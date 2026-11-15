package org.hm.health;
import java.io.IOException;
import java.util.*;

/** One person's daily records. Saves are validated as a batch before anything is persisted. */
public final class HealthSession {
    private final HealthCatalog catalog;
    private final ReadingStore store;
    private final String crewId;
    private final int today;
    private volatile List<Reading> readings;
    public HealthSession(HealthCatalog catalog,ReadingStore store,String crewId,int today)throws IOException{
        this.catalog=Objects.requireNonNull(catalog);this.store=Objects.requireNonNull(store);this.crewId=Objects.requireNonNull(crewId);this.today=today;
        readings=List.copyOf(store.load());
        for(var r:readings){catalog.indicator(r.indicator());if(!crewId.equals(r.crewId()))throw new IOException("The reading store must contain only "+crewId);}
    }
    public HealthCatalog catalog(){return catalog;}
    public int today(){return today;}
    public List<Reading> readings(){return readings;}
    public Map<String,AssessmentEngine.Result> assess(int day){
        var snapshot=readings;
        Map<String,AssessmentEngine.Result> result=new LinkedHashMap<>();
        for(var ind:catalog.daily())result.put(ind.id(),AssessmentEngine.assess(ind,snapshot,day));return Collections.unmodifiableMap(result);
    }
    public Map<String,Integer> systemLevels(int day){
        var snapshot=readings;
        Map<String,Integer> result=new LinkedHashMap<>();catalog.systems().forEach(s->result.put(s.id(),0));
        for(var ind:catalog.daily()){var r=AssessmentEngine.assess(ind,snapshot,day);result.merge(ind.system(),r.level(),Math::max);}
        return Map.copyOf(result);
    }
    public void save(String indicator,int day,double value)throws IOException{saveBatch(Map.of(indicator,value),day);}
    public synchronized void saveBatch(Map<String,Double> values,int day)throws IOException{
        if(day< -3650||day>today)throw new IllegalArgumentException("Mission day must be between -3650 and "+today);
        if(values.isEmpty())throw new IllegalArgumentException("Enter a reading first.");
        for(var entry:values.entrySet()){
            var ind=catalog.indicator(entry.getKey());Double value=entry.getValue();
            if(value==null||!Double.isFinite(value)||value<ind.input().min()||value>ind.input().max())throw new IllegalArgumentException(ind.shortName()+": enter a number from "+ind.input().min()+" to "+ind.input().max()+" "+ind.unit());
            if(ind.input().type().equals("scale")&&value!=Math.rint(value))throw new IllegalArgumentException(ind.shortName()+": choose a whole-number scale value.");
        }
        List<Reading> next=new ArrayList<>(readings),added=new ArrayList<>();long id=next.stream().mapToLong(Reading::id).max().orElse(0)+1;
        for(var entry:values.entrySet()){
            int seq=next.stream().filter(r->r.indicator().equals(entry.getKey())&&r.day()==day).mapToInt(Reading::seq).max().orElse(-1)+1;
            Reading reading=new Reading(id++,crewId,entry.getKey(),entry.getValue(),day,seq,"manual","");next.add(reading);added.add(reading);
        }
        store.append(List.copyOf(added),List.copyOf(next));readings=List.copyOf(next);
    }
}

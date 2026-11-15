package org.hm.health;

import java.util.*;
import java.math.*;
import static org.hm.health.HealthCatalog.*;

/** Native Java port of the original engine's DAILY-indicator assessment path. No UI dependencies. */
public final class AssessmentEngine {
    public record Day(int day,Reading latest,List<Reading> discarded) {}
    public record Baseline(double mean,double sd,int n,String kind,int lastDay) {}
    public record ShiftResult(double delta,double pct,boolean big,boolean act,String direction) {}
    public record Result(String indicator,int level,String key,String direction,List<String> reasons,boolean remeasure,
                         List<Day> days,Reading latest,Double value,Baseline baseline,ShiftResult shift,String trend,Integer lastDay,int window) {
        public List<Reading> discardedToday(){return days.isEmpty()?List.of():days.getLast().discarded();}
    }
    private static double mean(List<Double> values){return values.stream().mapToDouble(Double::doubleValue).average().orElse(0);}
    public static List<Day> byDay(List<Reading> rows){
        var sorted=rows.stream().sorted(Comparator.comparingInt(Reading::day).thenComparingInt(Reading::seq).thenComparingLong(Reading::id)).toList();
        List<Day> days=new ArrayList<>();
        for(var r:sorted){
            if(!days.isEmpty()&&days.getLast().day()==r.day()){
                var previous=days.removeLast();var discarded=new ArrayList<>(previous.discarded());discarded.add(previous.latest());
                days.add(new Day(r.day(),r,List.copyOf(discarded)));
            }else days.add(new Day(r.day(),r,List.of()));
        }return List.copyOf(days);
    }
    public static Baseline baseline(List<Day> days){
        var chosen=days.stream().filter(d->d.day()<=0).toList();String kind="before launch";
        if(chosen.size()<2){if(days.size()<4)return null;chosen=days.subList(0,3);kind="your first three readings";}
        double avg=mean(chosen.stream().map(d->d.latest().value()).toList()),sum=0;
        for(var d:chosen)sum+=Math.pow(d.latest().value()-avg,2);
        double sd=chosen.size()<2?0:Math.sqrt(sum/(chosen.size()-1));
        return new Baseline(avg,sd,chosen.size(),kind,chosen.getLast().day());
    }
    public static Result assess(Indicator ind,List<Reading> readings,int asOf){
        if(!"daily".equals(ind.kind()))throw new IllegalArgumentException("This component assesses daily indicators, not laboratory panels");
        var days=byDay(readings.stream().filter(r->r.indicator().equals(ind.id())&&r.day()<=asOf).toList());
        if(days.isEmpty())return new Result(ind.id(),0,"nodata",null,List.of(),false,days,null,null,null,null,"steady",null,0);
        var last=days.getLast();var base=baseline(days);int n=ind.window()>1?Math.min(ind.window(),days.size()):1;
        double value=mean(days.subList(days.size()-n,days.size()).stream().map(d->d.latest().value()).toList());
        var bands=ind.bands();int level=0;String direction=null;
        if(high(value,bands.highUrgent())){level=3;direction="high";}
        else if(low(value,bands.lowUrgent())){level=3;direction="low";}
        else if(high(value,bands.highAct())){level=2;direction="high";}
        else if(low(value,bands.lowAct())){level=2;direction="low";}
        else if(high(value,bands.highWatch())){level=1;direction="high";}
        else if(low(value,bands.lowWatch())){level=1;direction="low";}
        List<String> reasons=new ArrayList<>();if(level>0)reasons.add("outside the healthy range");
        var s=ind.shift();ShiftResult shift=null;
        if(base!=null&&last.day()>base.lastDay()){
            double delta=value-base.mean(),pct=base.mean()!=0?delta/Math.abs(base.mean())*100:0;
            boolean big=(s.abs()!=null&&Math.abs(delta)>=s.abs())||(s.pct()!=null&&Math.abs(pct)>=s.pct());
            if(big&&base.n()>=3&&base.sd()>0&&Math.abs(delta)<1.5*base.sd())big=false;
            String shiftDirection=delta>0?"high":"low";
            if(big&&shiftDirection.equals(ind.goodDirection()))big=false;
            boolean act=big&&s.actPct()!=null&&Math.abs(pct)>=s.actPct();
            shift=new ShiftResult(delta,pct,big,act,shiftDirection);
            if(big){reasons.add("moved from your own normal");if(direction==null)direction=shiftDirection;level=Math.max(level,act?2:1);}
        }
        boolean remeasure=false;
        if(n==1&&level>=2&&(days.size()>=2||!last.discarded().isEmpty())){
            double prev=!last.discarded().isEmpty()?last.discarded().getLast().value():days.get(days.size()-2).latest().value();
            double limit=s.abs()!=null?3*s.abs():Math.abs(prev)*3*(s.pct()!=null?s.pct():15)/100;
            if(Math.abs(value-prev)>=limit){remeasure=true;reasons.addFirst("a sudden jump from your last reading");}
        }
        String trend="steady";var recent=days.subList(Math.max(0,days.size()-7),days.size());
        if(recent.size()>=4){
            double mx=mean(recent.stream().map(d->(double)d.day()).toList()),my=mean(recent.stream().map(d->d.latest().value()).toList()),num=0,den=0;
            for(var d:recent){num+=(d.day()-mx)*(d.latest().value()-my);den+=Math.pow(d.day()-mx,2);}
            double slope=num/(den==0?1:den),step=(s.abs()!=null?s.abs():Math.abs(my)*(s.pct()!=null?s.pct():15)/100)/7;
            trend=slope>step?"rising":slope< -step?"falling":"steady";
        }
        return new Result(ind.id(),level,remeasure?"remeasure":List.of("ok","watch","act","urgent").get(level),direction,List.copyOf(reasons),remeasure,
                days,last.latest(),value,base,shift,trend,last.day(),n);
    }
    private static boolean high(double v,Double limit){return limit!=null&&v>=limit;}
    private static boolean low(double v,Double limit){return limit!=null&&v<limit;}
    public static boolean isDue(Indicator ind,Result result,int today){return result.lastDay()==null||today-result.lastDay()>=Math.max(1,ind.every());}
    public static String format(Indicator ind,Double value){
        if(value==null||!Double.isFinite(value))return "–";
        double step=ind.input().step();int digits=step>=1?0:step>=.1?1:2;
        return BigDecimal.valueOf(value).setScale(digits,RoundingMode.HALF_UP).stripTrailingZeros().toPlainString();
    }
    public static String describe(Indicator i,Result r){
        if(r.value()==null)return "No reading yet";
        if(r.shift()!=null&&r.baseline()!=null){double delta=r.shift().delta();if(Math.abs(delta)<1e-9)return "At your normal";
            String size=i.shift().pct()!=null?Math.round(Math.abs(r.shift().pct()))+"%":i.input().type().equals("scale")?format(i,Math.abs(delta))+(Math.abs(delta)==1?" point":" points"):format(i,Math.abs(delta))+" "+i.unit();
            return size+(delta>0?" above":" below")+" your normal";
        }return r.baseline()!=null?"Part of your baseline":"No baseline yet";
    }
    public static double normalBand(Indicator i,Baseline b){return b==null?0:Math.max(b.sd()*1.5,i.shift().abs()!=null?i.shift().abs():Math.abs(b.mean())*(i.shift().pct()!=null?i.shift().pct():15)/100);}
}

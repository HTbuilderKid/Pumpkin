package org.hm.health;

import com.google.gson.*;
import com.google.gson.annotations.SerializedName;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

/** Content and limits copied from the uploaded application's catalog. */
public record HealthCatalog(List<BodySystem> systems, List<Indicator> indicators, List<Hazard> hazards,
                            List<Environment> environments, List<Level> levels, List<Equipment> equipment, String equipmentNote) {
    public record BodySystem(String id,String name,String about) {}
    public record Hazard(String id,String name,String text,List<String> watch) { @Override public String toString(){return name;} }
    public record Environment(String id,String name,String delay,String delayNote) { @Override public String toString(){return name;} }
    public record Level(int id,String name,String who) {}
    public record Input(String type,double min,double max,double step,String placeholder,List<String> labels) {}
    public record Shift(Double abs,Double pct,Double actPct) {}
    public record Bands(Double lowUrgent,Double lowAct,Double lowWatch,Double highWatch,Double highAct,Double highUrgent) {}
    public record Indicator(String id,String name,@SerializedName("short") String shortName,String unit,String system,String kind,
                            Input input,Integer every,Integer window,Bands bands,Shift shift,String goodDirection,String how,String why,
                            List<String> sources,Map<String,List<String>> advice) {}
    public record Step(String t,Integer timer) {}
    public record Equipment(String id,String name,List<String> measures,String what,List<String> kit,List<Step> steps,
                            List<String> space,List<String> mistakes,String after) { @Override public String toString(){return name;} }
    public List<Indicator> daily(){return indicators.stream().filter(i->i.kind().equals("daily")).toList();}
    public Indicator indicator(String id){return daily().stream().filter(i->i.id().equals(id)).findFirst().orElseThrow(()->new IllegalArgumentException("Unknown daily indicator: "+id));}
    public BodySystem system(String id){return systems.stream().filter(s->s.id().equals(id)).findFirst().orElseThrow();}
    public Equipment equipmentFor(String id){return equipment.stream().filter(e->e.measures().contains(id)).findFirst().orElse(null);}
    public static HealthCatalog load()throws IOException{
        try(var in=HealthCatalog.class.getResourceAsStream("/health/catalog.json")){
            if(in==null)throw new FileNotFoundException("Missing health/catalog.json");
            return new Gson().fromJson(new InputStreamReader(in,StandardCharsets.UTF_8),HealthCatalog.class);
        }
    }
}

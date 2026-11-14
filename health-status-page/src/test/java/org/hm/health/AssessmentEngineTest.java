package org.hm.health;
import org.junit.jupiter.api.Test;
import com.google.gson.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

class AssessmentEngineTest {
    private List<Reading> demo()throws Exception{return JsonReadingStore.demo(java.nio.file.Path.of("target/nonexistent-test-store.json")).load();}
    @Test void matches660AssessmentsProducedByOriginalJavaScript()throws Exception{
        var catalog=HealthCatalog.load();var rows=demo();JsonArray expected;
        try(var in=getClass().getResourceAsStream("/original-engine-expected.json")){expected=JsonParser.parseString(new String(Objects.requireNonNull(in).readAllBytes(),StandardCharsets.UTF_8)).getAsJsonArray();}
        assertEquals(660,expected.size());
        for(var item:expected){var e=item.getAsJsonObject();String id=e.get("id").getAsString();var ind=catalog.indicator(id);var r=AssessmentEngine.assess(ind,rows,e.get("day").getAsInt());String label=id+" on "+e.get("day");
            assertEquals(e.get("level").getAsInt(),r.level(),label);assertEquals(e.get("key").getAsString(),r.key(),label);
            assertEquals(e.get("trend").getAsString(),r.trend(),label);assertEquals(e.get("remeasure").getAsBoolean(),r.remeasure(),label);
            assertEquals(e.get("discarded").getAsInt(),r.discardedToday().size(),label);assertEquals(e.get("due").getAsBoolean(),AssessmentEngine.isDue(ind,r,45),label);
            if(e.get("value").isJsonNull())assertNull(r.value(),label);else assertEquals(e.get("value").getAsDouble(),r.value(),1e-9,label);
            if(e.get("baseline").isJsonNull())assertNull(r.baseline(),label);else assertEquals(e.get("baseline").getAsDouble(),r.baseline().mean(),1e-9,label);
        }
    }
    @Test void thresholdsAndBaselineFallbackMatchOriginal()throws Exception{
        var cat=HealthCatalog.load();
        assertEquals(1,one(cat,"bp_sys",120).level());assertEquals(2,one(cat,"bp_sys",140).level());assertEquals(3,one(cat,"bp_sys",180).level());
        assertEquals(0,one(cat,"hr",100).level());assertEquals(3,one(cat,"hr",135).level());assertEquals(2,one(cat,"hydration",6).level());
        assertEquals(3,one(cat,"glucose",50).level());assertEquals(2,one(cat,"glucose",69).level());assertEquals(1,one(cat,"spo2",93).level());
        List<Reading> rows=new ArrayList<>();for(int d=1;d<=4;d++)rows.add(new Reading(d,"X","hr",60,d,0,"manual",""));
        assertNull(AssessmentEngine.assess(cat.indicator("hr"),rows,3).baseline());assertEquals("your first three readings",AssessmentEngine.assess(cat.indicator("hr"),rows,4).baseline().kind());
    }
    private AssessmentEngine.Result one(HealthCatalog cat,String id,double value){return AssessmentEngine.assess(cat.indicator(id),List.of(new Reading(1,"X",id,value,1,0,"manual","")),1);}
    @Test void repeatCanCorrectAnUrgentSpikeAndKeepsTheReplacedReading()throws Exception{
        var ind=HealthCatalog.load().indicator("glucose");List<Reading> rows=new ArrayList<>();
        for(int d=-2;d<=2;d++)rows.add(new Reading(d+3,"X","glucose",90,d,0,"manual",""));
        rows.add(new Reading(9,"X","glucose",41,3,0,"manual",""));assertTrue(AssessmentEngine.assess(ind,rows,3).remeasure());
        rows.add(new Reading(10,"X","glucose",92,3,1,"manual",""));var fixed=AssessmentEngine.assess(ind,rows,3);
        assertEquals("ok",fixed.key());assertEquals(1,fixed.discardedToday().size());assertEquals(41,fixed.discardedToday().getFirst().value());
        rows.set(rows.size()-1,new Reading(10,"X","glucose",43,3,1,"manual",""));assertEquals("urgent",AssessmentEngine.assess(ind,rows,3).key());
    }
}

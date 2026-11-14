package org.hm.health;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.io.TempDir;
import java.nio.file.*;
import java.io.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
class ReadingStoreTest {
 @TempDir Path dir;
 @Test void savesAndReloadsRepeatsWithoutOverwritingPreviousMeasurements()throws Exception{
  var file=dir.resolve("nested/readings.json");var cat=HealthCatalog.load();var session=new HealthSession(cat,JsonReadingStore.demo(file),"SIM-1",45);int initial=session.readings().size();
  session.save("hydration",45,7);session.save("hydration",45,2);
  var reloaded=new HealthSession(cat,JsonReadingStore.demo(file),"SIM-1",45);var r=reloaded.assess(45).get("hydration");
  assertEquals(initial+2,reloaded.readings().size());assertEquals(2,r.latest().value());assertEquals(1,r.discardedToday().size());assertEquals(7,r.discardedToday().getFirst().value());assertEquals(0,r.level());
 }
 @Test void rejectsInvalidBatchesAndFailedWritesDoNotChangeMemory()throws Exception{
  var file=dir.resolve("readings.json");var cat=HealthCatalog.load();var store=JsonReadingStore.demo(file);var session=new HealthSession(cat,store,"SIM-1",45);var before=session.readings();
  assertThrows(IllegalArgumentException.class,()->session.saveBatch(Map.of("hr",65.,"hydration",9.),45));assertEquals(before,session.readings());assertFalse(Files.exists(file));
  assertThrows(IllegalArgumentException.class,()->session.save("temp",45,Double.NaN));assertThrows(IllegalArgumentException.class,()->session.save("hydration",45,2.5));assertThrows(IllegalArgumentException.class,()->session.save("hr",46,65));
  var failing=new ReadingStore(){public List<Reading> load()throws IOException{return before;}public void save(List<Reading> rows)throws IOException{throw new IOException("disk unavailable");}};
  var failureSession=new HealthSession(cat,failing,"SIM-1",45);assertThrows(IOException.class,()->failureSession.save("hr",45,65));assertEquals(before,failureSession.readings());
 }
 @Test void corruptExistingDataIsNotReplacedByDemoData()throws Exception{
  Path file=dir.resolve("broken.json");Files.writeString(file,"{bad");assertThrows(IOException.class,()->JsonReadingStore.demo(file).load());assertEquals("{bad",Files.readString(file));
 }
 @Test void readsStayResponsiveWhilePersistenceIsBlocked()throws Exception{
  var entered=new java.util.concurrent.CountDownLatch(1);var release=new java.util.concurrent.CountDownLatch(1);
  var blocking=new ReadingStore(){
   public List<Reading> load(){return List.of();}
   public void save(List<Reading> rows)throws IOException{entered.countDown();try{if(!release.await(4,java.util.concurrent.TimeUnit.SECONDS))throw new IOException("Test release timeout");}catch(InterruptedException e){Thread.currentThread().interrupt();throw new IOException(e);}}
  };
  var session=new HealthSession(HealthCatalog.load(),blocking,"TEAM-001",1);
  try(var pool=java.util.concurrent.Executors.newFixedThreadPool(2)){
   var writer=pool.submit(()->{session.save("hr",1,65);return null;});
   try{
    assertTrue(entered.await(3,java.util.concurrent.TimeUnit.SECONDS));
    var result=pool.submit(()->session.assess(1)).get(1,java.util.concurrent.TimeUnit.SECONDS);
    assertEquals("nodata",result.get("hr").key());
   }finally{release.countDown();}
   writer.get(3,java.util.concurrent.TimeUnit.SECONDS);assertEquals(65,session.assess(1).get("hr").value());
  }
 }
}

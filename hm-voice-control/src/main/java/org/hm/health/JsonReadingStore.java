package org.hm.health;
import com.google.gson.*;
import java.io.*;
import java.nio.file.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

/** Atomic local persistence. Existing corrupt files fail visibly; they are never silently overwritten. */
public final class JsonReadingStore implements ReadingStore {
    private static final Gson JSON=new GsonBuilder().setPrettyPrinting().create();
    private final Path file;
    private final List<Reading> initial;
    public JsonReadingStore(Path file,List<Reading> initial){this.file=file.toAbsolutePath();this.initial=List.copyOf(initial);}
    public static JsonReadingStore demo(Path file)throws IOException{
        try(var in=JsonReadingStore.class.getResourceAsStream("/health/demo-readings.json")){
            if(in==null)throw new FileNotFoundException("Missing demo-readings.json");
            return new JsonReadingStore(file,decode(new String(in.readAllBytes(),StandardCharsets.UTF_8)));
        }
    }
    private static List<Reading> decode(String text)throws IOException{
        try{
            Reading[] rows=JSON.fromJson(text,Reading[].class);if(rows==null)throw new IOException("Missing readings array");
            for(var r:rows)if(r==null||r.indicator()==null||!Double.isFinite(r.value()))throw new IOException("Invalid reading record");
            return List.of(rows);
        }catch(JsonParseException|IllegalStateException e){throw new IOException("Cannot read readings JSON",e);}
    }
    @Override public synchronized List<Reading> load()throws IOException{return Files.exists(file)?decode(Files.readString(file)):initial;}
    @Override public synchronized void save(List<Reading> rows)throws IOException{
        Files.createDirectories(file.getParent());Path temp=Files.createTempFile(file.getParent(),"readings-",".tmp");
        try{
            Files.writeString(temp,JSON.toJson(rows),StandardCharsets.UTF_8);
            try{Files.move(temp,file,StandardCopyOption.ATOMIC_MOVE,StandardCopyOption.REPLACE_EXISTING);}
            catch(AtomicMoveNotSupportedException e){Files.move(temp,file,StandardCopyOption.REPLACE_EXISTING);}
        }finally{Files.deleteIfExists(temp);}
    }
}

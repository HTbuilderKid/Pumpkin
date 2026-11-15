package org.hm.health;
import java.io.IOException;
import java.util.List;
/** Implement this interface to connect the page to HM_repo's database or API. One store per person. */
public interface ReadingStore {
    List<Reading> load() throws IOException;
    void save(List<Reading> readings) throws IOException;
    /**
     * Store readings that were just entered together (one check-in). {@code all} is everything, old and new.
     * A file store rewrites the whole file; a database store overrides this and inserts only the new ones.
     */
    default void append(List<Reading> added, List<Reading> all) throws IOException { save(all); }
}

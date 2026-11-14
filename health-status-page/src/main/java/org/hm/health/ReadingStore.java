package org.hm.health;
import java.io.IOException;
import java.util.List;
/** Implement this interface to connect the page to HM_repo's database or API. One store per person. */
public interface ReadingStore {
    List<Reading> load() throws IOException;
    void save(List<Reading> readings) throws IOException;
}

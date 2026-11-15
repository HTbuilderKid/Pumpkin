package com.example.healthmonitor;

import org.hm.health.JsonReadingStore;
import org.hm.health.Reading;

import java.io.IOException;
import java.nio.file.Path;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/** Puts one invented crew member into the database, so the app has something to show. Every value is made up. */
public final class DemoData {
    private DemoData() {}
    public static final String NAME = "Alex Rivera (simulated)";
    private static final int DEMO_TODAY = 45;                      // the demo readings run from 14 days before launch to mission day 45

    public static Astronaut load() throws SQLException, IOException {
        List<Reading> readings = JsonReadingStore.demo(Path.of("no-such-file-" + System.nanoTime())).load();
        Astronaut astronaut = new AstronautDAO().addAstronaut(NAME, LocalDate.now().minusDays(DEMO_TODAY));
        // readings of the same day and the same turn (first measurement, repeat, ...) share one row
        Map<Integer, Map<Integer, Measurement>> rows = new TreeMap<>();
        for (Reading r : readings) {
            if (!DatabaseReadingStore.INDICATORS.contains(r.indicator())) continue;
            Measurement m = rows.computeIfAbsent(r.day(), d -> new TreeMap<>()).computeIfAbsent(r.seq(), s -> {
                Measurement fresh = new Measurement(astronaut.getId());
                fresh.setMissionDay(r.day()); fresh.setSource("simulated");
                fresh.setRecordedAt(astronaut.getLaunchDate().plusDays(r.day()).atTime(7, 30).plusMinutes(10L * s));
                return fresh;
            });
            DatabaseReadingStore.set(m, r.indicator(), r.value());
        }
        List<Measurement> entries = new ArrayList<>();
        rows.values().forEach(day -> entries.addAll(day.values()));
        new MeasurementDAO().addMeasurements(entries);
        return astronaut;
    }
}

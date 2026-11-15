package com.example.healthmonitor;

import org.hm.health.Reading;
import org.hm.health.ReadingStore;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Connects the health status page to the database, for one astronaut.
 * The page thinks in single readings ("heart rate 62 on mission day 5"); the data table holds one row per log entry
 * with a column per vital. This class translates between the two:
 *   reading in  -> every filled-in column of every row becomes one reading
 *   reading out -> the values entered together become one new row
 */
public class DatabaseReadingStore implements ReadingStore {
    /** The page's indicator ids, in the order of the columns they are stored in. */
    static final List<String> INDICATORS = List.of("hr", "bp_sys", "bp_dia", "spo2", "glucose", "temp", "sleep", "hydration", "exercise", "mass", "mood");

    private final int astronautId;
    private final MeasurementDAO dao = new MeasurementDAO();

    public DatabaseReadingStore(int astronautId) { this.astronautId = astronautId; }

    static Double get(Measurement m, String indicator) {
        return switch (indicator) {
            case "hr" -> whole(m.getHeartRate());
            case "bp_sys" -> whole(m.getBpSystolic());
            case "bp_dia" -> whole(m.getBpDiastolic());
            case "spo2" -> m.getBloodOxygen();
            case "glucose" -> m.getBloodGlucose();
            case "temp" -> m.getBodyTemp();
            case "sleep" -> m.getSleepHours();
            case "hydration" -> whole(m.getUrineColor());
            case "exercise" -> m.getExerciseMinutes();
            case "mass" -> m.getBodyMass();
            case "mood" -> whole(m.getMood());
            default -> null;
        };
    }

    static void set(Measurement m, String indicator, double value) {
        switch (indicator) {
            case "hr" -> m.setHeartRate((int) Math.round(value));
            case "bp_sys" -> m.setBpSystolic((int) Math.round(value));
            case "bp_dia" -> m.setBpDiastolic((int) Math.round(value));
            case "spo2" -> m.setBloodOxygen(value);
            case "glucose" -> m.setBloodGlucose(value);
            case "temp" -> m.setBodyTemp(value);
            case "sleep" -> m.setSleepHours(value);
            case "hydration" -> m.setUrineColor((int) Math.round(value));
            case "exercise" -> m.setExerciseMinutes(value);
            case "mass" -> m.setBodyMass(value);
            case "mood" -> m.setMood((int) Math.round(value));
            default -> throw new IllegalArgumentException("The database has no column for " + indicator);
        }
    }
    private static Double whole(Integer v) { return v == null ? null : v.doubleValue(); }

    @Override public List<Reading> load() throws IOException {
        try {
            List<Reading> readings = new ArrayList<>();
            Map<String, Integer> repeats = new HashMap<>();              // how many times a vital was already logged that day
            for (Measurement m : dao.findByAstronaut(astronautId)) {
                for (int column = 0; column < INDICATORS.size(); column++) {
                    String indicator = INDICATORS.get(column);
                    Double value = get(m, indicator);
                    if (value == null) continue;
                    int seq = repeats.merge(indicator + "@" + m.getMissionDay(), 1, Integer::sum) - 1;
                    readings.add(new Reading(m.getId() * 16L + column, Integer.toString(astronautId), indicator, value, m.getMissionDay(), seq, m.getSource(), ""));
                }
            }
            return readings;
        } catch (SQLException e) {
            throw new IOException("The readings could not be read from the database: " + e.getMessage(), e);
        }
    }

    /** The values entered together become one row. */
    @Override public void append(List<Reading> added, List<Reading> all) throws IOException {
        if (added.isEmpty()) return;
        Measurement m = new Measurement(astronautId);
        m.setMissionDay(added.get(0).day());
        for (Reading r : added) {
            if (r.day() != m.getMissionDay()) throw new IOException("One log entry cannot span several mission days.");
            set(m, r.indicator(), r.value());
        }
        try { dao.addMeasurement(m); }
        catch (SQLException e) { throw new IOException("The database refused the reading: " + e.getMessage(), e); }
    }

    @Override public void save(List<Reading> readings) throws IOException {
        throw new IOException("The database store only adds new readings; it never rewrites the whole history.");
    }
}

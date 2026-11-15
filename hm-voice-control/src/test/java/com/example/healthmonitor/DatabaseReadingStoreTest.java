package com.example.healthmonitor;

import org.hm.health.HealthCatalog;
import org.hm.health.HealthSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Path;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/** The health page reading from and writing to the real database, on a throw-away file. */
class DatabaseReadingStoreTest {
    @TempDir Path folder;
    private final AstronautDAO astronauts = new AstronautDAO();

    @BeforeEach void freshDatabase() throws SQLException {
        Database.setDbUrl("jdbc:sqlite:" + folder.resolve("test.db"));
        Database.init();
        Database.init();                                  // running it again must change nothing
    }

    private HealthSession session(Astronaut a, int today) throws Exception {
        return new HealthSession(HealthCatalog.load(), new DatabaseReadingStore(a.getId()), Integer.toString(a.getId()), today);
    }

    @Test void crewAreSavedAndListed() throws Exception {
        Astronaut sam = astronauts.addAstronaut("  Sam Okoro ", LocalDate.of(2026, 11, 1));
        assertEquals("Sam Okoro", sam.getName());
        assertEquals(1, astronauts.findAll().size());
        assertEquals(LocalDate.of(2026, 11, 1), astronauts.findAll().get(0).getLaunchDate());
        assertEquals(14, sam.missionDay(LocalDate.of(2026, 11, 15)));
        assertThrows(IllegalArgumentException.class, () -> astronauts.addAstronaut("   ", LocalDate.now()));
    }

    @Test void aCheckInBecomesOneRowAndComesBackAsReadings() throws Exception {
        Astronaut a = astronauts.addAstronaut("A", LocalDate.now());
        HealthSession s = session(a, 3);
        s.saveBatch(Map.of("bp_sys", 118.0, "bp_dia", 76.0), 3);
        s.save("hr", 3, 61);
        assertEquals(2, new MeasurementDAO().findByAstronaut(a.getId()).size());          // two log entries: the pressure pair, then the pulse
        Measurement first = new MeasurementDAO().findByAstronaut(a.getId()).get(0);
        assertEquals(118, first.getBpSystolic()); assertEquals(76, first.getBpDiastolic()); assertNull(first.getHeartRate()); assertEquals(3, first.getMissionDay());

        HealthSession reopened = session(a, 3);                                           // as after restarting the app
        assertEquals(3, reopened.readings().size());
        assertEquals(61, reopened.assess(3).get("hr").value());
        assertEquals(118, reopened.assess(3).get("bp_sys").value());
        assertEquals("nodata", reopened.assess(3).get("sleep").key());
    }

    @Test void aRepeatOnTheSameDayReplacesTheFirstReadingButBothAreKept() throws Exception {
        Astronaut a = astronauts.addAstronaut("A", LocalDate.now());
        HealthSession s = session(a, 2);
        s.save("hydration", 2, 6); s.save("hydration", 2, 3);
        var result = session(a, 2).assess(2).get("hydration");
        assertEquals(3, result.latest().value()); assertEquals(1, result.discardedToday().size());
    }

    @Test void eachAstronautSeesOnlyTheirOwnReadings() throws Exception {
        Astronaut a = astronauts.addAstronaut("A", LocalDate.now()), b = astronauts.addAstronaut("B", LocalDate.now());
        session(a, 1).save("hr", 1, 60); session(b, 1).save("hr", 1, 90);
        assertEquals(60, session(a, 1).assess(1).get("hr").value());
        assertEquals(90, session(b, 1).assess(1).get("hr").value());
    }

    @Test void impossibleValuesNeverReachTheDatabase() throws Exception {
        Astronaut a = astronauts.addAstronaut("A", LocalDate.now());
        HealthSession s = session(a, 1);
        assertThrows(IllegalArgumentException.class, () -> s.save("temp", 1, 99));
        assertTrue(new MeasurementDAO().findByAstronaut(a.getId()).isEmpty());
        Measurement bad = new Measurement(a.getId()); bad.setMissionDay(1); bad.setHeartRate(900);      // past the page: the table's own limits still hold
        assertThrows(SQLException.class, () -> new MeasurementDAO().addMeasurement(bad));
    }

    @Test void removingAnAstronautRemovesTheirReadings() throws Exception {
        Astronaut a = astronauts.addAstronaut("A", LocalDate.now());
        session(a, 1).save("hr", 1, 60);
        astronauts.deleteAstronaut(a.getId());
        assertTrue(astronauts.findAll().isEmpty());
        assertTrue(new MeasurementDAO().findByAstronaut(a.getId()).isEmpty());
    }

    @Test void theSimulatedCrewMemberLoadsAndTellsTheSameStoryAsBefore() throws Exception {
        Astronaut alex = DemoData.load();
        assertEquals(45, alex.missionDay(LocalDate.now()));
        HealthSession s = session(alex, 45);
        assertTrue(s.readings().size() > 550);
        assertEquals(1, s.assess(38).get("glucose").discardedToday().size());             // the bad test strip on day 38 and its repeat
        assertTrue(s.assess(45).get("sleep").level() >= 1);
        assertEquals(0, s.assess(45).get("spo2").level());
    }
}

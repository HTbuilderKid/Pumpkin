package com.example.healthmonitor;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/** Reads and writes the data table: one row per log entry, with only the vitals that were measured filled in. */
public class MeasurementDAO
{
    private static final DateTimeFormatter STAMP = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public MeasurementDAO() {}

    /** Save one log entry. Returns the id the database gave it. */
    public int addMeasurement(Measurement m) throws SQLException
    {
        if (m.getMissionDay() == null) throw new IllegalArgumentException("A measurement needs its mission day.");
        String sql = "INSERT INTO data (astronaut_id, recorded_at, mission_day, source, heart_rate, bp_systolic, bp_diastolic, blood_oxygen, "
                   + "blood_glucose, body_temp, sleep_hours, urine_color, exercise_minutes, strength, body_mass, mood) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        try (Connection con = Database.getConnection();
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, m.getAstronautId());
            ps.setString(2, (m.getRecordedAt() != null ? m.getRecordedAt() : LocalDateTime.now()).format(STAMP));
            ps.setInt(3, m.getMissionDay());
            ps.setString(4, m.getSource() != null ? m.getSource() : "manual");
            ps.setObject(5, m.getHeartRate(), Types.INTEGER);
            ps.setObject(6, m.getBpSystolic(), Types.INTEGER);
            ps.setObject(7, m.getBpDiastolic(), Types.INTEGER);
            ps.setObject(8, m.getBloodOxygen(), Types.REAL);
            ps.setObject(9, m.getBloodGlucose(), Types.REAL);
            ps.setObject(10, m.getBodyTemp(), Types.REAL);
            ps.setObject(11, m.getSleepHours(), Types.REAL);
            ps.setObject(12, m.getUrineColor(), Types.INTEGER);
            ps.setObject(13, m.getExerciseMinutes(), Types.REAL);
            ps.setObject(14, m.getStrength(), Types.REAL);
            ps.setObject(15, m.getBodyMass(), Types.REAL);
            ps.setObject(16, m.getMood(), Types.INTEGER);
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                keys.next();
                m.setId(keys.getInt(1));
                return m.getId();
            }
        }
    }

    /** Several entries in one go: all of them are saved, or none. */
    public void addMeasurements(List<Measurement> entries) throws SQLException
    {
        String sql = "INSERT INTO data (astronaut_id, recorded_at, mission_day, source, heart_rate, bp_systolic, bp_diastolic, blood_oxygen, "
                   + "blood_glucose, body_temp, sleep_hours, urine_color, exercise_minutes, strength, body_mass, mood) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        try (Connection con = Database.getConnection()) {
            con.setAutoCommit(false);
            try (PreparedStatement ps = con.prepareStatement(sql)) {
                for (Measurement m : entries) {
                    ps.setInt(1, m.getAstronautId());
                    ps.setString(2, (m.getRecordedAt() != null ? m.getRecordedAt() : LocalDateTime.now()).format(STAMP));
                    ps.setInt(3, m.getMissionDay());
                    ps.setString(4, m.getSource() != null ? m.getSource() : "manual");
                    ps.setObject(5, m.getHeartRate(), Types.INTEGER);
                    ps.setObject(6, m.getBpSystolic(), Types.INTEGER);
                    ps.setObject(7, m.getBpDiastolic(), Types.INTEGER);
                    ps.setObject(8, m.getBloodOxygen(), Types.REAL);
                    ps.setObject(9, m.getBloodGlucose(), Types.REAL);
                    ps.setObject(10, m.getBodyTemp(), Types.REAL);
                    ps.setObject(11, m.getSleepHours(), Types.REAL);
                    ps.setObject(12, m.getUrineColor(), Types.INTEGER);
                    ps.setObject(13, m.getExerciseMinutes(), Types.REAL);
                    ps.setObject(14, m.getStrength(), Types.REAL);
                    ps.setObject(15, m.getBodyMass(), Types.REAL);
                    ps.setObject(16, m.getMood(), Types.INTEGER);
                    ps.addBatch();
                }
                ps.executeBatch();
                con.commit();
            } catch (SQLException e) {
                con.rollback();
                throw e;
            }
        }
    }

    /** Everything one astronaut has logged, oldest mission day first; entries of the same day in the order they were saved. */
    public List<Measurement> findByAstronaut(int astronautId) throws SQLException
    {
        List<Measurement> rows = new ArrayList<>();
        try (Connection con = Database.getConnection();
             PreparedStatement ps = con.prepareStatement("SELECT * FROM data WHERE astronaut_id = ? ORDER BY mission_day, id")) {
            ps.setInt(1, astronautId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Measurement m = new Measurement();
                    m.setId(rs.getInt("id"));
                    m.setAstronautId(rs.getInt("astronaut_id"));
                    try { m.setRecordedAt(LocalDateTime.parse(rs.getString("recorded_at"), STAMP)); } catch (RuntimeException ignored) { /* an unusual timestamp: leave it empty */ }
                    m.setMissionDay(rs.getInt("mission_day"));
                    m.setSource(rs.getString("source"));
                    m.setHeartRate(wholeOrNull(rs, "heart_rate"));
                    m.setBpSystolic(wholeOrNull(rs, "bp_systolic"));
                    m.setBpDiastolic(wholeOrNull(rs, "bp_diastolic"));
                    m.setBloodOxygen(numberOrNull(rs, "blood_oxygen"));
                    m.setBloodGlucose(numberOrNull(rs, "blood_glucose"));
                    m.setBodyTemp(numberOrNull(rs, "body_temp"));
                    m.setSleepHours(numberOrNull(rs, "sleep_hours"));
                    m.setUrineColor(wholeOrNull(rs, "urine_color"));
                    m.setExerciseMinutes(numberOrNull(rs, "exercise_minutes"));
                    m.setStrength(numberOrNull(rs, "strength"));
                    m.setBodyMass(numberOrNull(rs, "body_mass"));
                    m.setMood(wholeOrNull(rs, "mood"));
                    rows.add(m);
                }
            }
        }
        return rows;
    }

    private static Double numberOrNull(ResultSet rs, String column) throws SQLException { double v = rs.getDouble(column); return rs.wasNull() ? null : v; }
    private static Integer wholeOrNull(ResultSet rs, String column) throws SQLException { int v = rs.getInt(column); return rs.wasNull() ? null : v; }
}

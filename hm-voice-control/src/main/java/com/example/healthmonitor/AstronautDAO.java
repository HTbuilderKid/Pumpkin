package com.example.healthmonitor;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/** Reads and writes the astronaut table. */
public class AstronautDAO
{
    public AstronautDAO() {}

    /** Add a crew member. Returns them with the id the database gave them. */
    public Astronaut addAstronaut(String name, LocalDate launchDate) throws SQLException
    {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("Enter a name.");
        String sql = "INSERT INTO astronaut (name, launch_date) VALUES (?, ?)";
        try (Connection con = Database.getConnection();
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, name.trim());
            ps.setString(2, launchDate.toString());
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                keys.next();
                return new Astronaut(keys.getInt(1), name.trim(), null, launchDate);
            }
        }
    }

    public List<Astronaut> findAll() throws SQLException
    {
        List<Astronaut> crew = new ArrayList<>();
        try (Connection con = Database.getConnection();
             PreparedStatement ps = con.prepareStatement("SELECT id, name, height_cm, launch_date FROM astronaut ORDER BY id");
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                double height = rs.getDouble("height_cm");
                crew.add(new Astronaut(rs.getInt("id"), rs.getString("name"), rs.wasNull() ? null : height, LocalDate.parse(rs.getString("launch_date"))));
            }
        }
        return crew;
    }

    /** Change the launch date. Logged readings keep the mission day they were saved with. */
    public void setLaunchDate(int astronautId, LocalDate launchDate) throws SQLException
    {
        try (Connection con = Database.getConnection();
             PreparedStatement ps = con.prepareStatement("UPDATE astronaut SET launch_date = ? WHERE id = ?")) {
            ps.setString(1, launchDate.toString());
            ps.setInt(2, astronautId);
            ps.executeUpdate();
        }
    }

    /** Remove a crew member and, with them, everything they logged. */
    public void deleteAstronaut(int astronautId) throws SQLException
    {
        try (Connection con = Database.getConnection();
             PreparedStatement ps = con.prepareStatement("DELETE FROM astronaut WHERE id = ?")) {
            ps.setInt(1, astronautId);
            ps.executeUpdate();
        }
    }
}

package com.example.healthmonitor;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class Database {
    private static String dbUrl = "jdbc:sqlite:HealthMonitor.db";

    public static void setDbUrl(String url){
        dbUrl = url;
    }

    public static Connection getConnection() throws SQLException {
        Connection con = DriverManager.getConnection(dbUrl);
        try(Statement stm = con.createStatement()){
            stm.execute("PRAGMA foreign_keys = ON;");
        }
        return con;
    }

    /** Create the tables if this is a new database file. Safe to call at every start. */
    public static void init() throws SQLException {
        String schema;
        try (var in = Database.class.getResourceAsStream("schema.sql")) {
            if (in == null) throw new SQLException("schema.sql is missing from the application");
            schema = new String(in.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new SQLException("schema.sql could not be read", e);
        }
        String statements = schema.replaceAll("(?m)--.*$", "");          // drop the comments, then run each statement
        try (Connection con = getConnection(); Statement stm = con.createStatement()) {
            for (String sql : statements.split(";")) if (!sql.isBlank()) stm.execute(sql);
        }
    }
}

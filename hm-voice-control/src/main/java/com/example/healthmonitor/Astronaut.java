package com.example.healthmonitor;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class Astronaut {
    private final int id;
    private String name;
    private Double heightCm;          // null = not recorded
    private LocalDate launchDate;     // mission day 0

    public Astronaut(int id, String name, Double heightCm, LocalDate launchDate) {
        this.id = id;
        this.name = name;
        this.heightCm = heightCm;
        this.launchDate = launchDate;
    }

    public int getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Double getHeightCm() { return heightCm; }
    public LocalDate getLaunchDate() { return launchDate; }
    public void setLaunchDate(LocalDate launchDate) { this.launchDate = launchDate; }

    /** Days since launch on the given date; negative before launch. */
    public int missionDay(LocalDate on) { return (int) ChronoUnit.DAYS.between(launchDate, on); }

    @Override public String toString() { return name; }
}

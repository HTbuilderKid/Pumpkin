package com.example.healthmonitor;

import java.time.LocalDateTime;

public class Measurement {
    private int id;
    private int astronautId;
    private LocalDateTime recordedAt;
    private Integer missionDay;
    private String source = "manual";
    private Integer heartRate;
    private Integer bpSystolic;
    private Integer bpDiastolic;
    private Double bloodOxygen;
    private Double bloodGlucose;
    private Double bodyTemp;
    private Double sleepHours;
    private Integer urineColor;      // the eight-step colour chart: 1 clear ... 8 brown
    private Double exerciseMinutes;
    private Double strength;
    private Double bodyMass;
    private Integer mood;

    public Measurement() {}

    public Measurement(int astronautId) {
        this.astronautId = astronautId;
        this.recordedAt = LocalDateTime.now();
    }

    public int getAstronautId() {
        return astronautId;
    }

    public void setAstronautId(int astronautId) {
        this.astronautId = astronautId;
    }

    public Double getBloodGlucose() {
        return bloodGlucose;
    }

    public void setBloodGlucose(Double bloodGlucose) {
        this.bloodGlucose = bloodGlucose;
    }

    public Double getBloodOxygen() {
        return bloodOxygen;
    }

    public void setBloodOxygen(Double bloodOxygen) {
        this.bloodOxygen = bloodOxygen;
    }

    public Double getBodyMass() {
        return bodyMass;
    }

    public void setBodyMass(Double bodyMass) {
        this.bodyMass = bodyMass;
    }

    public Double getBodyTemp() {
        return bodyTemp;
    }

    public void setBodyTemp(Double bodyTemp) {
        this.bodyTemp = bodyTemp;
    }

    public Integer getHeartRate() {
        return heartRate;
    }

    public void setHeartRate(Integer heartRate) {
        this.heartRate = heartRate;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Integer getMissionDay() {
        return missionDay;
    }

    public void setMissionDay(Integer missionDay) {
        this.missionDay = missionDay;
    }

    public Integer getMood() {
        return mood;
    }

    public void setMood(Integer mood) {
        this.mood = mood;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }

    public Double getSleepHours() {
        return sleepHours;
    }

    public void setSleepHours(Double sleepHours) {
        this.sleepHours = sleepHours;
    }

    public Double getStrength() {
        return strength;
    }

    public void setStrength(Double strength) {
        this.strength = strength;
    }

    public Integer getUrineColor() {
        return urineColor;
    }

    public void setUrineColor(Integer urineColor) {
        this.urineColor = urineColor;
    }

    public Integer getBpSystolic() {
        return bpSystolic;
    }

    public void setBpSystolic(Integer bpSystolic) {
        this.bpSystolic = bpSystolic;
    }

    public Integer getBpDiastolic() {
        return bpDiastolic;
    }

    public void setBpDiastolic(Integer bpDiastolic) {
        this.bpDiastolic = bpDiastolic;
    }

    public Double getExerciseMinutes() {
        return exerciseMinutes;
    }

    public void setExerciseMinutes(Double exerciseMinutes) {
        this.exerciseMinutes = exerciseMinutes;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }
}

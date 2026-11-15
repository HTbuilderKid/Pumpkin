package com.example.healthmonitor.voice;

import java.util.List;

/** The only actions the model may propose. No code execution, SQL, deletion or medical advice. */
public record VoiceCommand(Action action,String indicator,String crew_id,Integer day,Double value,String unit,String hazard,String environment,String message) {
    public enum Action {SHOW_METRIC,SELECT_CREW,SHOW_DAY,SHOW_CURRENT_DAY,SET_HAZARD,CLEAR_HAZARD,SET_ENVIRONMENT,PREPARE_READING,HELP,UNSUPPORTED}
    public record Crew(String id,String name) {}
    public record Context(String currentCrew,int viewingDay,int today,List<Crew> crew) {}
    public static double nativeValue(String indicator,double value,String unit){
        if(!Double.isFinite(value))throw new IllegalArgumentException("The reading must be a finite number.");
        if(unit==null||unit.equals("native"))return value;
        return switch(indicator){
            case "temp" -> switch(unit){case "celsius"->value;case "fahrenheit"->Math.round((value-32)*5/9*10)/10.0;default->throw wrongUnit();};
            case "glucose" -> switch(unit){case "mg/dL"->value;case "mmol/L"->Math.round(value*18.0182);default->throw wrongUnit();};
            case "mass" -> switch(unit){case "kg"->value;case "lb"->Math.round(value/2.2046226218*10)/10.0;default->throw wrongUnit();};
            case "hr" -> require(unit,"bpm",value);
            case "bp_sys","bp_dia" -> require(unit,"mmHg",value);
            case "sleep" -> require(unit,"hours",value);
            case "exercise" -> require(unit,"minutes",value);
            case "mood","hydration" -> require(unit,"scale",value);
            case "spo2" -> require(unit,"percent",value);
            default -> throw new IllegalArgumentException("Unknown reading indicator.");
        };
    }
    private static double require(String actual,String expected,double value){if(!actual.equals(expected))throw wrongUnit();return value;}
    private static IllegalArgumentException wrongUnit(){return new IllegalArgumentException("Those units do not match the selected metric. Please repeat with units.");}
}

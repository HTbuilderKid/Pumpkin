package com.example.healthmonitor.voice;
public interface VoiceAi {
    String transcribe(byte[] wav,String key)throws Exception;
    VoiceCommand interpret(String transcript,VoiceCommand.Context context,String key)throws Exception;
}

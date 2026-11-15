package com.example.healthmonitor.voice;
import java.util.concurrent.CompletableFuture;
public interface AudioCapture {
    Recording start()throws Exception;
    interface Recording extends AutoCloseable {CompletableFuture<byte[]> stop();@Override default void close(){stop();}}
}

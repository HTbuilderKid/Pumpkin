package com.example.healthmonitor.voice;
import javax.sound.sampled.*;
import java.io.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;

/** Java Sound PCM capture; bounded to 30 seconds, encoded as WAV in memory. */
public final class MicrophoneCapture implements AudioCapture {
    @Override public Recording start()throws Exception{
        TargetDataLine selected=null;AudioFormat format=null;
        for(float rate:new float[]{16000,44100,48000}){
            var candidate=new AudioFormat(rate,16,1,true,false);
            try{var line=(TargetDataLine)AudioSystem.getLine(new DataLine.Info(TargetDataLine.class,candidate));line.open(candidate);selected=line;format=candidate;break;}catch(LineUnavailableException|IllegalArgumentException ignored){}
        }
        if(selected==null)throw new IOException("No microphone available. Enable microphone access for Java and choose a working default input device.");
        final TargetDataLine line=selected;final AudioFormat pcm=format;var running=new AtomicBoolean(true);var result=new CompletableFuture<byte[]>();
        line.start();Thread capture=new Thread(()->{
            try(var bytes=new ByteArrayOutputStream()){
                byte[] buffer=new byte[4096];int max=(int)(pcm.getFrameRate()*pcm.getFrameSize()*30);
                while(running.get()&&bytes.size()<max){int n;try{n=line.read(buffer,0,Math.min(buffer.length,max-bytes.size()));}catch(RuntimeException e){if(!running.get())break;throw e;}if(n>0)bytes.write(buffer,0,n);else break;}
                if(bytes.size()<pcm.getFrameRate()*pcm.getFrameSize()*.2)throw new IOException("Recording was too short. Speak a command before stopping.");
                result.complete(wav(bytes.toByteArray(),pcm));
            }catch(Exception e){result.completeExceptionally(e);}finally{running.set(false);line.stop();line.close();}
        },"voice-microphone");capture.setDaemon(true);capture.start();
        return ()->{running.set(false);line.stop();line.close();return result;};
    }
    static byte[] wav(byte[] pcm,AudioFormat format)throws IOException{
        try(var out=new ByteArrayOutputStream();var audio=new AudioInputStream(new ByteArrayInputStream(pcm),format,pcm.length/format.getFrameSize())){AudioSystem.write(audio,AudioFileFormat.Type.WAVE,out);return out.toByteArray();}
    }
}

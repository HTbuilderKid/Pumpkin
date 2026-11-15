package com.example.healthmonitor.voice;
import org.junit.jupiter.api.Test;
import com.sun.net.httpserver.HttpServer;
import com.google.gson.*;
import java.net.*;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
class OpenAiVoiceClientTest {
 @Test void realHttpContractsForWavTranscriptionAndStructuredCommands()throws Exception{
  var server=HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);List<String> paths=new ArrayList<>();
  server.createContext("/v1/",e->{try(e){String path=e.getRequestURI().getPath();paths.add(path);String body=new String(e.getRequestBody().readAllBytes(),StandardCharsets.ISO_8859_1);String response;
   if(!"Bearer test-key".equals(e.getRequestHeaders().getFirst("Authorization")))throw new AssertionError("Auth header");
   if(path.endsWith("transcriptions")){if(!body.contains("gpt-4o-mini-transcribe")||!body.contains("command.wav")||!body.contains("RIFF"))throw new AssertionError("WAV multipart");response="{\"text\":\"show hydration\"}";}
   else{var json=JsonParser.parseString(body).getAsJsonObject();if(!json.getAsJsonObject("response_format").get("type").getAsString().equals("json_schema"))throw new AssertionError("Strict schema");String command="{\"action\":\"SHOW_METRIC\",\"indicator\":\"hydration\"}";response="{\"choices\":[{\"message\":{\"content\":"+new Gson().toJson(command)+"}}]}";}
   byte[] bytes=response.getBytes(StandardCharsets.UTF_8);e.sendResponseHeaders(200,bytes.length);e.getResponseBody().write(bytes);
  }});server.start();
  try{var client=new OpenAiVoiceClient(HttpClient.newHttpClient(),URI.create("http://127.0.0.1:"+server.getAddress().getPort()+"/v1/"));byte[] pcm=new byte[16000];byte[] wav=MicrophoneCapture.wav(pcm,new javax.sound.sampled.AudioFormat(16000,16,1,true,false));
   assertEquals("show hydration",client.transcribe(wav,"test-key"));var cmd=client.interpret("show hydration",new VoiceCommand.Context("1",45,45,List.of(new VoiceCommand.Crew("1","Alex"))),"test-key");assertEquals(VoiceCommand.Action.SHOW_METRIC,cmd.action());assertEquals("hydration",cmd.indicator());assertEquals(2,paths.size());
  }finally{server.stop(0);}
 }
 @Test void errorsDoNotExposeCredentials()throws Exception{
  var server=HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);server.createContext("/",e->{try(e){byte[] b="secret-key-value".getBytes();e.sendResponseHeaders(401,b.length);e.getResponseBody().write(b);}});server.start();
  try{var c=new OpenAiVoiceClient(HttpClient.newHttpClient(),URI.create("http://127.0.0.1:"+server.getAddress().getPort()+"/"));var error=assertThrows(java.io.IOException.class,()->c.transcribe(new byte[64],"secret-key-value"));assertFalse(error.getMessage().contains("secret-key-value"));}finally{server.stop(0);}
 }
 @Test void unitConversionIsDeterministicAndIncompatibleUnitsAreRejected(){
  assertEquals(37,VoiceCommand.nativeValue("temp",98.6,"fahrenheit"),.01);assertEquals(99,VoiceCommand.nativeValue("glucose",5.5,"mmol/L"));assertEquals(72.6,VoiceCommand.nativeValue("mass",160,"lb"),.01);
  assertThrows(IllegalArgumentException.class,()->VoiceCommand.nativeValue("hydration",6,"celsius"));assertThrows(IllegalArgumentException.class,()->VoiceCommand.nativeValue("temp",Double.NaN,"native"));
 }
}

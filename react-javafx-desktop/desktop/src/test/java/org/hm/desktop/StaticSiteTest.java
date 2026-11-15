package org.hm.desktop;
import org.junit.jupiter.api.Test;
import java.net.*;
import java.net.http.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
class StaticSiteTest {
 @Test void servesStaticReactAndPreviewRoutesFromJarResources()throws Exception{
  try(var site=new StaticSite()){
   var http=HttpClient.newHttpClient();
   for(String path:List.of("/","/preview/input/","/preview/switch/","/r/switch.json")){
    var response=http.send(HttpRequest.newBuilder(URI.create(site.url()).resolve(path)).build(),HttpResponse.BodyHandlers.ofString());
    assertEquals(200,response.statusCode(),path);assertTrue(response.body().length()>100,path);
   }
   assertFalse(site.owns("https://example.com/"));assertFalse(site.owns("file:///etc/passwd"));assertTrue(site.owns(site.url()+"preview/input/"));
   assertEquals(404,http.send(HttpRequest.newBuilder(URI.create(site.url()+"pom.xml")).build(),HttpResponse.BodyHandlers.discarding()).statusCode());
  }
 }
 @Test void mapsOnlyWhitelistedExportedPaths(){
  var files=Set.of("index.html","preview/input/index.html","_next/static/app.js");
  assertEquals("index.html",StaticSite.resolve("/",files));assertEquals("preview/input/index.html",StaticSite.resolve("/preview/input",files));
  assertEquals("_next/static/app.js",StaticSite.resolve("/_next/static/app.js",files));assertNull(StaticSite.resolve("/../index.html",files));assertNull(StaticSite.resolve("/fake.html",files));
 }
}

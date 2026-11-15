package org.pumpkin.viewer;
import org.junit.jupiter.api.Test;
import java.net.*;
import java.net.http.*;
import static org.junit.jupiter.api.Assertions.*;
class ViewerAssetsTest {
 @Test void servesPackagedModelAndModulesOnlyFromPrivatePath() throws Exception {
  var http=HttpClient.newHttpClient();
  try(var host=new ViewerAssets()) {
   var url=URI.create(host.url());
   var page=http.send(HttpRequest.newBuilder(url).build(),HttpResponse.BodyHandlers.ofString());
   assertEquals(200,page.statusCode());assertTrue(page.body().contains("js/host.js"));
   var mesh=http.send(HttpRequest.newBuilder(url.resolve("assets/body.bin")).build(),HttpResponse.BodyHandlers.ofByteArray());
   assertEquals(200,mesh.statusCode());assertEquals(1164996,mesh.body().length);
   var shader=http.send(HttpRequest.newBuilder(url.resolve("js/body3d.js")).build(),HttpResponse.BodyHandlers.ofString());
   assertTrue(shader.body().contains("blending: THREE.AdditiveBlending"));assertTrue(shader.body().contains("0.035 + 0.9 * rim"));
   assertEquals(404,http.send(HttpRequest.newBuilder(url.resolve("../assets/body.bin")).build(),HttpResponse.BodyHandlers.discarding()).statusCode());
   assertEquals(404,http.send(HttpRequest.newBuilder(url.resolve("../../pom.xml")).build(),HttpResponse.BodyHandlers.discarding()).statusCode());
  }
 }
}

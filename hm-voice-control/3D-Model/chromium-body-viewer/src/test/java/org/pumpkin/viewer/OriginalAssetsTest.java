package org.pumpkin.viewer;
import org.junit.jupiter.api.Test;
import com.google.gson.*;
import java.nio.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
class OriginalAssetsTest {
 private byte[] read(String p)throws Exception{try(var in=getClass().getResourceAsStream(p)){assertNotNull(in,p);return in.readAllBytes();}}
 @Test void keepsOriginalGeometryThreeJsFontsAndShadersUnchanged()throws Exception{
  var expected=JsonParser.parseString(new String(read("/original-hashes.json"),StandardCharsets.UTF_8)).getAsJsonObject();
  for(var e:expected.entrySet()){
   byte[] bytes;
   if(e.getKey().equals("shader-source")){
    String js=new String(read("/viewer/js/body3d.js"),StandardCharsets.UTF_8);
    bytes=js.substring(js.indexOf("const VERT ="),js.indexOf("// canvas:")).getBytes(StandardCharsets.UTF_8);
   }else bytes=read("/viewer/"+e.getKey());
   assertEquals(e.getValue().getAsString(),HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes)),e.getKey());
  }
 }
 @Test void validatesEveryOriginalTriangleAndAllNineAnchors()throws Exception{
  var meta=JsonParser.parseString(new String(read("/viewer/assets/body.json"),StandardCharsets.UTF_8)).getAsJsonObject();
  var parts=meta.getAsJsonArray("meshes");assertEquals(18,parts.size());
  var bytes=ByteBuffer.wrap(read("/viewer/assets/body.bin")).order(ByteOrder.LITTLE_ENDIAN);
  Set<String> names=new HashSet<>();int triangles=0;
  for(var p:parts){var m=p.getAsJsonObject();names.add(m.get("name").getAsString());int nv=m.get("nv").getAsInt(),ni=m.get("ni").getAsInt(),off=m.get("offI").getAsInt();
   assertEquals(0,ni%3);triangles+=ni/3;
   for(int i=0;i<ni;i++)assertTrue(Short.toUnsignedInt(bytes.getShort(off+2*i))<nv);
  }
  assertEquals(129752,triangles);
  var systems=JsonParser.parseString(new String(read("/viewer/assets/systems.json"),StandardCharsets.UTF_8)).getAsJsonArray();assertEquals(9,systems.size());
  for(var s:systems){var system=s.getAsJsonObject();String spot=system.get("spot").getAsString();assertTrue(names.contains(spot)||meta.getAsJsonObject("spots").has(spot));
   for(var mesh:system.getAsJsonArray("meshes"))assertTrue(names.contains(mesh.getAsString()));
  }
 }
}

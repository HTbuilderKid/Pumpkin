package org.pumpkin.body;

import com.google.gson.Gson;
import java.io.*;
import java.nio.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

/** Reads the original, little-endian, quantized NASA project assets without conversion loss. */
public record BodyModel(List<Part> parts, List<BodySystem> systems, Map<String, Point> anchors) {
    public record Point(double x, double y, double z) {}
    public record Part(String name, float[] points, int[] indices, Point centre) {}
    public record BodySystem(String id, String name, List<String> meshes, String spot, String about, String shortName) {}
    private record Metadata(List<Mesh> meshes, Map<String, double[]> spots) {}
    private record Mesh(String name, int nv, int ni, int offV, int offI, double[] min, double[] size, double[] centre) {}
    private record SystemJson(String id, String name, List<String> meshes, String spot, String about,
                              @com.google.gson.annotations.SerializedName("short") String shortName) {}

    public static BodyModel load() throws IOException {
        Gson gson = new Gson();
        Metadata meta = gson.fromJson(readText("body.json"), Metadata.class);
        SystemJson[] catalog = gson.fromJson(readText("systems.json"), SystemJson[].class);
        byte[] bytes;
        try (InputStream in = resource("body.bin")) { bytes = in.readAllBytes(); }
        ByteBuffer data = ByteBuffer.wrap(bytes).order(ByteOrder.LITTLE_ENDIAN);
        List<Part> parts = new ArrayList<>();
        Map<String, Point> spots = new HashMap<>();
        meta.spots.forEach((key, value) -> spots.put(key, point(value)));
        for (Mesh mesh : meta.meshes) {
            if (mesh.nv <= 0 || mesh.ni <= 0 || mesh.ni % 3 != 0
                    || mesh.offV < 0 || mesh.offI < 0
                    || (long) mesh.offV + mesh.nv * 6L > bytes.length
                    || (long) mesh.offI + mesh.ni * 2L > bytes.length)
                throw new IOException("Invalid mesh layout: " + mesh.name);
            float[] points = new float[mesh.nv * 3];
            for (int i = 0; i < points.length; i++) {
                int axis = i % 3;
                double position = mesh.min[axis] + Short.toUnsignedInt(data.getShort(mesh.offV + i * 2)) / 65535.0 * mesh.size[axis];
                // Three.js is y-up, front +z; JavaFX is y-down, camera looking +z.
                points[i] = (float) (axis == 0 ? position : -position);
            }
            int[] indices = new int[mesh.ni];
            for (int i = 0; i < indices.length; i++) {
                indices[i] = Short.toUnsignedInt(data.getShort(mesh.offI + i * 2));
                if (indices[i] >= mesh.nv) throw new IOException("Invalid vertex index: " + mesh.name);
            }
            Point centre = point(mesh.centre);
            parts.add(new Part(mesh.name, points, indices, centre));
            spots.put(mesh.name, centre);
        }
        List<BodySystem> systems = new ArrayList<>();
        Set<String> partNames = new HashSet<>();
        parts.forEach(part -> partNames.add(part.name));
        Map<String, Point> anchors = new HashMap<>();
        for (SystemJson s : catalog) {
            if (!spots.containsKey(s.spot) || !partNames.containsAll(s.meshes))
                throw new IOException("Unresolved system: " + s.id);
            systems.add(new BodySystem(s.id, s.name, List.copyOf(s.meshes), s.spot, s.about, s.shortName));
            anchors.put(s.id, spots.get(s.spot));
        }
        return new BodyModel(List.copyOf(parts), List.copyOf(systems), Map.copyOf(anchors));
    }
    private static Point point(double[] p) { return new Point(p[0], p[1], p[2]); }
    private static InputStream resource(String name) throws IOException {
        InputStream in = BodyModel.class.getResourceAsStream("/model/" + name);
        if (in == null) throw new FileNotFoundException("Missing model resource: " + name);
        return in;
    }
    private static String readText(String name) throws IOException {
        try (InputStream in = resource(name)) { return new String(in.readAllBytes(), StandardCharsets.UTF_8); }
    }
}

package org.pumpkin.body;

import javafx.animation.AnimationTimer;
import javafx.application.Platform;
import javafx.application.ConditionalFeature;
import javafx.scene.*;
import javafx.scene.control.Button;
import javafx.scene.layout.*;
import javafx.scene.paint.*;
import javafx.scene.shape.*;
import javafx.scene.transform.Rotate;
import java.util.*;
import java.util.function.Consumer;

/** Embeddable native JavaFX view. Construct and call its API on the JavaFX application thread. */
public final class BodyView extends StackPane implements AutoCloseable {
    public static final List<Color> LEVEL_COLORS = List.of(Color.web("#6f9bff"), Color.web("#ffbe2e"), Color.web("#ff7a1a"), Color.web("#ff4558"));
    private static final Set<String> SKELETON = Set.of("skull", "spine", "ribcage", "pelvis", "arms", "legs");
    private record Visual(MeshView surface, MeshView edge, String system, Color base, double opacity) {}
    private final BodyModel model;
    private final Group figure = new Group();
    private final Rotate turn = new Rotate(0, Rotate.Y_AXIS);
    private final PerspectiveCamera camera = new PerspectiveCamera(true);
    private final Pane overlay = new Pane();
    private final SubScene scene3d;
    private final Map<String, Visual> visuals = new LinkedHashMap<>();
    private final Map<String, Button> markers = new LinkedHashMap<>();
    private Map<String, Integer> levels = Map.of();
    private Consumer<String> onPick = id -> {};
    private String selected;
    private boolean spinning = true, hover, dragging, closed;
    private double lastX, moved, distance = 430, goalDistance = 430, focusY, goalY;
    private long lastFrame;
    private final AnimationTimer timer = new AnimationTimer() {
        @Override public void handle(long now) {
            double dt = lastFrame == 0 ? 0 : Math.min(.05, (now - lastFrame) / 1e9);
            lastFrame = now;
            if (spinning && !hover && !dragging) turn.setAngle(turn.getAngle() + Math.toDegrees(dt * .32));
            distance += (goalDistance - distance) * Math.min(1, dt * 4);
            focusY += (goalY - focusY) * Math.min(1, dt * 4);
            update(now / 1e6);
        }
    };

    public BodyView(BodyModel model) {
        if (!Platform.isSupported(ConditionalFeature.SCENE3D))
            throw new IllegalStateException("JavaFX 3D requires a graphics driver with OpenGL support.");
        this.model = Objects.requireNonNull(model);
        setMinSize(240, 320);
        setStyle("-fx-background-color: #080e20;");
        figure.getTransforms().add(turn);
        Group world = new Group(figure, new AmbientLight(Color.WHITE));
        scene3d = new SubScene(world, 640, 760, true, SceneAntialiasing.BALANCED);
        scene3d.setFill(Color.web("#080e20"));
        camera.setFieldOfView(26); camera.setNearClip(10); camera.setFarClip(3000);
        scene3d.setCamera(camera);
        scene3d.widthProperty().bind(widthProperty()); scene3d.heightProperty().bind(heightProperty());
        overlay.setPickOnBounds(false);
        getChildren().addAll(scene3d, overlay);
        Map<String, String> owners = new HashMap<>();
        model.systems().forEach(s -> s.meshes().forEach(name -> owners.put(name, s.id())));
        for (BodyModel.Part part : model.parts()) {
            TriangleMesh mesh = new TriangleMesh();
            mesh.getPoints().setAll(part.points()); mesh.getTexCoords().setAll(0, 0);
            int[] faces = new int[part.indices().length * 2];
            for (int i = 0; i < part.indices().length; i++) faces[i * 2] = part.indices()[i];
            mesh.getFaces().setAll(faces);
            boolean skin = part.name().equals("skin"), bone = SKELETON.contains(part.name());
            Color base = Color.web(skin ? "#2f6bff" : bone ? "#c8d8ff" : "#7fa8ff");
            MeshView surface = new MeshView(mesh), edge = new MeshView(mesh);
            surface.setCullFace(CullFace.NONE); edge.setCullFace(CullFace.NONE);
            surface.setMaterial(new PhongMaterial()); edge.setMaterial(new PhongMaterial());
            ((PhongMaterial) surface.getMaterial()).setSpecularColor(Color.BLACK);
            ((PhongMaterial) edge.getMaterial()).setSpecularColor(Color.BLACK);
            if (skin) surface.setVisible(false);
            edge.setDrawMode(DrawMode.LINE); edge.setMouseTransparent(true);
            String owner = owners.get(part.name());
            // Keep the outer shell from swallowing all organ clicks. Core remains selectable via its marker/list.
            surface.setMouseTransparent(skin || owner == null);
            surface.setOnMouseClicked(e -> { if (moved <= 4) pick(owner); e.consume(); });
            figure.getChildren().addAll(surface, edge);
            visuals.put(part.name(), new Visual(surface, edge, owner, base, skin ? .012 : bone ? .06 : .28));
        }
        for (BodyModel.BodySystem s : model.systems()) {
            Button marker = new Button("◉  " + s.shortName());
            marker.setManaged(false); marker.setVisible(false);
            marker.setAccessibleText("Select " + s.name());
            marker.setOnAction(e -> pick(s.id()));
            markers.put(s.id(), marker); overlay.getChildren().add(marker);
        }
        scene3d.setOnMouseEntered(e -> hover = true);
        scene3d.setOnMouseExited(e -> hover = false);
        scene3d.setOnMousePressed(e -> { lastX = e.getSceneX(); moved = 0; dragging = true; });
        scene3d.setOnMouseDragged(e -> {
            double dx = e.getSceneX() - lastX; lastX = e.getSceneX(); moved += Math.abs(dx);
            turn.setAngle(turn.getAngle() + Math.toDegrees(dx * .012));
        });
        scene3d.setOnMouseReleased(e -> dragging = false);
        scene3d.setOnMouseClicked(e -> { if (moved <= 4) pick(null); });
        scene3d.setOnScroll(e -> { goalDistance = Math.max(220, Math.min(800, goalDistance - e.getDeltaY() * .4)); e.consume(); });
        sceneProperty().addListener((obs, old, next) -> {
            lastFrame = 0;
            if (next == null || closed) timer.stop(); else timer.start();
        });
        update(0);
    }
    private void pick(String id) { select(id); onPick.accept(id); }
    public void setOnPick(Consumer<String> callback) { checkThread(); onPick = Objects.requireNonNull(callback); }
    public void setSpinning(boolean value) { checkThread(); spinning = value; }
    public void setLevels(Map<String, Integer> next) {
        checkThread();
        next.forEach((id, lv) -> {
            if (!markers.containsKey(id) || lv == null || lv < 0 || lv > 3)
                throw new IllegalArgumentException("Expected a known system and level 0..3: " + id);
        });
        levels = Map.copyOf(next); update(0);
    }
    public void select(String id) {
        checkThread();
        if (id != null && !markers.containsKey(id)) throw new IllegalArgumentException("Unknown system: " + id);
        selected = id;
        goalY = id == null ? 0 : model.anchors().get(id).y() * .45;
        goalDistance = id == null ? 430 : Set.of("bone", "muscle", "core").contains(id) ? 410 : 330;
        update(0);
    }
    public String getSelectedSystem() { return selected; }
    private void update(double time) {
        double w = Math.max(2, getWidth()), h = Math.max(2, getHeight());
        double dist = distance * (goalDistance > 400 ? Math.max(1, .62 / (w / h)) : 1);
        camera.setTranslateZ(-dist); camera.setTranslateY(-focusY);
        double pulse = .78 + .22 * Math.sin(time / 260);
        for (Visual v : visuals.values()) {
            int lv = v.system == null ? 0 : levels.getOrDefault(v.system, 0);
            boolean chosen = selected != null && selected.equals(v.system);
            Color color = lv > 0 ? LEVEL_COLORS.get(lv) : chosen ? Color.WHITE : v.base;
            double gain = lv > 0 ? 1.8 * pulse : chosen ? 1.8 : selected != null ? .6 : 1;
            ((PhongMaterial) v.surface.getMaterial()).setDiffuseColor(tint(color, Math.min(.7, v.opacity * gain)));
            ((PhongMaterial) v.edge.getMaterial()).setDiffuseColor(tint(color, Math.min(.4, v.opacity * gain * .5)));
        }
        double a = Math.toRadians(turn.getAngle()), focal = h / (2 * Math.tan(Math.toRadians(13)));
        record Placement(Button button, double x, double y, int level, String id) {}
        List<Placement> shown = new ArrayList<>();
        for (var entry : markers.entrySet()) {
            String id = entry.getKey(); Button marker = entry.getValue(); int lv = levels.getOrDefault(id, 0);
            boolean visible = lv > 0 || id.equals(selected); marker.setVisible(visible);
            if (!visible) continue;
            BodyModel.Point p = model.anchors().get(id);
            double x = p.x() * Math.cos(a) - p.z() * Math.sin(a);
            double z = -p.x() * Math.sin(a) - p.z() * Math.cos(a);
            double depth = dist + z;
            double sx = w / 2 + x * focal / depth, sy = h / 2 + (-p.y() + focusY) * focal / depth;
            if (depth <= 10 || sx < 0 || sx > w || sy < 0 || sy > h) { marker.setVisible(false); continue; }
            shown.add(new Placement(marker, sx, sy, lv, id));
        }
        shown.sort(Comparator.comparingDouble(Placement::y));
        double previousY = -100; boolean previousFlip = false;
        for (Placement p : shown) {
            boolean flip = p.x > w * .6 || (Math.abs(p.y - previousY) < 20 && !previousFlip && p.x > w * .3);
            String hex = toHex(LEVEL_COLORS.get(p.level));
            String style = "-fx-background-color: #101b32; -fx-text-fill: " + hex + "; -fx-border-color: " + hex
                    + "; -fx-border-radius: 14; -fx-background-radius: 14; -fx-padding: 4 9; -fx-font-size: 11;"
                    + (p.id.equals(selected) ? "-fx-font-weight: bold;" : "");
            if (!p.button.getStyle().equals(style)) { p.button.setStyle(style); p.button.applyCss(); }
            p.button.autosize();
            double bx = flip ? p.x - p.button.getWidth() + 8 : p.x - 8;
            p.button.relocate(Math.max(0, Math.min(w - p.button.getWidth(), bx)), Math.max(0, Math.min(h - p.button.getHeight(), p.y - p.button.getHeight() / 2)));
            previousY = p.y; previousFlip = flip;
        }
    }
    // Dim dense, overlapping anatomical triangles as well as making them transparent.
    private static Color tint(Color c, double alpha) {
        double brightness = Math.sqrt(alpha);
        return Color.color(c.getRed() * brightness, c.getGreen() * brightness, c.getBlue() * brightness, alpha);
    }
    private static String toHex(Color c) { return String.format("#%02x%02x%02x", Math.round(c.getRed()*255), Math.round(c.getGreen()*255), Math.round(c.getBlue()*255)); }
    private static void checkThread() { if (!Platform.isFxApplicationThread()) throw new IllegalStateException("Use the JavaFX application thread"); }
    @Override public void close() { checkThread(); closed = true; timer.stop(); }
}

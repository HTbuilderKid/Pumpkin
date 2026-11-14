# JavaFX body model + markers: integration guide

Requires **JDK 21+**, **JavaFX 21+**, and **Gson 2.11.0**.
No Python, JavaScript, WebView, server, or database is required.

## Option A: copy two classes and three assets

Copy these directories into the matching locations in your JavaFX project:

- `src/main/java/org/pumpkin/body/` — `BodyModel.java` and `BodyView.java`.
- `src/main/resources/model/` — `body.bin`, `body.json`, `systems.json`.

Keep resource paths unchanged; Maven/Gradle must include them on the runtime
classpath. Retain `ATTRIBUTION.md` when distributing the model.

Add Gson to your Maven dependencies; keep your team's JavaFX version if it is 21
or newer (do not add a second conflicting JavaFX version):

```xml
<dependency>
  <groupId>org.openjfx</groupId>
  <artifactId>javafx-controls</artifactId>
  <version>21.0.6</version>
</dependency>
<dependency>
  <groupId>com.google.code.gson</groupId>
  <artifactId>gson</artifactId>
  <version>2.11.0</version>
</dependency>
```

For a project with `module-info.java`, add:

```java
requires javafx.controls;
requires com.google.gson;
opens org.pumpkin.body to com.google.gson;
```

The `opens` directive lets Gson read the metadata records. Projects without
`module-info.java` do not need it. Update this directive if renaming the package.

## Embed in your controller

Create the view on the **JavaFX application thread**, e.g. from your controller's
`initialize()` method. No new Application, Stage, or Scene is required:

```java
import org.pumpkin.body.BodyModel;
import org.pumpkin.body.BodyView;
import java.util.Map;

BodyView body = new BodyView(BodyModel.load()); // can throw IOException
body.setLevels(Map.of("heart", 3, "brain", 1, "fluids", 2));
body.setOnPick(systemId -> {
    // null = background click; otherwise open your app's panel for this ID.
    System.out.println(systemId);
});
yourBorderPane.setCenter(body);
// Or: yourStackPane.getChildren().setAll(body);
```

The component fills its parent (minimum 240 × 320). It contains its own camera,
lighting, model, marker overlay, colours, and interactions. Drag to rotate;
scroll to zoom. Automatic rotation pauses while hovered.

- `body.select("heart")`: select and frame a system. `select(null)`: whole body.
- `body.setSpinning(false)`: stop automatic rotation.
- `body.setLevels(map)`: replace all severity values; missing IDs become 0.
- `body.setOnPick(callback)`: receive organ/marker/background clicks.
- `body.getSelectedSystem()`: current ID, or null.
- `body.close()`: stop animation when permanently disposing of the view.

Call all view methods on the JavaFX thread. Use
`Platform.runLater(() -> body.setLevels(newLevels))` for background results.
Animation stops while detached from a Scene, and resumes on reattachment unless
closed. Programmatic `select` does not call the callback, avoiding update loops.

## Markers and data

| ID | Marker | Anchor |
|---|---|---|
| `brain` | Brain | Brain centre |
| `heart` | Heart | Heart centre |
| `lungs` | Lungs | Lungs centre |
| `metabolic` | Blood sugar | Pancreas centre |
| `core` | Temperature | Forehead |
| `fluids` | Kidneys & fluids | Kidneys centre |
| `liver` | Liver | Liver centre |
| `bone` | Bones | Hip |
| `muscle` | Muscle | Thigh |

Severity: **0 normal/blue, 1 yellow, 2 orange, 3 red**. Markers appear for levels
1–3 and for the selected system at any level. No sample alerts are injected by the
component: set levels or select a system to show markers. Unknown IDs and invalid
levels are rejected. These are display states supplied by your application,
not computed medical results.

The skin does not intercept organ clicks; choose `core` through your own controls
or its active marker. The original has no muscle mesh; its marker uses the thigh.

## Option B: use the compiled library

Instead of copying source/resources, add `lib/javafx-body-component-1.0.0.jar`
to your IDE dependencies, alongside JavaFX and Gson. It contains the model and
markers but no standalone dashboard. Do not use both integration options together.
The JAR is a library, not an executable application or bundled Java runtime.

For a named-module application using this JAR:

```java
requires org.pumpkin.body;
requires javafx.controls;
requires com.google.gson;
```

The library's automatic module name is `org.pumpkin.body`. Do not put the
source-copy `opens org.pumpkin.body` directive in your application's module
when using the JAR.

Rebuild with `mvn package`. The included two asset tests check geometry, coordinate
conversion, index ranges, and marker anchors. `examples/IntegrationExample.java`
shows a minimal host application; copy it into a host project's source directory
if you want to run it.

## Rendering and platform support

The 18 original meshes and nine marker definitions are retained. Native JavaFX
surfaces and outlines approximate the original WebGL x-ray shader; the outer skin
uses wireframe to expose organs. Transparency and picking differ from Three.js.
See `docs/preview.png`; this is not a pixel-identical shader port.

Verified on Linux with JDK 21, JavaFX 21.0.6, and a Mesa/OpenGL graphics smoke run.
A desktop graphics pipeline supporting JavaFX 3D is required; Linux also needs
GTK 3 and a display server. Windows/macOS have not been tested here. Maven selects
platform-specific JavaFX natives; do not copy Linux JavaFX binaries to another OS.

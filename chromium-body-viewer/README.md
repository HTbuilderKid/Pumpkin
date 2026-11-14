# Original NASA 3D viewer inside JavaFX

This is the **Chromium/Three.js integration**, preserving the original model,
custom x-ray shader, additive blending, marker styles, picking, and camera.
It does not replace the renderer with JavaFX meshes. Python is not needed for
this extracted viewer; you may keep your Python backend separately if needed.

## Run the demo

Install a **full desktop JDK 21+** (not a headless-only JRE) and **Maven 3.9+**.
From this folder:

```sh
mvn clean package
```

Then launch:

- Windows: `run.bat`
- Linux/macOS: `./run.sh`

Set `JAVA_HOME` to the full JDK. On Linux the launch script also supplies the
JDK's AWT native-library locations. Linux needs a display server and the normal
Chromium desktop libraries (GTK 3, NSS, GBM, ALSA, X11, GL). Missing native-library
errors should be resolved using your distribution's package manager.

The first Maven build downloads Chromium for the selected platform (~150 MB
compressed on Linux). On first launch, jcefmaven extracts it to `runtime/jcef`.
Subsequent launches use that local copy. `runtime/cache` is writable browser
state; keep it outside read-only installation directories in a packaged app.
The model, fonts, scripts, and Chromium natives are local: no runtime CDN, NASA API,
Python process, or internet connection is required after building for that OS.

The demo's sidebar supplies example severity values, system selection, a reset,
and auto-rotation controls. The component itself injects no sample data.

## Drop into your team's JavaFX project

Recommended: keep this folder as a separate Maven library module, or build it and
add `target/chromium-body-viewer-1.0.0.jar` (also supplied in `dist/`) plus its dependencies to your app.
The JAR contains the Java adapter and all viewer assets. Alternatively copy all
`src/main/java` and `src/main/resources` contents and the dependencies/profiles
from `pom.xml`. `Launcher`, `ViewerDemo`, and `ViewerSmoke` are optional demo code.

**Keep JCEF and this adapter on the classpath.** The adapter deliberately shares
JCEF's `org.cef.browser` package to access its pinned off-screen API. Do not place
it on the JPMS module path or relocate that package. JavaFX itself can stay on
the module path, as in the launch scripts. Pin jcefmaven at 152.0.6; upgrading
requires rebuilding and testing the adapter against that JCEF version.

For an existing **named-module** JavaFX host, keep the viewer JAR and all JCEF
libraries on the classpath, keep JavaFX on the module path, and add this to BOTH
host compilation and launch (replace the name):

```text
--add-reads your.app.module=ALL-UNNAMED
```

Keep `requires javafx.controls;` and add `requires jdk.httpserver;` in your host's
`module-info.java`; do not add `requires` entries for JCEF or the viewer. This
separate-module host arrangement was compiled and launched successfully here.
For a nonmodular application, the supplied launch scripts need no add-reads flag.

Create ONE `ChromiumRuntime` for your application's lifetime, on a worker/init
thread before creating the view (initial extraction can take time):

```java
ChromiumRuntime runtime = ChromiumRuntime.open(
    Path.of(System.getProperty("user.home"), ".your-app", "body-viewer"));
```

Then on the JavaFX application thread, e.g. in your controller:

```java
ChromiumBodyView body = new ChromiumBodyView(runtime);
yourBorderPane.setCenter(body);
// Or: yourStackPane.getChildren().setAll(body);

body.setOnPick(systemId -> {
    // Runs on JavaFX thread. null = background click.
    // Open your application's corresponding details panel here.
    System.out.println(systemId);
});
body.setOnError(message -> System.err.println(message));
body.setLevels(Map.of("brain", 1, "heart", 3, "fluids", 2));
body.select("heart");
```

Imports: `org.pumpkin.viewer.ChromiumRuntime`, `org.pumpkin.viewer.ChromiumBodyView`,
`java.nio.file.Path`, and `java.util.Map`.
No second Stage, Application, SwingNode, WebView, or external browser is needed.
The node fills its parent, with a minimum size of 240 × 320.

### API

- `ready()` — future completing after model load and the first rendered frame.
- `setLevels(Map<String,Integer>)` — replace levels; omitted IDs return to 0.
- `select(String)` — focus a system, or `null` for the whole body.
- `setSpinning(boolean)` — automatic rotation on/off.
- `setOnPick(Consumer<String>)` — marker/organ/background callback on JavaFX thread.
- `setOnError(Consumer<String>)` — load/render failures, also shown in the view.
- `diagnostics()` — async render and marker state, useful for host smoke tests.
- `close()` / `disposed()` — close the browser and await native/server cleanup.

Levels and selection commands can be queued before `ready()`; they are dispatched
in call order. Their returned futures signal dispatch, not a completed animation.
Unknown IDs and levels outside 0–3 are rejected. Changing selection from Java does
not invoke the pick callback. Use the JavaFX thread for view construction,
callbacks, resizing, and disposal. Queue APIs are safe from background threads.

Systems: `brain`, `heart`, `lungs`, `metabolic`, `core`, `fluids`, `liver`, `bone`,
`muscle`. Levels: **0 normal/blue, 1 yellow, 2 orange, 3 red**. Markers appear for
abnormal levels and for the selected system. The muscle anchor is the original
thigh spot; there is no separate muscle mesh in the uploaded model.

On final disposal, call `body.close()` on the JavaFX thread. After all views'
`disposed()` futures complete, call `runtime.close()` once. Do not initialize CEF
again in the same process after disposing the runtime. See `ViewerDemo.stop()`.

## How JavaFX embeds Chromium

`FxOffscreenBrowser` receives Chromium's BGRA frame buffers and forwards mouse,
wheel, and keyboard input. `ChromiumBodyView` coalesces frames and presents them
using a native JavaFX ImageView. This avoids SwingNode's heavyweight-component
limitations and avoids JOGL rendering inside JavaFX. Chromium still executes the
original Three.js GLSL shaders; JavaFX does not reinterpret the model.

`ViewerAssets` serves only bundled assets on a random loopback port and private
path, including from inside a JAR. It stops with the view. Navigation is restricted
to the viewer page. A CEF message router carries marker callbacks and readiness
back to Java, without needing a Python HTTP server.

The adapter uses CEF default screen information rather than JCEF 152's JNI screen-info conversion (which double-deletes a local reference). A scaled
viewport and page zoom handle high-DPI output without that conversion.

The original shader, geometry, and camera remain intact. Additions to `body3d.js`
are lifecycle cleanup, explicit rotation control, wheel zoom, and diagnostics.
The original marker CSS and fonts are retained. Hardware differences, pixel ratio,
and the original animation timing can affect individual frames.

## Platform packaging

`mvn package` creates:

- `target/chromium-body-viewer-1.0.0.jar`: component plus assets.
- `target/lib/`: CEF, platform-native bundle, and Java dependencies.
- `target/javafx/`: platform JavaFX modules.

Ship these three outputs plus the appropriate launch script and a full JDK/runtime
with desktop support. Keep the native and dependency license files. Build a separate
distribution on each target OS/architecture; a Linux native bundle cannot run on
Windows. The POM selects Linux x64, Windows x64, macOS Intel, or macOS ARM by host.
Additional platforms require an explicit matching jcef-natives dependency.

Windows and macOS launch profiles are provided but were **not executed here**.
The verified platform is Linux x64/JDK 21/JavaFX 21.0.6/CEF 152.0.6.
The scripts include the required AWT export and macOS AWT opens. This adapter uses
JCEF internals, so run the smoke check on your team's target platforms before release.

## Validation and graphics fallback

`mvn test` runs three tests for local hosting, unknown paths, all triangle indices,
all marker anchors, and SHA-256 matches for original geometry, fonts, Three.js,
and shader source. `./run.sh --smoke` (or `run.bat --smoke`) runs real GUI checks: WebGL
rendering, severity and selection updates, forwarded mouse marker-click callbacks, mouse
rotation, wheel zoom, resize, JavaFX pixel transfer, and native/browser disposal.
It writes `target/chromium-preview.png` and exits nonzero on failure.

A GPU-less machine may block WebGL. For a **trusted bundled viewer** on such a
machine, an explicit SwiftShader mode is available:

```sh
JAVA_TOOL_OPTIONS=-Dviewer.softwareWebGL=true ./run.sh --smoke
```

On Windows set `JAVA_TOOL_OPTIONS=-Dviewer.softwareWebGL=true` before launching.
This retains the GLSL renderer using CPU software WebGL, with lower performance;
it opts into Chromium's software WebGL fallback. Normal launch uses hardware
acceleration where available. The GUI smoke test here used SwiftShader under Xvfb.
Do not disable WebGL or use JavaFX WebView for this renderer.

See `VALIDATION.md`, `docs/preview.png`, and `ATTRIBUTION.md`.

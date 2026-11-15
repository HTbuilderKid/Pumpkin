# Your React project as a JavaFX desktop app

This packages the uploaded **Health-Stat-Page.zip** interface inside a real JavaFX
window using embedded Chromium/JCEF. The uploaded interface is the **plush UI
component gallery**, not the previously created health dashboard. Its React
components, CSS, fonts, animations, source dialogs, and layout are retained.

JavaFX owns the desktop window and lifecycle. Chromium renders the bundled React
interface locally; no external browser, Node process, development server, or
internet connection is needed at runtime after the desktop dependencies are built.
This is a desktop app with a bundled web renderer, not a native-control rewrite.

## Run on Windows

Install/use a **full desktop JDK 21+** and **Maven 3.9+**. In the extracted folder,
where this README and the root `pom.xml` are located:

```powershell
mvn clean package
.\run.bat
```

Set `JAVA_HOME` to your JDK if Maven uses another Java version. The first Maven
build downloads the appropriate Chromium native bundle (~150 MB compressed on
Linux), JavaFX, and Java dependencies. The first launch extracts Chromium to
`desktop/runtime/jcef`. Later launches only need `run.bat`.

**Node.js is not needed to run this package.** A production static UI export is
already included under `desktop/src/main/resources/ui`.

On Linux/macOS:

```sh
mvn clean package
./run.sh
```

Linux requires a display server and the usual Chromium/GTK desktop libraries,
including GTK 3, NSS, GBM, ALSA, X11, GL, and the desktop JDK's AWT libraries.
The script supplies the JDK native-library paths when JAVA_HOME is set.
Build and run separately for each OS/architecture; native binaries are not
interchangeable. Profiles are included for Linux x64, Windows x64, macOS Intel,
and macOS ARM. Windows/macOS were not executed in this cloud environment.

## What is included

- `web/`: original React/Next.js source and original frozen pnpm lockfile.
- `desktop/`: Maven JavaFX host, Chromium adapter, native clipboard bridge,
  classpath asset server, tests, and the ready static UI.
- `desktop/src/main/resources/ui/`: bundled HTML, JS, CSS, fonts, images, preview
  routes and registry JSON. These ship inside the Java JAR.
- `dist/react-javafx-desktop-1.0.0.jar`: prebuilt app/component JAR, containing
  the UI too. Dependencies still need to be supplied by Maven or your app.
- `docs/preview.png` and `docs/narrow.png`: actual JavaFX window captures.
- Root build/run scripts and validation details.

The UI itself remains React. No automatic conversion to native JavaFX controls
has been attempted. The fonts and CSS remain the originals. The host advertises
a desktop mouse/fine pointer so the existing hover media rules work in off-screen
mode, rather than accidentally using the touch presentation.

Native input is forwarded to Chromium. Mouse input uses JCEF events; keyboard
input uses Chromium's in-process DevTools input protocol to avoid private AWT
scancode dependencies on Windows. No remote-debugging TCP port is opened.
Popups, cursor changes, wheel scrolling, keyboard modifiers and text input are
handled by the adapter. Full IME, accessibility/screen-reader integration, and
touch-device behavior are not claimed as tested.

## Java ↔ React bridge

The host injects a small bridge after each bundled page loads:

```javascript
const info = await window.desktop.getAppInfo();
await window.desktop.writeClipboard("text to copy");
```

The original Copy buttons keep their appearance. Their clipboard writes are
routed through JavaFX's native clipboard; no extra JavaFX controls are added to
the web layout. Existing local React state behaves as in the upload. This wrapper
does not invent a backend, payment processing, or health-record storage.

Only the bundled loopback origin may use the bridge. Internal preview routes
stay in the app. User-clicked external HTTP/HTTPS links open through the operating
system's browser. That is for external documentation/GitHub links; the main app
itself stays in JavaFX. The original registry/install commands still refer to the
original URLs, just as in the uploaded project.

`DesktopView.evaluate(expression)` lets trusted Java code read/update its own
page and receive a JSON result asynchronously. Do not concatenate untrusted user
input into JavaScript expressions. Extend the typed bridge handler in
`DesktopView` when adding application-specific backend operations.

The asset server binds only 127.0.0.1 on a random free port, serves a whitelist
from the JAR, supports Next's exported routes, and stops with the view. It is an
internal part of the desktop app, not a separately managed web server.

## Rebuild the React interface after changes

Only frontend development needs **Node.js 22+**. Package versions and the lockfile
are unchanged. From this folder:

```powershell
.\build-web.ps1
mvn clean package
.\run.bat
```

If PowerShell blocks local scripts, run the script with an execution policy that
your organization permits, or run the equivalent commands manually:

```powershell
cd web
npx --yes pnpm@9.15.9 install --frozen-lockfile
npx --yes pnpm@9.15.9 build
cd ..
node tools/sync-export.mjs
mvn clean package
.\run.bat
```

On Linux/macOS, use `./build-web.sh` followed by `mvn package`.
`tools/sync-export.mjs` copies `web/out` and writes the asset manifest. It replaces
only the generated `desktop/src/main/resources/ui` directory. Do not hand-edit
those generated files; edit `web/` and rebuild.

One original build script, **`web/scripts/build-registry.mjs`**, was made portable. It now uses
`fileURLToPath` for paths containing Windows drive letters/spaces and invokes the
pnpm JavaScript CLI through Node rather than trying to execute a Windows .cmd file
as a native executable. No React component or stylesheet was changed.

## Embed in an existing JavaFX application

Build the `desktop` Maven module and add its JAR plus dependencies to your app.
Keep JCEF, its dependencies, and this adapter **on the classpath**; the adapter
uses JCEF's pinned package-level off-screen API. JavaFX can remain on the module
path. Pin jcefmaven 152.0.6 until the adapter has been tested with another version.

Initialize one `DesktopRuntime` for the process (on a worker/init thread):

```java
DesktopRuntime runtime = DesktopRuntime.open(writableDataDirectory);
```

On JavaFX's application thread:

```java
DesktopView view = new DesktopView(runtime);
yourBorderPane.setCenter(view);
view.setOnExternalLink(getHostServices()::showDocument);
view.ready().thenCompose(v -> view.evaluate("document.title"))
    .thenAccept(System.out::println);
```

If an existing app is a named module, keep this adapter/JCEF on the classpath and
add `--add-reads your.module=ALL-UNNAMED` for compilation and launch. Include
`requires jdk.httpserver;` in the host module so the local asset server resolves.
Do not put the adapter or JCEF on the JPMS module path: the adapter shares the
`org.cef.browser` package with the pinned JCEF API. A process may initialize CEF
only once; coordinate its runtime with any other embedded Chromium views.

When permanently discarding the view, call `view.close()` on JavaFX's thread.
After all views' `disposed()` futures complete, call `runtime.close()` once.
The runtime schedules native disposal on AWT to avoid cross-thread shutdown
locks. See `DesktopApp.stop()` for the complete application example.

## Distribution and verification

After `mvn package`, ship these outputs together with the launch scripts and a
suitable full Java runtime:

- `desktop/target/react-javafx-desktop-1.0.0.jar`
- `desktop/target/lib/`
- `desktop/target/javafx/`

Keep all dependency/native license notices. Chromium extracts to a writable
runtime directory; set the JVM property `desktop.runtime` for a writable
per-user location in an installed app. Do not run two processes with the same
Chromium cache directory. This ZIP is a source/buildable desktop package, not
a Windows MSI/EXE installer.

`mvn test` checks bundled HTML/preview/registry routes and path confinement.
`run.bat --smoke` or `./run.sh --smoke` exercises the real React UI through the
JavaFX/CEF input adapter, bridge, clipboard, routes, resize and disposal. The
smoke test changes only demo UI state and clipboard text; it does not contact a
payment service or edit the original source. It writes PNGs under desktop/target.

For a GPU-less Linux cloud display, the demo supports an explicit rendering
fallback via JVM option `-Ddesktop.software=true` (disables GPU compositing).
Normal launch uses Chromium's normal graphics selection. See `VALIDATION.md`.

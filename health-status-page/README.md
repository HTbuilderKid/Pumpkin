# HM native JavaFX health status page

A native JavaFX recreation of the screenshot's **STATUS** cards and metric detail
page. JavaFX renders every control, sparkline, chart, guide, and input. No browser,
Chromium, Python process, or server is needed for this page.

## Run it now

Requires JDK 21+, Maven 3.9+, and a desktop display. In this folder:

```powershell
mvn clean package
mvn javafx:run
```

Or double-click `run.bat` on Windows once Maven is on your PATH. Linux/macOS can
use `./run.sh`. Maven resolves JavaFX 21.0.6 for your OS; no manual JavaFX SDK path
is required. `HealthDemo` is the standalone demo entry point.

The demo opens with the original Alex Rivera simulated data, mission day 45,
hydration selected, and the “Hostile, closed environment” hazard focus used in the
screenshot. The toolbar changes the viewed mission day, hazard, and environment.
Clear focus removes the yellow dashed card outlines.

Demo changes persist to `~/.hm-health-demo/readings.json`, so they survive restart.
To choose another file, set the JVM property `health.data` in your IDE's VM options:

```text
-Dhealth.data=D:\YourAppData\health-readings.json
```

Deleting ONLY that demo data file restores the initial sample data. Never point
the demo at your team's production patient data store.

## Included functionality

- All 11 daily metric cards: heart rate, both blood pressures, fasting sugar,
  temperature, oxygen, sleep, mood, hydration, exercise, and body mass.
- Severity colours, selected-card styling, hazard outlines, baseline comparisons,
  and 14-reading sparklines. Click any card to show its detail.
- Personal pre-launch baseline (or first-three fallback), rolling three-reading
  averages for sleep/mood/exercise, fixed bands, meaningful shifts, trends, and
  sudden-jump remeasurement handling, ported from the original JavaScript.
- Native trend chart: personal-normal band, healthy-range limits, launch marker,
  final readings, replaced-reading crosses, and hover values.
- Numeric and scale entry controls, validation, asynchronous persistent saves,
  same-day repeats, and immediate card/chart/advice refresh. Repeats keep the
  earlier readings and use the latest sequence for assessment.
- Original advice, why/how/source disclosures, and all eight equipment guides.
  Guides include step navigation, start/stop timers, equipment/space/mistake notes,
  and a final record form (including paired blood-pressure inputs).
- Guide recording always targets the current mission day, as in the original,
  even if the page was viewing a historical day. The inline form saves to the
  day being viewed. Future days are rejected.
- Responsive card columns and stacked detail panels on narrower windows.

This component covers the daily-metric screenshot, not the original app's lab
archive/crew comparison, radiation panel, full check-in dashboard, or account
management. The original catalog is retained, but this engine explicitly assesses
only daily indicators. It does not silently pretend to assess laboratory records.
The original 3D viewer remains a separate component.

## Integrate in HM_repo: direct Java approach

Copy these into the corresponding locations in the actual Maven module that runs
your team's JavaFX application:

- `src/main/java/org/hm/health/`
- `src/main/resources/health/`

`HealthDemo.java` and `HealthSmoke.java` are optional demo/testing hosts; you may
omit them when copying source. Keep all other classes, CSS, fonts, JSON, and FXML.
Keep the font licenses and attribution in your distribution.

Add the JavaFX controls/FXML and Gson dependencies from this project's `pom.xml`.
Use your team's existing JavaFX version if it is 21+; avoid conflicting versions.
For a modular **source-copy** project, add to `module-info.java`:

```java
requires javafx.controls;
requires javafx.fxml;
requires com.google.gson;
opens org.hm.health to javafx.fxml, com.google.gson;
```

If copying the optional smoke/demo hosts, also add `requires java.desktop;` for
PNG smoke-test output. Alternatively the supplied compiled library in `dist/`
can stay as a separate dependency; see the library option below.

On the JavaFX application thread, create the view in your controller:

```java
var catalog = HealthCatalog.load();
var store = new JsonReadingStore(
    Path.of(System.getProperty("user.home"), ".hm", "crew-001-readings.json"),
    List.of()); // actual user: start empty, not with the simulated seed
var session = new HealthSession(catalog, store, "crew-001", currentMissionDay);

HealthStatusPane page = new HealthStatusPane(session);
yourBorderPane.setCenter(page);
// Or: yourStackPane.getChildren().setAll(page);
```

Imports: `org.hm.health.*`, `java.nio.file.Path`, `java.util.List`.
The catalog/store/session creation can throw IOException; surface that through
your app's startup error handling. All records in one store belong to the same
person. Create a new session when changing person/current mission day.

For original demo data instead, use `JsonReadingStore.demo(path)` and crew ID
`"SIM-1"`, with current mission day 45. These values are invented demo data.

### FXML approach

A ready wrapper is at `health/HealthStatusPage.fxml`. After loading it, inject
the session before displaying it:

```java
FXMLLoader loader = new FXMLLoader(
    HealthStatusPane.class.getResource("/health/HealthStatusPage.fxml"));
Parent content = loader.load();
HealthStatusController controller = loader.getController();
controller.setSession(session);
yourBorderPane.setCenter(content);
HealthStatusPane page = controller.page();
```

Imports additionally: `javafx.fxml.FXMLLoader`, `javafx.scene.Parent`.
Call `controller.close()` when permanently disposing of that screen. For the
direct approach call `page.close()` instead. Closing cancels guide timers and
lets any in-flight save finish; remove/dispose the page on the JavaFX thread.

### Use your team's database instead of local JSON

Implement `ReadingStore.load()` and `ReadingStore.save(List<Reading>)` using your
existing persistence service. Save the supplied snapshot atomically, or use a
transaction to preserve same-day repeats. `HealthSession` validates the complete
batch before saving and keeps in-memory state unchanged if persistence fails.
Only this adapter needs to know about your database; UI and assessment code do not.

`Reading` uses the original JSON field names (`crew_id`, `mission_day`, etc.).
Reads load during session construction; writes run on the page's background save
executor. The host should load a large external database before mounting the view.

## Page API and 3D integration

```java
page.setSelectedIndicator("hydration");
page.setMissionDay(38);             // historical day, <= session.today()
page.setEnvironment("station");    // station, transit, lunar, rover
page.setHazard("hostile");         // radiation, isolation, distance, gravity, hostile
page.setHazard(null);              // clear dashed hazard outlines
page.refresh();                    // after external session changes
```

If the Chromium 3D component is in your app too, connect the existing APIs:

```java
page.setOnSystemLevels(levels -> body.setLevels(levels));
page.setOnSystemSelected(systemId -> body.select(systemId));
body.setOnPick(systemId -> {
    if (systemId == null) return;
    var results = session.assess(page.missionDay());
    catalog.daily().stream()
        .filter(i -> i.system().equals(systemId))
        .max(java.util.Comparator.comparingInt(i -> results.get(i.id()).level()))
        .ifPresent(i -> page.setSelectedIndicator(i.id()));
});
```

Callbacks run on JavaFX's thread. A marker opens that system's most severe daily
metric; systems with no daily indicator leave the page unchanged. Setting the 3D
selection programmatically does not emit another pick, so this avoids loops.
No 3D dependency is required unless you choose to connect the components.

## Compiled library option

`dist/health-status-page-1.0.0.jar` contains the classes and resources. Add it plus
JavaFX controls, JavaFX FXML, and Gson 2.11.0 to your application, instead of copying
source. It is a normal library JAR, not a self-contained executable or Java runtime.
The supplied POM can also be added as a separate Maven module.

For a named-module host using this library JAR on the module path:

```java
requires org.hm.health;
requires javafx.controls;
requires javafx.fxml;
requires com.google.gson;
```

The automatic module is open for its own Gson/FXML access; do not put the
source-copy `opens org.hm.health` directive in your host module in this case.

## Verification

`mvn test`: seven JUnit tests, including comparison with **660 expected assessments
generated by the original JavaScript engine**, threshold boundaries, correction
of a sudden spike, atomic save/reload, rejected batches, failed writes, nonblocking reads during persistence, and corrupt
files. Tests never modify the uploaded original database.

```powershell
mvn javafx:run "-Djavafx.args=--smoke"
```

The GUI smoke check uses a fresh temporary store on every run. It exercises the
actual controls for selection, history, invalid entry, saves/repeats, reload,
guide recording, timer cleanup, responsive layout, and FXML loading. It writes
screenshots under `target/` and exits nonzero on failure.

Tested on Linux/JDK 21/JavaFX 21.0.6. Windows/macOS were not executed here; Maven
selects their JavaFX native dependencies. See `docs/preview.png`,
`docs/narrow.png`, `VALIDATION.md`, and `ATTRIBUTION.md`.

# Vitals: crew health monitor

A JavaFX desktop app for the NASA Space Apps challenge "Health Monitoring Software". Crew members log their vitals;
the app compares each reading with that person's own normal and says what to do about it.

## Run it

You need JDK 21 or newer. Maven is included (the `mvnw` wrapper).

```bash
./mvnw javafx:run
```

On Windows use `mvnw.cmd javafx:run`. To start with one simulated crew member already in the database:

```bash
./mvnw javafx:run "-Djavafx.args=--demo"
```

Run the tests with `./mvnw test`.

## Voice control (OpenAI)

The same native JavaFX page now includes push-to-talk voice control. Run the app, click **OpenAI key**, paste your
API key and click **Use key**. Then click **Start voice**, say one command and click **Stop and interpret**.
No Python, Node, browser, or separate backend is required for health-page voice control.

See [VOICE.md](VOICE.md) for commands, key setup, troubleshooting and verification details. The 3D viewer stays a
separate project in this upload; voice commands control the health page.

## The database

Everything the app shows comes from one SQLite file, `HealthMonitor.db`, created in the folder you start the app from.
It is not committed to git; each computer has its own. Delete the file to start empty. To use a different file, pass
`--db=path/to/file.db` in `javafx.args`.

| Table | What it holds |
| --- | --- |
| `astronaut` | Name, optional height, and launch date. The launch date is mission day 0. |
| `data` | One row per log entry: who, when, which mission day, and a column per vital. Only the vitals measured at that moment are filled in. |

The tables are defined in `src/main/resources/com/example/healthmonitor/schema.sql`. It runs at every start and only
creates what is missing; it never deletes anything.

How a reading travels:

1. Someone enters a value on the status page (or at the end of an equipment guide).
2. `HealthSession` checks it is a possible value.
3. `DatabaseReadingStore` turns the values entered together into one new `data` row, through `MeasurementDAO`.
4. On the next start, `DatabaseReadingStore` reads the rows back and the page assesses them again.

## Where things are

| Path | What it holds |
| --- | --- |
| `src/main/java/com/example/healthmonitor/MainApp.java` | The window: crew picker, launch date, the status page |
| `.../Database.java`, `schema.sql` | Opening the database and creating its tables |
| `.../Astronaut.java`, `AstronautDAO.java` | Crew members, and reading and writing them |
| `.../Measurement.java`, `MeasurementDAO.java` | One log entry, and reading and writing them |
| `.../DatabaseReadingStore.java` | The link between the status page and the `data` table |
| `.../DemoData.java` | The simulated crew member (every value invented) |
| `.../AddCrewController.java` | The code behind `AddCrew.fxml` |
| `src/main/java/org/hm/health/` | The health status page: the wheel of metric cards, the detail card, the chart, the equipment guides, and the assessment rules |
| `src/main/resources/health/` | The page's stylesheet, fonts, the catalogue of indicators (limits, advice, guides) and the demo readings |
| `src/main/resources/com/example/healthmonitor/*.fxml` | Screens. `AddCrew.fxml` is in use; `main.fxml`, `hello-view.fxml`, `LogVitals.fxml` and `HowToUse.fxml` are not wired up yet |
| `3D-Model/chromium-body-viewer/` | The 3D body viewer, a separate project, not yet connected to this app |
| `src/test/` | Tests for the assessment rules, the storage layer and the database |

## Not connected yet

- **The 3D body viewer.** The status page already offers the hooks (`page.setOnSystemLevels`, `page.setOnSystemSelected`);
  see the viewer's own README.
- **`LogVitals.fxml` and `HowToUse.fxml`.** The status page already lets you add readings and has step-by-step equipment
  guides, so decide whether these two screens are still wanted before writing their controllers.
- **Strength.** The `data` table has a `strength` column, but the page has no limits or advice for it, so it is stored
  and not shown.

## Limits

The limits and advice are reference values written for a prototype and need review by a flight surgeon. The app
supports a crew member's judgement; it does not diagnose. There is no sign-in: anyone who can open the app can read
and change the data.

## Credits

- Look: after the Plush widgets (plush-ui, MIT) and the Apple Health summary; no Plush code or Apple assets are included.
- Font: Open Runde, SIL Open Font Licence. See `licenses/`.
- 3D body models (in the viewer): BodyParts3D, © The Database Center for Life Science, CC Attribution-Share Alike 2.1 Japan.

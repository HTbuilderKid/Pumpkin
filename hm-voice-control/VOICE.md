# OpenAI voice control for Vitals

This is your uploaded HM_repo JavaFX app, with its existing health-page styling, SQLite database, crew management,
charts and measurement guides. A voice toolbar has been added above the page. The separate 3D viewer is included
as it was in the upload and is not connected to voice control.

## Windows: run without IntelliJ

1. Extract the ZIP. Open PowerShell in the extracted `HM-voice-control` folder, alongside `pom.xml`.
2. Check `java -version` uses **JDK 21 or newer**. Set `JAVA_HOME` to that JDK if the Maven wrapper reports a different version.
3. Run:

```powershell
.\mvnw.cmd javafx:run
```

Or double-click `run-voice.bat`. The wrapper downloads Maven/JavaFX dependencies on the first run, so allow internet
access. You do not need to install JavaFX separately, and you do not need Python or Node for these voice controls.

For a fresh database with an invented crew member and readings:

```powershell
.\mvnw.cmd javafx:run "-Djavafx.args=--demo"
```

`--demo` only adds data when the database has no crew. To keep your existing database, launch from the same folder
as before, or explicitly select it:

```powershell
.\mvnw.cmd javafx:run "-Djavafx.args=--db=D:/path/to/HealthMonitor.db"
```

On macOS/Linux: `chmod +x mvnw`, then `./mvnw javafx:run`.

## Add your API key

Click **OpenAI key**, paste the key alone (without quotes), then click **Use key**. It takes effect immediately and
stays in memory until the app exits. No source-code edits are needed. Re-enter it after restarting.

Alternatively, set `OPENAI_API_KEY` in the launching PowerShell session before starting the app. The app reads it
at startup. Do not put a real key into source code, a committed script, or a ZIP. A `.env` file is **not** loaded.

Your OpenAI API project needs billing/credits and access to these models:

- `gpt-4o-mini-transcribe` for speech transcription;
- `gpt-4o-mini` for interpreting a command as a restricted JSON action.

A ChatGPT subscription does not supply API credits. API requests are billed to your project. Voice commands use
two requests; commands entered in the text box use one.

## Use it

Choose a crew member. Click **Start voice**, speak, then click **Stop and interpret**. A recording is limited to
30 seconds. The toolbar shows the recognized transcript and the result. You can also type in the command box and
press Enter or **Run command**, which uses the same command interpreter without microphone capture.

Give one command at a time, for example:

| Say | Result |
| --- | --- |
| Show hydration | Selects the hydration metric |
| Show blood oxygen | Selects oxygen saturation |
| Show mission day 38 | Changes the viewed day |
| Show today | Returns to the current mission day |
| Select Alex Rivera | Selects an existing crew member by name |
| Focus on radiation | Sets the hazard focus |
| Clear the hazard focus | Clears the hazard selection |
| Set environment to lunar | Sets the existing environment selection |
| Record temperature 36.8 Celsius | Opens a confirmation dialog for today's reading |
| Record temperature 98.6 Fahrenheit for mission day 38 | Converts to Celsius and asks you to confirm |
| Record hydration 6 for mission day 38 | Proposes a whole-number hydration reading |
| Help | Shows examples |

Voice supports the eleven daily metrics: heart rate, upper/lower blood pressure, glucose, temperature, blood oxygen,
sleep, mood, hydration, exercise and body mass. Say systolic/diastolic pressure separately. Lab results, deleting data,
adding crew, diagnoses and 3D rotation are not voice actions. Ambiguous or unsupported commands ask for clarification.
Speak in the units displayed by the app, or explicitly state Fahrenheit, pounds or mmol/L for the supported conversions.

**Every proposed reading requires clicking OK in a dialog** showing crew, metric, value, units and mission day.
Cancel writes nothing. Omitted day means today, even when viewing an older chart. Invalid/future readings are rejected.
Existing readings remain in history. If you change crew/day while a request is processing, repeat the command.
The app does not speak responses aloud or listen in the background; this is push-to-talk control.

## Privacy and key handling

The captured WAV, transcript and crew names/IDs needed for matching commands are sent over HTTPS to OpenAI. Historical
readings are not included in the command context. Recordings stay in memory and are not saved by this feature. API
keys are not written to SQLite or application settings, and raw provider errors are not displayed. OpenAI's API data
handling policies still apply to requests. For distribution to other people, have each user supply their own key.

## Troubleshooting

- **Start voice is disabled:** click OpenAI key and supply a key, or set the environment variable before launch.
- **No microphone available:** select a working default recording device in Windows Sound settings and allow desktop
  apps/Java to access the microphone under Privacy & security. Use the text box to check the API separately.
- **Key rejected (401):** replace it in OpenAI key. Remove quotes, spaces and any copied command text.
- **No model access (403):** check that the key's project can use both models above.
- **Quota/rate limit (429):** check API billing, credit balance, project limits and then retry.
- **Connection/timeout:** allow Java HTTPS access to `api.openai.com` and check your internet connection.
- **Wrong recognition:** check the displayed transcript, cancel any incorrect reading, then retry or type the command.
- **No crew yet:** add a crew member or click Load a simulated crew member. Voice does not create profiles.

## Tests and implementation

Run `./mvnw test` (Windows: `.\mvnw.cmd test`). The suite covers the existing app plus WAV/API request shapes,
credential-safe errors and deterministic unit conversions using a local fake HTTP server.

An explicit **offline** GUI test can be run against a new, disposable database:

```powershell
.\mvnw.cmd javafx:run "-Djavafx.args=--voice-smoke --db=target/voice-smoke.db"
```

Delete that test DB before repeating. This test uses a fake API client and fake microphone, enters a dummy key,
exercises the actual JavaFX buttons/dialogs and saves a confirmed reading to SQLite. It prints PASS and exits.
It must never be used as evidence that a real microphone or OpenAI account was tested. Normal launches use the real
HTTPS client and Java Sound microphone. Live speech recognition needs your own valid key, API credits and microphone.

Implementation: `voice/VoiceControlPanel` handles UI/lifecycle; `MicrophoneCapture` captures PCM and produces WAV;
`OpenAiVoiceClient` calls the two endpoints with structured output; `VoiceCommand` defines allowed actions and unit
conversions; `MainApp.executeVoice` validates and routes actions to the existing controls. Network calls and saves run
off the JavaFX thread. No model-supplied code, SQL, or arbitrary method is executed.

## Add to your team's repo

This is a complete project, not a second nested Maven module. Replace the corresponding source and `pom.xml` in a
working branch of HM_repo, or copy this project's contents into a fresh checkout as appropriate. Keep your existing
local database; the package contains no real crew data or API key. Review your Git diff before committing.

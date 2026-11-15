# Verification

Checked in the cloud environment using JDK 21 and JavaFX 21.0.6 on Linux with a virtual display.

- Maven: 17 tests passed, zero failures/errors. Includes the original assessment/storage/database tests and three new voice-client tests.
- HTTP client: local fake HTTP server checked authorization, WAV multipart transcription and structured command requests; provider errors do not expose a key.
- Units: deterministic Fahrenheit/Celsius, pounds/kilograms and glucose conversions, incompatible units and non-finite values.
- JavaFX: entered a dummy key; Start voice/Stop simulated capture; fake transcription selected hydration; a typed command selected mission day 38.
- JavaFX: the reading dialog displayed 36.8; Cancel left both viewed day and reading count unchanged. OK appended exactly one reading, which a new database store read from SQLite.
- The existing health CSS, FXML, fonts, catalogue and 3D viewer files match the uploaded source. Voice controls reuse the same toolbar styling.
- `docs/voice-preview.png` shows the actual JavaFX window after this offline GUI test, with simulated crew data.

No live OpenAI calls or physical microphone capture were tested: the environment has no user API key or microphone.
The API account, model access/billing and OS microphone permissions must be checked on the target computer. Windows
launcher scripts are included; Windows-specific device/launcher behavior was not run in this Linux environment.

Use VOICE.md for commands and steps to reproduce both the normal launch and the explicit offline GUI check.

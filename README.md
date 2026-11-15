# Vitals JavaFX app with OpenAI voice control

Based on the uploaded `HM_repo-main.zip`. Includes the full existing app and its original health-page design,
plus push-to-talk navigation and confirmed reading entry.

[Download HM-voice-control.zip](downloads/HM-voice-control.zip?raw=true)

Extract the ZIP, open PowerShell in `HM-voice-control`, then run:

```powershell
.\mvnw.cmd javafx:run
```

Requires JDK 21+. Click **OpenAI key**, paste your own key, then **Start voice** and **Stop and interpret**.
Try “Show hydration” or “Record temperature 36.8 Celsius”. A reading is saved only after clicking OK.

For simulated crew data in an empty database:

```powershell
.\mvnw.cmd javafx:run "-Djavafx.args=--demo"
```

[Detailed setup and commands](hm-voice-control/VOICE.md) · [Source](hm-voice-control) · [Verification](hm-voice-control/VERIFICATION.md)

The key remains in memory; `OPENAI_API_KEY` is also supported. API billing/model access and microphone permission are
required. The included 3D viewer remains separate, as in the uploaded app.

All 17 tests and an offline JavaFX/database test passed. Live OpenAI speech and physical microphone capture require
your own key/device and were not tested here.

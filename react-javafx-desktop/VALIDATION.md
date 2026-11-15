# Verified results

Platform: Linux x64, full desktop OpenJDK 21.0.13, JavaFX 21.0.6,
JCEF/Chromium 152.0.6 under Xvfb. The GUI smoke run used explicit CPU compositing.

- Original pnpm 9.15.9 frozen lockfile installation: passed.
- Original Next.js 16.4.6 production static export: passed, all preview routes built.
- Included cross-platform rebuild script: passed after correcting Windows path/CLI
  handling in the original build-registry script. No dependency versions changed.
- React/TypeScript/CSS files in app/, components/, registry/ and lib/ match the
  uploaded ZIP byte-for-byte. Hashes are in docs/original-source-hashes.json.
- Root `mvn package`: passed, both asset-server tests passed (zero failures/skips).
- All 215 exported asset files are bundled on the Java classpath, including fonts,
  registry JSON, preview routes and production JS/CSS.
- Native JavaFX screenshot of the actual Chromium renderer: captured.
- Desktop hover media queries: active (the original desktop styling is applied).
- JavaScript -> Java bridge -> JavaScript JSON reply: passed.
- React switch via forwarded JavaFX mouse input and Space key: passed.
- Controlled React text input with Ctrl+A and typed replacement: passed.
- Slider using keyboard arrows: passed.
- Counter increment using native mouse input: passed.
- Radix select menu opening and selection: passed.
- Component source dialog opening and browser history Back: passed.
- Original Copy button: updated to copied state and put the expected text on the
  native JavaFX/system clipboard.
- Exported preview route and home navigation: passed.
- Native wheel scrolling, window resize, and new-width frame transfer: passed.
- No JavaScript console errors were observed during the smoke run.
- Browser, message router, loopback asset server and CEF shutdown: passed; exit 0.

The smoke harness injects JavaFX mouse/keyboard events into the real desktop node;
those go through CEF input handling to the unchanged React controls. It does not
replace mouse interactions with DOM `.click()`. JavaScript queries position the
viewport and inspect results. It is not an OS-level accessibility/Robot test.

The cloud display emitted GTK, DBus, JCEF startup exception headers, and JavaFX
font-cache diagnostics; this is not a claim of warning-free native dependencies.
Windows/macOS launch profiles are included but were not executed here. Full IME,
screen-reader support, touch input, and high-DPI hardware testing remain outside
this run. Keep native dependencies pinned and rerun the smoke on target platforms.

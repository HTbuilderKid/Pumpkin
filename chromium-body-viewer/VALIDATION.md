# Verified results

Platform: Linux x64, full desktop OpenJDK 21.0.13, JavaFX 21.0.6,
jcefmaven 152.0.6 / CEF 152.0.6, Xvfb with explicit SwiftShader WebGL.

- `mvn package`: passed; 3 tests, 0 failures/errors/skips.
- Original model assets, Three.js module, fonts, and GLSL shader-source hashes: matched.
- All 18 meshes and all 129,752 triangles: rendered, WebGL error code 0.
- All nine marker definitions and severity-controlled visibility: passed.
- Java-to-JavaScript severity and selection commands, including queuing during load: passed.
- Forwarded JavaFX mouse press/release on the heart marker, through CEF native input
  and the JavaScript message router back to the Java callback: passed.
- Forwarded mouse drag and wheel: rotation and camera distance changed as expected.
- Window resize: CSS viewport and JavaFX frame width both updated to 620 pixels.
- Actual JavaFX snapshot after interaction: blue anatomical pixels verified,
  separately from the background and marker labels; see `docs/preview.png`.
- A separate named-module JavaFX host compiled and ran against the component JAR
  with classpath JCEF; rendered correctly and exited cleanly.
- Invalid severity rejected: passed.
- Browser, message router, local server, and CEF shutdown: passed; process exited 0.
- An additional JNI-checking run completed after avoiding JCEF's double-delete
  screen-info path. CEF/JavaFX still emit native diagnostic warnings on this cloud
  desktop (including DBus/GTK diagnostics, JCEF startup exception headers, and JNI critical-array warnings). This is not a
  claim of warning-free native dependencies.

The GUI harness injects JavaFX mouse/scroll events into the real view. It does
not replace clicks with JavaScript DOM `.click()` or bypass the native input
adapter. OS-level Robot clicks were not reliable under this headless X server;
they are not counted as passing.

Windows/macOS profiles and launch scripts are supplied but not executed here.
High-DPI scaling and hardware GPU execution must be checked on target desktops.
The smoke test can be rerun with `run.bat --smoke` or `./run.sh --smoke`.

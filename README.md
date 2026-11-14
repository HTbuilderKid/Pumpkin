# Pumpkin Pie Latte
Best repository I've ever made :D

## Original-quality 3D viewer for JavaFX

This branch embeds the original Three.js/WebGL viewer in JavaFX using Chromium
off-screen rendering. It retains the original x-ray shader and interactive markers.

- [Setup and integration guide](chromium-body-viewer/README.md)
- [Download source + compiled component](downloads/chromium-javafx-body-viewer.zip)
- [Rendering preview](chromium-body-viewer/docs/preview.png)
- [Verified checks and platform limits](chromium-body-viewer/VALIDATION.md)

Start with a full JDK 21 and Maven: run `mvn package` in `chromium-body-viewer`,
then `run.bat` on Windows or `./run.sh` on Linux/macOS. Maven supplies the large
platform-specific Chromium runtime; it is not stored in Git. No Python server is
needed for this extracted viewer.

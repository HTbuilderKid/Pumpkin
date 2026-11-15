# Pumpkin Pie Latte
Best repository I've ever made :D

## React interface in a JavaFX desktop window

This branch packages the user's uploaded Health-Stat-Page.zip (the plush React
component gallery) inside a JavaFX app using embedded Chromium. The original
React components, CSS, and fonts are retained.

- [Download the desktop project ZIP](downloads/react-javafx-desktop.zip)
- [Build, run, and integrate](react-javafx-desktop/README.md)
- [Preview](react-javafx-desktop/docs/preview.png)
- [Validation](react-javafx-desktop/VALIDATION.md)

In the extracted project root, run `mvn clean package`, then `run.bat` on Windows
or `./run.sh` on Linux/macOS. Requires a full JDK 21 and Maven. The static React
export is bundled; Node.js is needed only when rebuilding the frontend.

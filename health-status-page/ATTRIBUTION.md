# Source and attribution

The catalog, simulated daily readings, assessment behavior, chart design, guide
content, and visual design originate in the user's uploaded `NASA Hackathon.zip`
(`baseline-app`). `catalog.json` is retained; `demo-readings.json` extracts only
Alex Rivera's invented SIM-1 readings from the included database. No original
database or application files were modified.

The daily assessment and chart logic were ported to Java. Layout, controls,
Canvas drawing, persistence, and guide interactions use native JavaFX.
The source ZIP did not include a general license for its application code; this
package does not assign one on the author's behalf.

Original bundled Inter and DM Mono fonts were converted from WOFF2 to TTF for
JavaFX using FontTools/Brotli without changing their design. Inter and DM Mono
are licensed under SIL Open Font License 1.1; see the included license files.
JavaFX, Gson, and test/build dependencies retain their own licenses and notices.

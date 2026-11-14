# Provenance and third-party licenses

The anatomical assets and viewer originate in the user's `NASA Hackathon.zip`.
Its `tools/build_body.py` identifies the model source as **BodyParts3D 3.0,
© The Database Center for Life Science (DBCLS)**, licensed under
**Creative Commons Attribution-ShareAlike 2.1 Japan**:
https://lifesciencedb.jp/bp3d/ and https://creativecommons.org/licenses/by-sa/2.1/jp/ .
The source project simplified and merged STL parts, oriented the body, converted
units to centimetres, and quantized geometry. `body.bin` and `body.json` are copied
unchanged here. `systems.json` extracts the nine original catalog definitions.
Retain the model's attribution and applicable share-alike terms when distributing.

Three.js r160 is copied unchanged from the uploaded project. Copyright 2010–2023
Three.js Authors, MIT license; see `licenses/THREE-MIT.txt` and the source header.
Inter fonts are retained from the upload; SIL Open Font License 1.1 is in
`licenses/Inter-OFL.txt`.

JCEF/Chromium, jcefmaven, JavaFX, and dependencies have their own licenses.
Their licenses and notices are included in dependency JARs/native bundles; retain
these when packaging. jcefmaven is Apache 2.0; JCEF is BSD-style. This project does
not replace those licenses. The upload included no general license for its own
application code; none is assigned here on the author's behalf.

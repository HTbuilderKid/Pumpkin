# Source and licenses

The React interface is copied from the user's uploaded Health-Stat-Page.zip.
It identifies itself as plush UI (https://github.com/dominikmartn/plush-ui).
The original MIT LICENSE, README, font license notices, and source headers are
retained under web/. React components and CSS were not redesigned.

Original fonts, including the bundled Open Runde fallback, remain under their
original licenses. See web/licenses/. Retain these when distributing the desktop
JAR and exported assets. Static export embeds the original components' source
examples and original registry/install URLs by design.

JCEF, Chromium, jcefmaven, JavaFX, Gson, and other dependencies have their own
licenses/notices. Preserve the notices supplied inside their JARs/native bundles
when distributing a platform-specific build. They are fetched by Maven; the
large native bundles are intentionally not committed to Git.

The off-screen Java adapter builds on the JCEF browser API; package-private access
is pinned to the selected JCEF release. No upstream native binary was patched and
no TLS or artifact-integrity verification was disabled.

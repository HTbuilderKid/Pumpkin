#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
viewer_java=java
if [[ -n "${JAVA_HOME:-}" ]]; then viewer_java="$JAVA_HOME/bin/java"; fi
if [[ ! -d target/javafx || ! -f target/chromium-body-viewer-1.0.0.jar ]]; then
  echo 'Run mvn package before launching.' >&2
  exit 1
fi
if [[ "$(uname -s)" == Linux && -n "${JAVA_HOME:-}" ]]; then
  export LD_LIBRARY_PATH="$JAVA_HOME/lib:$JAVA_HOME/lib/server${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
fi
viewer_flags=(--add-exports=java.desktop/sun.awt=ALL-UNNAMED)
if [[ "$(uname -s)" == Darwin ]]; then
  viewer_flags+=(--add-opens=java.desktop/sun.awt=ALL-UNNAMED --add-opens=java.desktop/sun.lwawt=ALL-UNNAMED --add-opens=java.desktop/sun.lwawt.macosx=ALL-UNNAMED)
fi
exec "$viewer_java" "${viewer_flags[@]}" --module-path target/javafx --add-modules javafx.controls -cp 'target/chromium-body-viewer-1.0.0.jar:target/lib/*' org.pumpkin.viewer.Launcher "$@"

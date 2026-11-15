@echo off
setlocal
cd /d "%~dp0"
set "VIEWER_JAVA=java"
if defined JAVA_HOME set "VIEWER_JAVA=%JAVA_HOME%\bin\java.exe"
if not exist target\chromium-body-viewer-1.0.0.jar (
 echo Run mvn package before launching.
 exit /b 1
)
"%VIEWER_JAVA%" --add-exports=java.desktop/sun.awt=ALL-UNNAMED --module-path target\javafx --add-modules javafx.controls -cp "target\chromium-body-viewer-1.0.0.jar;target\lib\*" org.pumpkin.viewer.Launcher %*
exit /b %ERRORLEVEL%

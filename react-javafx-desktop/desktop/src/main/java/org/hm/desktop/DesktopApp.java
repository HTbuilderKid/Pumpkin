package org.hm.desktop;

import javafx.application.*;
import javafx.scene.Scene;
import javafx.stage.Stage;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

public final class DesktopApp extends Application {
    private DesktopRuntime runtime;
    private DesktopView view;
    @Override public void init()throws Exception{
        runtime=DesktopRuntime.open(Path.of(System.getProperty("desktop.runtime","runtime")),Boolean.getBoolean("desktop.software")?new String[]{"--disable-gpu"}:new String[0]);
    }
    @Override public void start(Stage stage)throws Exception{
        view=new DesktopView(runtime);view.setOnExternalLink(getHostServices()::showDocument);
        stage.setTitle("plush · JavaFX Desktop");stage.setScene(new Scene(view,1440,1000));stage.setMinWidth(600);stage.setMinHeight(420);stage.show();view.requestFocus();
        if(getParameters().getRaw().contains("--smoke"))new DesktopSmoke(view,stage).run();
    }
    @Override public void stop(){if(view!=null){view.close();view.disposed().orTimeout(10,TimeUnit.SECONDS).whenComplete((v,f)->runtime.close());}else if(runtime!=null)runtime.close();}
}

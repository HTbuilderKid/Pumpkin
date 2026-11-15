package org.pumpkin.viewer;

import javafx.application.*;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.stage.Stage;
import java.nio.file.Path;
import java.util.Map;

public final class ViewerDemo extends Application {
    private ChromiumRuntime runtime;
    private ChromiumBodyView body;
    @Override public void init() throws Exception {
        String[] flags = Boolean.getBoolean("viewer.softwareWebGL")
                ? new String[]{"--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"} : new String[0];
        runtime=ChromiumRuntime.open(Path.of(System.getProperty("viewer.runtime","runtime")),flags);
    }
    @Override public void start(Stage stage) throws Exception {
        body=new ChromiumBodyView(runtime);
        Label selected=new Label("Select a marker or an organ"); selected.setWrapText(true);
        VBox sidebar=new VBox(10,new Label("ORIGINAL THREE.JS VIEWER"),selected);
        sidebar.setPrefWidth(220); sidebar.setStyle("-fx-padding:20; -fx-background-color:#10192a; -fx-base:#192b47; -fx-text-base-color:white;");
        for(String id:ChromiumBodyView.SYSTEM_IDS.stream().sorted().toList()) {
            Button b=new Button(id); b.setMaxWidth(Double.MAX_VALUE); b.setOnAction(e->body.select(id)); sidebar.getChildren().add(b);
        }
        CheckBox spin=new CheckBox("Auto rotate"); spin.setSelected(true); spin.selectedProperty().addListener((o,a,b)->body.setSpinning(b));
        Button reset=new Button("Whole body"); reset.setOnAction(e->body.select(null));
        Button clear=new Button("Clear example alerts"); clear.setOnAction(e->body.setLevels(Map.of()));
        sidebar.getChildren().addAll(spin,reset,clear,new Label("Severity values are demo data."));
        body.setOnPick(id->selected.setText(id==null?"Whole body":id));
        body.setLevels(Map.of("brain",1,"heart",3,"fluids",2,"bone",1));
        BorderPane root=new BorderPane(body); root.setRight(sidebar);
        stage.setTitle("NASA original viewer · Chromium + JavaFX"); stage.setScene(new Scene(root,1050,850)); stage.show();
        if(getParameters().getRaw().contains("--smoke")) new ViewerSmoke(body,stage).run();
    }
    @Override public void stop() {
        if(body!=null) { body.close(); body.disposed().orTimeout(10,java.util.concurrent.TimeUnit.SECONDS).whenComplete((v,f)->runtime.close()); }
        else if(runtime!=null)runtime.close();
    }
    public static void main(String[] args){launch(args);}
}

package org.hm.health;

import javafx.application.*;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.stage.Stage;
import java.nio.file.*;

/** Standalone host; embed HealthStatusPane in your existing HM_repo controller instead. */
public final class HealthDemo extends Application {
    private HealthStatusPane page;
    @Override public void start(Stage stage)throws Exception{
        boolean smoke=getParameters().getRaw().contains("--smoke");
        Path file=smoke?Files.createTempDirectory("hm-health-smoke-").resolve("readings.json"):
                Path.of(System.getProperty("health.data",Path.of(System.getProperty("user.home"),".hm-health-demo","readings.json").toString()));
        var catalog=HealthCatalog.load();var session=new HealthSession(catalog,JsonReadingStore.demo(file),"SIM-1",45);
        page=new HealthStatusPane(session);page.setHazard("hostile");
        Spinner<Integer> day=new Spinner<>(-14,45,45);day.setPrefWidth(92);day.valueProperty().addListener((o,a,b)->page.setMissionDay(b));
        ComboBox<HealthCatalog.Hazard> hazard=new ComboBox<>();hazard.setPromptText("No hazard focus");hazard.getItems().addAll(catalog.hazards());hazard.setValue(catalog.hazards().stream().filter(h->h.id().equals("hostile")).findFirst().orElseThrow());hazard.setPrefWidth(260);hazard.setOnAction(e->page.setHazard(hazard.getValue()==null?null:hazard.getValue().id()));
        Button clear=new Button("Clear focus");clear.setOnAction(e->{hazard.setValue(null);page.setHazard(null);});
        ComboBox<HealthCatalog.Environment> environment=new ComboBox<>();environment.getItems().addAll(catalog.environments());environment.setValue(catalog.environments().getFirst());environment.setPrefWidth(260);environment.setOnAction(e->page.setEnvironment(environment.getValue().id()));
        Label person=new Label("Alex Rivera · simulated demo data");Region space=new Region();HBox.setHgrow(space,Priority.ALWAYS);
        HBox toolbar=new HBox(10,person,space,new Label("Mission day"),day,hazard,clear,environment);toolbar.setStyle("-fx-padding:8 18; -fx-background-color:#10151d; -fx-base:#151c29; -fx-text-base-color:#dce7ff; -fx-font-size:13;");
        BorderPane root=new BorderPane(page);root.setTop(toolbar);stage.setTitle("HM · Native JavaFX health status");stage.setScene(new Scene(root,1600,1256));stage.setMinWidth(720);stage.setMinHeight(600);stage.show();page.requestFocus();
        if(smoke)new HealthSmoke(page,stage,file).run();
    }
    @Override public void stop(){if(page!=null)page.close();}
    public static void main(String[] args){launch(args);}
}

package com.example.healthmonitor;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.geometry.Pos;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.ButtonType;
import javafx.scene.control.ComboBox;
import javafx.scene.control.DatePicker;
import javafx.scene.control.Label;
import javafx.scene.control.Spinner;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.layout.VBox;
import javafx.stage.Modality;
import javafx.stage.Stage;
import org.hm.health.HealthCatalog;
import org.hm.health.HealthSession;
import org.hm.health.HealthStatusPane;

import java.time.LocalDate;
import com.example.healthmonitor.voice.*;
import java.util.concurrent.*;
import java.util.List;

/**
 * The app window: pick a crew member at the top, see their health status below. Everything shown comes from the database.
 *
 * Options (after "--" on the command line, or -Djavafx.args with Maven):
 *   --db=path/to/file.db   use another database file (default: HealthMonitor.db in the folder the app is started from)
 *   --demo                 if the database has no crew yet, add one simulated crew member
 */
public class MainApp extends Application {
    private final AstronautDAO astronauts = new AstronautDAO();
    private final BorderPane root = new BorderPane();
    private final ComboBox<Astronaut> crew = new ComboBox<>();
    private final DatePicker launch = new DatePicker();
    private final Spinner<Integer> day = new Spinner<>(0, 0, 0);
    private final ComboBox<HealthCatalog.Hazard> hazard = new ComboBox<>();
    private final ComboBox<HealthCatalog.Environment> environment = new ComboBox<>();
    private final Label today = new Label();
    private HealthCatalog catalog;
    private HealthStatusPane page;
    private Stage stage;
    private VoiceControlPanel voice;
    private boolean updating;          // true while the controls are being filled in by the program, not the user

    @Override
    public void start(Stage stage) throws Exception {
        this.stage = stage;
        String db = getParameters().getNamed().get("db");
        if (db != null) Database.setDbUrl("jdbc:sqlite:" + db);
        Database.init();
        catalog = HealthCatalog.load();
        HealthStatusPane.loadFonts();
        if ((getParameters().getUnnamed().contains("--demo") || getParameters().getUnnamed().contains("--voice-smoke")) && astronauts.findAll().isEmpty()) DemoData.load();

        // ---- the bar at the top ----
        Label title = new Label("Vitals"); title.getStyleClass().add("toolbar-title");
        Button add = new Button("Add crew"); add.setOnAction(e -> addCrew());
        Button remove = new Button("Remove"); remove.setOnAction(e -> removeCrew());
        crew.setPrefWidth(210); crew.setPromptText("No crew yet");
        crew.setOnAction(e -> { if (!updating) show(crew.getValue()); });
        launch.setPrefWidth(130); launch.setEditable(false);
        launch.setOnAction(e -> { if (!updating) changeLaunch(); });
        day.setPrefWidth(92);
        day.valueProperty().addListener((o, a, b) -> { if (!updating && page != null && b != null) page.setMissionDay(b); });
        hazard.getItems().addAll(catalog.hazards()); hazard.setPromptText("No hazard focus"); hazard.setPrefWidth(175);
        hazard.setOnAction(e -> { if (page != null) page.setHazard(hazard.getValue() == null ? null : hazard.getValue().id()); });
        Button clear = new Button("Clear"); clear.setOnAction(e -> hazard.setValue(null));
        environment.getItems().addAll(catalog.environments()); environment.setValue(catalog.environments().get(0)); environment.setPrefWidth(190);
        environment.setOnAction(e -> { if (page != null) page.setEnvironment(environment.getValue().id()); });
        Region space = new Region(); HBox.setHgrow(space, Priority.ALWAYS);
        HBox bar = new HBox(10, title, crew, add, remove, new Label("Launched"), launch, today, space, new Label("Viewing day"), day, hazard, clear, environment);
        for (var node : bar.getChildren()) if (node instanceof Label || node instanceof Button) ((Region) node).setMinWidth(Region.USE_PREF_SIZE);   // never cut a word short
        bar.setAlignment(Pos.CENTER_LEFT); bar.getStyleClass().add("health-toolbar");
        bar.getStylesheets().add(HealthStatusPane.class.getResource("/health/health.css").toExternalForm());
        VoiceControlPanel.Host voiceHost=new VoiceControlPanel.Host(){
            public VoiceCommand.Context context(){return voiceContext();}
            public CompletableFuture<String> execute(VoiceCommand command,VoiceCommand.Context captured){return executeVoice(command,captured);}
        };
        boolean smoke=getParameters().getUnnamed().contains("--voice-smoke");
        voice=smoke?new VoiceControlPanel(voiceHost,VoiceSmoke.fakeAi(),VoiceSmoke.fakeAudio()):new VoiceControlPanel(voiceHost);
        root.setTop(new VBox(bar,voice));

        stage.setTitle("Vitals · Health monitor");
        stage.setScene(new Scene(root, 1600, 1000));
        stage.setMinWidth(760); stage.setMinHeight(600);
        refreshCrew(null);
        stage.show();
        if(smoke)new VoiceSmoke(stage,voice,()->page).run();
    }

    /** Reload the crew list from the database and show one of them (the given one, else the first). */
    private void refreshCrew(Astronaut select) throws Exception {
        List<Astronaut> all = astronauts.findAll();
        updating = true;
        crew.getItems().setAll(all);
        Astronaut chosen = select == null ? null : all.stream().filter(a -> a.getId() == select.getId()).findFirst().orElse(null);
        if (chosen == null && !all.isEmpty()) chosen = all.get(0);
        crew.setValue(chosen);
        updating = false;
        show(chosen);
    }

    /** Build the status page for one crew member from what the database holds about them. */
    private void show(Astronaut astronaut) {
        if (page != null) { page.close(); page = null; }
        boolean none = astronaut == null;
        launch.setDisable(none); day.setDisable(none); hazard.setDisable(none); environment.setDisable(none);
        if (none) { today.setText(""); root.setCenter(emptyState()); return; }
        try {
            int now = astronaut.missionDay(LocalDate.now());
            HealthSession session = new HealthSession(catalog, new DatabaseReadingStore(astronaut.getId()), Integer.toString(astronaut.getId()), now);
            page = new HealthStatusPane(session);
            int first = session.readings().stream().mapToInt(r -> r.day()).min().orElse(now);
            updating = true;
            launch.setValue(astronaut.getLaunchDate());
            day.setValueFactory(new javafx.scene.control.SpinnerValueFactory.IntegerSpinnerValueFactory(Math.min(first, now), now, now));
            today.setText(now > 0 ? "mission day " + now : now == 0 ? "launch day" : -now + " days before launch");
            updating = false;
            page.setEnvironment(environment.getValue().id());
            if (hazard.getValue() != null) page.setHazard(hazard.getValue().id());
            // open on whatever most needs attention
            session.assess(now).entrySet().stream().max(java.util.Comparator.comparingInt(e -> e.getValue().level())).ifPresent(e -> page.setSelectedIndicator(e.getKey()));
            root.setCenter(page);
        } catch (Exception e) {
            updating = false;
            root.setCenter(message("The data for " + astronaut.getName() + " could not be loaded.", e.getMessage()));
        }
    }

    private void changeLaunch() {
        Astronaut astronaut = crew.getValue();
        if (astronaut == null || launch.getValue() == null) return;
        try { astronauts.setLaunchDate(astronaut.getId(), launch.getValue()); astronaut.setLaunchDate(launch.getValue()); show(astronaut); }
        catch (Exception e) { error("The launch date could not be saved.", e); }
    }

    private void addCrew() {
        try {
            FXMLLoader loader = new FXMLLoader(MainApp.class.getResource("AddCrew.fxml"));
            loader.setController(new AddCrewController(added -> { try { refreshCrew(added); } catch (Exception e) { error("The crew list could not be reloaded.", e); } }));
            Parent form = loader.load();
            Stage dialog = new Stage();
            dialog.initOwner(stage); dialog.initModality(Modality.WINDOW_MODAL); dialog.setTitle("Add crew");
            dialog.setScene(new Scene(form)); dialog.showAndWait();
        } catch (Exception e) { error("The add-crew screen could not be opened.", e); }
    }

    private void removeCrew() {
        Astronaut astronaut = crew.getValue();
        if (astronaut == null) return;
        Alert ask = new Alert(Alert.AlertType.CONFIRMATION, "Remove " + astronaut.getName() + " and everything they have logged? This cannot be undone.", ButtonType.CANCEL, ButtonType.OK);
        ask.initOwner(stage); ask.setHeaderText("Remove crew member");
        if (ask.showAndWait().orElse(ButtonType.CANCEL) != ButtonType.OK) return;
        try { astronauts.deleteAstronaut(astronaut.getId()); refreshCrew(null); }
        catch (Exception e) { error("The crew member could not be removed.", e); }
    }

    /** What the window shows while the database has no crew. */
    private Region emptyState() {
        Button add = new Button("Add a crew member"); add.getStyleClass().add("primary"); add.setOnAction(e -> addCrew());
        Button demo = new Button("Load a simulated crew member");
        demo.setOnAction(e -> { try { refreshCrew(DemoData.load()); } catch (Exception ex) { error("The demo data could not be loaded.", ex); } });
        HBox buttons = new HBox(10, add, demo); buttons.setAlignment(Pos.CENTER);
        VBox box = (VBox) message("No crew yet", "Add a crew member to start logging, or load a simulated one to see how the page works. The simulated readings are invented.");
        box.getChildren().add(buttons);
        return box;
    }

    private Region message(String heading, String text) {
        Label h = new Label(heading); h.getStyleClass().add("page-title");
        Label t = new Label(text); t.getStyleClass().add("muted"); t.setWrapText(true); t.setMaxWidth(520); t.setAlignment(Pos.CENTER); t.setTextAlignment(javafx.scene.text.TextAlignment.CENTER);
        VBox box = new VBox(14, h, t); box.setAlignment(Pos.CENTER); box.getStyleClass().add("health-page");
        box.getStylesheets().add(HealthStatusPane.class.getResource("/health/health.css").toExternalForm());
        return box;
    }

    private void error(String what, Exception e) {
        Alert alert = new Alert(Alert.AlertType.ERROR, e.getMessage() == null ? e.toString() : e.getMessage(), ButtonType.OK);
        alert.initOwner(stage); alert.setHeaderText(what); alert.showAndWait();
    }

    private VoiceCommand.Context voiceContext(){
        Astronaut selected=crew.getValue();return new VoiceCommand.Context(selected==null?null:Integer.toString(selected.getId()),page==null?0:page.missionDay(),page==null?0:page.session().today(),crew.getItems().stream().map(a->new VoiceCommand.Crew(Integer.toString(a.getId()),a.getName())).toList());
    }
    private CompletableFuture<String> executeVoice(VoiceCommand cmd,VoiceCommand.Context captured){
        if(cmd==null||cmd.action()==null)throw new IllegalArgumentException("No supported command was recognized.");
        if(cmd.action()==VoiceCommand.Action.HELP)return CompletableFuture.completedFuture("Try: Show hydration; select a crew member by name; show mission day 38; record temperature 36.8 Celsius. Readings always require confirmation.");
        if(cmd.action()==VoiceCommand.Action.UNSUPPORTED)return CompletableFuture.completedFuture(cmd.message()==null?"Please give one supported command, with a metric and value for recording.":cmd.message());
        if(!java.util.Objects.equals(voiceContext().currentCrew(),captured.currentCrew())||voiceContext().viewingDay()!=captured.viewingDay())throw new IllegalArgumentException("The selected crew/day changed while processing. Please repeat the command.");
        Astronaut target=cmd.crew_id()==null?crew.getValue():crew.getItems().stream().filter(a->Integer.toString(a.getId()).equals(cmd.crew_id())).findFirst().orElseThrow(()->new IllegalArgumentException("Crew member not found."));
        if(target==null)throw new IllegalArgumentException("Add or select a crew member first.");
        if(cmd.action()==VoiceCommand.Action.PREPARE_READING){
            var ind=catalog.indicator(cmd.indicator());if(cmd.value()==null)throw new IllegalArgumentException("Specify the reading's value.");
            double value=VoiceCommand.nativeValue(ind.id(),cmd.value(),cmd.unit());int today=target.missionDay(LocalDate.now()),recordDay=cmd.day()==null?today:cmd.day();
            if(recordDay< -3650||recordDay>today)throw new IllegalArgumentException("Cannot record a reading for that mission day.");
            if(value<ind.input().min()||value>ind.input().max()||!Double.isFinite(value)||(ind.input().type().equals("scale")&&value!=Math.rint(value)))throw new IllegalArgumentException("Reading is outside the allowed range/scale for "+ind.name()+".");
            Alert confirm=new Alert(Alert.AlertType.CONFIRMATION,"Crew: "+target.getName()+"\nMetric: "+ind.name()+"\nValue: "+value+" "+ind.unit()+"\nMission day: "+recordDay+"\n\nSave this reading? Existing readings are retained as history.",ButtonType.CANCEL,ButtonType.OK);confirm.initOwner(stage);confirm.setTitle("Confirm voice reading");confirm.setHeaderText("Check the recognized value before saving");
            if(confirm.showAndWait().orElse(ButtonType.CANCEL)!=ButtonType.OK)return CompletableFuture.completedFuture("Reading cancelled. Nothing was saved.");
            crew.setValue(target);if(page==null)throw new IllegalStateException("Crew data could not be loaded.");viewVoiceDay(recordDay);page.setSelectedIndicator(ind.id());
            return page.recordReading(ind.id(),recordDay,value).thenApply(v->"Saved "+ind.shortName()+" for "+target.getName()+" on mission day "+recordDay+".");
        }
        if(cmd.crew_id()!=null)crew.setValue(target);
        if(page==null)throw new IllegalStateException("Crew data could not be loaded.");
        switch(cmd.action()){
            case SHOW_METRIC -> {catalog.indicator(cmd.indicator());page.setSelectedIndicator(cmd.indicator());}
            case SELECT_CREW -> {if(cmd.crew_id()==null)throw new IllegalArgumentException("Specify a crew member's name.");}
            case SHOW_DAY -> {if(cmd.day()==null)throw new IllegalArgumentException("Specify a mission day.");viewVoiceDay(cmd.day());}
            case SHOW_CURRENT_DAY -> viewVoiceDay(page.session().today());
            case SET_HAZARD -> {var h=catalog.hazards().stream().filter(x->x.id().equals(cmd.hazard())).findFirst().orElseThrow(()->new IllegalArgumentException("Unknown hazard."));hazard.setValue(h);}
            case CLEAR_HAZARD -> {hazard.setValue(null);page.setHazard(null);}
            case SET_ENVIRONMENT -> {var e=catalog.environments().stream().filter(x->x.id().equals(cmd.environment())).findFirst().orElseThrow(()->new IllegalArgumentException("Unknown environment."));environment.setValue(e);}
            default -> throw new IllegalArgumentException("Unsupported command.");
        }
        return CompletableFuture.completedFuture("Done: "+cmd.action().name().toLowerCase().replace('_',' ')+".");
    }
    private void viewVoiceDay(int value){
        if(value< -3650||value>page.session().today())throw new IllegalArgumentException("Day outside available mission window.");
        updating=true;day.setValueFactory(new javafx.scene.control.SpinnerValueFactory.IntegerSpinnerValueFactory(-3650,page.session().today(),value));updating=false;page.setMissionDay(value);
    }
    @Override
    public void stop() { if(voice!=null)voice.close();if (page != null) page.close(); }

    public static void main(String[] args) { launch(args); }
}

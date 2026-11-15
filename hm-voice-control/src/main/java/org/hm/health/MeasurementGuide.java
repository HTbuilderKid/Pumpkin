package org.hm.health;

import javafx.animation.*;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.util.Duration;
import java.util.*;
import static org.hm.health.HealthStatusPane.*;

/** Original equipment guides, timers, and final record form, implemented natively in JavaFX. */
final class MeasurementGuide extends Dialog<Void> {
    private final HealthStatusPane page;
    private final VBox content = new VBox(18), stepContent = new VBox(14), info = new VBox(4);
    private final Label count = label("", "caption"), stepText = wrapped("", "guide-step"), clock = label("", "timer-clock"), error = wrapped("", "error-text");
    private final ProgressBar progress = new ProgressBar(0);
    private final Button back = new Button("Back"), next = new Button("Next step"), timerButton = new Button("Start timer");
    private HealthCatalog.Equipment equipment;
    private int step, remaining;
    private Timeline timer;
    private final ComboBox<HealthCatalog.Equipment> selector = new ComboBox<>();

    MeasurementGuide(HealthStatusPane page, HealthCatalog.Equipment initial) {
        this.page = page; this.equipment = initial; setTitle("Step-by-step measurement guide"); setResizable(true); initOwner(page.getScene().getWindow());
        getDialogPane().getStylesheets().add(Objects.requireNonNull(getClass().getResource("/health/health.css")).toExternalForm()); getDialogPane().getStyleClass().add("health-guide");
        getDialogPane().getButtonTypes().add(ButtonType.CLOSE); getDialogPane().setPrefSize(820, 760);
        selector.getItems().setAll(page.session().catalog().equipment()); selector.setMaxWidth(Double.MAX_VALUE);
        selector.valueProperty().addListener((o, a, b) -> { if (b != null) { stopTimer(); equipment = b; step = 0; render(); } });
        back.setId("guide-back"); next.setId("guide-next"); next.getStyleClass().add("primary"); Plush.press(back, .95); Plush.press(next, .95); Plush.press(timerButton, .95);
        back.setOnAction(e -> { stopTimer(); step--; render(); }); next.setOnAction(e -> { stopTimer(); step++; render(); });
        progress.setMaxWidth(Double.MAX_VALUE); HBox.setHgrow(progress, Priority.ALWAYS); count.setMinWidth(Region.USE_PREF_SIZE);
        HBox head = new HBox(14, count, progress); head.setAlignment(Pos.CENTER_LEFT);
        HBox navigation = new HBox(10, back, next);
        error.managedProperty().bind(error.textProperty().isNotEmpty()); error.visibleProperty().bind(error.managedProperty());
        VBox card = new VBox(16, head, stepContent, navigation, error); card.getStyleClass().add("step-card");
        content.getChildren().setAll(selector, card, info);
        ScrollPane scroll = new ScrollPane(content); scroll.setFitToWidth(true); getDialogPane().setContent(scroll);
        setOnHidden(e -> stopTimer()); selector.setValue(initial); render();
    }

    private void render() {
        int total = equipment.steps().size() + 1;
        error.setText(""); setHeaderText(equipment.name()); count.setText("Step " + (step + 1) + " of " + total); progress.setProgress((step + 1) / (double) total);
        stepContent.getChildren().clear(); back.setDisable(step == 0); next.setVisible(step < equipment.steps().size()); next.setManaged(next.isVisible());
        next.setText(step == equipment.steps().size() - 1 ? "Record the result" : "Next step");
        if (step == equipment.steps().size()) {
            stepText.setText("Record the result. It is saved for " + dayName(page.session().today()) + "."); stepContent.getChildren().add(stepText);
            Map<String, ReadingInput> inputs = new LinkedHashMap<>();
            for (String id : equipment.measures()) {
                var ind = page.session().catalog().indicator(id); ReadingInput input = new ReadingInput(ind); inputs.put(id, input);
                stepContent.getChildren().add(new VBox(6, label(ind.shortName() + " · " + ind.unit(), "caption"), input));
            }
            Button save = new Button("Save reading"); save.setId("guide-save"); save.getStyleClass().add("primary"); Plush.press(save, .95);
            save.setOnAction(e -> {
                try {
                    Map<String, Double> values = new LinkedHashMap<>(); for (var entry : inputs.entrySet()) { Double value = entry.getValue().value(); if (value != null) values.put(entry.getKey(), value); }
                    if (values.isEmpty()) throw new IllegalArgumentException("Enter a reading first.");
                    save.setDisable(true);
                    page.saveReadings(values, page.session().today(), () -> { page.setMissionDay(page.session().today()); page.setSelectedIndicator(values.keySet().iterator().next()); close(); })
                        .exceptionally(f -> { save.setDisable(false); error.setText("Could not save: " + f.getMessage()); return null; });
                } catch (IllegalArgumentException failure) { error.setText(failure.getMessage()); }
            });
            stepContent.getChildren().add(save);
        } else {
            var current = equipment.steps().get(step); stepText.setText(current.t()); stepContent.getChildren().add(stepText);
            if (current.timer() != null) {
                remaining = current.timer(); clock.setText(clock(remaining)); timerButton.setText("Start timer"); timerButton.setId("guide-timer");
                timerButton.setOnAction(e -> {
                    if (timer != null) { stopTimer(); remaining = current.timer(); clock.setText(clock(remaining)); timerButton.setText("Start timer"); return; }
                    remaining = current.timer(); timerButton.setText("Stop");
                    timer = new Timeline(new KeyFrame(Duration.seconds(1), tick -> { remaining--; clock.setText(remaining == 0 ? "Done" : clock(remaining)); if (remaining <= 0) { stopTimer(); timerButton.setText("Start timer"); } }));
                    timer.setCycleCount(remaining); timer.play();
                });
                HBox row = new HBox(16, clock, timerButton); row.setAlignment(Pos.CENTER_LEFT); stepContent.getChildren().add(row);
            }
        }
        info.getChildren().setAll(wrapped(equipment.what(), "body-text"), section("What you need", equipment.kit()), section("In microgravity", equipment.space()), section("Common mistakes", equipment.mistakes()),
                wrapped(equipment.after(), "muted"), wrapped(page.session().catalog().equipmentNote(), "muted"));
    }

    private TitledPane section(String title, List<String> items) { VBox list = new VBox(8); for (String item : items) list.getChildren().add(wrapped("• " + item, "body-text")); TitledPane pane = new TitledPane(title, list); pane.setAnimated(false); pane.setExpanded(false); return pane; }
    private void stopTimer() { if (timer != null) { timer.stop(); timer = null; } }
    private static String clock(int seconds) { return String.format("%d:%02d", seconds / 60, seconds % 60); }
}

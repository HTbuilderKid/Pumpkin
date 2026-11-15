package com.example.healthmonitor;

import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.stage.Stage;

import java.sql.SQLException;
import java.time.LocalDate;
import java.util.function.Consumer;

/** Behind AddCrew.fxml: saves a new crew member to the database. */
public class AddCrewController {
    @FXML private Button backButton;
    @FXML private Button submitButton;
    @FXML private Label statusLabel;
    @FXML private TextField nameField;

    private final Consumer<Astronaut> onAdded;

    public AddCrewController(Consumer<Astronaut> onAdded) { this.onAdded = onAdded; }

    @FXML private void initialize() {
        backButton.setOnAction(e -> close());
        submitButton.setOnAction(e -> submit());
        nameField.setOnAction(e -> submit());
    }

    private void submit() {
        String name = nameField.getText() == null ? "" : nameField.getText().trim();
        if (name.isEmpty()) { statusLabel.setText("Enter a name first."); return; }
        if (name.length() > 60) { statusLabel.setText("That name is too long (60 characters at most)."); return; }
        try {
            // a new crew member starts on mission day 0 today; the launch date can be changed in the main window
            Astronaut added = new AstronautDAO().addAstronaut(name, LocalDate.now());
            close();
            onAdded.accept(added);
        } catch (SQLException e) {
            statusLabel.setText("Could not save: " + e.getMessage());
        }
    }

    private void close() { ((Stage) nameField.getScene().getWindow()).close(); }
}

package example;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.layout.BorderPane;
import javafx.stage.Stage;
import org.pumpkin.body.BodyModel;
import org.pumpkin.body.BodyView;
import java.util.Map;

/** Copy the view creation into your existing controller; no second Application is needed. */
public class IntegrationExample extends Application {
    private BodyView body;
    @Override public void start(Stage stage) throws Exception {
        body = new BodyView(BodyModel.load());
        body.setLevels(Map.of("brain", 1, "heart", 3, "fluids", 2, "bone", 1));
        body.setOnPick(id -> System.out.println("Selected system: " + id));
        BorderPane root = new BorderPane();
        root.setCenter(body);
        stage.setScene(new Scene(root, 800, 850));
        stage.setTitle("Body model and markers"); stage.show();
    }
    @Override public void stop() { if (body != null) body.close(); }
    public static void main(String[] args) { launch(args); }
}

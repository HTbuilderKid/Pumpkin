module com.example.healthmonitor {
    requires javafx.controls;
    requires javafx.fxml;
    requires java.sql;
    requires java.net.http;
    requires java.desktop;
    requires org.xerial.sqlitejdbc;
    requires com.google.gson;

    opens com.example.healthmonitor to javafx.fxml;
    opens org.hm.health to javafx.fxml, com.google.gson;
    opens com.example.healthmonitor.voice to com.google.gson;
    exports com.example.healthmonitor;
    exports org.hm.health;
}

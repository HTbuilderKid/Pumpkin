package org.hm.health;
import javafx.fxml.FXML;
import javafx.scene.layout.StackPane;
/** Optional FXML adapter. Load health/HealthStatusPage.fxml, then call setSession before displaying. */
public final class HealthStatusController implements AutoCloseable {
    @FXML private StackPane healthSlot;
    private HealthStatusPane page;
    public void setSession(HealthSession session){
        if(page!=null)page.close();page=new HealthStatusPane(session);healthSlot.getChildren().setAll(page);
    }
    public HealthStatusPane page(){if(page==null)throw new IllegalStateException("Call setSession first");return page;}
    @Override public void close(){if(page!=null){page.close();healthSlot.getChildren().clear();page=null;}}
}

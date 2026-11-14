package org.hm.health;

import javafx.application.Platform;
import javafx.animation.PauseTransition;
import javafx.util.Duration;
import javafx.scene.*;
import javafx.scene.control.*;
import javafx.scene.layout.GridPane;
import javafx.stage.*;
import java.nio.file.*;
import java.util.concurrent.*;
import java.util.function.BooleanSupplier;

/** Opt-in UI smoke test: actual page controls, asynchronous saves, guide flow, timers, resizing. */
final class HealthSmoke {
    private final HealthStatusPane page;private final Stage stage;private final Path data;
    HealthSmoke(HealthStatusPane page,Stage stage,Path data){this.page=page;this.stage=stage;this.data=data;}
    void run(){
        delay(500).thenRun(()->{
            check(page.lookupAll(".metric-tile").size()==11,"11 native metric controls");
            check(((GridPane)page.lookup("#status-grid")).getColumnConstraints().size()==7,"Screenshot's seven-column layout");
            snapshot("health-status-preview.png");
            try {
                var loader=new javafx.fxml.FXMLLoader(getClass().getResource("/health/HealthStatusPage.fxml"));javafx.scene.Parent host=loader.load();
                HealthStatusController controller=loader.getController();controller.setSession(page.session());Stage hostStage=new Stage();hostStage.setScene(new Scene(host,900,800));hostStage.show();host.applyCss();host.layout();
                check(controller.page().lookupAll(".metric-tile").size()==11,"FXML integration loads the native page");controller.close();hostStage.close();
            }catch(java.io.IOException e){throw new CompletionException(e);}
            button("metric-bp_sys").fire();check(((Label)page.lookup("#metric-title")).getText().contains("systolic"),"Tile selection changes detail");
            page.setMissionDay(38);page.setSelectedIndicator("glucose");check(page.session().assess(38).get("glucose").discardedToday().size()==1,"Replaced reading in history");
            page.setMissionDay(45);page.setSelectedIndicator("temp");((TextField)page.lookup("#reading-value-temp")).setText("NaN");button("save-reading").fire();
            check(((Label)page.lookup("#save-feedback")).getText().contains("finite"),"Invalid input rejected visibly");
            page.setSelectedIndicator("hydration");((ToggleButton)page.lookup("#reading-choice-hydration-6")).fire();button("save-reading").fire();
        }).thenCompose(v->until(()->page.session().assess(45).get("hydration").lastDay()==45&&!button("save-reading").isDisabled()))
        .thenRun(()->{((ToggleButton)page.lookup("#reading-choice-hydration-2")).fire();button("save-reading").fire();})
        .thenCompose(v->until(()->page.session().assess(45).get("hydration").latest().value()==2&&!button("save-reading").isDisabled()))
        .thenRun(()->{
            var r=page.session().assess(45).get("hydration");check(r.discardedToday().size()==1,"Same-day repeat retained");
            try{var restored=new HealthSession(HealthCatalog.load(),JsonReadingStore.demo(data),"SIM-1",45);check(restored.assess(45).get("hydration").latest().value()==2,"Persistence after reopening");}catch(Exception e){throw new CompletionException(e);}
            page.setMissionDay(38);button("open-guide").fire();
            for(int i=0;i<page.session().catalog().equipmentFor("hydration").steps().size();i++)((Button)dialog().lookup("#guide-next")).fire();
            ((ToggleButton)dialog().lookup("#reading-choice-hydration-3")).fire();((Button)dialog().lookup("#guide-save")).fire();
        }).thenCompose(v->until(()->page.session().assess(45).get("hydration").latest().value()==3))
        .thenCompose(v->delay(100)).thenRun(()->{
            check(page.missionDay()==45,"Guide records for current day, not historical viewing day");
            page.setSelectedIndicator("hr");button("open-guide").fire();((Button)dialog().lookup("#guide-next")).fire();((Button)dialog().lookup("#guide-timer")).fire();
        }).thenCompose(v->delay(1200)).thenCompose(v->{
            Label clock=(Label)dialog().lookup(".timer-clock");check(!clock.getText().equals("5:00"),"Guide countdown runs");
            ((Button)dialog().lookupAll(".button").stream().filter(n->n instanceof Button b&&b.getText().equals("Close")).findFirst().orElseThrow()).fire();
            String stopped=clock.getText();return delay(1200).thenRun(()->check(clock.getText().equals(stopped),"Closing guide cancels timer"));
        }).thenRun(()->stage.setWidth(880)).thenCompose(v->delay(200)).thenRun(()->{
            check(((GridPane)page.lookup("#status-grid")).getColumnConstraints().size()<7,"Responsive card layout");
            check(page.lookup("#save-reading")!=null,"Entry remains available at narrow width");snapshot("health-status-narrow.png");
            System.out.println("PASS: 11 tiles, detail selection, history/repeats, validation, save/reload, guide recording, timer cleanup, responsive native JavaFX layout");
        }).orTimeout(40,TimeUnit.SECONDS).whenComplete((v,f)->Platform.runLater(()->{
            if(f!=null){f.printStackTrace();System.exit(1);}page.close();stage.close();Platform.exit();
        }));
    }
    private Button button(String id){page.applyCss();page.layout();return (Button)page.lookup("#"+id); }
    private Parent dialog(){return Window.getWindows().stream().filter(w->w.isShowing()&&w!=stage).map(w->w.getScene().getRoot()).filter(p->p.lookup("#guide-next")!=null).findFirst().orElseThrow();}
    private static CompletableFuture<Void> delay(int ms){var f=new CompletableFuture<Void>();var p=new PauseTransition(Duration.millis(ms));p.setOnFinished(e->f.complete(null));p.play();return f;}
    private CompletableFuture<Void> until(BooleanSupplier ready){return poll(ready,System.nanoTime()+TimeUnit.SECONDS.toNanos(8));}
    private CompletableFuture<Void> poll(BooleanSupplier condition,long deadline){if(condition.getAsBoolean())return CompletableFuture.completedFuture(null);if(System.nanoTime()>deadline)return CompletableFuture.failedFuture(new AssertionError("Save did not complete"));return delay(60).thenCompose(v->poll(condition,deadline));}
    private void snapshot(String filename){
        try{var image=page.snapshot(null,null);var png=new java.awt.image.BufferedImage((int)image.getWidth(),(int)image.getHeight(),java.awt.image.BufferedImage.TYPE_INT_ARGB);for(int y=0;y<png.getHeight();y++)for(int x=0;x<png.getWidth();x++)png.setRGB(x,y,image.getPixelReader().getArgb(x,y));Files.createDirectories(Path.of("target"));javax.imageio.ImageIO.write(png,"png",Path.of("target",filename).toFile());}
        catch(Exception e){throw new CompletionException(e);}
    }
    private static void check(boolean value,String what){if(!value)throw new AssertionError(what);}
}

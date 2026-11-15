package com.example.healthmonitor;
import com.example.healthmonitor.voice.*;
import javafx.application.Platform;
import javafx.animation.PauseTransition;
import javafx.util.Duration;
import javafx.scene.*;
import javafx.scene.control.*;
import javafx.stage.*;
import org.hm.health.HealthStatusPane;
import java.util.concurrent.*;
import java.util.function.*;

/** Explicit offline GUI test mode; never sends requests to OpenAI. */
final class VoiceSmoke {
    private String step="initial";
    private int originalCount;
    private final Stage stage;private final VoiceControlPanel panel;private final Supplier<HealthStatusPane> page;
    VoiceSmoke(Stage stage,VoiceControlPanel panel,Supplier<HealthStatusPane> page){this.stage=stage;this.panel=panel;this.page=page;}
    static VoiceAi fakeAi(){return new VoiceAi(){
        public String transcribe(byte[] wav,String key){return "show hydration";}
        public VoiceCommand interpret(String text,VoiceCommand.Context context,String key){
            return switch(text.toLowerCase()){
                case "show hydration" -> new VoiceCommand(VoiceCommand.Action.SHOW_METRIC,"hydration",null,null,null,null,null,null,null);
                case "day 38" -> new VoiceCommand(VoiceCommand.Action.SHOW_DAY,null,null,38,null,null,null,null,null);
                case "record temperature" -> new VoiceCommand(VoiceCommand.Action.PREPARE_READING,"temp",null,null,36.8,"celsius",null,null,null);
                default -> new VoiceCommand(VoiceCommand.Action.UNSUPPORTED,null,null,null,null,null,null,null,"unsupported");
            };
        }
    };}
    static AudioCapture fakeAudio(){return ()->()->CompletableFuture.completedFuture(new byte[64]);}
    void run(){
        delay(400).thenRun(()->{
            originalCount=page.get().session().readings().size();step="key dialog";Platform.runLater(()->button(panel,"voice-key").fire());
        }).thenCompose(v->until(this::hasDialog)).thenRun(()->{
            Parent dialog=dialog();((PasswordField)dialog.lookup("#voice-key-input")).setText("offline-test-key");find(dialog,"Use key").fire();
        }).thenCompose(v->until(()->!button(panel,"voice-talk").isDisabled()))
        .thenRun(()->{step="recording start";button(panel,"voice-talk").fire();})
        .thenCompose(v->until(()->button(panel,"voice-talk").getText().startsWith("Stop")))
        .thenRun(()->{step="transcription";button(panel,"voice-talk").fire();})
        .thenCompose(v->until(()->!button(panel,"voice-run").isDisabled()))
        .thenRun(()->{check(page.get().selectedIndicator().equals("hydration"),"Audio path navigated");step="mission day";command("day 38");})
        .thenCompose(v->until(()->!button(panel,"voice-run").isDisabled()&&page.get().missionDay()==38))
        .thenRun(()->{step="cancel dialog";command("record temperature");})
        .thenCompose(v->until(()->hasDialog()))
        .thenRun(()->{check(dialog().lookupAll(".label").stream().anyMatch(n->n instanceof Label l&&l.getText().contains("36.8")),"Exact reading shown in confirmation");find(dialog(),"Cancel").fire();})
        .thenCompose(v->until(()->!button(panel,"voice-run").isDisabled()))
        .thenRun(()->{check(page.get().missionDay()==38,"Cancellation leaves day unchanged");check(page.get().session().readings().size()==originalCount,"Cancelled command writes no readings");step="confirm dialog";command("record temperature");})
        .thenCompose(v->until(()->hasDialog()))
        .thenRun(()->{step="database save";find(dialog(),"OK").fire();})
        .thenCompose(v->until(()->!button(panel,"voice-run").isDisabled()&&page.get().missionDay()==45))
        .thenCompose(v->delay(700))
        .thenRun(()->{
            var reading=page.get().session().assess(45).get("temp");check(Math.abs(reading.latest().value()-36.8)<1e-9,"Confirmed reading stored in real database");
            check(page.get().selectedIndicator().equals("temp"),"Saved metric selected");
            check(page.get().session().readings().size()==originalCount+1,"Exactly one reading appended");
            try {
                int id=new AstronautDAO().findAll().get(0).getId();
                var persisted=new DatabaseReadingStore(id).load();
                check(persisted.stream().anyMatch(r->r.indicator().equals("temp")&&r.day()==45&&Math.abs(r.value()-36.8)<1e-9),"New store reads saved value from SQLite");
                var image=stage.getScene().snapshot(null);var png=new java.awt.image.BufferedImage((int)image.getWidth(),(int)image.getHeight(),java.awt.image.BufferedImage.TYPE_INT_ARGB);
                for(int y=0;y<png.getHeight();y++)for(int x=0;x<png.getWidth();x++)png.setRGB(x,y,image.getPixelReader().getArgb(x,y));
                javax.imageio.ImageIO.write(png,"png",new java.io.File("target/voice-preview.png"));
            }catch(Exception e){throw new CompletionException(e);}
            System.out.println("PASS: offline voice UI key entry, record/stop/transcript pipeline, navigation, day selection, cancel/confirm, real SQLite persistence");
        }).orTimeout(30,TimeUnit.SECONDS).whenComplete((v,f)->Platform.runLater(()->{if(f!=null){f.printStackTrace();System.exit(1);}stage.close();Platform.exit();}));
    }
    private void command(String value){((TextField)panel.lookup("#voice-text")).setText(value);button(panel,"voice-run").fire();}
    private Parent dialog(){return Window.getWindows().stream().filter(w->w!=stage&&w.isShowing()).map(w->w.getScene().getRoot()).findFirst().orElseThrow();}
    private boolean hasDialog(){return Window.getWindows().stream().anyMatch(w->w!=stage&&w.isShowing());}
    private static Button button(Parent root,String id){root.applyCss();return (Button)root.lookup("#"+id);}
    private static Button find(Parent root,String text){return (Button)root.lookupAll(".button").stream().filter(n->n instanceof Button b&&b.getText().equals(text)).findFirst().orElseThrow();}
    private CompletableFuture<Void> until(BooleanSupplier predicate){return poll(predicate,System.nanoTime()+TimeUnit.SECONDS.toNanos(8));}
    private CompletableFuture<Void> poll(BooleanSupplier p,long end){if(p.getAsBoolean())return CompletableFuture.completedFuture(null);if(System.nanoTime()>end)return CompletableFuture.failedFuture(new AssertionError("Voice UI did not reach expected state at "+step+"; "+((Label)panel.lookup("#voice-status")).getText()+"; day="+(page.get()==null?"none":page.get().missionDay())));return delay(80).thenCompose(v->poll(p,end));}
    private static CompletableFuture<Void> delay(int ms){var f=new CompletableFuture<Void>();var t=new PauseTransition(Duration.millis(ms));t.setOnFinished(e->f.complete(null));t.play();return f;}
    private static void check(boolean ok,String message){if(!ok)throw new AssertionError(message);}
}

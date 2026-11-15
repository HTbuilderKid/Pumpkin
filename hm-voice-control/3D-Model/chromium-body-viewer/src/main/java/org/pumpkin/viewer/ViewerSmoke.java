package org.pumpkin.viewer;

import com.google.gson.*;
import javafx.animation.PauseTransition;
import javafx.application.Platform;
import javafx.scene.input.MouseButton;
import javafx.stage.Stage;
import javafx.util.Duration;
import java.util.*;
import java.util.concurrent.*;
import java.util.function.Predicate;

/** Opt-in real-window smoke check, invoked by the demo's --smoke argument. */
final class ViewerSmoke {
    private final ChromiumBodyView view;
    private final Stage stage;

    private String picked;
    private double rotation, distance;
    ViewerSmoke(ChromiumBodyView view,Stage stage){this.view=view;this.stage=stage;}
    void run() {
        view.setOnPick(id->picked=id);
        view.setOnError(message->{throw new AssertionError(message);});
        view.ready().thenCompose(v->view.setSpinning(false))
            .thenCompose(v->view.diagnostics()).thenAccept(d->{
                check(d.get("meshes").getAsInt()==18,"18 original meshes");
                check(d.get("triangles").getAsInt()>100000,"Triangles rendered");
                check(d.get("webglError").getAsInt()==0,"WebGL error-free");
                check(d.get("width").getAsInt()>500,"Correct layout");
                System.out.println("PASS: original WebGL rendering: "+d);
            })
            .thenCompose(v->{Map<String,Integer> all=new HashMap<>();ChromiumBodyView.SYSTEM_IDS.forEach(id->all.put(id,1));return view.setLevels(all);})
            .thenCompose(v->until(d->visible(d)==9))
            .thenCompose(d->view.setLevels(Map.of()))
            .thenCompose(v->view.select("muscle"))
            .thenCompose(v->until(d->visible(d)==1&&"muscle".equals(selected(d))))
            .thenCompose(d->view.select(null))
            .thenCompose(v->view.setLevels(Map.of("brain",1,"heart",3,"fluids",2,"bone",1)))
            .thenCompose(v->delay(900))
            .thenCompose(v->view.diagnostics()).thenCompose(d->{
                JsonObject heart=null;for(JsonElement e:d.getAsJsonArray("markers"))if(e.getAsJsonObject().get("id").getAsString().equals("heart"))heart=e.getAsJsonObject();
                check(heart!=null&&heart.get("visible").getAsBoolean(),"Heart marker visible");
                String[] xy=heart.get("transform").getAsString().replace("translate(","").replace(")","").replace("px","").split(",");
                double x=Double.parseDouble(xy[0]), y=Double.parseDouble(xy[1]);
                mouse(javafx.scene.input.MouseEvent.MOUSE_MOVED,x,y,false);
                mouse(javafx.scene.input.MouseEvent.MOUSE_PRESSED,x,y,true);
                mouse(javafx.scene.input.MouseEvent.MOUSE_RELEASED,x,y,false);
                return until(next->"heart".equals(selected(next))&&"heart".equals(picked));
            })
            .thenAccept(d->System.out.println("PASS: Java -> JS levels and selection; actual marker click -> Java callback"))
            .thenCompose(v->{stage.setWidth(840);stage.setHeight(760);return until(d->d.get("width").getAsInt()<700 && d.get("javafxFrameWidth").getAsInt()==d.get("width").getAsInt());})
            .thenCompose(d->view.select(null)).thenCompose(v->delay(500))
            .thenCompose(v->view.diagnostics()).thenCompose(d->{
                rotation=d.get("rotation").getAsDouble();
                mouse(javafx.scene.input.MouseEvent.MOUSE_MOVED,60,300,false);mouse(javafx.scene.input.MouseEvent.MOUSE_PRESSED,60,300,true);
                return delay(100);
            }).thenCompose(v->{mouse(javafx.scene.input.MouseEvent.MOUSE_DRAGGED,130,300,true);return delay(100);})
            .thenCompose(v->{mouse(javafx.scene.input.MouseEvent.MOUSE_RELEASED,130,300,false);return until(d->Math.abs(d.get("rotation").getAsDouble()-rotation)>.1);})
            .thenCompose(d->{distance=d.get("distance").getAsDouble();view.fireEvent(new javafx.scene.input.ScrollEvent(javafx.scene.input.ScrollEvent.SCROLL,130,300,130,300,false,false,false,false,false,false,0,120,0,120,javafx.scene.input.ScrollEvent.HorizontalTextScrollUnits.NONE,0,javafx.scene.input.ScrollEvent.VerticalTextScrollUnits.NONE,0,0,null));return until(next->Math.abs(next.get("distance").getAsDouble()-distance)>2);})
            .thenCompose(d->delay(900)).thenCompose(v->view.diagnostics()).thenAccept(d->{
                System.out.println("FINAL STATE: "+d);
                check(d.get("webglError").getAsInt()==0,"WebGL after resize");
                try {
                    var image=view.snapshot(null,null);
                    var png=new java.awt.image.BufferedImage((int)image.getWidth(),(int)image.getHeight(),java.awt.image.BufferedImage.TYPE_INT_ARGB);
                    int nonBlack=0;
                    for(int y=0;y<png.getHeight();y++)for(int x=0;x<png.getWidth();x++) {
                        int color=image.getPixelReader().getArgb(x,y);png.setRGB(x,y,color);
                        if(((color>>16)&255)<100 && (color&255)>130 && ((color>>8)&255)<150)nonBlack++;
                    }
                    check(nonBlack>3000,"Visible blue model pixels, excluding labels/background");
                    java.nio.file.Files.createDirectories(java.nio.file.Path.of("target"));
                    javax.imageio.ImageIO.write(png,"png",new java.io.File("target/chromium-preview.png"));
                    try{view.setLevels(Map.of("heart",4));throw new AssertionError("Invalid level accepted");}catch(IllegalArgumentException expected){}
                    System.out.println("PASS: resize, forwarded drag and wheel, frame transfer to JavaFX, PNG snapshot, input validation");
                }catch(java.io.IOException e){throw new CompletionException(e);}
            }).orTimeout(60,TimeUnit.SECONDS).whenComplete((v,f)->Platform.runLater(()->{
                if(f!=null){f.printStackTrace();System.exit(1);}
                view.close();view.disposed().orTimeout(10,TimeUnit.SECONDS).whenComplete((done,failure)->Platform.runLater(()->{
                    if(failure!=null){failure.printStackTrace();System.exit(1);}
                    System.out.println("PASS: browser, message router and local asset server disposed");stage.close();Platform.exit();
                }));
            }));
    }
    private void mouse(javafx.event.EventType<javafx.scene.input.MouseEvent> type,double x,double y,boolean down) {
        view.fireEvent(new javafx.scene.input.MouseEvent(type,x,y,x,y,MouseButton.PRIMARY,1,false,false,false,false,
                down,false,false,false,false,true,new javafx.scene.input.PickResult(view,x,y)));
    }
    private CompletableFuture<JsonObject> until(Predicate<JsonObject> condition){return poll(condition,System.nanoTime()+TimeUnit.SECONDS.toNanos(15));}
    private CompletableFuture<JsonObject> poll(Predicate<JsonObject> condition,long deadline){
        return view.diagnostics().thenCompose(d->{
            if(condition.test(d))return CompletableFuture.completedFuture(d);
            if(System.nanoTime()>deadline)return CompletableFuture.failedFuture(new AssertionError("State did not converge: "+d));
            return delay(80).thenCompose(v->poll(condition,deadline));
        });
    }
    private static int visible(JsonObject d){int n=0;for(var m:d.getAsJsonArray("markers"))if(m.getAsJsonObject().get("visible").getAsBoolean())n++;return n;}
    private static String selected(JsonObject d){var s=d.get("selected");return s.isJsonNull()?null:s.getAsString();}
    private static CompletableFuture<Void> delay(int ms){var future=new CompletableFuture<Void>();var p=new PauseTransition(Duration.millis(ms));p.setOnFinished(e->future.complete(null));p.play();return future;}
    private static void check(boolean value,String label){if(!value)throw new AssertionError(label);}
}

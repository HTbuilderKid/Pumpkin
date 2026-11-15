package org.hm.desktop;

import com.google.gson.*;
import javafx.application.Platform;
import javafx.animation.PauseTransition;
import javafx.util.Duration;
import javafx.scene.input.*;
import javafx.stage.Stage;
import java.util.concurrent.*;
import java.util.function.Predicate;

/** Exercises React controls through real JavaFX -> CEF native input, not DOM .click(). */
final class DesktopSmoke {
    private final DesktopView view;private final Stage stage;
    private String before;private int slider;private long initialFrames;
    DesktopSmoke(DesktopView view,Stage stage){this.view=view;this.stage=stage;}
    void run(){
        view.ready().thenCompose(v->until("({tiles:document.querySelectorAll('[data-tile]').length,fonts:document.fonts.status})",d->d.getAsJsonObject().get("tiles").getAsInt()>20))
            .thenCompose(v->delay(400)).thenRun(()->{check(view.presentedFrames()>0,"Chromium frames presented in JavaFX");snapshot("desktop-preview.png");})
            .thenCompose(v->view.evaluate("matchMedia('(hover: hover)').matches"))
            .thenAccept(d->check(d.getAsBoolean(),"Desktop hover styles active"))
            .thenCompose(v->view.evaluate("window.desktop.getAppInfo()"))
            .thenAccept(d->check(d.getAsJsonObject().get("desktop").getAsBoolean(),"JavaScript -> Java bridge reply"))
            .thenCompose(v->view.evaluate("document.querySelector('[data-tile=switch] [role=switch]').getAttribute('aria-checked')"))
            .thenCompose(d->{before=d.getAsString();return click("[data-tile=switch] [role=switch]");})
            .thenCompose(v->until("document.querySelector('[data-tile=switch] [role=switch]').getAttribute('aria-checked')",d->!d.getAsString().equals(before)))
            .thenRun(()->{System.out.println("PASS: native mouse toggles React switch");key(KeyCode.SPACE,false);})
            .thenCompose(v->until("document.querySelector('[data-tile=switch] [role=switch]').getAttribute('aria-checked')",d->d.getAsString().equals(before)))
            .thenCompose(v->click("[data-tile=input-field] input"))
            .thenRun(()->key(KeyCode.A,true))
            .thenCompose(v->until("(()=>{let e=document.querySelector('[data-tile=input-field] input');return e.selectionStart===0&&e.selectionEnd===e.value.length})()",JsonElement::getAsBoolean))
            .thenRun(()->{for(char c:"JavaFX desktop".toCharArray())typed(c);})
            .thenCompose(v->until("document.querySelector('[data-tile=input-field] input').value",d->d.getAsString().equals("JavaFX desktop")))
            .thenCompose(v->click("[data-tile=slider] [role=slider]"))
            .thenCompose(v->view.evaluate("document.querySelector('[data-tile=slider] [role=slider]').getAttribute('aria-valuenow')"))
            .thenCompose(d->{slider=d.getAsInt();key(slider>=30?KeyCode.LEFT:KeyCode.RIGHT,false);return until("document.querySelector('[data-tile=slider] [role=slider]').getAttribute('aria-valuenow')",value->value.getAsInt()!=slider);})
             .thenCompose(v->view.evaluate("document.querySelector('[data-tile=counter-people] [role=spinbutton]').getAttribute('aria-valuenow')"))
            .thenCompose(d->{slider=d.getAsInt();return click("[data-tile=counter-people] button[aria-label=Increase]");})
            .thenCompose(v->until("document.querySelector('[data-tile=counter-people] [role=spinbutton]').getAttribute('aria-valuenow')",d->d.getAsInt()==slider+1))
            .thenCompose(v->click("[data-tile=select] [role=combobox]"))
            .thenCompose(v->until("Boolean(document.querySelector('[role=listbox]'))",JsonElement::getAsBoolean))
            .thenCompose(v->click("[role=option]:nth-child(2)"))
            .thenCompose(v->until("document.querySelector('[data-tile=select] [role=combobox]').textContent",d->d.getAsString().contains("By item")))
            .thenCompose(v->click("button[data-detail=switch]"))
            .thenCompose(v->until("Boolean(document.querySelector('pre[aria-label=\"source of switch\"]')?.checkVisibility())",JsonElement::getAsBoolean))
            .thenRun(view::goBack)
            .thenCompose(v->until("Boolean(document.querySelector('pre[aria-label=\"source of switch\"]')?.checkVisibility())",d->!d.getAsBoolean()))
            .thenCompose(v->click("[data-tile=switch] button[aria-label=\"copy install command for switch\"]"))
            .thenCompose(v->until("document.querySelector('[data-tile=switch] button[aria-label=\"copy install command for switch\"]').getAttribute('data-state')",d->d.getAsString().equals("copied")))
            .thenRun(()->check(Clipboard.getSystemClipboard().getString().contains("/switch.json"),"Native system clipboard"))
            .thenCompose(v->view.navigate("/preview/input/"))
            .thenCompose(v->until("location.pathname",d->d.getAsString().equals("/preview/input/")))
            .thenCompose(v->view.navigate("/"))
            .thenCompose(v->until("document.querySelectorAll('[data-tile]').length",d->d.getAsInt()>20))
            .thenCompose(v->view.evaluate("window.scrollY"))
            .thenAccept(d->{slider=d.getAsInt();view.fireEvent(new ScrollEvent(ScrollEvent.SCROLL,400,500,400,500,false,false,false,false,false,false,0,-600,0,-600,ScrollEvent.HorizontalTextScrollUnits.NONE,0,ScrollEvent.VerticalTextScrollUnits.NONE,0,0,null));})
            .thenCompose(v->until("window.scrollY",d->d.getAsInt()>slider))
            .thenRun(()->{initialFrames=view.presentedFrames();stage.setWidth(900);})
            .thenCompose(v->delay(500)).thenCompose(v->until("innerWidth",d->d.getAsInt()<1000&&view.frameWidth()<1000&&view.presentedFrames()>initialFrames))
            .thenRun(()->{snapshot("desktop-narrow.png");check(view.consoleErrors().isEmpty(),"No JavaScript console errors: "+view.consoleErrors());System.out.println("PASS: original React UI, fonts, JavaFX frames, switch mouse/keyboard, editable React input, slider, counter, select menu, source dialog/back, clipboard bridge, static routes, wheel scrolling, resize");})
            .orTimeout(90,TimeUnit.SECONDS).whenComplete((v,f)->Platform.runLater(()->{
                if(f!=null){f.printStackTrace();System.exit(1);}
                view.close();view.disposed().orTimeout(10,TimeUnit.SECONDS).whenComplete((done,error)->Platform.runLater(()->{if(error!=null){error.printStackTrace();System.exit(1);}System.out.println("PASS: Chromium browser, bridge and local asset server disposed");stage.close();Platform.exit();}));
            }));
    }
    private CompletableFuture<Void> click(String selector){
        String quoted=new Gson().toJson(selector);
        return view.evaluate("(()=>{let e=document.querySelector("+quoted+");if(!e)throw Error('Missing element');e.scrollIntoView({block:'center',inline:'nearest'});let r=(e.closest('[data-tile]')||e).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()")
            .thenCompose(d->{mouse(javafx.scene.input.MouseEvent.MOUSE_MOVED,d.getAsJsonObject().get("x").getAsDouble(),d.getAsJsonObject().get("y").getAsDouble(),false);return delay(300);})
            .thenCompose(v->view.evaluate("(()=>{let r=document.querySelector("+quoted+").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()"))
            .thenCompose(d->{double x=d.getAsJsonObject().get("x").getAsDouble(),y=d.getAsJsonObject().get("y").getAsDouble();mouse(javafx.scene.input.MouseEvent.MOUSE_MOVED,x,y,false);return delay(250).thenRun(()->{mouse(javafx.scene.input.MouseEvent.MOUSE_PRESSED,x,y,true);mouse(javafx.scene.input.MouseEvent.MOUSE_RELEASED,x,y,false);});});
    }
    private void mouse(javafx.event.EventType<javafx.scene.input.MouseEvent> type,double x,double y,boolean down){view.fireEvent(new javafx.scene.input.MouseEvent(type,x,y,x,y,MouseButton.PRIMARY,1,false,false,false,false,down,false,false,false,false,true,new PickResult(view,x,y)));}
    private void key(KeyCode code,boolean control){view.fireEvent(new KeyEvent(KeyEvent.KEY_PRESSED,"","",code,false,control,false,false));if(code==KeyCode.SPACE&&!control)typed(' ');view.fireEvent(new KeyEvent(KeyEvent.KEY_RELEASED,"","",code,false,control,false,false));}
    private void typed(char c){view.fireEvent(new KeyEvent(KeyEvent.KEY_TYPED,String.valueOf(c),"",KeyCode.UNDEFINED,false,false,false,false));}
    private CompletableFuture<JsonElement> until(String expression,Predicate<JsonElement> predicate){return poll(expression,predicate,System.nanoTime()+TimeUnit.SECONDS.toNanos(12));}
    private CompletableFuture<JsonElement> poll(String expression,Predicate<JsonElement> predicate,long deadline){return view.evaluate(expression).thenCompose(d->{if(predicate.test(d))return CompletableFuture.completedFuture(d);if(System.nanoTime()>deadline)return CompletableFuture.failedFuture(new AssertionError("State did not converge: "+expression+" = "+d));return delay(100).thenCompose(v->poll(expression,predicate,deadline));});}
    private static CompletableFuture<Void> delay(int ms){var f=new CompletableFuture<Void>();var p=new PauseTransition(Duration.millis(ms));p.setOnFinished(e->f.complete(null));p.play();return f;}
    private void snapshot(String name){try{var image=view.snapshot(null,null);var png=new java.awt.image.BufferedImage((int)image.getWidth(),(int)image.getHeight(),java.awt.image.BufferedImage.TYPE_INT_ARGB);for(int y=0;y<png.getHeight();y++)for(int x=0;x<png.getWidth();x++)png.setRGB(x,y,image.getPixelReader().getArgb(x,y));java.nio.file.Files.createDirectories(java.nio.file.Path.of("target"));javax.imageio.ImageIO.write(png,"png",new java.io.File("target",name));}catch(Exception e){throw new CompletionException(e);}}
    private static void check(boolean ok,String message){if(!ok)throw new AssertionError(message);}
}

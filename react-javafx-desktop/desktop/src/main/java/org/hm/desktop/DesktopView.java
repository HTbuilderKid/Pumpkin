package org.hm.desktop;

import com.google.gson.*;
import javafx.application.Platform;
import javafx.scene.Cursor;
import javafx.scene.control.Label;
import javafx.scene.image.*;
import javafx.scene.input.*;
import javafx.scene.layout.StackPane;
import javafx.scene.shape.Rectangle;
import org.cef.*;
import org.cef.browser.*;
import org.cef.callback.CefQueryCallback;
import org.cef.handler.*;
import org.cef.network.CefRequest;
import java.awt.event.InputEvent;
import java.awt.event.MouseEvent;
import java.net.URI;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.Consumer;

/** Embeds the unchanged static React export in a JavaFX node. All UI operations use JavaFX's thread. */
public final class DesktopView extends StackPane implements AutoCloseable {
    private static final Gson JSON=new Gson();
    private final StaticSite site;
    private final CefClient client;
    private final CefMessageRouter router;
    private final FxDesktopBrowser browser;
    private final ImageView image=new ImageView(),popup=new ImageView();
    private WritableImage pixels,popupPixels;
    private final Label status=new Label("Starting desktop interface…");
    private final AtomicReference<FxDesktopBrowser.Frame> latest=new AtomicReference<>(),latestPopup=new AtomicReference<>();
    private final AtomicBoolean painting=new AtomicBoolean(),nativeCloseRequested=new AtomicBoolean();
    private final CompletableFuture<Void> ready=new CompletableFuture<>(),disposed=new CompletableFuture<>();
    private volatile CompletableFuture<Void> navigation=ready;
    private final Map<String,CompletableFuture<JsonElement>> pending=new ConcurrentHashMap<>();
    private final Queue<String> consoleErrors=new ConcurrentLinkedQueue<>();
    private volatile boolean closed,created;
    private Consumer<String> external=url->{};
    private long frames;
    public DesktopView(DesktopRuntime runtime)throws java.io.IOException{
        requireFx();setMinSize(320,240);setFocusTraversable(true);setStyle("-fx-background-color:#fafafa;");
        image.setSmooth(false);image.fitWidthProperty().bind(widthProperty());image.fitHeightProperty().bind(heightProperty());
        popup.setSmooth(false);popup.setManaged(false);popup.setMouseTransparent(true);popup.setVisible(false);
        status.setStyle("-fx-text-fill:#252525;-fx-font-size:16;-fx-background-color:#fafafa;-fx-padding:12;");status.setWrapText(true);
        getChildren().addAll(image,popup,status);Rectangle clip=new Rectangle();clip.widthProperty().bind(widthProperty());clip.heightProperty().bind(heightProperty());setClip(clip);
        site=new StaticSite();client=runtime.app.createClient();router=CefMessageRouter.create();
        router.addHandler(new CefMessageRouterHandlerAdapter(){
            @Override public boolean onQuery(CefBrowser b,CefFrame frame,long query,String text,boolean persistent,CefQueryCallback callback){
                if(!site.owns(frame.getURL())||!frame.isMain())return false;
                try{
                    JsonObject request=JsonParser.parseString(text).getAsJsonObject();
                    Platform.runLater(()->handle(request,callback));
                }catch(RuntimeException e){callback.failure(400,"Invalid desktop request");}return true;
            }
        },true);client.addMessageRouter(router);
        client.addLifeSpanHandler(new CefLifeSpanHandlerAdapter(){
            @Override public void onAfterCreated(CefBrowser b){created=true;if(closed)closeNative();else Platform.runLater(()->resizeBrowser());}
            @Override public boolean onBeforePopup(CefBrowser b,CefFrame f,String url,String target){
                if(site.owns(url))b.loadURL(url);else if(site.owns(f.getURL()))Platform.runLater(()->openExternal(url));return true;
            }
            @Override public void onBeforeClose(CefBrowser b){
                client.removeMessageRouter(router);router.dispose();client.dispose();site.close();
                java.awt.EventQueue.invokeLater(()->disposed.complete(null));
            }
        });
        client.addRequestHandler(new CefRequestHandlerAdapter(){
            @Override public boolean onBeforeBrowse(CefBrowser b,CefFrame f,CefRequest request,boolean userGesture,boolean redirect){
                if(site.owns(request.getURL()))return false;
                if(userGesture&&site.owns(f.getURL()))Platform.runLater(()->openExternal(request.getURL()));return true;
            }
            @Override public void onRenderProcessTerminated(CefBrowser b,TerminationStatus s,int code,String message){Platform.runLater(()->fail("Chromium renderer stopped: "+s+" "+message));}
        });
        client.addLoadHandler(new CefLoadHandlerAdapter(){
            @Override public void onLoadEnd(CefBrowser b,CefFrame f,int code){
                if(!f.isMain()||!site.owns(f.getURL()))return;
                if(code>=400){Platform.runLater(()->fail("Interface page returned HTTP "+code));return;}
                b.executeJavaScript(bridge(),site.url(),0);
            }
            @Override public void onLoadError(CefBrowser b,CefFrame f,ErrorCode code,String message,String url){if(f.isMain()&&code!=ErrorCode.ERR_ABORTED)Platform.runLater(()->fail("Interface could not load: "+message));}
        });
        client.addDisplayHandler(new CefDisplayHandlerAdapter(){
            @Override public boolean onConsoleMessage(CefBrowser b,CefSettings.LogSeverity severity,String message,String source,int line){
                if(severity==CefSettings.LogSeverity.LOGSEVERITY_ERROR){consoleErrors.add(message);System.err.println("UI console: "+message);}return false;
            }
        });
        browser=new FxDesktopBrowser(client,site.url(),this::paint,show->Platform.runLater(()->{if(!closed)popup.setVisible(show);}),cursor->Platform.runLater(()->{if(!closed)setCursor(cursor(cursor));}));
        widthProperty().addListener(o->resizeBrowser());heightProperty().addListener(o->resizeBrowser());
        sceneProperty().addListener((o,a,b)->{if(b!=null)Platform.runLater(this::resizeBrowser);});
        focusedProperty().addListener((o,a,b)->{if(created&&!closed)browser.setFocus(b);});
        setOnMousePressed(e->{requestFocus();browser.setFocus(true);mouse(e,MouseEvent.MOUSE_PRESSED);});
        setOnMouseReleased(e->mouse(e,MouseEvent.MOUSE_RELEASED));setOnMouseMoved(e->mouse(e,MouseEvent.MOUSE_MOVED));
        setOnMouseDragged(e->mouse(e,MouseEvent.MOUSE_DRAGGED));setOnMouseEntered(e->mouse(e,MouseEvent.MOUSE_ENTERED));setOnMouseExited(e->mouse(e,MouseEvent.MOUSE_EXITED));
        setOnScroll(e->{double delta=Math.abs(e.getDeltaX())>Math.abs(e.getDeltaY())?e.getDeltaX():e.getDeltaY();int mod=modifiers(e.isShiftDown(),e.isControlDown(),e.isAltDown(),e.isMetaDown());if(Math.abs(e.getDeltaX())>Math.abs(e.getDeltaY()))mod|=InputEvent.SHIFT_DOWN_MASK;browser.wheel((int)e.getX(),(int)e.getY(),delta,mod);e.consume();});
        setOnKeyPressed(e->{if(e.isAltDown()&&e.getCode()==KeyCode.LEFT){browser.goBack();}else if(e.isAltDown()&&e.getCode()==KeyCode.RIGHT){browser.goForward();}else browser.key(java.awt.event.KeyEvent.KEY_PRESSED,e.getCode().getCode(),java.awt.event.KeyEvent.CHAR_UNDEFINED,mods(e));e.consume();});
        setOnKeyReleased(e->{browser.key(java.awt.event.KeyEvent.KEY_RELEASED,e.getCode().getCode(),java.awt.event.KeyEvent.CHAR_UNDEFINED,mods(e));e.consume();});
        setOnKeyTyped(e->{browser.text(e.getCharacter(),mods(e));e.consume();});
        browser.createImmediately();ready.orTimeout(60,TimeUnit.SECONDS).exceptionally(f->{Platform.runLater(()->fail(f.getMessage()));return null;});
    }
    private String bridge(){return """
        (()=>{
          if(window.desktop)return;
          const call=(method,payload={})=>new Promise((resolve,reject)=>window.cefQuery({
            request:JSON.stringify({method,payload}),onSuccess:reply=>{try{resolve(JSON.parse(reply))}catch{resolve(reply)}},onFailure:(code,message)=>reject(new Error(message))}));
          window.desktop=Object.freeze({getAppInfo:()=>call('app-info'),writeClipboard:text=>call('clipboard-write',{text:String(text)})});
          try {Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:async text=>{await window.desktop.writeClipboard(text)}});} catch(e){console.warn('Native clipboard override unavailable',e);}
          Promise.resolve(document.fonts.ready).then(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>call('ready'))));
        })();
        """;}
    private void handle(JsonObject request,CefQueryCallback callback){
        if(closed){callback.failure(410,"Desktop view closed");return;}
        try{
            switch(request.get("method").getAsString()){
                case "ready"->{status.setVisible(false);ready.complete(null);navigation.complete(null);callback.success("{}");}
                case "app-info"->{JsonObject info=new JsonObject();info.addProperty("name","Plush JavaFX Desktop");info.addProperty("java",Runtime.version().feature());info.addProperty("desktop",true);callback.success(JSON.toJson(info));}
                case "clipboard-write"->{String value=request.getAsJsonObject("payload").get("text").getAsString();if(value.length()>2_000_000)throw new IllegalArgumentException("Clipboard text too large");ClipboardContent content=new ClipboardContent();content.putString(value);if(!Clipboard.getSystemClipboard().setContent(content))throw new IllegalStateException("Clipboard unavailable");callback.success("{}");}
                case "result"->{var payload=request.getAsJsonObject("payload");var f=pending.remove(payload.get("id").getAsString());if(f!=null){if(payload.get("ok").getAsBoolean())f.complete(payload.get("value"));else f.completeExceptionally(new IllegalStateException(payload.get("error").getAsString()));}callback.success("{}");}
                default->callback.failure(400,"Unknown desktop method");
            }
        }catch(RuntimeException e){callback.failure(400,e.getMessage()==null?"Desktop operation failed":e.getMessage());}
    }
    public CompletableFuture<Void> ready(){return ready.copy();}
    /** Trusted host-side expression evaluated in the main React page, with a JSON result. */
    public CompletableFuture<JsonElement> evaluate(String expression){
        if(closed)return CompletableFuture.failedFuture(new IllegalStateException("View closed"));
        String id=UUID.randomUUID().toString();var future=new CompletableFuture<JsonElement>();pending.put(id,future);
        navigation.thenRun(()->{
            if(closed){future.completeExceptionally(new IllegalStateException("View closed"));return;}
            String script="Promise.resolve().then(()=>("+expression+")).then(value=>window.cefQuery({request:JSON.stringify({method:'result',payload:{id:"+JSON.toJson(id)+",ok:true,value:value===undefined?null:value}}),onSuccess(){},onFailure(){}})).catch(error=>window.cefQuery({request:JSON.stringify({method:'result',payload:{id:"+JSON.toJson(id)+",ok:false,error:String(error)}}),onSuccess(){},onFailure(){}}));";
            browser.executeJavaScript(script,site.url(),0);
        }).exceptionally(f->{future.completeExceptionally(f);return null;});
        future.orTimeout(15,TimeUnit.SECONDS).whenComplete((v,f)->pending.remove(id));return future;
    }
    public void setOnExternalLink(Consumer<String> handler){requireFx();external=Objects.requireNonNull(handler);}
    public CompletableFuture<Void> navigate(String path){requireFx();URI url=URI.create(site.url()).resolve(path);if(!site.owns(url.toString()))throw new IllegalArgumentException("Only bundled pages may be loaded");navigation=new CompletableFuture<>();browser.loadURL(url.toString());return navigation.orTimeout(60,TimeUnit.SECONDS).copy();}
    public void goBack(){requireFx();browser.goBack();}
    public long presentedFrames(){return frames;}
    public List<String> consoleErrors(){return List.copyOf(consoleErrors);}
    public double frameWidth(){return pixels==null?0:pixels.getWidth();}
    private void openExternal(String url){try{var uri=URI.create(url);if(Set.of("https","http").contains(uri.getScheme())&&uri.getHost()!=null)external.accept(url);}catch(RuntimeException e){System.err.println("External link: "+e.getMessage());}}
    private void paint(FxDesktopBrowser.Frame frame){if(closed)return;(frame.popup()?latestPopup:latest).set(frame);if(painting.compareAndSet(false,true))Platform.runLater(this::present);}
    private void present(){
        if(!closed){var main=latest.getAndSet(null);if(main!=null){pixels=update(image,pixels,main);frames++;}var pop=latestPopup.getAndSet(null);if(pop!=null){popupPixels=update(popup,popupPixels,pop);popup.setFitWidth(pop.width()/browser.scale());popup.setFitHeight(pop.height()/browser.scale());popup.relocate(pop.x()/browser.scale(),pop.y()/browser.scale());}var origin=localToScreen(0,0);if(origin!=null)browser.screenOrigin((int)origin.getX(),(int)origin.getY());}
        painting.set(false);if(!closed&&(latest.get()!=null||latestPopup.get()!=null)&&painting.compareAndSet(false,true))Platform.runLater(this::present);
    }
    private static WritableImage update(ImageView target,WritableImage previous,FxDesktopBrowser.Frame frame){
        if(previous==null||previous.getWidth()!=frame.width()||previous.getHeight()!=frame.height()){previous=new WritableImage(frame.width(),frame.height());target.setImage(previous);}
        previous.getPixelWriter().setPixels(0,0,frame.width(),frame.height(),PixelFormat.getByteBgraPreInstance(),frame.bgra(),0,frame.width()*4);return previous;
    }
    private void resizeBrowser(){if(closed||!created)return;double dpi=getScene()!=null&&getScene().getWindow()!=null?getScene().getWindow().getOutputScaleX():1;browser.resize((int)Math.max(1,getWidth()),(int)Math.max(1,getHeight()),dpi);}
    private void mouse(javafx.scene.input.MouseEvent e,int type){int button=e.getButton()==MouseButton.PRIMARY?1:e.getButton()==MouseButton.MIDDLE?2:e.getButton()==MouseButton.SECONDARY?3:0;int mod=modifiers(e.isShiftDown(),e.isControlDown(),e.isAltDown(),e.isMetaDown())|(e.isPrimaryButtonDown()?InputEvent.BUTTON1_DOWN_MASK:0)|(e.isMiddleButtonDown()?InputEvent.BUTTON2_DOWN_MASK:0)|(e.isSecondaryButtonDown()?InputEvent.BUTTON3_DOWN_MASK:0);browser.mouse(type,(int)e.getX(),(int)e.getY(),button,mod,Math.max(1,e.getClickCount()));e.consume();}
    private static int mods(KeyEvent e){return modifiers(e.isShiftDown(),e.isControlDown(),e.isAltDown(),e.isMetaDown());}
    private static int modifiers(boolean shift,boolean control,boolean alt,boolean meta){return(shift?InputEvent.SHIFT_DOWN_MASK:0)|(control?InputEvent.CTRL_DOWN_MASK:0)|(alt?InputEvent.ALT_DOWN_MASK:0)|(meta?InputEvent.META_DOWN_MASK:0);}
    private static Cursor cursor(int c){return switch(c){case 1->Cursor.CROSSHAIR;case 2->Cursor.TEXT;case 3->Cursor.WAIT;case 12->Cursor.HAND;case 13->Cursor.MOVE;default->Cursor.DEFAULT;};}
    private void fail(String message){if(closed)return;status.setText("Desktop interface failed: "+message);status.setVisible(true);ready.completeExceptionally(new IllegalStateException(message));navigation.completeExceptionally(new IllegalStateException(message));pending.values().forEach(f->f.completeExceptionally(new IllegalStateException(message)));pending.clear();}
    public CompletableFuture<Void> disposed(){return disposed.copy();}
    private void closeNative(){if(created&&nativeCloseRequested.compareAndSet(false,true))browser.close(true);}
    @Override public void close(){requireFx();if(closed)return;closed=true;site.close();ready.completeExceptionally(new CancellationException("View closed"));navigation.completeExceptionally(new CancellationException("View closed"));pending.values().forEach(f->f.completeExceptionally(new CancellationException("View closed")));pending.clear();latest.set(null);latestPopup.set(null);closeNative();}
    private static void requireFx(){if(!Platform.isFxApplicationThread())throw new IllegalStateException("Use JavaFX application thread");}
}

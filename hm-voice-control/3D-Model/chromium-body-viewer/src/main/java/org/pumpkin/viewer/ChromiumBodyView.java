package org.pumpkin.viewer;

import com.google.gson.*;
import javafx.application.Platform;
import javafx.scene.image.*;
import javafx.scene.input.MouseButton;
import javafx.scene.layout.StackPane;
import javafx.scene.control.Label;
import org.cef.*;
import org.cef.browser.*;
import org.cef.callback.CefQueryCallback;
import org.cef.handler.*;
import org.cef.network.CefRequest;
import java.awt.event.InputEvent;
import java.awt.event.MouseEvent;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.Consumer;

/** Native JavaFX node displaying the original Three.js renderer through CEF off-screen frames. */
public final class ChromiumBodyView extends StackPane implements AutoCloseable {
    public static final Set<String> SYSTEM_IDS = Set.of("brain","heart","lungs","metabolic","core","fluids","liver","bone","muscle");
    private static final Gson JSON = new Gson();
    private final ViewerAssets assets;
    private final CefClient client;
    private final FxOffscreenBrowser browser;
    private final CefMessageRouter router;
    private final ImageView image = new ImageView();
    private final Label status = new Label("Loading Chromium 3D viewer…");
    private final AtomicReference<FxOffscreenBrowser.Frame> latest = new AtomicReference<>();
    private final AtomicBoolean paintPending = new AtomicBoolean();
    private final CompletableFuture<Void> ready = new CompletableFuture<>();
    private CompletableFuture<Void> commands = ready;
    private final CompletableFuture<Void> disposed = new CompletableFuture<>();
    private final Map<String, CompletableFuture<JsonObject>> reports = new ConcurrentHashMap<>();
    private Consumer<String> onPick = id -> {};
    private Consumer<String> onError = System.err::println;
    private volatile boolean closed;
    private WritableImage pixels;

    public ChromiumBodyView(ChromiumRuntime runtime) throws java.io.IOException {
        requireFx();
        setMinSize(240,320); setFocusTraversable(true); setStyle("-fx-background-color:black;");
        status.setStyle("-fx-text-fill:#dbe6ff;");
        image.setPreserveRatio(false); image.setSmooth(false);
        image.fitWidthProperty().bind(widthProperty()); image.fitHeightProperty().bind(heightProperty());
        getChildren().addAll(image,status);
        assets = new ViewerAssets();
        client = runtime.app.createClient();
        router = CefMessageRouter.create();
        router.addHandler(new CefMessageRouterHandlerAdapter() {
            @Override public boolean onQuery(CefBrowser b, CefFrame f, long query, String request, boolean persistent, CefQueryCallback callback) {
                if (!f.getURL().equals(assets.url())) return false;
                try {
                    JsonObject event = JsonParser.parseString(request).getAsJsonObject();
                    Platform.runLater(() -> receive(event)); callback.success("ok");
                } catch (RuntimeException failure) { callback.failure(400,"Invalid viewer event"); }
                return true;
            }
        }, true);
        client.addMessageRouter(router);
        client.addLifeSpanHandler(new CefLifeSpanHandlerAdapter() {
            @Override public boolean onBeforePopup(CefBrowser b, CefFrame f, String url, String frame) { return true; }
            @Override public void onAfterCreated(CefBrowser b) { Platform.runLater(() -> resizeBrowser()); }
            @Override public void onBeforeClose(CefBrowser b) {
                client.removeMessageRouter(router); router.dispose(); client.dispose();
                assets.close(); java.awt.EventQueue.invokeLater(() -> disposed.complete(null));
            }
        });
        client.addRequestHandler(new CefRequestHandlerAdapter() {
            @Override public boolean onBeforeBrowse(CefBrowser b, CefFrame f, CefRequest request, boolean gesture, boolean redirect) {
                return !request.getURL().equals(assets.url());
            }
            @Override public void onRenderProcessTerminated(CefBrowser b, TerminationStatus s, int code, String text) {
                Platform.runLater(() -> fail("Chromium renderer terminated: " + s + " " + text));
            }
        });
        client.addLoadHandler(new CefLoadHandlerAdapter() {
            @Override public void onLoadError(CefBrowser b, CefFrame f, ErrorCode code, String text, String url) {
                if (f.isMain() && code != ErrorCode.ERR_ABORTED) Platform.runLater(() -> fail("Viewer load failed: " + text));
            }
        });
        browser = new FxOffscreenBrowser(client, assets.url(), this::paint);
        widthProperty().addListener(o -> resizeBrowser()); heightProperty().addListener(o -> resizeBrowser());
        focusedProperty().addListener((o,old,next) -> browser.setFocus(next));
        setOnMousePressed(e -> { requestFocus(); forwardMouse(e,MouseEvent.MOUSE_PRESSED); });
        setOnMouseReleased(e -> forwardMouse(e,MouseEvent.MOUSE_RELEASED));
        setOnMouseMoved(e -> forwardMouse(e,MouseEvent.MOUSE_MOVED));
        setOnMouseDragged(e -> forwardMouse(e,MouseEvent.MOUSE_DRAGGED));
        setOnMouseEntered(e -> forwardMouse(e,MouseEvent.MOUSE_ENTERED));
        setOnMouseExited(e -> forwardMouse(e,MouseEvent.MOUSE_EXITED));
        setOnScroll(e -> { browser.wheel((int)e.getX(),(int)e.getY(),-e.getDeltaY()/40,0); e.consume(); });
        setOnKeyPressed(e -> { browser.key(java.awt.event.KeyEvent.KEY_PRESSED,e.getCode().getCode(),java.awt.event.KeyEvent.CHAR_UNDEFINED,0); e.consume(); });
        setOnKeyReleased(e -> { browser.key(java.awt.event.KeyEvent.KEY_RELEASED,e.getCode().getCode(),java.awt.event.KeyEvent.CHAR_UNDEFINED,0); e.consume(); });
        setOnKeyTyped(e -> { if(!e.getCharacter().isEmpty()) browser.key(java.awt.event.KeyEvent.KEY_TYPED,0,e.getCharacter().charAt(0),0); e.consume(); });
        browser.createImmediately();
        ready.orTimeout(45,TimeUnit.SECONDS).exceptionally(failure -> { Platform.runLater(() -> fail(failure.getMessage())); return null; });
    }
    private void receive(JsonObject event) {
        if (closed) return;
        switch (event.get("type").getAsString()) {
            case "ready" -> { status.setVisible(false); ready.complete(null); }
            case "pick" -> { JsonElement id = event.get("id"); String value = id.isJsonNull()?null:id.getAsString(); if(value==null||SYSTEM_IDS.contains(value)) onPick.accept(value); }
            case "error" -> fail(event.get("message").getAsString());
            case "report" -> { var pending = reports.remove(event.get("requestId").getAsString()); if(pending!=null) {
                JsonObject data=event.getAsJsonObject("data"); data.addProperty("javafxFrameWidth",pixels==null?0:pixels.getWidth()); pending.complete(data);
            } }
            default -> { }
        }
    }
    private void fail(String reason) {
        if (closed) return;
        status.setText("3D viewer failed: " + reason); status.setVisible(true); status.setWrapText(true);
        ready.completeExceptionally(new IllegalStateException(reason));
        reports.values().forEach(f -> f.completeExceptionally(new IllegalStateException(reason))); reports.clear();
        onError.accept(reason);
    }
    private void resizeBrowser() {
        if (closed) return;
        double scale = getScene()!=null && getScene().getWindow()!=null ? getScene().getWindow().getOutputScaleX() : 1;
        browser.resize((int)Math.max(1,getWidth()),(int)Math.max(1,getHeight()),scale);
    }
    private void paint(FxOffscreenBrowser.Frame frame) {
        if (closed) return;
        latest.set(frame);
        if (paintPending.compareAndSet(false,true)) Platform.runLater(this::present);
    }
    private void present() {
        var frame = latest.getAndSet(null);
        if (!closed && frame != null) {
            if(pixels==null||pixels.getWidth()!=frame.width()||pixels.getHeight()!=frame.height()) {
                pixels = new WritableImage(frame.width(),frame.height()); image.setImage(pixels);
            }
            pixels.getPixelWriter().setPixels(0,0,frame.width(),frame.height(),PixelFormat.getByteBgraPreInstance(),frame.bgra(),0,frame.width()*4);
        }
        paintPending.set(false);
        if (!closed && latest.get()!=null && paintPending.compareAndSet(false,true)) Platform.runLater(this::present);
    }
    private void forwardMouse(javafx.scene.input.MouseEvent e, int type) {
        int button=e.getButton()==MouseButton.PRIMARY?1:e.getButton()==MouseButton.MIDDLE?2:e.getButton()==MouseButton.SECONDARY?3:0;
        int mods=(e.isPrimaryButtonDown()?InputEvent.BUTTON1_DOWN_MASK:0)|(e.isMiddleButtonDown()?InputEvent.BUTTON2_DOWN_MASK:0)|(e.isSecondaryButtonDown()?InputEvent.BUTTON3_DOWN_MASK:0)
                |(e.isShiftDown()?InputEvent.SHIFT_DOWN_MASK:0)|(e.isControlDown()?InputEvent.CTRL_DOWN_MASK:0)|(e.isAltDown()?InputEvent.ALT_DOWN_MASK:0)|(e.isMetaDown()?InputEvent.META_DOWN_MASK:0);
        browser.mouse(type,(int)e.getX(),(int)e.getY(),button,mods,Math.max(1,e.getClickCount())); e.consume();
    }
    public CompletableFuture<Void> ready() { return ready.copy(); }
    public void setOnPick(Consumer<String> callback) { requireFx(); onPick=Objects.requireNonNull(callback); }
    public void setOnError(Consumer<String> callback) { requireFx(); onError=Objects.requireNonNull(callback); }
    public CompletableFuture<Void> setLevels(Map<String,Integer> values) {
        Map<String,Integer> copy = Map.copyOf(values);
        copy.forEach((id,lv)->{if(!SYSTEM_IDS.contains(id)||lv<0||lv>3)throw new IllegalArgumentException("Unknown system or severity outside 0..3: "+id);});
        return command("setLevels("+JSON.toJson(copy)+")");
    }
    public CompletableFuture<Void> select(String id) {
        if(id!=null&&!SYSTEM_IDS.contains(id))throw new IllegalArgumentException("Unknown system: "+id);
        return command("select("+JSON.toJson(id)+")");
    }
    public CompletableFuture<Void> setSpinning(boolean value) { return command("setSpinning("+value+")"); }
    private synchronized CompletableFuture<Void> command(String expression) {
        if(closed) return CompletableFuture.failedFuture(new IllegalStateException("View closed"));
        commands = commands.thenRun(()->{if(closed)throw new IllegalStateException("View closed"); browser.executeJavaScript("window.bodyHost."+expression+";",assets.url(),0);});
        return commands.copy();
    }
    public CompletableFuture<JsonObject> diagnostics() {
        String id=UUID.randomUUID().toString(); var result=new CompletableFuture<JsonObject>(); reports.put(id,result);
        command("report("+JSON.toJson(id)+")").exceptionally(f->{result.completeExceptionally(f);return null;});
        result.orTimeout(10,TimeUnit.SECONDS).whenComplete((r,f)->reports.remove(id)); return result;
    }
    /** Completes once CEF has closed this browser and the local asset server is stopped. */
    public CompletableFuture<Void> disposed() { return disposed.copy(); }
    @Override public void close() {
        requireFx(); if(closed)return; closed=true;
        ready.completeExceptionally(new CancellationException("View closed"));
        reports.values().forEach(f->f.completeExceptionally(new CancellationException("View closed"))); reports.clear(); latest.set(null);
        browser.close(true);
    }
    private static void requireFx() { if(!Platform.isFxApplicationThread())throw new IllegalStateException("Use the JavaFX application thread"); }
}

package org.cef.browser;

import org.cef.*;
import org.cef.handler.*;
import org.cef.callback.CefDragData;
import java.awt.*;
import java.awt.event.*;
import java.nio.ByteBuffer;
import java.util.concurrent.CompletableFuture;
import java.util.function.Consumer;

/** Pinned JCEF adapter: package access is needed because CefBrowser_N is not public.
 * No Swing/JOGL heavyweight component is embedded in JavaFX. */
public final class FxDesktopBrowser extends CefBrowser_N implements CefRenderHandler {
    public record Frame(byte[] bgra, int width, int height, boolean popup, int x, int y) {}
    private volatile int width = 800, height = 850;
    private volatile double scale = 1;
    private final Canvas eventSource = new Canvas();
    private final Consumer<Frame> painter;
    private final Consumer<Boolean> popupVisibility;
    private final java.util.function.IntConsumer cursor;
    private volatile Rectangle popupRect=new Rectangle();
    private volatile int screenX,screenY;
    public double scale(){return scale;}
    public void screenOrigin(int x,int y){screenX=x;screenY=y;}
    private final CefRenderHandler handler = new CefRenderHandlerAdapter() {
        @Override public Rectangle getViewRect(CefBrowser browser) { return new Rectangle(0, 0, width, height); }
        // Use CEF's default screen info. JCEF 152's native GetJNIScreenInfo
        // deletes the supplied JNI local reference twice when this returns true.
        @Override public boolean getScreenInfo(CefBrowser browser, CefScreenInfo info) { return false; }
        @Override public Point getScreenPoint(CefBrowser browser, Point point) { return new Point(screenX+(int)(point.x/scale),screenY+(int)(point.y/scale)); }
        @Override public void onPaint(CefBrowser b, boolean popup, Rectangle[] dirty, ByteBuffer bytes, int w, int h) {
            if (w <= 0 || h <= 0) return;
            byte[] copy = new byte[Math.multiplyExact(Math.multiplyExact(w, h), 4)];
            bytes.duplicate().get(copy); var rect=popupRect; painter.accept(new Frame(copy, w, h, popup, rect.x, rect.y));
        }
        @Override public void addOnPaintListener(Consumer<CefPaintEvent> listener) { throw new UnsupportedOperationException(); }
        @Override public void setOnPaintListener(Consumer<CefPaintEvent> listener) { throw new UnsupportedOperationException(); }
        @Override public void removeOnPaintListener(Consumer<CefPaintEvent> listener) {}
        @Override public boolean onCursorChange(CefBrowser b, int type) { cursor.accept(type); return true; }
        @Override public void onPopupShow(CefBrowser b,boolean show){popupVisibility.accept(show);}
        @Override public void onPopupSize(CefBrowser b,Rectangle rect){popupRect=new Rectangle(rect);}
    };
    public FxDesktopBrowser(CefClient client, String url, Consumer<Frame> painter, Consumer<Boolean> popupVisibility, java.util.function.IntConsumer cursor) {
        super(client, url, null, null, null, settings()); this.painter = painter; this.popupVisibility=popupVisibility;this.cursor=cursor;
    }
    private static CefBrowserSettings settings() { var s = new CefBrowserSettings(); s.windowless_frame_rate = 60; return s; }
    @Override public void createImmediately() { createBrowser(getClient(), 0, getUrl(), true, false, null, getRequestContext()); }
    @Override public Component getUIComponent() { return eventSource; }
    @Override public CefRenderHandler getRenderHandler() { return this; }
    @Override protected CefBrowser_N createDevToolsBrowser(CefClient c, String u, CefRequestContext ctx, CefBrowser_N p, Point point) { throw new UnsupportedOperationException("No embedded devtools"); }
    @Override public CompletableFuture<java.awt.image.BufferedImage> createScreenshot(boolean nativeResolution) { return CompletableFuture.failedFuture(new UnsupportedOperationException("Use the JavaFX view snapshot")); }
    @Override public Rectangle getViewRect(CefBrowser b) { return handler.getViewRect(b); }
    @Override public boolean getScreenInfo(CefBrowser b, CefScreenInfo s) { return handler.getScreenInfo(b,s); }
    @Override public Point getScreenPoint(CefBrowser b, Point p) { return handler.getScreenPoint(b,p); }
    @Override public void onPopupShow(CefBrowser b, boolean show) { handler.onPopupShow(b,show); }
    @Override public void onPopupSize(CefBrowser b, Rectangle r) { handler.onPopupSize(b,r); }
    @Override public void onPaint(CefBrowser b, boolean p, Rectangle[] r, ByteBuffer data, int w, int h) { handler.onPaint(b,p,r,data,w,h); }
    @Override public boolean onCursorChange(CefBrowser b, int c) { return handler.onCursorChange(b,c); }
    @Override public boolean startDragging(CefBrowser b, CefDragData data, int op, int x, int y) { return false; }
    @Override public void updateDragCursor(CefBrowser b, int op) {}
    @Override public void addOnPaintListener(Consumer<CefPaintEvent> listener) { handler.addOnPaintListener(listener); }
    @Override public void setOnPaintListener(Consumer<CefPaintEvent> listener) { handler.setOnPaintListener(listener); }
    @Override public void removeOnPaintListener(Consumer<CefPaintEvent> listener) { handler.removeOnPaintListener(listener); }
    public void resize(int w, int h, double dpi) {
        scale = Math.max(1, dpi);
        width = Math.max(1, (int)Math.ceil(w * scale)); height = Math.max(1, (int)Math.ceil(h * scale));
        // A scaled viewport plus page zoom retains logical CSS size and crisp HiDPI pixels.
        setZoomLevel(Math.log(scale)/Math.log(1.2)); wasResized(width, height);
    }
    public void mouse(int type, int x, int y, int button, int modifiers, int clicks) {
        EventQueue.invokeLater(() -> sendMouseEvent(new MouseEvent(eventSource, type, System.currentTimeMillis(), modifiers, (int)(x*scale), (int)(y*scale), (int)(x*scale), (int)(y*scale), clicks, false, button)));
    }
    public void wheel(int x, int y, double pixels, int modifiers) {
        EventQueue.invokeLater(() -> sendMouseWheelEvent(new MouseWheelEvent(eventSource, MouseEvent.MOUSE_WHEEL, System.currentTimeMillis(), modifiers,
                (int)(x*scale), (int)(y*scale), (int)(x*scale), (int)(y*scale), 0, false, MouseWheelEvent.WHEEL_UNIT_SCROLL, Math.max(1,(int)Math.round(Math.abs(pixels))), (int)Math.signum(pixels), Math.signum(pixels))));
    }
    private CompletableFuture<?> keyboard=CompletableFuture.completedFuture(null);
    public void key(int type, int code, char character, int modifiers) {
        if(type==KeyEvent.KEY_TYPED){text(String.valueOf(character),modifiers);return;}
        int vk=switch(code){case 10->13;case 127->46;case 155->45;case 157->91;case 44->188;case 46->190;case 47->191;case 59->186;case 61->187;case 45->189;case 91->219;case 93->221;case 92->220;default->code;};
        String key=switch(vk){case 8->"Backspace";case 9->"Tab";case 13->"Enter";case 16->"Shift";case 17->"Control";case 18->"Alt";case 27->"Escape";case 32->" ";case 33->"PageUp";case 34->"PageDown";case 35->"End";case 36->"Home";case 37->"ArrowLeft";case 38->"ArrowUp";case 39->"ArrowRight";case 40->"ArrowDown";case 46->"Delete";default->character!=KeyEvent.CHAR_UNDEFINED?String.valueOf(character):code>=65&&code<=90?String.valueOf((char)(((modifiers&InputEvent.SHIFT_DOWN_MASK)!=0)?code:code+32)):code>=48&&code<=57?String.valueOf((char)code):"Unidentified";};
        var event=new com.google.gson.JsonObject();event.addProperty("type",type==KeyEvent.KEY_PRESSED?"rawKeyDown":"keyUp");event.addProperty("key",key);event.addProperty("windowsVirtualKeyCode",vk<=255?vk:0);event.addProperty("modifiers",cdpModifiers(modifiers));
        if(type==KeyEvent.KEY_PRESSED&&(modifiers&(InputEvent.CTRL_DOWN_MASK|InputEvent.META_DOWN_MASK))!=0){
            String command=switch(code){case 65->"selectAll";case 67->"copy";case 86->"paste";case 88->"cut";case 90->(modifiers&InputEvent.SHIFT_DOWN_MASK)!=0?"redo":"undo";case 89->"redo";default->null;};
            if(command!=null){var commands=new com.google.gson.JsonArray();commands.add(command);event.add("commands",commands);}
        }
        dispatchKey(event);
    }
    public void text(String text,int modifiers){
        if(text.isEmpty())return;var event=new com.google.gson.JsonObject();event.addProperty("type","char");event.addProperty("text",text);event.addProperty("unmodifiedText",text);event.addProperty("key",text);event.addProperty("modifiers",cdpModifiers(modifiers));dispatchKey(event);
    }
    private synchronized void dispatchKey(com.google.gson.JsonObject event){
        // CDP input avoids the platform-specific private AWT scancode fields required by JCEF's synthetic KeyEvents.
        keyboard=keyboard.handle((v,f)->null).thenCompose(v->isClosed()?CompletableFuture.completedFuture(""):getDevToolsClient().executeDevToolsMethod("Input.dispatchKeyEvent",event.toString()));
    }
    private static int cdpModifiers(int m){return((m&InputEvent.ALT_DOWN_MASK)!=0?1:0)|((m&InputEvent.CTRL_DOWN_MASK)!=0?2:0)|((m&InputEvent.META_DOWN_MASK)!=0?4:0)|((m&InputEvent.SHIFT_DOWN_MASK)!=0?8:0);}
}

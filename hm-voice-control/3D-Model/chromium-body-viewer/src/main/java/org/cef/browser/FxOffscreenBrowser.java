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
public final class FxOffscreenBrowser extends CefBrowser_N implements CefRenderHandler {
    public record Frame(byte[] bgra, int width, int height) {}
    private volatile int width = 800, height = 850;
    private volatile double scale = 1;
    private final Canvas eventSource = new Canvas();
    private final Consumer<Frame> painter;
    private final CefRenderHandler handler = new CefRenderHandlerAdapter() {
        @Override public Rectangle getViewRect(CefBrowser browser) { return new Rectangle(0, 0, width, height); }
        // Use CEF's default screen info. JCEF 152's native GetJNIScreenInfo
        // deletes the supplied JNI local reference twice when this returns true.
        @Override public boolean getScreenInfo(CefBrowser browser, CefScreenInfo info) { return false; }
        @Override public Point getScreenPoint(CefBrowser browser, Point point) { return point; }
        @Override public void onPaint(CefBrowser b, boolean popup, Rectangle[] dirty, ByteBuffer bytes, int w, int h) {
            if (popup || w <= 0 || h <= 0) return;
            byte[] copy = new byte[Math.multiplyExact(Math.multiplyExact(w, h), 4)];
            bytes.get(copy); painter.accept(new Frame(copy, w, h));
        }
        @Override public void addOnPaintListener(Consumer<CefPaintEvent> listener) { throw new UnsupportedOperationException(); }
        @Override public void setOnPaintListener(Consumer<CefPaintEvent> listener) { throw new UnsupportedOperationException(); }
        @Override public void removeOnPaintListener(Consumer<CefPaintEvent> listener) {}
        @Override public boolean onCursorChange(CefBrowser b, int cursor) { return true; }
    };
    public FxOffscreenBrowser(CefClient client, String url, Consumer<Frame> painter) {
        super(client, url, null, null, null, settings()); this.painter = painter;
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
    public void wheel(int x, int y, double units, int modifiers) {
        EventQueue.invokeLater(() -> sendMouseWheelEvent(new MouseWheelEvent(eventSource, MouseEvent.MOUSE_WHEEL, System.currentTimeMillis(), modifiers,
                (int)(x*scale), (int)(y*scale), (int)(x*scale), (int)(y*scale), 0, false, MouseWheelEvent.WHEEL_UNIT_SCROLL, 3, (int) Math.signum(units), units)));
    }
    public void key(int type, int code, char character, int modifiers) {
        sendKeyEvent(new KeyEvent(eventSource, type, System.currentTimeMillis(), modifiers, code, character));
    }
}

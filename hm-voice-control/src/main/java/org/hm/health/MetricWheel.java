package org.hm.health;

import javafx.animation.AnimationTimer;
import javafx.application.Platform;
import javafx.scene.Node;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.scene.input.MouseEvent;
import javafx.scene.input.ScrollEvent;
import javafx.scene.layout.Region;
import java.util.List;
import java.util.function.IntConsumer;

/**
 * The status cards on a wheel. The card in the middle is full size and fully opaque; the cards beside it get smaller
 * and fainter the further out they sit, with their bottom edges on one line. The wheel has no end: it comes round again.
 * Turn it with the mouse wheel or a trackpad, by dragging, with the left and right arrow keys, or by clicking a side card.
 */
final class MetricWheel extends Region {
    static final double CARD_W = 276, CARD_H = 134;          // the middle card
    private static final double GAP = 14, SHRINK = .17, SMALLEST = .52, FADE = .26, FAINTEST = .22, TOP = 12, BOTTOM = 14;
    private static final double STEP = CARD_W * (1 - SHRINK / 2) + GAP;   // distance from the middle card to its neighbour

    private double offset, target;                 // which card is in the middle, as a running number (not wrapped)
    private boolean placed, dragged;
    private double pressX, pressOffset, scrolled;
    private long lastStep;
    private IntConsumer onCentred = i -> {};
    private final AnimationTimer glide = new AnimationTimer() {
        private long last;
        @Override public void start() { last = 0; super.start(); }
        @Override public void handle(long now) {
            if (last == 0) { last = now; return; }
            double dt = Math.min(.05, (now - last) / 1e9); last = now;
            offset += (target - offset) * (1 - Math.exp(-dt * 11));       // ease towards the target, quick then gentle
            if (Math.abs(target - offset) < .002) { offset = target; stop(); }
            requestLayout();
        }
    };

    MetricWheel() {
        setId("status-wheel"); setMinWidth(0); setFocusTraversable(false);
        addEventFilter(ScrollEvent.SCROLL, e -> {
            double d = Math.abs(e.getDeltaX()) > Math.abs(e.getDeltaY()) ? e.getDeltaX() : e.getDeltaY();
            scrolled += d; e.consume();                                    // the wheel turns; the page behind stays put
            long now = System.nanoTime();
            if (Math.abs(scrolled) >= 30 && now - lastStep > 90_000_000L) { step(scrolled < 0 ? 1 : -1); scrolled = 0; lastStep = now; }
        });
        addEventFilter(KeyEvent.KEY_PRESSED, e -> {
            if (e.getCode() == KeyCode.LEFT) { step(-1); e.consume(); } else if (e.getCode() == KeyCode.RIGHT) { step(1); e.consume(); }
        });
        addEventFilter(MouseEvent.MOUSE_PRESSED, e -> { pressX = e.getSceneX(); pressOffset = offset; dragged = false; });
        addEventFilter(MouseEvent.MOUSE_DRAGGED, e -> {
            double dx = e.getSceneX() - pressX;
            if (!dragged && Math.abs(dx) > 6) { dragged = true; glide.stop(); }
            if (dragged) { offset = target = pressOffset - dx / STEP; requestLayout(); }
        });
        addEventFilter(MouseEvent.MOUSE_RELEASED, e -> {
            if (!dragged) return;
            target = Math.round(offset); glide.start(); onCentred.accept(centred());
            Platform.runLater(() -> dragged = false);                      // after the click this release would otherwise cause
        });
    }

    /** Called with the index of the card that has just been brought to the middle by the user. */
    void setOnCentred(IntConsumer listener) { onCentred = listener; }
    /** True while a drag is ending, so a card can ignore the click that comes with letting go. */
    boolean dragged() { return dragged; }
    /** The cards, in order. The wheel keeps its position when they are replaced. */
    void setItems(List<? extends Node> cards) { getChildren().setAll(cards); requestLayout(); }
    /** Index of the card in the middle (or on its way there). */
    int centred() { int n = getChildren().size(); return n == 0 ? 0 : (int) Math.floorMod(Math.round(target), (long) n); }
    /** How many cards are at least half inside the wheel's width right now. */
    int visibleCards() { return (int) getChildren().stream().filter(c -> c.isVisible() && c.getProperties().get("inside") == Boolean.TRUE).count(); }

    /** Bring a card to the middle, the short way round. */
    void centreOn(int index, boolean animate) {
        int n = getChildren().size(); if (n == 0) return;
        long now = Math.round(target); long delta = Math.floorMod(index - now, (long) n); if (delta > n / 2) delta -= n;
        target = now + delta;
        if (!animate || !placed) { offset = target; placed = true; glide.stop(); } else glide.start();
        requestLayout();
    }
    /** Turn by one card: +1 brings the next card in from the right. */
    void step(int direction) { if (getChildren().isEmpty()) return; target = Math.round(target) + direction; glide.start(); onCentred.accept(centred()); }

    /** Distance from the middle of the wheel to the middle of a card that sits u places away. */
    private static double place(double u) {
        double flat = (1 - SMALLEST) / SHRINK;                             // from here outwards the cards stop shrinking
        double widths = u <= flat ? u - SHRINK * u * u / 2 : flat - SHRINK * flat * flat / 2 + SMALLEST * (u - flat);
        return CARD_W * widths + GAP * u;
    }

    @Override protected void layoutChildren() {
        var cards = getChildren(); int n = cards.size(); double w = getWidth(), middle = w / 2;
        for (int i = 0; i < n; i++) {
            Node card = cards.get(i);
            double d = i - offset; d -= n * Math.round(d / n);             // places from the middle, the short way round
            double u = Math.abs(d), scale = Math.max(SMALLEST, 1 - SHRINK * u), x = middle + Math.signum(d) * place(u);
            card.resizeRelocate(x - CARD_W / 2, TOP, CARD_W, CARD_H);
            card.setScaleX(scale); card.setScaleY(scale); card.setTranslateY((1 - scale) * CARD_H / 2);   // bottoms on one line
            double inside = (middle + CARD_W * scale / 2 - place(u)) / (CARD_W * scale);                  // 1 = wholly in view
            double opacity = Math.max(FAINTEST, 1 - FADE * u) * Math.max(0, Math.min(1, inside * 1.5)) * Math.max(0, Math.min(1, (n / 2.0 - u) / .75));
            card.setOpacity(opacity); card.setVisible(opacity > .02); card.setViewOrder(u);
            card.getProperties().put("inside", inside >= .5);
        }
    }
    @Override protected double computePrefHeight(double width) { return TOP + CARD_H + BOTTOM; }
    @Override protected double computeMinHeight(double width) { return computePrefHeight(width); }
    @Override protected double computeMaxHeight(double width) { return computePrefHeight(width); }
    @Override protected double computePrefWidth(double height) { return CARD_W * 3; }
}

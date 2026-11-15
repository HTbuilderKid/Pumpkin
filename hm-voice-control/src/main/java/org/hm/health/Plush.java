package org.hm.health;

import javafx.animation.Interpolator;
import javafx.animation.ScaleTransition;
import javafx.scene.Node;
import javafx.util.Duration;

/**
 * The feel of the Plush widgets (github: plush-ui, MIT), rebuilt for JavaFX: a control gives a little while it is
 * held down and springs back with a small overshoot when released. Colours and shapes live in health.css.
 */
final class Plush {
    private Plush() {}

    /** Back-out curve: runs slightly past the target, then settles (about 3% overshoot, like Plush's spring). */
    private static final Interpolator SPRING = new Interpolator() {
        @Override protected double curve(double t) {
            double c = 1.25, u = t - 1;
            return 1 + (c + 1) * u * u * u + c * u * u;
        }
    };

    /** Make a node shrink to {@code scale} while pressed and spring back on release. */
    static <T extends Node> T press(T node, double scale) {
        ScaleTransition down = new ScaleTransition(Duration.millis(110), node);
        down.setToX(scale); down.setToY(scale); down.setInterpolator(Interpolator.EASE_OUT);
        ScaleTransition up = new ScaleTransition(Duration.millis(420), node);
        up.setToX(1); up.setToY(1); up.setInterpolator(SPRING);
        node.pressedProperty().addListener((o, was, pressed) -> {
            if (pressed) { up.stop(); down.playFromStart(); }
            else { down.stop(); up.playFromStart(); }
        });
        return node;
    }
}

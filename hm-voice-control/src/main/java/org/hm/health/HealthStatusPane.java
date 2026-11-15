package org.hm.health;

import javafx.application.Platform;
import javafx.geometry.*;
import javafx.scene.Node;
import javafx.scene.canvas.Canvas;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Rectangle;
import javafx.scene.shape.StrokeLineCap;
import javafx.scene.shape.StrokeLineJoin;
import javafx.scene.text.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.function.Consumer;
import static org.hm.health.AssessmentEngine.*;

/**
 * Native JavaFX status + metric detail page. Add this node to your existing layout.
 * The metric cards sit on a wheel (MetricWheel): the one in the middle is the one the detail card shows.
 * Look: light, rounded and quiet, after the Plush widgets and the Apple Health summary: white cards on a soft grey
 * ground, a coloured title per metric, one large number, black pill buttons. All colours and shapes are in health.css.
 */
public final class HealthStatusPane extends ScrollPane implements AutoCloseable {
    /** Status colours: your normal, watch, act, urgent. Used for dots, sparklines and chart marks. */
    public static final List<Color> COLORS = List.of(Color.web("#2fc26b"), Color.web("#f5a524"), Color.web("#f26a1b"), Color.web("#e5352b"));
    /** The same four, darkened so they read as text on white. */
    static final List<Color> TEXT_COLORS = List.of(Color.web("#178a47"), Color.web("#a36400"), Color.web("#c24a00"), Color.web("#c81e1e"));
    static final Color INK = Color.web("#141414"), INK_2 = Color.web("#6e6e72"), INK_3 = Color.web("#a3a3a6");
    private static final String WHY = "Why this matters in space", HOW = "How to measure it", LIMITS = "Where the limits come from";

    private final HealthSession session;
    private final VBox root = new VBox(22), status = new VBox(14), detail = new VBox(18), left = new VBox(16), right = new VBox(16);
    private final MetricWheel wheel = new MetricWheel();
    private final HBox dots = new HBox(7);
    private final HBox columns = new HBox(28), heading = new HBox(12);
    private final Label title = new Label(), system = new Label(), feedback = new Label();
    private final MetricChart chart = new MetricChart();
    private final ExecutorService saves = Executors.newSingleThreadExecutor(r -> { var t = new Thread(r, "health-readings"); t.setDaemon(false); return t; });
    private final Map<String, Boolean> disclosures = new HashMap<>(Map.of(WHY, true, HOW, true, LIMITS, false));
    private String selected = "hydration", hazard, environment = "station";
    private int day;
    private boolean saving, closed;
    private Consumer<Map<String, Integer>> onLevels = levels -> {};
    private Consumer<String> onSystemSelected = id -> {};
    private MeasurementGuide activeGuide;

    public HealthStatusPane(HealthSession session) {
        requireFx(); this.session = Objects.requireNonNull(session); day = session.today();
        loadFonts();
        getStylesheets().add(Objects.requireNonNull(getClass().getResource("/health/health.css")).toExternalForm());
        getStyleClass().add("health-page"); setFitToWidth(true); setHbarPolicy(ScrollBarPolicy.NEVER); setContent(root);
        root.setPadding(new Insets(22, 24, 28, 24)); status.getStyleClass().add("section"); detail.getStyleClass().add("panel");

        Label section = label("Status", "page-title"); Region space = new Region(); HBox.setHgrow(space, Priority.ALWAYS);
        FlowPane legend = new FlowPane(16, 5); legend.setAlignment(Pos.CENTER_RIGHT);
        String[] names = {"Your normal", "Watch", "Act", "Urgent"};
        for (int i = 0; i < 4; i++) { HBox item = new HBox(7, new Circle(5, COLORS.get(i)), label(names[i], "muted")); item.setAlignment(Pos.CENTER_LEFT); legend.getChildren().add(item); }
        // every metric as one dot, so what needs attention shows even while its card is off to the side
        dots.setId("status-dots"); dots.setAlignment(Pos.CENTER_LEFT); HBox.setMargin(dots, new Insets(0, 0, 7, 12));
        HBox bar = new HBox(12, section, dots, space, legend); bar.setAlignment(Pos.BOTTOM_LEFT); bar.setPadding(new Insets(0, 5, 0, 5));
        Button previous = turn("‹", "wheel-previous", -1), next = turn("›", "wheel-next", 1);
        StackPane stage = new StackPane(wheel, previous, next); StackPane.setAlignment(previous, Pos.CENTER_LEFT); StackPane.setAlignment(next, Pos.CENTER_RIGHT);
        wheel.setOnCentred(i -> setSelectedIndicator(session.catalog().daily().get(i).id()));
        status.getChildren().addAll(bar, stage);

        title.setId("metric-title"); title.getStyleClass().add("detail-title"); title.setWrapText(true); title.setMinWidth(0);
        system.getStyleClass().add("badge"); system.setMinWidth(Region.USE_PREF_SIZE);
        Region titleSpace = new Region(); HBox.setHgrow(titleSpace, Priority.ALWAYS);
        heading.getChildren().addAll(title, titleSpace, system); heading.setAlignment(Pos.CENTER_LEFT);
        left.setMinWidth(0); right.setMinWidth(0); HBox.setHgrow(left, Priority.ALWAYS); HBox.setHgrow(right, Priority.ALWAYS);
        columns.getChildren().addAll(left, right); detail.getChildren().addAll(heading, columns);
        // a small pointer on top of the detail card, under the middle of the wheel: this card is about that metric
        Region pointer = new Region(); pointer.getStyleClass().add("pointer"); pointer.setMinSize(30, 30); pointer.setPrefSize(30, 30); pointer.setMaxSize(30, 30);
        pointer.setRotate(45); pointer.setTranslateY(-13); pointer.setMouseTransparent(true);
        StackPane detailWrap = new StackPane(detail, pointer); StackPane.setAlignment(pointer, Pos.TOP_CENTER); VBox.setMargin(detailWrap, new Insets(-14, 0, 0, 0));
        root.getChildren().addAll(status, detailWrap);
        viewportBoundsProperty().addListener(o -> layoutResponsive());
        refresh();
    }

    /** Make the page's typeface available. The page does this itself; call it earlier if other screens use the same look. */
    public static void loadFonts() {
        for (String name : List.of("open-runde-latin-400-normal.ttf", "open-runde-latin-500-normal.ttf", "open-runde-latin-600-normal.ttf", "open-runde-latin-700-normal.ttf")) {
            try (var in = HealthStatusPane.class.getResourceAsStream("/health/fonts/" + name)) { if (in != null) Font.loadFont(in, 16); } catch (java.io.IOException ignored) {}
        }
    }

    public HealthSession session() { return session; }
    public String selectedIndicator() { return selected; }
    public int missionDay() { return day; }
    public void setSelectedIndicator(String id) { requireFx(); session.catalog().indicator(id); selected = id; refresh(); onSystemSelected.accept(session.catalog().indicator(id).system()); }
    public void setMissionDay(int day) { requireFx(); if (day < -3650 || day > session.today()) throw new IllegalArgumentException("Day outside available mission window"); this.day = day; refresh(); }
    public void setHazard(String id) { requireFx(); if (id != null && session.catalog().hazards().stream().noneMatch(h -> h.id().equals(id))) throw new IllegalArgumentException("Unknown hazard"); hazard = id; renderTiles(session.assess(day)); }
    public void setEnvironment(String id) { requireFx(); if (session.catalog().environments().stream().noneMatch(e -> e.id().equals(id))) throw new IllegalArgumentException("Unknown environment"); environment = id; refresh(); }
    public void setOnSystemLevels(Consumer<Map<String, Integer>> listener) { requireFx(); onLevels = Objects.requireNonNull(listener); onLevels.accept(session.systemLevels(day)); }
    public void setOnSystemSelected(Consumer<String> listener) { requireFx(); onSystemSelected = Objects.requireNonNull(listener); }
    public void refresh() { requireFx(); var results = session.assess(day); renderTiles(results); renderDetail(results.get(selected)); onLevels.accept(session.systemLevels(day)); }

    // ---------------------------------------------------------------- the metric cards
    private void renderTiles(Map<String, Result> results) {
        boolean hadFocus = wheel.isFocusWithin(); List<Node> cards = new ArrayList<>(); dots.getChildren().clear(); Button middle = null; Set<String> watched = new HashSet<>();
        session.catalog().hazards().stream().filter(h -> h.id().equals(hazard)).forEach(h -> watched.addAll(h.watch()));
        for (var ind : session.catalog().daily()) {
            Result result = results.get(ind.id());
            boolean empty = result.value() == null, chosen = selected.equals(ind.id());
            Color color = empty ? INK_3 : COLORS.get(result.level()), text = empty ? INK_2 : TEXT_COLORS.get(result.level());

            Button tile = new Button(); tile.setId("metric-" + ind.id()); tile.getStyleClass().add("metric-tile"); if (chosen) tile.getStyleClass().add("selected");
            tile.setMaxSize(Double.MAX_VALUE, Double.MAX_VALUE); tile.setMinWidth(0); tile.setAlignment(Pos.TOP_LEFT); if (chosen) middle = tile;
            // like a Health summary card: a coloured title, one large number with its unit, the trend beside it
            Label name = label(ind.shortName(), "metric-name"); name.setStyle("-fx-text-fill:" + hex(text) + ";"); name.setMinWidth(0); name.setMaxWidth(Double.MAX_VALUE); HBox.setHgrow(name, Priority.ALWAYS);
            Label chevron = label("›", "chevron"); chevron.setMinWidth(Region.USE_PREF_SIZE);
            HBox top = new HBox(7, new Circle(4.5, color), name, chevron); top.setAlignment(Pos.CENTER_LEFT);
            Label value = label(format(ind, result.value()), "metric-value"); value.setMinWidth(Region.USE_PREF_SIZE); if (empty) value.setStyle("-fx-text-fill:" + hex(INK_3) + ";");
            Label unit = label(ind.unit(), "metric-unit"); unit.setMinWidth(Region.USE_PREF_SIZE);
            HBox numbers = new HBox(5, value, unit); numbers.setAlignment(Pos.BASELINE_LEFT);
            Canvas spark = spark(result, color);
            StackPane valueRow = new StackPane(numbers, spark); StackPane.setAlignment(spark, Pos.CENTER_RIGHT);
            Label sub = label(describe(ind, result), "metric-sub"); sub.setMinWidth(0); sub.setMaxWidth(Double.MAX_VALUE); sub.setTextOverrun(OverrunStyle.ELLIPSIS);
            VBox content = new VBox(3, top, valueRow, sub); content.prefWidthProperty().bind(tile.widthProperty().subtract(34)); content.setMinWidth(0); content.setMaxWidth(Double.MAX_VALUE); tile.setGraphic(content);

            tile.setTooltip(new Tooltip(ind.name() + "\n" + describe(ind, result) + (result.remeasure() ? "\nRe-measure first" : "") + (isDue(ind, result, session.today()) ? "\nReading due" : "")));
            tile.setAccessibleText(ind.name() + ", " + format(ind, result.value()) + " " + ind.unit() + ", " + (empty ? "No reading yet" : session.catalog().levels().get(result.level()).name()));
            tile.setOnAction(e -> { if (!wheel.dragged()) setSelectedIndicator(ind.id()); });
            Circle dot = new Circle(chosen ? 5.5 : 4, color); dot.getStyleClass().add("status-dot"); if (chosen) { dot.setStroke(INK); dot.setStrokeWidth(2); }
            Tooltip.install(dot, new Tooltip(ind.shortName())); dot.setOnMouseClicked(e -> setSelectedIndicator(ind.id())); dots.getChildren().add(dot);
            Plush.press(tile, .96);
            StackPane wrap = new StackPane(tile); wrap.getStyleClass().add(watched.contains(ind.id()) ? "hazard-tile" : "tile-wrap"); wrap.setMinWidth(0); wrap.setMaxWidth(Double.MAX_VALUE);
            cards.add(wrap);
        }
        wheel.setItems(cards);
        wheel.centreOn(session.catalog().daily().indexOf(session.catalog().indicator(selected)), true);
        if (hadFocus && middle != null) middle.requestFocus();
    }

    private Button turn(String arrow, String id, int direction) {
        Button button = new Button(arrow); button.setId(id); button.getStyleClass().add("wheel-nav"); button.setFocusTraversable(false);
        button.setAccessibleText(direction < 0 ? "Previous metric" : "Next metric"); button.setOnAction(e -> wheel.step(direction)); return Plush.press(button, .88);
    }

    private void layoutResponsive() {
        double width = getViewportBounds().getWidth(); boolean narrow = width < 1050;
        if (narrow) { columns.getChildren().clear(); if (!detail.getChildren().contains(left)) { detail.getChildren().addAll(left, right); } left.setPrefWidth(-1); right.setPrefWidth(-1); }
        else {
            detail.getChildren().removeAll(left, right); if (columns.getChildren().isEmpty()) columns.getChildren().addAll(left, right);
            double available = Math.max(100, width - 124); left.setPrefWidth(available * .55); right.setPrefWidth(available * .45);
        }
        system.setVisible(width > 1000); system.setManaged(width > 1000);
    }

    // ---------------------------------------------------------------- the detail card
    private void renderDetail(Result result) {
        var catalog = session.catalog(); var ind = catalog.indicator(selected);
        boolean empty = result.value() == null;
        Color color = empty ? INK_3 : COLORS.get(result.level()), text = empty ? INK_2 : TEXT_COLORS.get(result.level());
        title.setText(ind.name()); system.setText(catalog.system(ind.system()).name());

        // the verdict: a soft tinted row, the level first
        TextFlow verdict = new TextFlow(); verdict.getStyleClass().add("verdict");
        String severity = result.remeasure() ? "Re-measure first" : catalog.levels().get(result.level()).name();
        Text lead = new Text(empty ? "No reading yet for this indicator." : severity); lead.setFill(text); lead.getStyleClass().add("verdict-lead"); verdict.getChildren().add(lead);
        if (!empty) {
            String win = result.window() > 1 ? " (average of the last " + result.window() + ")" : "";
            String body = " · " + format(ind, result.value()) + " " + ind.unit() + win + (result.baseline() == null ? " · no baseline yet" : " · your normal is " + format(ind, result.baseline().mean()) + " (" + result.baseline().kind() + ")")
                    + (result.reasons().isEmpty() ? "" : " · " + String.join("; ", result.reasons())) + (result.trend().equals("steady") ? "" : " · " + result.trend() + " over the last week") + " · " + dayName(result.lastDay());
            Text rest = new Text(body); rest.setFill(INK); verdict.getChildren().add(rest);
        }
        StackPane verdictBox = new StackPane(verdict); verdictBox.getStyleClass().add("verdict-box"); verdictBox.setStyle("-fx-background-color:" + rgba(color, empty ? .10 : .13) + ";");

        chart.setData(ind, result);
        FlowPane chartLegend = new FlowPane(18, 6, legend(COLORS.get(0), "Your normal"), legend(COLORS.get(2), "Outside the healthy range"), replacedLegend());

        ReadingInput input = new ReadingInput(ind);
        Button save = new Button("Save"); save.setId("save-reading"); save.getStyleClass().add("primary"); save.setDisable(saving); Plush.press(save, .95);
        save.setOnAction(e -> {
            try { Double value = input.value(); if (value == null) throw new IllegalArgumentException("Enter a reading first."); saveReadings(Map.of(ind.id(), value), day, null); }
            catch (IllegalArgumentException failure) { message(failure.getMessage(), true); }
        });
        FlowPane fields = new FlowPane(10, 8, input, label(ind.unit(), "muted"), save); fields.setAlignment(Pos.CENTER_LEFT);
        VBox entry = new VBox(10, label("Add a reading · " + dayName(day), "caption"), fields); entry.getStyleClass().add("entry-card");
        feedback.setId("save-feedback"); feedback.setWrapText(true);
        left.getChildren().setAll(verdictBox, chart, chartLegend, entry, feedback);

        // what to do
        VBox action = new VBox(12); action.getStyleClass().add("action-card");
        String who = empty ? "Nothing to assess yet" : result.remeasure() ? "Repeat the measurement first" : catalog.levels().get(result.level()).who();
        Label actionTitle = label(who, "action-title"); actionTitle.setStyle("-fx-text-fill:" + hex(result.level() == 0 || empty ? INK : text) + ";"); actionTitle.setWrapText(true);
        HBox actionHead = new HBox(10, new Circle(6, color), actionTitle); actionHead.setAlignment(Pos.CENTER_LEFT); action.getChildren().add(actionHead);
        var env = catalog.environments().stream().filter(e -> e.id().equals(environment)).findFirst().orElseThrow();
        if (result.level() >= 2 && !result.remeasure()) action.getChildren().add(wrapped(result.level() == 3 ? "Ground reply: " + env.delay() + ". " + env.delayNote() : "Report it at the next opportunity; do not wait for the next scheduled check.", "muted"));
        List<String> steps = new ArrayList<>();
        if (result.remeasure()) steps.add("This is a sudden jump from your last reading. Measure again now, carefully, before acting on it. If the repeat agrees, it stands: " + catalog.levels().get(result.level()).who().toLowerCase(Locale.ROOT) + " and follow the steps below.");
        if (!result.discardedToday().isEmpty()) steps.add("An earlier reading today (" + String.join(", ", result.discardedToday().stream().map(r -> format(ind, r.value())).toList()) + ") was replaced by the repeat measurement.");
        if (result.level() > 0) { boolean onlyShift = result.reasons().stream().noneMatch(s -> s.startsWith("outside")); steps.addAll(ind.advice().getOrDefault(onlyShift ? "shift" : result.direction(), ind.advice().getOrDefault("shift", List.of()))); }
        if (steps.isEmpty()) action.getChildren().add(wrapped(empty ? ind.how() : "This is in your normal range. Keep measuring on schedule.", "body-text"));
        else for (int j = 0; j < steps.size(); j++) action.getChildren().add(numbered(j + 1, steps.get(j)));

        Label why = wrapped(ind.why() + " " + catalog.system(ind.system()).about(), "body-text"), how = wrapped(ind.how(), "body-text"); VBox howBox = new VBox(12, how);
        var equipment = catalog.equipmentFor(ind.id());
        if (equipment != null) {
            Button guide = new Button("Step-by-step guide: " + equipment.name().toLowerCase(Locale.ROOT) + "  →"); guide.setId("open-guide"); guide.getStyleClass().add("guide-link"); guide.setWrapText(true);
            guide.setOnAction(e -> openGuide(equipment)); Plush.press(guide, .96); howBox.getChildren().add(guide);
        }
        right.getChildren().setAll(action, disclosure(WHY, new VBox(why)), disclosure(HOW, howBox), disclosure(LIMITS, new VBox(wrapped(String.join(". ", ind.sources()) + ".", "body-text"))));
        layoutResponsive();
    }

    void openGuide(HealthCatalog.Equipment equipment) { activeGuide = new MeasurementGuide(this, equipment); activeGuide.show(); }

    public CompletableFuture<Void> recordReading(String id,int day,double value){return saveReadings(Map.of(id,value),day,null);}

    CompletableFuture<Void> saveReadings(Map<String, Double> values, int targetDay, Runnable after) {
        requireFx(); if (closed) return CompletableFuture.failedFuture(new IllegalStateException("Page closed"));
        saving = true; message("Saving…", false); refresh();
        var result = new CompletableFuture<Void>();
        CompletableFuture.runAsync(() -> { try { session.saveBatch(values, targetDay); } catch (java.io.IOException e) { throw new CompletionException(e); } }, saves).whenComplete((v, f) -> Platform.runLater(() -> {
            saving = false; if (closed) { result.complete(null); return; }
            if (f != null) { Throwable cause = f; while (cause.getCause() != null) cause = cause.getCause(); message("Could not save: " + cause.getMessage(), true); result.completeExceptionally(cause); }
            else { message("Reading saved.", false); refresh(); if (after != null) after.run(); result.complete(null); }
        }));
        return result;
    }

    // ---------------------------------------------------------------- small parts
    private void message(String value, boolean bad) { feedback.setText(value); feedback.setStyle("-fx-text-fill:" + hex(bad ? TEXT_COLORS.get(3) : INK_2) + ";"); }
    private TitledPane disclosure(String name, Node content) { var pane = new TitledPane(name, content); pane.setAnimated(false); pane.setExpanded(disclosures.get(name)); pane.expandedProperty().addListener((o, a, b) -> disclosures.put(name, b)); return pane; }
    private static Node numbered(int n, String text) {
        Label number = label(Integer.toString(n), "step-number"); number.setMinSize(26, 26); number.setPrefSize(26, 26); number.setAlignment(Pos.CENTER);
        Label body = wrapped(text, "body-text"); HBox.setHgrow(body, Priority.ALWAYS);
        HBox row = new HBox(12, number, body); row.setAlignment(Pos.TOP_LEFT); return row;
    }
    private static Node replacedLegend() { Text cross = new Text("×"); cross.setFill(COLORS.get(3)); cross.getStyleClass().add("legend-cross"); HBox box = new HBox(6, cross, label("Replaced reading", "muted")); box.setAlignment(Pos.CENTER_LEFT); return box; }
    private static Node legend(Color color, String text) { Rectangle swatch = new Rectangle(18, 10, color.deriveColor(0, 1, 1, .3)); swatch.setArcWidth(6); swatch.setArcHeight(6); HBox box = new HBox(7, swatch, label(text, "muted")); box.setAlignment(Pos.CENTER_LEFT); return box; }
    private static Canvas spark(Result result, Color color) {
        Canvas canvas = new Canvas(62, 30); var days = result.days().subList(Math.max(0, result.days().size() - 14), result.days().size()); if (days.size() < 2) return canvas;
        double lo = days.stream().mapToDouble(d -> d.latest().value()).min().orElse(0), hi = days.stream().mapToDouble(d -> d.latest().value()).max().orElse(1), span = hi == lo ? 1 : hi - lo;
        var g = canvas.getGraphicsContext2D(); g.setStroke(color.deriveColor(0, 1, 1, .85)); g.setLineWidth(2); g.setLineCap(StrokeLineCap.ROUND); g.setLineJoin(StrokeLineJoin.ROUND); g.beginPath(); double x = 0, y = 0;
        for (int i = 0; i < days.size(); i++) { x = 2 + i / (double) (days.size() - 1) * 54; y = 25 - (days.get(i).latest().value() - lo) / span * 20; if (i == 0) g.moveTo(x, y); else g.lineTo(x, y); }
        g.stroke(); g.setFill(Color.WHITE); g.fillOval(x - 4.5, y - 4.5, 9, 9); g.setFill(color); g.fillOval(x - 3, y - 3, 6, 6); return canvas;
    }
    static Label label(String text, String style) { Label label = new Label(text); label.getStyleClass().add(style); return label; }
    static Label wrapped(String text, String style) { Label label = label(text, style); label.setWrapText(true); label.setMinWidth(0); label.setMaxWidth(Double.MAX_VALUE); return label; }
    static String dayName(int day) { return day > 0 ? "mission day " + day : day == 0 ? "launch day" : (-day) + " days before launch"; }
    static String hex(Color c) { return String.format("#%02x%02x%02x", Math.round(c.getRed() * 255), Math.round(c.getGreen() * 255), Math.round(c.getBlue() * 255)); }
    static String rgba(Color c, double alpha) { return String.format(Locale.ROOT, "rgba(%d,%d,%d,%.2f)", Math.round(c.getRed() * 255), Math.round(c.getGreen() * 255), Math.round(c.getBlue() * 255), alpha); }
    private static void requireFx() { if (!Platform.isFxApplicationThread()) throw new IllegalStateException("Use the JavaFX application thread"); }
    @Override public void close() { requireFx(); closed = true; if (activeGuide != null) activeGuide.close(); saves.shutdown(); }
}

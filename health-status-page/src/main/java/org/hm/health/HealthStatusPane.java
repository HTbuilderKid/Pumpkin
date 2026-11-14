package org.hm.health;

import javafx.application.Platform;
import javafx.geometry.*;
import javafx.scene.Node;
import javafx.scene.canvas.Canvas;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.text.*;
import javafx.scene.shape.Rectangle;
import java.util.*;
import java.util.concurrent.*;
import java.util.function.Consumer;
import static org.hm.health.AssessmentEngine.*;

/** Native JavaFX status + metric detail page. Add this node to your existing layout. */
public final class HealthStatusPane extends ScrollPane implements AutoCloseable {
    public static final List<Color> COLORS=List.of(Color.web("#2bc780"),Color.web("#ffbe2e"),Color.web("#ff7a1a"),Color.web("#ff4558"));
    private final HealthSession session;
    private final VBox root=new VBox(14),status=new VBox(12),detail=new VBox(16),left=new VBox(14),right=new VBox(14);
    private final GridPane grid=new GridPane();
    private final HBox columns=new HBox(20),heading=new HBox(12);
    private final Label title=new Label(),system=new Label(),feedback=new Label();
    private final MetricChart chart=new MetricChart();
    private final ExecutorService saves=Executors.newSingleThreadExecutor(r->{var t=new Thread(r,"health-readings");t.setDaemon(false);return t;});
    private final Map<String,Boolean> disclosures=new HashMap<>(Map.of("WHY THIS MATTERS IN SPACE",true,"HOW TO MEASURE IT",true,"WHERE THE LIMITS COME FROM",false));
    private String selected="hydration",hazard,environment="station";
    private int day;
    private boolean saving,closed;
    private Consumer<Map<String,Integer>> onLevels=levels->{};
    private Consumer<String> onSystemSelected=id->{};
    private MeasurementGuide activeGuide;
    public HealthStatusPane(HealthSession session){
        requireFx();this.session=Objects.requireNonNull(session);day=session.today();
        for(String name:List.of("inter-latin-400-normal.ttf","inter-latin-600-normal.ttf","inter-latin-700-normal.ttf","inter-latin-800-normal.ttf","dm-mono-latin-400-normal.ttf")){
            try(var in=getClass().getResourceAsStream("/health/fonts/"+name)){if(in!=null)Font.loadFont(in,16);}catch(java.io.IOException ignored){}
        }
        getStylesheets().add(Objects.requireNonNull(getClass().getResource("/health/health.css")).toExternalForm());
        getStyleClass().add("health-page");setFitToWidth(true);setHbarPolicy(ScrollBarPolicy.NEVER);setContent(root);
        root.setPadding(new Insets(12,18,18,18));status.getStyleClass().add("panel");detail.getStyleClass().add("panel");
        Label section=label("S T A T U S","section-label");Region space=new Region();HBox.setHgrow(space,Priority.ALWAYS);
        FlowPane legend=new FlowPane(16,5);legend.setAlignment(Pos.CENTER_RIGHT);
        String[] names={"Your normal","Watch","Act","Urgent"};for(int i=0;i<4;i++){var dot=new javafx.scene.shape.Circle(6,COLORS.get(i));legend.getChildren().add(new HBox(7,dot,label(names[i],"muted")));}
        HBox bar=new HBox(12,section,space,legend);bar.setAlignment(Pos.CENTER_LEFT);
        grid.setHgap(2);grid.setVgap(2);grid.setId("status-grid");status.getChildren().addAll(bar,new Separator(),grid);
        title.setId("metric-title");title.getStyleClass().add("detail-title");system.getStyleClass().add("system-label");
        Region titleSpace=new Region();HBox.setHgrow(titleSpace,Priority.ALWAYS);heading.getChildren().addAll(title,titleSpace,system);heading.setAlignment(Pos.CENTER_LEFT);
        left.setMinWidth(0);right.setMinWidth(0);HBox.setHgrow(left,Priority.ALWAYS);HBox.setHgrow(right,Priority.ALWAYS);
        columns.getChildren().addAll(left,right);detail.getChildren().addAll(heading,new Separator(),columns);detail.setMinHeight(880);
        root.getChildren().addAll(status,detail);
        viewportBoundsProperty().addListener(o->layoutResponsive());
        grid.widthProperty().addListener(o->layoutTiles());
        refresh();
    }
    public HealthSession session(){return session;}
    public String selectedIndicator(){return selected;}
    public int missionDay(){return day;}
    public void setSelectedIndicator(String id){requireFx();session.catalog().indicator(id);selected=id;refresh();onSystemSelected.accept(session.catalog().indicator(id).system());}
    public void setMissionDay(int day){requireFx();if(day< -3650||day>session.today())throw new IllegalArgumentException("Day outside available mission window");this.day=day;refresh();}
    public void setHazard(String id){requireFx();if(id!=null&&session.catalog().hazards().stream().noneMatch(h->h.id().equals(id)))throw new IllegalArgumentException("Unknown hazard");hazard=id;renderTiles(session.assess(day));}
    public void setEnvironment(String id){requireFx();if(session.catalog().environments().stream().noneMatch(e->e.id().equals(id)))throw new IllegalArgumentException("Unknown environment");environment=id;refresh();}
    public void setOnSystemLevels(Consumer<Map<String,Integer>> listener){requireFx();onLevels=Objects.requireNonNull(listener);onLevels.accept(session.systemLevels(day));}
    public void setOnSystemSelected(Consumer<String> listener){requireFx();onSystemSelected=Objects.requireNonNull(listener);}
    public void refresh(){requireFx();var results=session.assess(day);renderTiles(results);renderDetail(results.get(selected));onLevels.accept(session.systemLevels(day));}
    private void renderTiles(Map<String,Result> results){
        grid.getChildren().clear();Set<String> watched=new HashSet<>();
        session.catalog().hazards().stream().filter(h->h.id().equals(hazard)).forEach(h->watched.addAll(h.watch()));
        for(var ind:session.catalog().daily()){
            Result result=results.get(ind.id());Button tile=new Button();tile.setId("metric-"+ind.id());tile.getStyleClass().add("metric-tile");tile.setMaxWidth(Double.MAX_VALUE);tile.setMinWidth(0);tile.setAlignment(Pos.TOP_LEFT);
            boolean chosen=selected.equals(ind.id());Color color=result.value()==null?Color.web("#71819b"):COLORS.get(result.level());
            tile.setStyle("-fx-border-color:#2a3240 #2a3240 #2a3240 "+hex(color)+";"+(chosen?"-fx-background-color:#0038ad;":""));
            Label name=label(ind.shortName(),"metric-name");name.setMaxWidth(Double.MAX_VALUE);
            Label value=label(format(ind,result.value()),"metric-value");value.setStyle("-fx-text-fill:"+hex(result.value()==null?color:result.level()==0?Color.WHITE:color)+";");value.setMinWidth(Region.USE_PREF_SIZE);
            Label unit=label(ind.unit(),"metric-unit");unit.setMinWidth(Region.USE_PREF_SIZE);Canvas spark=spark(result,color);
            HBox numbers=new HBox(6,value,unit);numbers.setAlignment(Pos.BASELINE_LEFT);
            StackPane valueRow=new StackPane(numbers,spark);StackPane.setAlignment(spark,Pos.CENTER_RIGHT);
            Label sub=label(describe(ind,result),"muted");sub.setMinWidth(0);sub.setMaxWidth(Double.MAX_VALUE);sub.setTextOverrun(OverrunStyle.ELLIPSIS);
            VBox content=new VBox(1,name,valueRow,sub);content.prefWidthProperty().bind(tile.widthProperty().subtract(30));content.setMinWidth(0);content.setMaxWidth(Double.MAX_VALUE);tile.setGraphic(content);
            tile.setTooltip(new Tooltip(ind.name()+"\n"+describe(ind,result)+(result.remeasure()?"\nRe-measure first":"")+(isDue(ind,result,session.today())?"\nReading due":"")));
            tile.setAccessibleText(ind.name()+", "+format(ind,result.value())+" "+ind.unit()+", "+(result.value()==null?"No reading yet":session.catalog().levels().get(result.level()).name()));
            tile.setOnAction(e->setSelectedIndicator(ind.id()));
            StackPane wrap=new StackPane(tile);wrap.getStyleClass().add(watched.contains(ind.id())?"hazard-tile":"tile-wrap");wrap.setMinWidth(0);wrap.setMaxWidth(Double.MAX_VALUE);
            grid.getChildren().add(wrap);
        }layoutTiles();
    }
    private void layoutTiles(){
        int count=Math.max(1,(int)((grid.getWidth()+8)/210));grid.getColumnConstraints().clear();
        for(int i=0;i<count;i++){var c=new ColumnConstraints();c.setPercentWidth(100.0/count);c.setHgrow(Priority.ALWAYS);c.setMinWidth(0);grid.getColumnConstraints().add(c);}
        int i=0;for(Node node:grid.getChildren()){GridPane.setColumnIndex(node,i%count);GridPane.setRowIndex(node,i/count);i++;}
    }
    private void layoutResponsive(){
        double width=getViewportBounds().getWidth();boolean narrow=width<1050;
        if(narrow){columns.getChildren().clear();if(!detail.getChildren().contains(left)){detail.getChildren().addAll(left,right);}left.setPrefWidth(-1);right.setPrefWidth(-1);}
        else{
            detail.getChildren().removeAll(left,right);if(columns.getChildren().isEmpty())columns.getChildren().addAll(left,right);
            double available=Math.max(100,width-100);left.setPrefWidth(available*.55);right.setPrefWidth(available*.45);
        }
        system.setVisible(width>1000);system.setManaged(width>1000);
    }
    private void renderDetail(Result result){
        var catalog=session.catalog();var ind=catalog.indicator(selected);Color color=result.value()==null?Color.web("#71819b"):COLORS.get(result.level());
        title.setText(ind.name());system.setText(catalog.system(ind.system()).name().toUpperCase(Locale.ROOT));
        TextFlow verdict=new TextFlow();verdict.getStyleClass().add("verdict");
        String severity=result.remeasure()?"Re-measure first":catalog.levels().get(result.level()).name();
        Text lead=new Text(result.value()==null?"No reading yet for this indicator.":severity);lead.setFill(color);lead.setStyle("-fx-font-weight:bold;");verdict.getChildren().add(lead);
        if(result.value()!=null){
            String win=result.window()>1?" (average of the last "+result.window()+")":"";
            String text=" · "+format(ind,result.value())+" "+ind.unit()+win+(result.baseline()==null?" · no baseline yet":" · your normal is "+format(ind,result.baseline().mean())+" ("+result.baseline().kind()+")")
                    +(result.reasons().isEmpty()?"":" · "+String.join("; ",result.reasons()))+(result.trend().equals("steady")?"":" · "+result.trend()+" over the last week")+" · "+dayName(result.lastDay());
            Text rest=new Text(text);rest.setFill(Color.web("#dae5fb"));verdict.getChildren().add(rest);
        }
        StackPane verdictBox=new StackPane(verdict);verdictBox.getStyleClass().add("verdict-box");verdictBox.setStyle("-fx-border-color:"+hex(color)+"; -fx-border-width:0 0 0 6;");
        chart.setData(ind,result);
        FlowPane chartLegend=new FlowPane(18,6,legend(Color.web("#2bc780"),"Your normal"),legend(Color.web("#b0682d"),"Healthy range"),replacedLegend());
        ReadingInput input=new ReadingInput(ind);Button save=new Button("Save");save.setId("save-reading");save.setDisable(saving);save.setOnAction(e->{
            try{Double value=input.value();if(value==null)throw new IllegalArgumentException("Enter a reading first.");saveReadings(Map.of(ind.id(),value),day,null);}
            catch(IllegalArgumentException failure){message(failure.getMessage(),true);}
        });
        FlowPane entry=new FlowPane(8,8,label("Add a reading · "+dayName(day),"muted"),input,label(ind.unit(),"muted"),save);entry.setAlignment(Pos.CENTER_LEFT);
        feedback.setId("save-feedback");feedback.setWrapText(true);left.getChildren().setAll(verdictBox,chart,chartLegend,entry,feedback);
        VBox action=new VBox(8);action.getStyleClass().add("action-card");action.setStyle("-fx-border-color:"+hex(color)+"; -fx-border-width:0 0 0 6;");
        String who=result.value()==null?"Nothing to assess yet":result.remeasure()?"Repeat the measurement first":catalog.levels().get(result.level()).who();
        Label actionTitle=label(who,"action-title");actionTitle.setStyle("-fx-text-fill:"+hex(color)+";");actionTitle.setWrapText(true);action.getChildren().add(actionTitle);
        var env=catalog.environments().stream().filter(e->e.id().equals(environment)).findFirst().orElseThrow();
        if(result.level()>=2&&!result.remeasure())action.getChildren().add(wrapped(result.level()==3?"Ground reply: "+env.delay()+". "+env.delayNote():"Report it at the next opportunity; do not wait for the next scheduled check.","muted"));
        List<String> steps=new ArrayList<>();
        if(result.remeasure())steps.add("This is a sudden jump from your last reading. Measure again now, carefully, before acting on it. If the repeat agrees, it stands: "+catalog.levels().get(result.level()).who().toLowerCase(Locale.ROOT)+" and follow the steps below.");
        if(!result.discardedToday().isEmpty())steps.add("An earlier reading today ("+String.join(", ",result.discardedToday().stream().map(r->format(ind,r.value())).toList())+") was replaced by the repeat measurement.");
        if(result.level()>0){boolean onlyShift=result.reasons().stream().noneMatch(s->s.startsWith("outside"));steps.addAll(ind.advice().getOrDefault(onlyShift?"shift":result.direction(),ind.advice().getOrDefault("shift",List.of())));}
        if(steps.isEmpty())action.getChildren().add(wrapped(result.value()==null?ind.how():"This is in your normal range. Keep measuring on schedule.","body-text"));
        else for(int j=0;j<steps.size();j++)action.getChildren().add(wrapped((j+1)+". "+steps.get(j),"body-text"));
        Label why=wrapped(ind.why()+" "+catalog.system(ind.system()).about(),"body-text"),how=wrapped(ind.how(),"body-text");VBox howBox=new VBox(8,how);
        var equipment=catalog.equipmentFor(ind.id());if(equipment!=null){Button guide=new Button("Step-by-step guide: "+equipment.name().toLowerCase(Locale.ROOT)+"  ➜");guide.setId("open-guide");guide.getStyleClass().add("guide-link");guide.setWrapText(true);guide.setOnAction(e->openGuide(equipment));howBox.getChildren().add(guide);}
        right.getChildren().setAll(action,disclosure("WHY THIS MATTERS IN SPACE",why),disclosure("HOW TO MEASURE IT",howBox),disclosure("WHERE THE LIMITS COME FROM",wrapped(String.join(". ",ind.sources())+".","body-text")));
        layoutResponsive();
    }
    void openGuide(HealthCatalog.Equipment equipment){activeGuide=new MeasurementGuide(this,equipment);activeGuide.show();}
    CompletableFuture<Void> saveReadings(Map<String,Double> values,int targetDay,Runnable after){
        requireFx();if(closed)return CompletableFuture.failedFuture(new IllegalStateException("Page closed"));
        saving=true;message("Saving…",false);refresh();
        var result=new CompletableFuture<Void>();
        CompletableFuture.runAsync(()->{try{session.saveBatch(values,targetDay);}catch(java.io.IOException e){throw new CompletionException(e);}},saves).whenComplete((v,f)->Platform.runLater(()->{
            saving=false;if(closed){result.complete(null);return;}
            if(f!=null){Throwable cause=f;while(cause.getCause()!=null)cause=cause.getCause();message("Could not save: "+cause.getMessage(),true);result.completeExceptionally(cause);}
            else{message("Reading saved.",false);refresh();if(after!=null)after.run();result.complete(null);}
        }));return result;
    }
    private void message(String value,boolean bad){feedback.setText(value);feedback.setStyle("-fx-text-fill:"+(bad?"#ff4558":"#b3c3dd")+";");}
    private TitledPane disclosure(String name,Node content){var pane=new TitledPane(name,content);pane.setAnimated(false);pane.setExpanded(disclosures.get(name));pane.expandedProperty().addListener((o,a,b)->disclosures.put(name,b));return pane;}
    private static Node replacedLegend(){Text cross=new Text("✕");cross.setFill(Color.web("#ff4558"));cross.setStyle("-fx-font-size:20;");return new HBox(6,cross,label("Replaced reading","muted"));}
    private static Node legend(Color color,String text){Rectangle swatch=new Rectangle(20,10,color.deriveColor(0,1,1,.3));return new HBox(6,swatch,label(text,"muted"));}
    private static Canvas spark(Result result,Color color){
        Canvas canvas=new Canvas(56,26);var days=result.days().subList(Math.max(0,result.days().size()-14),result.days().size());if(days.size()<2)return canvas;
        double lo=days.stream().mapToDouble(d->d.latest().value()).min().orElse(0),hi=days.stream().mapToDouble(d->d.latest().value()).max().orElse(1),span=hi==lo?1:hi-lo;
        var g=canvas.getGraphicsContext2D();g.setStroke(Color.web("#bec3cd"));g.setLineWidth(1.5);g.beginPath();double x=0,y=0;
        for(int i=0;i<days.size();i++){x=i/(double)(days.size()-1)*54;y=23-(days.get(i).latest().value()-lo)/span*20;if(i==0)g.moveTo(x,y);else g.lineTo(x,y);}g.stroke();g.setFill(color);g.fillOval(x-2,y-2,4,4);return canvas;
    }
    static Label label(String text,String style){Label label=new Label(text);label.getStyleClass().add(style);return label;}
    static Label wrapped(String text,String style){Label label=label(text,style);label.setWrapText(true);label.setMinWidth(0);label.setMaxWidth(Double.MAX_VALUE);return label;}
    static String dayName(int day){return day>0?"mission day "+day:day==0?"launch day":(-day)+" days before launch";}
    static String hex(Color c){return String.format("#%02x%02x%02x",Math.round(c.getRed()*255),Math.round(c.getGreen()*255),Math.round(c.getBlue()*255));}
    private static void requireFx(){if(!Platform.isFxApplicationThread())throw new IllegalStateException("Use the JavaFX application thread");}
    @Override public void close(){requireFx();closed=true;if(activeGuide!=null)activeGuide.close();saves.shutdown();}
}

package org.hm.health;

import javafx.scene.canvas.*;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.text.*;
import javafx.scene.control.Tooltip;
import java.util.*;
import static org.hm.health.AssessmentEngine.*;

/** Responsive native Canvas equivalent of the original SVG chart, including repeat-reading crosses. */
final class MetricChart extends Pane {
    private final Canvas canvas=new Canvas();
    private HealthCatalog.Indicator indicator;
    private Result result;
    private final Tooltip tip=new Tooltip();
    private final List<double[]> hitPoints=new ArrayList<>();
    private final List<String> hitLabels=new ArrayList<>();
    MetricChart(){
        setMinHeight(190);setPrefHeight(250);setMaxHeight(270);getChildren().add(canvas);
        widthProperty().addListener(o->draw());heightProperty().addListener(o->draw());Tooltip.install(canvas,tip);
        canvas.setOnMouseMoved(e->{
            double best=Double.POSITIVE_INFINITY;int at=-1;
            for(int i=0;i<hitPoints.size();i++){var p=hitPoints.get(i);double d=Math.hypot(p[0]-e.getX(),p[1]-e.getY());if(d<best){best=d;at=i;}}
            tip.setText(at>=0&&best<25?hitLabels.get(at):"Hover a reading for its day and value");
        });
    }
    void setData(HealthCatalog.Indicator indicator,Result result){this.indicator=indicator;this.result=result;draw();}
    private void draw(){
        double w=Math.max(1,getWidth()),h=Math.max(1,getHeight());canvas.setWidth(w);canvas.setHeight(h);var g=canvas.getGraphicsContext2D();g.clearRect(0,0,w,h);
        hitPoints.clear();hitLabels.clear();if(result==null)return;
        g.setFont(Font.font("DM Mono",12));g.setFill(Color.web("#b3c3dd"));
        if(result.days().isEmpty()){g.fillText("No readings yet",w/2-50,h/2);return;}
        var days=result.days();var base=baseline(days);double lo=Double.POSITIVE_INFINITY,hi=Double.NEGATIVE_INFINITY;
        for(var day:days){lo=Math.min(lo,day.latest().value());hi=Math.max(hi,day.latest().value());for(var r:day.discarded()){lo=Math.min(lo,r.value());hi=Math.max(hi,r.value());}}
        double band=normalBand(indicator,base);if(base!=null){lo=Math.min(lo,base.mean()-band);hi=Math.max(hi,base.mean()+band);}
        Double refLo=indicator.bands().lowWatch(),refHi=indicator.bands().highWatch();
        if(refLo!=null&&refLo>lo-(hi-lo))lo=Math.min(lo,refLo);if(refHi!=null&&refHi<hi+(hi-lo))hi=Math.max(hi,refHi);
        double pad=(hi==lo?1:hi-lo)*.08;lo-=pad;hi+=pad;
        double l=48,r=w-14,t=12,b=h-32,span=hi-lo;int d0=days.getFirst().day(),d1=Math.max(days.getLast().day(),d0+1);
        final double min=lo,max=hi;
        java.util.function.DoubleUnaryOperator y=v->t+(max-v)/span*(b-t),x=d->l+(d-d0)/(d1-d0)*(r-l);
        g.save();g.beginPath();g.rect(l,t,Math.max(0,r-l),b-t);g.clip();
        if(refHi!=null&&refHi<hi){g.setFill(Color.web("#ff7a1a",.12));g.fillRect(l,t,r-l,Math.max(0,y.applyAsDouble(refHi)-t));dashed(g,Color.web("#df951e"),l,r,y.applyAsDouble(refHi),2,5);}
        if(refLo!=null&&refLo>lo){g.setFill(Color.web("#ff7a1a",.12));g.fillRect(l,y.applyAsDouble(refLo),r-l,Math.max(0,b-y.applyAsDouble(refLo)));dashed(g,Color.web("#df951e"),l,r,y.applyAsDouble(refLo),2,5);}
        if(base!=null){g.setFill(Color.web("#2bc780",.16));g.fillRect(l,y.applyAsDouble(base.mean()+band),r-l,Math.max(1,y.applyAsDouble(base.mean()-band)-y.applyAsDouble(base.mean()+band)));dashed(g,Color.web("#2bc780"),l,r,y.applyAsDouble(base.mean()),6,4);}
        g.restore();g.setLineWidth(1);g.setLineDashes();
        for(int i=0;i<=3;i++){double value=lo+(hi-lo)*i/3,py=y.applyAsDouble(value);g.setStroke(Color.web("#27303e"));g.strokeLine(l,py,r,py);g.setTextAlign(TextAlignment.RIGHT);g.setFill(Color.web("#b3c3dd"));g.fillText(format(indicator,value),l-8,py+4);}
        int step=Math.max(1,(int)Math.ceil((d1-d0)/8.0/5)*5);g.setTextAlign(TextAlignment.CENTER);
        for(int day=(int)Math.ceil(d0/(double)step)*step;day<=d1;day+=step)g.fillText(day==0?"launch":day>0?"day "+day:Integer.toString(day),x.applyAsDouble(day),h-8);
        if(d0<0&&d1>0){g.setStroke(Color.web("#6f9bff"));g.setLineDashes(4,4);g.strokeLine(x.applyAsDouble(0),t,x.applyAsDouble(0),b);g.setLineDashes();}
        g.setStroke(Color.WHITE);g.setLineWidth(1.7);g.beginPath();boolean first=true;
        for(var day:days){double px=x.applyAsDouble(day.day()),py=y.applyAsDouble(day.latest().value());if(first){g.moveTo(px,py);first=false;}else g.lineTo(px,py);}g.stroke();
        for(var day:days){
            double px=x.applyAsDouble(day.day());
            for(var bad:day.discarded()){double py=y.applyAsDouble(bad.value());g.setStroke(Color.web("#ff4558"));g.setLineWidth(2);g.strokeLine(px-4,py-4,px+4,py+4);g.strokeLine(px-4,py+4,px+4,py-4);point(px,py,"Replaced · day "+day.day()+": "+format(indicator,bad.value())+" "+indicator.unit());}
            double py=y.applyAsDouble(day.latest().value()),radius=day.day()==result.lastDay()?5:3;
            g.setFill(day.day()==result.lastDay()?HealthStatusPane.COLORS.get(result.level()):Color.WHITE);g.fillOval(px-radius,py-radius,radius*2,radius*2);
            if(radius==5){g.setStroke(Color.WHITE);g.setLineWidth(1.7);g.strokeOval(px-radius,py-radius,radius*2,radius*2);}
            point(px,py,"Day "+day.day()+": "+format(indicator,day.latest().value())+" "+indicator.unit());
        }
    }
    private void point(double x,double y,String text){hitPoints.add(new double[]{x,y});hitLabels.add(text);}
    private static void dashed(GraphicsContext g,Color color,double left,double right,double y,double... dash){g.setStroke(color);g.setLineWidth(1);g.setLineDashes(dash);g.strokeLine(left,y,right,y);g.setLineDashes();}
}

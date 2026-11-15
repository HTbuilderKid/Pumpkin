package org.hm.health;
import javafx.scene.layout.FlowPane;
import javafx.scene.control.*;
import java.util.*;

/** Shared numeric/scale control for the page and the measurement guide. */
final class ReadingInput extends FlowPane {
    private final ToggleGroup scale=new ToggleGroup();
    private TextField number;
    ReadingInput(HealthCatalog.Indicator indicator){
        setHgap(6);setVgap(6);setPrefWrapLength(indicator.input().type().equals("scale")?(indicator.input().max()-indicator.input().min()+1)*46-6:120);
        var input=indicator.input();
        if(input.type().equals("scale")){
            for(int value=(int)input.min();value<=input.max();value++){
                ToggleButton button=new ToggleButton(Integer.toString(value));button.setId("reading-choice-"+indicator.id()+"-"+value);
                button.getStyleClass().add("scale-choice");button.setToggleGroup(scale);button.setUserData((double)value);
                button.setAccessibleText(indicator.shortName()+": "+value+", "+input.labels().get(value-(int)input.min()));
                button.setTooltip(new Tooltip(input.labels().get(value-(int)input.min())));Plush.press(button,.9);getChildren().add(button);
            }
        }else{
            number=new TextField();number.setId("reading-value-"+indicator.id());number.setPrefWidth(120);number.setPromptText(input.placeholder());number.setAccessibleText(indicator.name()+" in "+indicator.unit());
            getChildren().add(number);
        }
    }
    Double value(){
        if(number==null)return scale.getSelectedToggle()==null?null:(Double)scale.getSelectedToggle().getUserData();
        String text=number.getText().trim();if(text.isEmpty())return null;
        try{double v=Double.parseDouble(text);if(!Double.isFinite(v))throw new NumberFormatException();return v;}
        catch(NumberFormatException e){throw new IllegalArgumentException("Enter a valid finite number.");}
    }
}

package com.example.healthmonitor.voice;
import javafx.application.Platform;
import javafx.animation.PauseTransition;
import javafx.util.Duration;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import java.util.concurrent.*;

/** Push-to-talk and typed-command fallback. API key stays in process memory only. */
public final class VoiceControlPanel extends VBox implements AutoCloseable {
    public interface Host {VoiceCommand.Context context();CompletableFuture<String> execute(VoiceCommand command,VoiceCommand.Context captured);}
    private final VoiceAi ai;private final AudioCapture audio;private final Host host;
    private final ExecutorService worker=Executors.newSingleThreadExecutor(r->{var t=new Thread(r,"voice-api");t.setDaemon(true);return t;});
    private final Button talk=new Button("Start voice"),run=new Button("Run command"),settings=new Button("OpenAI key");
    private final TextField typed=new TextField();private final Label status=new Label(),heard=new Label();
    private final PauseTransition limit=new PauseTransition(Duration.seconds(30));
    private volatile String key=System.getenv("OPENAI_API_KEY");private VoiceCommand.Context recordingContext;private AudioCapture.Recording recording;private boolean busy,closed;
    public VoiceControlPanel(Host host){this(host,new OpenAiVoiceClient(),new MicrophoneCapture());}
    public VoiceControlPanel(Host host,VoiceAi ai,AudioCapture audio){
        this.host=host;this.ai=ai;this.audio=audio;setSpacing(4);getStyleClass().add("health-toolbar");getStylesheets().add(VoiceControlPanel.class.getResource("/health/health.css").toExternalForm());setStyle("-fx-padding:8 24;-fx-font-size:13;");
        talk.setId("voice-talk");typed.setId("voice-text");run.setId("voice-run");settings.setId("voice-key");status.setId("voice-status");
        typed.setStyle("-fx-background-color:white;-fx-background-radius:14;-fx-border-width:0;-fx-padding:8 14;-fx-font-family:'Open Runde Medium';");
        typed.setPromptText("Try: Show hydration · Show mission day 38 · Record temperature 36.8 Celsius");typed.setPrefWidth(560);
        FlowPane buttons=new FlowPane(8,6,settings,talk,typed,run);heard.setWrapText(true);status.setWrapText(true);getChildren().addAll(buttons,status,heard);
        settings.setOnAction(e->configure());talk.setOnAction(e->{if(recording!=null)stopRecording();else startRecording();});run.setOnAction(e->interpretText());typed.setOnAction(e->interpretText());
        limit.setOnFinished(e->{if(recording!=null)stopRecording();});status.setText("Push to talk. Audio/transcripts are sent to OpenAI. Key is not saved to disk.");update();
    }
    private void configure(){
        Dialog<String> dialog=new Dialog<>();dialog.initOwner(getScene().getWindow());dialog.setTitle("OpenAI voice settings");dialog.setHeaderText("Use your own OpenAI API key");
        PasswordField secret=new PasswordField();secret.setId("voice-key-input");secret.setPromptText("Paste API key (kept in memory only)");secret.setPrefWidth(450);
        Label note=new Label((hasKey()?"A key is already configured. ":"")+"API billing and model access are required. You can also set OPENAI_API_KEY before launching.");note.setWrapText(true);
        dialog.getDialogPane().setContent(new VBox(10,note,secret));ButtonType use=new ButtonType("Use key",ButtonBar.ButtonData.OK_DONE);dialog.getDialogPane().getButtonTypes().addAll(use,ButtonType.CANCEL);
        dialog.setResultConverter(b->b==use?secret.getText():null);dialog.showAndWait().ifPresent(value->{if(!value.isBlank()){key=value.strip();status.setText("API key configured for this session.");}update();});secret.clear();
    }
    private boolean hasKey(){return key!=null&&!key.isBlank();}
    private void update(){talk.setDisable(busy||!hasKey());run.setDisable(busy||recording!=null||!hasKey());typed.setDisable(busy||recording!=null);settings.setDisable(busy||recording!=null);talk.setText(recording==null?"Start voice":"Stop and interpret");}
    private void startRecording(){
        if(!hasKey()||busy)return;recordingContext=host.context();busy=true;status.setText("Opening microphone…");update();
        CompletableFuture.supplyAsync(()->{try{return audio.start();}catch(Exception e){throw new CompletionException(e);}},worker).whenComplete((r,f)->Platform.runLater(()->{
            busy=false;if(closed){if(r!=null)r.close();return;}if(f!=null){failure(f);return;}recording=r;status.setText("Listening… click Stop and interpret when finished (30 seconds maximum).");limit.playFromStart();update();
        }));
    }
    private void stopRecording(){
        limit.stop();var capture=recording;recording=null;busy=true;update();status.setText("Transcribing…");var context=recordingContext;String activeKey=key;
        capture.stop().thenApplyAsync(wav->{try{return ai.transcribe(wav,activeKey);}catch(Exception e){throw new CompletionException(e);}},worker)
            .whenComplete((text,error)->Platform.runLater(()->{if(closed)return;if(error!=null){failure(error);return;}interpret(text,context,activeKey);}));
    }
    private void interpretText(){if(busy||!hasKey()||typed.getText().isBlank())return;interpret(typed.getText().strip(),host.context(),key);}
    private void interpret(String text,VoiceCommand.Context context,String activeKey){
        busy=true;heard.setText("Heard: "+text);status.setText("Understanding command…");update();
        CompletableFuture.supplyAsync(()->{try{return ai.interpret(text,context,activeKey);}catch(Exception e){throw new CompletionException(e);}},worker)
            .whenComplete((command,error)->Platform.runLater(()->{
                if(closed)return;if(error!=null){failure(error);return;}
                try{host.execute(command,context).whenComplete((message,f)->Platform.runLater(()->{if(closed)return;if(f!=null)failure(f);else{busy=false;status.setText(message);update();}}));}catch(Exception e){failure(e);}
            }));
    }
    private void failure(Throwable error){busy=false;Throwable cause=error;while(cause.getCause()!=null)cause=cause.getCause();String message=cause instanceof java.net.http.HttpTimeoutException?"OpenAI request timed out. Try again.":cause instanceof java.net.ConnectException?"Could not connect to OpenAI. Check your connection.":cause.getMessage();status.setText(message==null?"Voice command failed. Try again.":message);update();}
    @Override public void close(){closed=true;limit.stop();if(recording!=null)recording.close();key=null;worker.shutdownNow();}
}

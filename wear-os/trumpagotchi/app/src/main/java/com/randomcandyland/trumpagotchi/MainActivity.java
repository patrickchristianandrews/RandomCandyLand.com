package com.randomcandyland.trumpagotchi;

/*
 * SPDX-License-Identifier: GPL-3.0-only
 * A native Wear OS adaptation of the FM-1 Trumpagotchi pet-care game.
 * Game concepts and pixel art adapted from adamcharleswilsonmusic-code/Trumpagotchi v1.0.0.
 * No hardware firmware, no sequencer, no Internet connection.
 */
import android.app.Activity;
import android.app.AlertDialog;
import android.content.SharedPreferences;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.media.AudioAttributes;
import android.media.AudioFormat;
import android.media.AudioTrack;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.view.Gravity;
import android.view.HapticFeedbackConstants;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import org.json.JSONObject;

public final class MainActivity extends Activity {
    private static final String STORE = "trumpagotchi-watch-save-v1";
    private static final int BG = Color.rgb(13,20,37);
    private static final int WHITE = Color.rgb(246,235,209);
    private static final int GOLD = Color.rgb(234,187,62);
    private static final int INK = Color.rgb(32,43,61);
    private static final int SKIN = Color.rgb(233,151,90);
    private static final int SHADOW = Color.rgb(198,113,72);
    private static final int SUIT = Color.rgb(42,63,94);
    private static final int RED = Color.rgb(190,59,49);
    private static final int MINT = Color.rgb(127,177,153);
    private static final float[] MELODY = {261.63f,329.63f,392f,440f,392f,329.63f,293.66f,261.63f,392f,523.25f};

    private final Handler timer = new Handler(Looper.getMainLooper());
    private final Pet pet = new Pet();
    private PixelLCD lcd;
    private TextView hint;
    private Button pauseButton, soundButton, melodyButton;
    private Button[] actionButtons;
    private long frameAt;
    private boolean running;
    private volatile int melodySequence = 0;
    private volatile AudioTrack audioTrack;
    private final Runnable heartbeat = new Runnable() {
        @Override public void run() {
            if (!running) return;
            long now = SystemClock.elapsedRealtime();
            long dt = Math.max(0L,Math.min(1200L,now-frameAt));
            frameAt=now;
            if (!pet.paused && !pet.gameOver) tick(dt);
            redraw();
            timer.postDelayed(this,400);
        }
    };
    private int dp(float x){return Math.round(x * getResources().getDisplayMetrics().density);}
    private static double clamp(double v){return Math.max(0,Math.min(100,v));}
    private static boolean isNight(Pet p){return p.minute>=1260||p.minute<360;}

    static final class Pet {
        double food=75,mood=70,energy=75,clean=80;
        double minute=540;
        int day=1,messes=0,burgers=3,careCount=0,neglect=0;
        long activeMs=0,foodMs=0,pooMs=0,lastFeed=-30000,lastPraise=-15000,lastClean=-120000;
        long lastNews=-18000,lastCheer=-15000,lastMelody=-60000,messageUntil=0;
        boolean asleep=false,paused=false,gameOver=false,sound=true;
        String message="A TREMENDOUS DAY",pose="idle";
        long poseUntil=0;
    }

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().setNavigationBarColor(Color.BLACK);
        load();
        buildUI();
        redraw();
    }
    @Override protected void onResume() {
        super.onResume();running=true;frameAt=SystemClock.elapsedRealtime();
        timer.removeCallbacks(heartbeat);timer.post(heartbeat);
    }
    @Override protected void onPause() {
        running=false;timer.removeCallbacks(heartbeat);stopMelody();save();
        super.onPause();
    }
    @Override protected void onDestroy(){stopMelody();super.onDestroy();}

    private void buildUI() {
        ScrollView scroll=new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setVerticalScrollBarEnabled(false);
        scroll.setBackgroundColor(BG);
        LinearLayout column=new LinearLayout(this);
        column.setOrientation(LinearLayout.VERTICAL);
        column.setGravity(Gravity.CENTER_HORIZONTAL);
        column.setPadding(dp(15),dp(19),dp(15),dp(26));
        scroll.addView(column);
        TextView title=new TextView(this);
        title.setText("TRUMPAGOTCHI");
        title.setTextColor(GOLD);
        title.setTypeface(Typeface.DEFAULT,Typeface.BOLD);
        title.setTextSize(18);
        title.setGravity(Gravity.CENTER);
        column.addView(title,new LinearLayout.LayoutParams(-1,dp(28)));
        TextView subtitle=new TextView(this);
        subtitle.setText("PIXEL WATCH  •  TINY PET");
        subtitle.setTextColor(0xFFA5B7CB);
        subtitle.setTextSize(10);
        subtitle.setGravity(Gravity.CENTER);
        column.addView(subtitle,new LinearLayout.LayoutParams(-1,dp(22)));
        lcd=new PixelLCD();
        LinearLayout.LayoutParams screenParams=new LinearLayout.LayoutParams(-1,dp(193));
        screenParams.bottomMargin=dp(7);
        column.addView(lcd,screenParams);
        hint=new TextView(this);
        hint.setTextColor(WHITE);
        hint.setTextSize(11);
        hint.setMinHeight(dp(36));
        hint.setGravity(Gravity.CENTER);
        hint.setPadding(dp(3),dp(3),dp(3),dp(4));
        column.addView(hint,new LinearLayout.LayoutParams(-1,-2));

        Button feed=button("🍔 FEED",0xFF41506C);
        Button praise=button("👏 PRAISE",0xFF41506C);
        Button clean=button("🧹 CLEAN",0xFF41506C);
        Button rest=button("🛌 REST",0xFF41506C);
        Button news=button("📺 NEWS",0xFF3C315D);
        Button cheer=button("🎉 CHEER",0xFF3C315D);
        melodyButton=button("🎹 PLAY MELODY",0xFF4D405A);
        actionButtons=new Button[]{feed,praise,clean,rest,news,cheer,melodyButton};
        row(column,feed,praise);
        row(column,clean,rest);
        row(column,news,cheer);
        column.addView(melodyButton,fullWidth());
        feed.setOnClickListener(v->{care("feed");haptic(v);});
        praise.setOnClickListener(v->{care("praise");haptic(v);});
        clean.setOnClickListener(v->{care("clean");haptic(v);});
        rest.setOnClickListener(v->{care("rest");haptic(v);});
        news.setOnClickListener(v->{watchNews();haptic(v);});
        cheer.setOnClickListener(v->{cheer();haptic(v);});
        melodyButton.setOnClickListener(v->{melody();haptic(v);});

        pauseButton=button("⏸ PAUSE",0xFF253A53);
        soundButton=button("🔊 SOUND ON",0xFF253A53);
        row(column,pauseButton,soundButton);
        Button saveButton=button("💾 SAVE",0xFF203F39);
        Button restartButton=button("↻ NEW PET",0xFF65313F);
        row(column,saveButton,restartButton);
        pauseButton.setOnClickListener(v->{pet.paused=!pet.paused;if(pet.paused)stopMelody();say(pet.paused?"PET PAUSED":"BACK TO BUSINESS");save();haptic(v);});
        soundButton.setOnClickListener(v->{pet.sound=!pet.sound;if(!pet.sound)stopMelody();say(pet.sound?"SOUND ON":"SOUND OFF");save();haptic(v);});
        saveButton.setOnClickListener(v->{save();say("PET SAVED ON THIS WATCH");haptic(v);});
        restartButton.setOnClickListener(v->new AlertDialog.Builder(this)
            .setTitle("Start over?")
            .setMessage("Replace saved pet progress?")
            .setNegativeButton("Cancel",null)
            .setPositiveButton("Start new pet",(dialog,id)->{stopMelody();reset();haptic(v);})
            .show());
        setContentView(scroll);
    }
    private Button button(String label,int fill) {
        Button b=new Button(this);
        b.setText(label);b.setTextColor(Color.WHITE);b.setTextSize(11);
        b.setAllCaps(false);
        b.setTypeface(Typeface.DEFAULT,Typeface.BOLD);
        b.setPadding(dp(4),0,dp(4),0);
        b.setMinHeight(dp(45));
        GradientDrawable bg=new GradientDrawable();
        bg.setColor(fill);bg.setCornerRadius(dp(22));
        bg.setStroke(dp(1),0xFF7A93AC);
        b.setBackground(bg);
        return b;
    }
    private LinearLayout.LayoutParams fullWidth(){
        LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,dp(48));
        p.setMargins(dp(3),dp(2),dp(3),dp(4));
        return p;
    }
    private void row(LinearLayout parent,Button first,Button second){
        LinearLayout line=new LinearLayout(this);
        line.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams lp=new LinearLayout.LayoutParams(-1,dp(50));
        parent.addView(line,lp);
        LinearLayout.LayoutParams left=new LinearLayout.LayoutParams(0,dp(45),1);
        left.setMargins(dp(3),dp(1),dp(3),dp(1));
        line.addView(first,left);
        LinearLayout.LayoutParams right=new LinearLayout.LayoutParams(0,dp(45),1);
        right.setMargins(dp(3),dp(1),dp(3),dp(1));
        line.addView(second,right);
    }
    private void haptic(View view){view.performHapticFeedback(HapticFeedbackConstants.VIRTUAL_KEY);}
    private void say(String text){
        pet.message=text;pet.messageUntil=pet.activeMs+3800;redraw();
    }
    private void pose(String kind){
        pet.pose=kind;pet.poseUntil=pet.activeMs+2200;redraw();
    }
    private void redraw(){
        if(lcd==null)return;
        lcd.invalidate();
        if(hint!=null){
            String status=pet.activeMs<pet.messageUntil?pet.message:
                pet.gameOver?"GAME OVER — START NEW PET":pet.paused?"PAUSED":
                pet.asleep?"EXECUTIVE NAP":pet.food<=25?"I WANT FOOD":
                pet.energy<=20||isNight(pet)?"I WANT SLEEP":
                pet.clean<=25?"THIS PLACE NEEDS A CLEAN":
                pet.mood<=40?"A LITTLE ATTENTION?":"A TREMENDOUS DAY";
            hint.setText(status);
        }
        if(pauseButton!=null)pauseButton.setText(pet.paused?"▶ RESUME":"⏸ PAUSE");
        if(soundButton!=null)soundButton.setText(pet.sound?"🔊 SOUND ON":"🔇 SOUND OFF");
        if(actionButtons!=null)for(Button b:actionButtons)b.setEnabled(!pet.gameOver);
    }
    private void tick(long ms){
        pet.activeMs+=ms;
        boolean night=isNight(pet);
        double speed=pet.asleep&&night?16:1;
        pet.minute+=ms*1440.0/300000.0*speed;
        while(pet.minute>=1440){pet.minute-=1440;pet.day++;}
        if(pet.asleep&&night&&!isNight(pet)){
            pet.asleep=false;pet.minute=360;pet.energy=100;pet.mood=clamp(pet.mood+25);
            say("A TREMENDOUS MORNING");pose("wake");
        }else{
            if(pet.asleep){pet.energy=clamp(pet.energy+ms*10.0/5000);}
            else pet.energy=clamp(pet.energy-ms*4.0/5000);
            if(pet.asleep&&!isNight(pet)&&pet.energy>=90){
                pet.asleep=false;say("READY FOR MY CLOSE-UP");pose("wake");
            }
        }
        if(!pet.asleep){
            if(isNight(pet))pet.energy=Math.min(20,pet.energy);
            else if(pet.minute>=1080)pet.energy=Math.min(100-(pet.minute-1080)*80.0/180.0,pet.energy);
        }
        pet.foodMs+=ms;
        while(pet.foodMs>=60000){
            pet.foodMs-=60000;
            pet.food=clamp(pet.food-(pet.asleep?1:14));
            pet.clean=clamp(pet.clean-1);
            if(!pet.asleep)pet.mood=clamp(pet.mood-5);
            if(pet.food<=20||pet.clean<=20||(!pet.asleep&&pet.energy<=20)){
                pet.neglect=Math.min(60,pet.neglect+1);
                pet.mood=clamp(pet.mood-1);
            }else if(pet.food>35&&pet.clean>35&&pet.energy>35)pet.neglect=Math.max(0,pet.neglect-1);
        }
        if(!pet.asleep){
            pet.pooMs+=ms;
            if(pet.pooMs>=90000 && pet.messes<3){
                pet.pooMs-=90000;pet.messes++;
                pet.clean=clamp(pet.clean-12);say("A LITTLE ACCIDENT");
            }
        }
        if(!pet.gameOver&&pet.food<=0&&pet.mood<=0&&pet.energy<=0){
            pet.gameOver=true;pet.asleep=false;stopMelody();say("GAME OVER");
        }
        if(pet.activeMs%15000<ms)save();
    }
    private void care(String action){
        if(pet.gameOver)return;
        if(pet.paused){say("PRESS PLAY TO CARE");return;}
        long t=pet.activeMs;
        if(action.equals("rest")){
            if(pet.asleep){pet.asleep=false;say("BACK TO BUSINESS");pose("wake");}
            else if(pet.energy>=85&&!isNight(pet)){say("TOO MUCH ENERGY TO NAP");return;}
            else {pet.asleep=true;stopMelody();say(isNight(pet)?"PRESIDENTIAL BEDTIME":"EXECUTIVE NAP");pose("sleep");}
            pet.careCount++;save();return;
        }
        if(pet.asleep){say("LET ME FINISH MY NAP");return;}
        if(action.equals("feed")){
            if(t-pet.lastFeed<30000){say("GIVE ME A MINUTE");return;}
            pet.lastFeed=t;pet.food=clamp(pet.food+25);pet.energy=clamp(pet.energy+10);
            pet.mood=clamp(pet.mood+2);pet.clean=clamp(pet.clean-3);
            pet.burgers=3;say("A VERY FINE SNACK");pose("feed");
        }else if(action.equals("praise")){
            if(t-pet.lastPraise<15000){say("GIVE ME A MINUTE");return;}
            if(pet.food<=25){say("SNACKS BEFORE SPEECHES");return;}
            if(pet.energy<=20||isNight(pet)){say("PRAISE AFTER MY NAP");return;}
            if(pet.clean<=25){say("CLEANUP FIRST");return;}
            if(pet.mood>=100){say("YES, I KNOW. THANK YOU.");return;}
            pet.lastPraise=t;pet.mood=clamp(pet.mood+15);
            pet.neglect=Math.max(0,pet.neglect-1);say("FINALLY, SOME RESPECT");pose("cheer");
        }else if(action.equals("clean")){
            if(t-pet.lastClean<120000 && pet.messes==0){say("GIVE ME A MINUTE");return;}
            if(pet.clean>80&&pet.messes==0){say("ALREADY LOOKING SHARP");return;}
            pet.lastClean=t;pet.clean=clamp(pet.clean+30);
            pet.messes=0;pet.pooMs=0;pet.mood=clamp(pet.mood+2);
            say("SPOTLESS. AS EXPECTED.");pose("clean");
        }
        pet.careCount++;save();
    }
    private void watchNews(){
        if(pet.asleep||pet.paused||pet.gameOver){say("WATCH NEWS WHEN AWAKE");return;}
        if(pet.activeMs-pet.lastNews<18000){say("THE NEWS NEEDS A BREAK");return;}
        pet.lastNews=pet.activeMs;pet.mood=clamp(pet.mood-8);
        say("NEWS IS UNFAIR");pose("news");save();
    }
    private void cheer(){
        if(pet.paused||pet.asleep||pet.gameOver){say("NOT RIGHT NOW");return;}
        if(pet.activeMs-pet.lastCheer<15000){say("GIVE THE CROWD A MINUTE");return;}
        if(pet.food<=25||pet.energy<=20||isNight(pet)){say("SNACKS AND SLEEP FIRST");return;}
        pet.lastCheer=pet.activeMs;pet.mood=clamp(pet.mood+3);
        pet.energy=clamp(pet.energy-1);say("THE CROWD LOVES IT");pose("cheer");save();
    }
    private void melody(){
        if(pet.paused||pet.asleep||pet.gameOver){say("MUSIC WHEN AWAKE");return;}
        if(!pet.sound){say("TURN SOUND ON TO PLAY");return;}
        boolean healthy=pet.food>25&&pet.energy>20&&pet.clean>25&&!isNight(pet)&&pet.neglect<12&&pet.mood>10;
        boolean bongos=healthy&&pet.mood>40;
        stopMelody();
        int generation=melodySequence;
        new Thread(()->playTrack(generation,bongos),"Trumpagotchi-melody").start();
        if(healthy&&pet.activeMs-pet.lastMelody>=60000){
            pet.lastMelody=pet.activeMs;pet.mood=clamp(pet.mood+2);
            pet.energy=clamp(pet.energy-1);
        }
        say(bongos?"HE'S PLAYING BONGOS!":"A TREMENDOUS MELODY");
        pose(bongos?"bongo":"melody");save();
    }
    private void stopMelody(){
        melodySequence++;
        AudioTrack t=audioTrack;audioTrack=null;
        if(t!=null){try{t.pause();t.flush();t.release();}catch(Exception ignored){}}
    }
    private void playTrack(int generation,boolean bongos){
        AudioTrack t=null;
        try {
            final int sampleRate=22050;
            byte[] samples=createTune(bongos,sampleRate);
            if(generation!=melodySequence)return;
            AudioAttributes attr=new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_GAME)
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build();
            AudioFormat format=new AudioFormat.Builder()
                .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                .setSampleRate(sampleRate).setChannelMask(AudioFormat.CHANNEL_OUT_MONO).build();
            t=new AudioTrack.Builder().setAudioAttributes(attr).setAudioFormat(format)
                .setBufferSizeInBytes(samples.length).setTransferMode(AudioTrack.MODE_STATIC).build();
            if(generation!=melodySequence){t.release();return;}
            audioTrack=t;
            t.write(samples,0,samples.length);
            t.play();
            Thread.sleep(2800);
        }catch(Exception ignored){}finally{
            if(t!=null){try{t.stop();t.release();}catch(Exception ignored){}}
            if(audioTrack==t)audioTrack=null;
        }
    }
    private static byte[] createTune(boolean bongos,int sampleRate){
        double beat=0.245;
        int length=(int)(sampleRate*(beat*MELODY.length+0.4));
        byte[] out=new byte[length*2];
        for(int i=0;i<length;i++){
            double seconds=i/(double)sampleRate;
            int noteIndex=(int)(seconds/beat);
            double audio=0;
            if(noteIndex>=0&&noteIndex<MELODY.length){
                double local=seconds-noteIndex*beat;
                double envelope=Math.min(1,local/0.018)*Math.exp(-local*5.2);
                double phase=2*Math.PI*MELODY[noteIndex]*local;
                double triangle=2.0/Math.PI*Math.asin(Math.sin(phase));
                audio=0.28*envelope*triangle;
                if(bongos&&noteIndex%2==0 && local<0.17){
                    double sweep=120+105*Math.exp(-local*17);
                    audio+=0.21*Math.exp(-local*21)*Math.sin(2*Math.PI*sweep*local);
                }
            }
            short pcm=(short)(Math.max(-1,Math.min(1,audio))*32767);
            out[i*2]=(byte)(pcm&0xff);
            out[i*2+1]=(byte)((pcm>>8)&0xff);
        }
        return out;
    }
    private void reset(){
        Pet fresh=new Pet();
        pet.food=fresh.food;pet.mood=fresh.mood;pet.energy=fresh.energy;pet.clean=fresh.clean;
        pet.minute=fresh.minute;pet.day=1;pet.messes=0;pet.burgers=3;pet.careCount=0;pet.neglect=0;
        pet.activeMs=0;pet.foodMs=0;pet.pooMs=0;
        pet.lastFeed=-30000;pet.lastPraise=-15000;pet.lastClean=-120000;
        pet.lastNews=-18000;pet.lastCheer=-15000;pet.lastMelody=-60000;
        pet.asleep=false;pet.paused=false;pet.gameOver=false;
        pet.messageUntil=0;pet.pose="idle";pet.poseUntil=0;
        // Retain the user's audio preference across a new pet.
        say("A FRESH START");save();
    }
    private void save(){
        try{
            JSONObject o=new JSONObject();
            o.put("food",pet.food);o.put("mood",pet.mood);o.put("energy",pet.energy);
            o.put("clean",pet.clean);o.put("minute",pet.minute);o.put("day",pet.day);
            o.put("messes",pet.messes);o.put("burgers",pet.burgers);o.put("careCount",pet.careCount);
            o.put("neglect",pet.neglect);o.put("activeMs",pet.activeMs);o.put("foodMs",pet.foodMs);
            o.put("pooMs",pet.pooMs);o.put("lastFeed",pet.lastFeed);o.put("lastPraise",pet.lastPraise);
            o.put("lastClean",pet.lastClean);o.put("lastNews",pet.lastNews);o.put("lastCheer",pet.lastCheer);
            o.put("lastMelody",pet.lastMelody);o.put("asleep",pet.asleep);
            o.put("paused",pet.paused);o.put("gameOver",pet.gameOver);o.put("sound",pet.sound);
            getSharedPreferences(STORE,MODE_PRIVATE).edit().putString("pet",o.toString()).apply();
        }catch(Exception ignored){}
    }
    private void load(){
        try{
            SharedPreferences prefs=getSharedPreferences(STORE,MODE_PRIVATE);
            String str=prefs.getString("pet",null);if(str==null)return;
            JSONObject o=new JSONObject(str);
            pet.food=clamp(o.optDouble("food",75));pet.mood=clamp(o.optDouble("mood",70));
            pet.energy=clamp(o.optDouble("energy",75));pet.clean=clamp(o.optDouble("clean",80));
            pet.minute=Math.max(0,o.optDouble("minute",540))%1440;
            pet.day=Math.max(1,o.optInt("day",1));
            pet.messes=Math.max(0,Math.min(3,o.optInt("messes",0)));
            pet.burgers=Math.max(0,Math.min(3,o.optInt("burgers",3)));
            pet.careCount=Math.max(0,o.optInt("careCount",0));
            pet.neglect=Math.max(0,Math.min(60,o.optInt("neglect",0)));
            pet.activeMs=Math.max(0,o.optLong("activeMs",0));
            pet.foodMs=Math.max(0,o.optLong("foodMs",0));
            pet.pooMs=Math.max(0,o.optLong("pooMs",0));
            pet.lastFeed=o.optLong("lastFeed",-30000);
            pet.lastPraise=o.optLong("lastPraise",-15000);
            pet.lastClean=o.optLong("lastClean",-120000);
            pet.lastNews=o.optLong("lastNews",-18000);
            pet.lastCheer=o.optLong("lastCheer",-15000);
            pet.lastMelody=o.optLong("lastMelody",-60000);
            pet.asleep=o.optBoolean("asleep",false);
            pet.paused=o.optBoolean("paused",false);
            pet.gameOver=o.optBoolean("gameOver",false);
            pet.sound=o.optBoolean("sound",true);
            pet.message="WELCOME BACK — PET LOADED";pet.messageUntil=pet.activeMs+3000;
        }catch(Exception ignored){}
    }

    private final class PixelLCD extends View {
        private final Paint paint=new Paint();
        private final Paint textPaint=new Paint(Paint.ANTI_ALIAS_FLAG);
        PixelLCD(){
            super(MainActivity.this);
            setLayerType(View.LAYER_TYPE_SOFTWARE,null);
            textPaint.setTypeface(Typeface.create(Typeface.MONOSPACE,Typeface.BOLD));
        }
        private void rect(Canvas c,float x,float y,float w,float h,int color){
            paint.setColor(color);paint.setStyle(Paint.Style.FILL);
            c.drawRect(x,y,x+w,y+h,paint);
        }
        private void oval(Canvas c,float x,float y,float w,float h,int color){
            paint.setColor(color);paint.setStyle(Paint.Style.FILL);
            c.drawOval(new RectF(x,y,x+w,y+h),paint);
        }
        private void label(Canvas c,String s,float x,float y,float sz,int color,boolean center){
            textPaint.setColor(color);textPaint.setTextSize(sz);
            if(center) x-=textPaint.measureText(s)/2f;
            c.drawText(s,x,y,textPaint);
        }
        @Override protected void onDraw(Canvas c){
            super.onDraw(c);
            c.drawColor(BG);
            float scale=Math.min(getWidth()/240f,getHeight()/240f);
            c.save();c.translate((getWidth()-240*scale)/2f,(getHeight()-240*scale)/2f);c.scale(scale,scale);
            rect(c,0,0,240,240,WHITE);
            rect(c,0,0,240,24,INK);
            label(c,"TRUMPAGOTCHI",8,17,12,GOLD,false);
            String state=pet.gameOver?"GAME OVER":pet.asleep?"SLEEP":pet.food<=25?"HUNGRY":
                pet.energy<=20?"TIRED":pet.mood<40?"BORED":"HAPPY";
            label(c,state,232,17,9,WHITE,true);
            String[] names={"FOOD","MOOD","ENERGY"};
            double[] vals={pet.food,pet.mood,pet.energy};
            for(int i=0;i<3;i++){
                int x=8+i*78;
                label(c,names[i],x,35,9,INK,false);
                rect(c,x,40,68,5,0xFFD3C5AA);
                rect(c,x,40,(float)(68*vals[i]/100),5,vals[i]<30?RED:MINT);
            }
            if(pet.gameOver){
                rect(c,0,50,240,156,WHITE);
                label(c,"GAME OVER",120,129,20,INK,true);
                label(c,"START A NEW PET",120,153,10,INK,true);
            }else{
                room(c);
                character(c);
            }
            rect(c,0,206,240,34,WHITE);
            label(c,"DAY "+pet.day+"   "+clockText(),120,218,9,INK,true);
            label(c,"FEED   PRAISE   CLEAN    REST",120,232,9,INK,true);
            c.restore();
        }
        private String clockText(){
            int mins=((int)pet.minute+1440)%1440;
            int hr=(mins/60)%12;if(hr==0)hr=12;
            return String.format(java.util.Locale.US,"%d:%02d",hr,mins%60);
        }
        private void room(Canvas c){
            boolean night=isNight(pet);
            int wall=night?0xFF5E6C87:pet.minute>=1080?0xFFE1BFA0:WHITE;
            rect(c,0,50,240,156,wall);
            rect(c,0,152,240,54,night?0xFF474B5E:0xFFCAAE8B);
            for(int i=0;i<8;i++)rect(c,0,159+i*6,240,1,night?0xFF565769:0xFFB99B78);
            rect(c,12,64,60,48,INK);
            rect(c,15,67,54,42,night?0xFF202D50:0xFF99C9D9);
            if(night){rect(c,55,73,8,9,GOLD);rect(c,52,71,7,7,0xFF202D50);}
            else rect(c,24+(float)(pet.minute%1080)*0.03f,78,8,8,0xFFFFDC76);
            rect(c,40,66,3,45,INK);rect(c,14,87,56,3,INK);
            // Bed and blanket in the original FM-1 room.
            rect(c,5,146,5,28,0xFF795446);rect(c,73,146,5,28,0xFF795446);
            rect(c,10,145,63,17,INK);rect(c,11,146,61,13,0xFFDFD5B9);
            rect(c,13,147,22,10,0xFFFFF6DA);
            rect(c,37,147,34,13,MINT);rect(c,39,147,3,13,0xFFB6CFB1);
            rect(c,10,163,63,4,0xFF9E6F50);
            // Framed poster and tiny TV.
            rect(c,175,62,49,39,0xFF6A4630);
            rect(c,178,65,43,33,GOLD);
            rect(c,180,67,39,29,0xFFB0BEB4);
            label(c,"BFF",199,76,10,INK,true);
            rect(c,184,79,14,14,SKIN);rect(c,183,76,15,4,GOLD);
            rect(c,204,79,14,14,0xFFD0A184);rect(c,203,76,15,4,0xFF767978);
            rect(c,192,114,39,31,INK);
            rect(c,195,117,33,23,pet.asleep?0xFF283546:0xFF649EB1);
            if(!pet.asleep){rect(c,204,121,10,8,SKIN);rect(c,201,129,16,7,SUIT);rect(c,196,136,31,3,RED);}
            rect(c,208,145,7,5,INK);
            rect(c,186,150,49,5,0xFF8B6349);rect(c,190,155,4,22,0xFF8B6349);
            rect(c,228,155,4,22,0xFF8B6349);
            // Chair and burger side table.
            rect(c,115,169,44,5,0xFF69463A);rect(c,118,159,43,10,0xFF69463A);
            rect(c,134,144,26,6,0xFF69463A);rect(c,157,148,5,25,0xFF69463A);
            rect(c,172,164,25,3,0xFF8B6349);rect(c,174,167,3,11,0xFF8B6349);
            rect(c,192,167,3,11,0xFF8B6349);
            for(int i=0;i<pet.burgers;i++)burger(c,178,151-i*7,0);
            for(int i=0;i<pet.messes;i++){
                int x=i==0?53:i==1?184:78;
                rect(c,x-7,195,15,6,0xFF422B23);
                rect(c,x-5,191,11,5,0xFF7E4F2E);
                rect(c,x-2,188,5,4,0xFF7E4F2E);
            }
            if(pet.clean<60)rect(c,210,176,16,5,0xFFFAEFCC);
            if(pet.clean<30)rect(c,38,182,17,5,0xFFFAEFCC);
        }
        private void burger(Canvas c,float x,float y,int bites){
            float width=bites==2?10:bites==1?14:18;
            rect(c,x,y,width,3,GOLD);
            rect(c,x-1,y+3,width+2,3,0xFFECAA4B);
            rect(c,x-1,y+6,width+2,2,MINT);
            rect(c,x,y+8,width,3,0xFF643D2B);
            rect(c,x,y+11,width,3,GOLD);
        }
        private void character(Canvas c){
            if(pet.asleep){
                rect(c,17,139,20,17,INK);rect(c,18,140,19,12,SKIN);
                rect(c,15,138,18,5,GOLD);rect(c,18,136,12,3,GOLD);
                rect(c,33,147,36,13,MINT);rect(c,31,150,40,11,MINT);
                label(c,"z Z",50,132,12,GOLD,false);
                return;
            }
            boolean action=pet.poseUntil>pet.activeMs;
            boolean news=action&&pet.pose.equals("news");
            if(news){
                oval(c,120,145,42,32,INK);oval(c,122,147,38,28,SUIT);
                oval(c,121,116,34,35,GOLD);oval(c,126,124,26,20,SKIN);
                rect(c,132,115,22,6,GOLD);
                rect(c,153,151,9,6,SKIN);
                return;
            }
            boolean cheer=action&&(pet.pose.equals("cheer")||pet.pose.equals("bongo")||pet.pose.equals("melody"));
            boolean feeding=action&&pet.pose.equals("feed");
            long t=pet.activeMs;
            int bounce=cheer?((t/180)%2==0?-3:0):0;
            int dx=!action?(int)(Math.sin(t/1600.0)*17):0;
            c.save();c.translate(dx,bounce);
            oval(c,83,190,75,6,0xFF977E67);
            rect(c,104,183,14,15,SUIT);rect(c,140,183,14,15,SUIT);
            rect(c,97,195,24,5,INK);rect(c,136,195,24,5,INK);
            oval(c,87,141,82,60,INK);oval(c,90,144,76,55,SUIT);
            rect(c,120,151,24,20,0xFFF7EDD1);rect(c,124,171,16,19,0xFFF7EDD1);
            rect(c,130,155,7,14,RED);rect(c,132,168,4,18,RED);
            oval(c,103,100,55,63,INK);oval(c,106,102,49,59,SKIN);
            oval(c,108,143,47,18,SHADOW);oval(c,110,141,44,16,SKIN);
            oval(c,101,130,12,19,SHADOW);oval(c,151,130,12,19,SHADOW);
            // Blond crest, eyebrows and expressive eyes.
            rect(c,102,99,52,14,0xFFA67C27);
            rect(c,109,92,40,14,GOLD);rect(c,99,104,53,10,GOLD);
            rect(c,98,111,24,5,GOLD);rect(c,115,94,33,3,0xFFFFDC75);
            if(cheer){
                rect(c,114,130,9,2,INK);rect(c,140,130,9,2,INK);
                oval(c,121,149,25,9,INK);
            }else if((t/2700)%19==0){
                rect(c,114,131,9,2,INK);rect(c,140,131,9,2,INK);
            }else{
                rect(c,114,130,7,3,INK);rect(c,143,130,7,3,INK);
                rect(c,118,133,3,4,INK);rect(c,145,133,3,4,INK);
            }
            oval(c,130,137,14,11,SHADOW);rect(c,135,136,8,4,0xFFF8B273);
            if(pet.food<=25||pet.energy<=20)oval(c,127,149,12,10,INK);
            else if(pet.mood>40){rect(c,124,152,22,3,INK);rect(c,128,155,14,2,INK);}
            else rect(c,130,153,12,3,RED);
            rect(c,119,184,11,4,SKIN);rect(c,154,184,11,4,SKIN);
            if(feeding){
                rect(c,111,163,16,18,SUIT);rect(c,123,164,12,8,SKIN);
                burger(c,131,147,((t/400)%3==0)?1:0);
            }else if(cheer){
                rect(c,93,150,11,24,SUIT);rect(c,159,146,11,24,SUIT);
                oval(c,91,144,12,11,SKIN);oval(c,166,140,12,11,SKIN);
                if(pet.pose.equals("bongo")||pet.pose.equals("melody")){
                    rect(c,103,177,28,19,INK);rect(c,106,179,22,15,0xFFAA633A);
                    rect(c,134,178,28,19,INK);rect(c,137,180,22,15,0xFFAA633A);
                    label(c,"♫",175,135,12,INK,false);
                }else{
                    rect(c,94,130,4,12,GOLD);rect(c,88,134,16,3,GOLD);
                }
            }else{
                oval(c,92,171,13,13,SKIN);oval(c,159,171,13,13,SKIN);
            }
            c.restore();
        }
    }
}

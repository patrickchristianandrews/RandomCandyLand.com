package com.randomcandyland.holidaydeals;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.WindowInsets;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.AdapterView;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/** Native Android companion to RandomCandyLand.com's Black Friday / Cyber Monday 2026 catalog. */
public final class MainActivity extends Activity {
    private static final String FEED = "https://randomcandyland.com/black-friday/live-feed.json";
    private static final String FULL = "https://randomcandyland.com/black-friday/all/";
    private static final int BG = Color.rgb(22, 14, 33), PANEL = Color.rgb(42, 28, 54);
    private static final int TEXT = Color.rgb(255, 244, 251), MUTED = Color.rgb(207, 183, 215);
    private static final int PINK = Color.rgb(255, 192, 223), MINT = Color.rgb(187, 255, 217);
    private final ArrayList<Deal> deals = new ArrayList<>();
    private final Set<String> favorites = new HashSet<>();
    private final ExecutorService worker = Executors.newSingleThreadExecutor();
    private final Handler ui = new Handler(Looper.getMainLooper());
    private final Random random = new Random();
    private final String[] tabs = {"🔥 Hot", "All deals", "◷ Upcoming", "♥ Saved"};
    private int tab = 0, sortMode = 0, renderedLimit = 32;
    private String category = "All categories", query = "", lastSync = "Never";
    private SharedPreferences prefs;
    private FrameLayout frame;
    private LinearLayout main, results, mascotPopup, tabsRow;
    private TextView status;
    private Spinner categoryPicker, sortPicker;
    private boolean dataReady = false, isRebuildingCategories = false;
    private boolean mascotShowing = false;

    private static final class Deal {
        String id, name, category, store, source, sourceType, checked, publishedAt, startsAt, endsAt, why;
        double price = Double.NaN;
        boolean featured, popular, announced;
        Deal(JSONObject j) {
            id = j.optString("id", ""); name = j.optString("name", "");
            category = j.optString("category", "Other"); store = j.optString("store", "See source");
            source = j.optString("source", ""); sourceType = j.optString("sourceType", "Deal report");
            checked = j.optString("checked", ""); publishedAt = j.optString("publishedAt", checked);
            startsAt = j.optString("startsAt", ""); endsAt = j.optString("endsAt", "");
            why = j.optString("why", ""); price = j.isNull("price") ? Double.NaN : j.optDouble("price", Double.NaN);
            featured = j.optBoolean("featured"); popular = j.optBoolean("popular"); announced = j.optBoolean("announced");
        }
        int rank() { return popular ? 3 : sourceType.equals("DealNews editors") ? 2 : featured ? 1 : 0; }
    }

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(BG); getWindow().setNavigationBarColor(BG);
        prefs = getSharedPreferences("holiday_deals_2026", MODE_PRIVATE);
        try { JSONArray v = new JSONArray(prefs.getString("favorites", "[]")); for(int i=0;i<v.length();i++) favorites.add(v.optString(i)); } catch(JSONException ignored) {}
        makeLayout();
        String cache = prefs.getString("latestFeed", "");
        if(!cache.isEmpty()) loadFeed(cache, true);
        else { loadAnnounced(); draw(); }
        refreshFeed();
        ui.postDelayed(this::maybeShowMascot, 20000);
    }

    private void makeLayout() {
        frame = new FrameLayout(this); frame.setBackgroundColor(BG);
        main = new LinearLayout(this); main.setOrientation(LinearLayout.VERTICAL);
        FrameLayout.LayoutParams mp = new FrameLayout.LayoutParams(-1, -1);
        frame.addView(main, mp);
        if(Build.VERSION.SDK_INT>=30) {
            frame.setOnApplyWindowInsetsListener((v, insets) -> {
                android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars());
                v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
                return insets;
            });
        }
        setContentView(frame);

        LinearLayout bar = horizontal(); bar.setPadding(dp(15),dp(11),dp(12),dp(9)); bar.setGravity(Gravity.CENTER_VERTICAL);
        LinearLayout titleBox = new LinearLayout(this); titleBox.setOrientation(LinearLayout.VERTICAL);
        TextView kicker = text("BLACK FRIDAY • CYBER MONDAY 2026", 10, PINK, true);
        TextView title = text("Holiday Deal Madness 2026", 21, TEXT, true);
        titleBox.addView(kicker); titleBox.addView(title);
        bar.addView(titleBox, new LinearLayout.LayoutParams(0,-2,1));
        Button refresh = action("↻ Refresh"); refresh.setOnClickListener(v -> refreshFeed()); bar.addView(refresh);
        main.addView(bar);

        tabsRow = horizontal(); tabsRow.setPadding(dp(7),dp(3),dp(7),dp(8));
        for(int i=0;i<tabs.length;i++) {
            final int selected=i;
            Button b = action(tabs[i]);
            LinearLayout.LayoutParams lp=new LinearLayout.LayoutParams(0, dp(44),1);
            lp.setMargins(dp(2),0,dp(2),0); tabsRow.addView(b,lp);
            b.setOnClickListener(v -> { tab=selected;renderedLimit=32;updateTabs();draw(); });
        }
        main.addView(tabsRow); updateTabs();

        EditText search = new EditText(this); search.setSingleLine(true); search.setTextColor(TEXT);
        search.setHintTextColor(MUTED); search.setHint("Search 2026 deals, products and stores");
        search.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13); search.setPadding(dp(12),dp(5),dp(12),dp(5));
        search.setBackground(round(PANEL,12));
        LinearLayout.LayoutParams sp=new LinearLayout.LayoutParams(-1,dp(47));sp.setMargins(dp(12),0,dp(12),dp(7));main.addView(search,sp);
        search.addTextChangedListener(new TextWatcher(){public void beforeTextChanged(CharSequence s,int st,int c,int a){}
            public void onTextChanged(CharSequence s,int st,int before,int count){query=s.toString().trim().toLowerCase(Locale.ROOT);renderedLimit=32;draw();}
            public void afterTextChanged(Editable e){} });

        LinearLayout controls=horizontal();controls.setPadding(dp(12),0,dp(12),dp(3));
        categoryPicker=new Spinner(this);categoryPicker.setBackground(round(PANEL,9));
        LinearLayout.LayoutParams cp=new LinearLayout.LayoutParams(0,dp(42),1);cp.setMargins(0,0,dp(7),0);controls.addView(categoryPicker,cp);
        sortPicker=new Spinner(this); sortPicker.setBackground(round(PANEL,9));
        controls.addView(sortPicker,new LinearLayout.LayoutParams(0,dp(42),1));
        ArrayAdapter<String> sorts=new ArrayAdapter<>(this,R.layout.spinner_item,new String[]{"Recent / featured","Popular signals","Lowest price"});
        sorts.setDropDownViewResource(R.layout.spinner_item);sortPicker.setAdapter(sorts);sortPicker.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener(){
            public void onNothingSelected(AdapterView<?> parent){}
            public void onItemSelected(AdapterView<?> parent, View view,int position,long id){sortMode=position;renderedLimit=32;draw();}
        });
        categoryPicker.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener(){
            public void onNothingSelected(AdapterView<?> parent){}
            public void onItemSelected(AdapterView<?> parent, View view,int position,long id){
                if(isRebuildingCategories)return;
                Object value=parent.getItemAtPosition(position);category=value==null?"All categories":value.toString();renderedLimit=32;draw();
            }
        });
        main.addView(controls); rebuildCategories();
        status=text("Checking 2026 deals…",11,MUTED,false);status.setPadding(dp(14),dp(8),dp(14),dp(5));main.addView(status);
        ScrollView scroll=new ScrollView(this);scroll.setFillViewport(false);
        results=new LinearLayout(this);results.setOrientation(LinearLayout.VERTICAL);results.setPadding(dp(12),dp(3),dp(12),dp(18));
        scroll.addView(results);main.addView(scroll,new LinearLayout.LayoutParams(-1,0,1));
        addMascot();
    }

    private void addMascot(){
        mascotPopup=horizontal();mascotPopup.setGravity(Gravity.CENTER_VERTICAL);
        mascotPopup.setPadding(dp(8),dp(8),dp(10),dp(8));mascotPopup.setBackground(round(Color.rgb(255,242,231),15));
        FrameLayout.LayoutParams m=new FrameLayout.LayoutParams(dp(258),-2,Gravity.BOTTOM|Gravity.END);m.setMargins(0,0,dp(12),dp(16));
        frame.addView(mascotPopup,m);mascotPopup.setVisibility(View.GONE);
    }
    private void maybeShowMascot(){
        if(isFinishing()||mascotShowing||tab!=0){ui.postDelayed(this::maybeShowMascot,80000);return;}
        List<Deal> top=filtered();if(top.isEmpty()){ui.postDelayed(this::maybeShowMascot,80000);return;}
        Deal pick=top.get(random.nextInt(Math.min(4,top.size())));
        boolean tidbit=random.nextBoolean();mascotPopup.removeAllViews();
        ImageView pic=new ImageView(this);try(InputStream in=getAssets().open(tidbit?"tidbit.webp":"sugarfight.webp")){
            pic.setImageDrawable(android.graphics.drawable.Drawable.createFromStream(in,null));
        }catch(Exception ignored){}
        LinearLayout.LayoutParams ip=new LinearLayout.LayoutParams(dp(55),dp(55));ip.setMargins(0,0,dp(8),0);mascotPopup.addView(pic,ip);
        LinearLayout message=new LinearLayout(this);message.setOrientation(LinearLayout.VERTICAL);
        message.addView(text(tidbit?"Tidbit says…":"Sugarfoot says…",11,BG,true));
        message.addView(text(tidbit?"🏷️ WOW! Mega Mania deal!":"👍 Super-duper deal approved!",13,BG,true));
        TextView jump=text("See deal ↗",11,Color.rgb(115,39,95),true);
        jump.setOnClickListener(v->open(pick.source));message.addView(jump);
        mascotPopup.addView(message,new LinearLayout.LayoutParams(0,-2,1));
        TextView close=text("×",24,BG,true);close.setPadding(dp(6),0,0,0);
        close.setOnClickListener(v->{mascotPopup.animate().cancel();mascotPopup.setVisibility(View.GONE);mascotPopup.setTranslationX(0f);mascotShowing=false;});
        mascotPopup.addView(close);
        mascotPopup.setVisibility(View.VISIBLE);mascotShowing=true;
        // Dash on from the left, approve the deal, then run out to the right.
        mascotPopup.setTranslationX(-getResources().getDisplayMetrics().widthPixels);
        mascotPopup.animate().translationX(0f).setDuration(1300).withEndAction(()->{
            if(!mascotShowing)return;
            ui.postDelayed(()->{
                if(!mascotShowing)return;
                mascotPopup.animate().translationX(dp(310)).setDuration(1200).withEndAction(()->{
                    mascotPopup.setVisibility(View.GONE);mascotPopup.setTranslationX(0f);mascotShowing=false;
                }).start();
            },2800);
        }).start();
        ui.postDelayed(this::maybeShowMascot,90000);
    }

    private void updateTabs(){
        for(int i=0;i<tabsRow.getChildCount();i++) {
            Button b=(Button)tabsRow.getChildAt(i);
            b.setBackground(round(i==tab?PINK:PANEL,10));b.setTextColor(i==tab?BG:TEXT);
        }
    }
    private void rebuildCategories(){
        isRebuildingCategories=true;
        Set<String> names=new HashSet<>();for(Deal d:deals)if(!d.category.isEmpty())names.add(d.category);
        List<String> options=new ArrayList<>();options.add("All categories");List<String> rest=new ArrayList<>(names);Collections.sort(rest);options.addAll(rest);
        ArrayAdapter<String> adapter=new ArrayAdapter<>(this,R.layout.spinner_item,options);adapter.setDropDownViewResource(R.layout.spinner_item);categoryPicker.setAdapter(adapter);
        int selected=options.indexOf(category);categoryPicker.setSelection(Math.max(0,selected));
        isRebuildingCategories=false;
    }

    private void loadAnnounced(){
        deals.clear();
        String[][] events = {
            {"nintendo-bf2026","Nintendo Switch 2 + Mario Kart World 2026 bundle","Toys & Games","Nintendo","499.99","2026-11-22","2026-12-05","https://www.nintendo.com/us/whatsnew/nintendo-announces-black-friday-offers-to-help-spread-joy-this-holiday-season/"},
            {"walmart-bf2026","Walmart Black Friday 2026 sale launch","Upcoming sales","Walmart","","2026-11-23T00:01:00-05:00","2026-11-29","https://www.walmart.com/"},
            {"amazon-bf2026","Amazon Black Friday Week 2026 sale","Upcoming sales","Amazon","","2026-11-19T03:01:00-05:00","2026-11-30","https://www.amazon.com/gp/goldbox"},
            {"walmart-cyber2026","Walmart Cyber Monday 2026 launch","Upcoming sales","Walmart","","2026-11-30T00:01:00-05:00","2026-12-02","https://www.walmart.com/"}
        };
        for(String[] item:events){
            JSONObject j=new JSONObject();try{
                j.put("id",item[0]);j.put("name",item[1]);j.put("category",item[2]);j.put("store",item[3]);
                j.put("price",item[4].isEmpty()?JSONObject.NULL:Double.parseDouble(item[4]));
                j.put("startsAt",item[5]);j.put("endsAt",item[6]);j.put("source",item[7]);
                j.put("sourceType","Official 2026 sale announcement");j.put("announced",true);
                deals.add(new Deal(j));
            }catch(JSONException ignored){}
        }
    }

    private void loadFeed(String json, boolean cached){
        try{
            JSONObject payload=new JSONObject(json);JSONArray list=payload.optJSONArray("deals");
            if(list==null)throw new JSONException("Missing deals");
            loadAnnounced();Set<String> ids=new HashSet<>();for(Deal d:deals)ids.add(d.id);
            for(int i=0;i<list.length();i++){
                JSONObject item=list.optJSONObject(i);if(item==null)continue;
                Deal deal=new Deal(item);
                if(deal.id.isEmpty()||deal.name.isEmpty()||!deal.source.startsWith("https://")||ids.contains(deal.id))continue;
                deals.add(deal);ids.add(deal.id);
            }
            lastSync=payload.optString("generatedAt", "Unknown");dataReady=true;
            if(!cached)prefs.edit().putString("latestFeed",json).apply();
            rebuildCategories();draw();
        }catch(JSONException e){ if(!cached)status.setText("Could not read updated 2026 deals. Showing saved listings if available."); }
    }
    private void refreshFeed(){
        status.setText("Refreshing 2026 deal reports…");
        worker.execute(()->{
            String content=null;HttpURLConnection conn=null;
            try{
                conn=(HttpURLConnection)new URL(FEED).openConnection();conn.setConnectTimeout(12000);conn.setReadTimeout(12000);
                conn.setRequestProperty("Accept","application/json");
                if(conn.getResponseCode()!=200)throw new Exception("HTTP "+conn.getResponseCode());
                try(InputStream in=conn.getInputStream();ByteArrayOutputStream output=new ByteArrayOutputStream()){
                    byte[] buf=new byte[8192];int n;while((n=in.read(buf))!=-1){output.write(buf,0,n);if(output.size()>4_000_000)throw new Exception("Feed too large");}
                    content=output.toString(StandardCharsets.UTF_8.name());
                }
            }catch(Exception ignored){}finally{if(conn!=null)conn.disconnect();}
            final String next=content;
            ui.post(()->{if(isFinishing())return;if(next!=null){loadFeed(next,false);}else{
                status.setText(dataReady?"Offline · using saved 2026 deal snapshot":"Feed unavailable · browse announced 2026 events or open catalog");
            }});
        });
    }
    private long dateMillis(String value){
        if(value==null||value.isEmpty())return 0;
        try{
            if(value.length()==10)return LocalDate.parse(value).atStartOfDay(ZoneId.of("America/New_York")).toInstant().toEpochMilli();
            return OffsetDateTime.parse(value).toInstant().toEpochMilli();
        }catch(Exception ignored){return 0;}
    }
    private boolean upcoming(Deal d){return dateMillis(d.startsAt)>System.currentTimeMillis();}
    private boolean ended(Deal d){if(d.endsAt==null||d.endsAt.isEmpty())return false;
        return dateMillis(d.endsAt)+86400_000L<System.currentTimeMillis();}
    private boolean recent(Deal d){
        long checked=dateMillis(d.publishedAt==null||d.publishedAt.isEmpty()?d.checked:d.publishedAt);
        return checked>0&&System.currentTimeMillis()-checked<=72L*3600000L&&System.currentTimeMillis()-checked>=-86400_000L;
    }
    private boolean hot(Deal d){return Double.isFinite(d.price)&&d.price>0&&!upcoming(d)&&!ended(d)&&recent(d);}
    private String timing(Deal d){
        if(upcoming(d))return "STARTS "+fmtDate(dateMillis(d.startsAt));
        if(ended(d))return "ENDED";
        return recent(d)?"LIVE · reported":"Check listing";
    }
    private String fmtDate(long millis){
        if(millis<=0)return "TBA";
        return DateTimeFormatter.ofPattern("MMM d, uuuu",Locale.US).format(Instant.ofEpochMilli(millis).atZone(ZoneId.of("America/New_York")));
    }
    private String price(Deal d){return Double.isFinite(d.price)?String.format(Locale.US,"$%,.2f",d.price):"Price TBA";}

    private List<Deal> filtered(){
        List<Deal> list=new ArrayList<>();
        for(Deal d:deals){
            if(!category.equals("All categories")&&!category.equals(d.category))continue;
            if(!query.isEmpty()&&!(d.name+" "+d.category+" "+d.store).toLowerCase(Locale.ROOT).contains(query))continue;
            if(tab==0&&!hot(d))continue;
            if(tab==2&&!upcoming(d))continue;
            if(tab==3&&!favorites.contains(d.id))continue;
            list.add(d);
        }
        Comparator<Deal> ranking=(a,b)->Integer.compare(b.rank(),a.rank());
        if(sortMode==1)list.sort(ranking.thenComparing((a,b)->b.publishedAt.compareTo(a.publishedAt)));
        else if(sortMode==2)list.sort(Comparator.comparingDouble(d->Double.isFinite(d.price)?d.price:Double.MAX_VALUE));
        else list.sort(ranking.thenComparing((a,b)->b.publishedAt.compareTo(a.publishedAt)));
        if(tab==0&&list.size()>12)return new ArrayList<>(list.subList(0,12));
        return list;
    }
    private void draw(){
        if(results==null||status==null)return;
        List<Deal> list=filtered();results.removeAllViews();
        String sub=tab==0?"Most popular recently reported deals":"Browse 2026 Black Friday & Cyber Monday";
        TextView heading=text(sub,15,TEXT,true);heading.setPadding(dp(2),dp(2),0,dp(3));results.addView(heading);
        TextView description=text(tab==0?"Up to 12 recent popular, editor-selected and freshly reported deals; confirm inventory.":"Publisher listings and announced events · verify at retailer",11,MUTED,false);
        results.addView(description);
        if(dataReady)status.setText(deals.size()+" deals indexed · 2026 · last source sync "+lastSync.replace('T',' ').replace('Z',' ') );
        if(list.isEmpty()){
            TextView empty=text(tab==0?"No source-eligible live hot deals at the moment. Try All deals.":"No matching 2026 deals. Change your search or category.",13,MUTED,false);
            empty.setPadding(dp(8),dp(35),dp(8),dp(20));results.addView(empty);
        }
        int count=Math.min(list.size(),renderedLimit);
        for(int i=0;i<count;i++)addCard(list.get(i));
        if(list.size()>count){Button more=action("Show more ("+(list.size()-count)+" remaining)");
            more.setOnClickListener(v->{renderedLimit+=32;draw();});results.addView(more);}
        Button catalog=action("Browse all 2026 deals by category ↗");
        catalog.setOnClickListener(v->open(FULL));
        LinearLayout.LayoutParams cl=new LinearLayout.LayoutParams(-1,dp(45));cl.setMargins(0,dp(12),0,0);results.addView(catalog,cl);
        TextView fine=text("2026 deal reports are not real-time stock guarantees. Confirm model, seller, eligibility and checkout price.",11,MUTED,false);
        fine.setPadding(dp(3),dp(9),dp(3),0);results.addView(fine);
    }
    private void addCard(Deal d){
        LinearLayout card=new LinearLayout(this);card.setOrientation(LinearLayout.VERTICAL);
        card.setPadding(dp(12),dp(10),dp(12),dp(10));card.setBackground(round(PANEL,12));
        LinearLayout.LayoutParams lp=new LinearLayout.LayoutParams(-1,-2);lp.setMargins(0,dp(8),0,0);results.addView(card,lp);
        String flag=d.popular?"🔥 Publisher-popular":d.sourceType.equals("DealNews editors")?"✦ Editor-selected":d.announced?"◷ Announced 2026 event":"2026 deal report";
        card.addView(text(flag+" · "+d.category,11,PINK,true));
        TextView name=text(d.name,15,TEXT,true);name.setPadding(0,dp(3),0,dp(3));card.addView(name);
        LinearLayout priceLine=horizontal();priceLine.setGravity(Gravity.CENTER_VERTICAL);
        TextView value=text(price(d),17,MINT,true);priceLine.addView(value,new LinearLayout.LayoutParams(0,-2,1));
        priceLine.addView(text(timing(d),11,Color.rgb(255,217,164),true));card.addView(priceLine);
        card.addView(text(d.store+" · "+d.sourceType,11,MUTED,false));
        LinearLayout buttons=horizontal();buttons.setPadding(0,dp(8),0,0);
        Button source=action("Source ↗"); source.setOnClickListener(v->open(d.source));buttons.addView(source,new LinearLayout.LayoutParams(0,dp(39),1));
        Button save=action(favorites.contains(d.id)?"♥ Saved":"♡ Save");
        save.setOnClickListener(v->{if(!favorites.add(d.id))favorites.remove(d.id);saveFavorites();draw();});
        LinearLayout.LayoutParams bp=new LinearLayout.LayoutParams(0,dp(39),1);bp.setMargins(dp(6),0,0,0);buttons.addView(save,bp);
        Button share=action("↗");share.setContentDescription("Share deal "+d.name);
        share.setOnClickListener(v->share(d));
        LinearLayout.LayoutParams sh=new LinearLayout.LayoutParams(dp(49),dp(39));sh.setMargins(dp(6),0,0,0);buttons.addView(share,sh);
        Button more=action("•••");more.setContentDescription("More actions for "+d.name);
        more.setOnClickListener(v->showDetails(d));LinearLayout.LayoutParams ap=new LinearLayout.LayoutParams(dp(54),dp(39));ap.setMargins(dp(6),0,0,0);buttons.addView(more,ap);
        card.addView(buttons);
    }
    private void showDetails(Deal d){
        String message=price(d)+" · "+timing(d)+"\n"+d.store+"\n\n"+
            (d.why==null||d.why.isEmpty()?"Price, inventory and model specifications need confirmation at the source.":d.why)+
            "\n\nSource: "+d.sourceType+"\nYear: 2026";
        new AlertDialog.Builder(this).setTitle(d.name).setMessage(message)
            .setPositiveButton("Open source",(x,y)->open(d.source))
            .setNeutralButton("Share",(x,y)->share(d))
            .setNegativeButton("Close",null).show();
    }
    private void saveFavorites(){JSONArray saved=new JSONArray();for(String id:favorites)saved.put(id);prefs.edit().putString("favorites",saved.toString()).apply();}
    private void share(Deal d){Intent i=new Intent(Intent.ACTION_SEND);i.setType("text/plain");
        i.putExtra(Intent.EXTRA_TEXT,"2026 Black Friday / Cyber Monday deal: "+d.name+" — "+price(d)+"\n"+d.source);
        startActivity(Intent.createChooser(i,"Share 2026 deal"));}
    private void open(String url){
        if(url==null||!url.startsWith("https://"))return;
        try{startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse(url)));}catch(Exception ignored){}
    }
    private LinearLayout horizontal(){LinearLayout v=new LinearLayout(this);v.setOrientation(LinearLayout.HORIZONTAL);return v;}
    private TextView text(String s,int size,int color,boolean bold){TextView t=new TextView(this);t.setText(s);t.setTextSize(TypedValue.COMPLEX_UNIT_SP,size);
        t.setTextColor(color);if(bold)t.setTypeface(Typeface.DEFAULT,Typeface.BOLD);return t;}
    private Button action(String s){Button b=new Button(this);b.setText(s);b.setAllCaps(false);b.setTextSize(TypedValue.COMPLEX_UNIT_SP,11);
        b.setTextColor(TEXT);b.setPadding(dp(5),0,dp(5),0);b.setBackground(round(PANEL,9));return b;}
    private GradientDrawable round(int color,int radius){GradientDrawable bg=new GradientDrawable();bg.setColor(color);bg.setCornerRadius(dp(radius));return bg;}
    private int dp(int val){return Math.round(getResources().getDisplayMetrics().density*val);}
    @Override protected void onDestroy(){super.onDestroy();worker.shutdownNow();ui.removeCallbacksAndMessages(null);}
}

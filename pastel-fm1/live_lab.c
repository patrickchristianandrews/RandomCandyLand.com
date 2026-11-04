/* SPDX-License-Identifier: GPL-3.0-only
 * Pastel 0.5: LIQUID LIVE -- four physically playable, audio-reactive
 * performance visualizers with a curated native-instrument sound gallery.
 * GPL-3.0-only: original UI code; upstream engines retain own licenses.
 *
 * This file is included by ui_draw.c AFTER ui_view.c. All state is main-loop
 * UI-only. No new memory allocation or audio ISR work. The 240x208 picture is
 * drawn in four 52-pixel canvas bands (the FM-1 holds only 64 canvas rows).
 */
#define PASTEL_LIVE_SCENES 4u
#define PASTEL_LIVE_SOUNDS 24u
static uint8_t pastel_live_scene;
static uint8_t pastel_live_sense = 7u;  /* default audio sensitivity */
static uint8_t pastel_live_flow = 6u;   /* 1..12 */
static uint8_t pastel_live_tint = 0u;   /* 0..3 */
static uint8_t pastel_live_patch = 0u;
static uint8_t pastel_live_note = 60u;
static uint32_t pastel_live_hit;
static const char *const pastel_live_scenes[PASTEL_LIVE_SCENES] = {
    "LIQUID", "PRISM", "ORBIT", "STARFIELD"
};
/* Legal/native engines, not patch data stolen from incompatible firmware.
 * PROPHET = original modeled analog, FM6 = six-operator, CZ = phase
 * distortion, SID = chip/acid/lo-fi, DRUM = native synthesis.
 * The SID rows 32..47 are Pastel's community-inspired voices.
 * The engine's actual internally stored name is displayed dynamically.
 */
static const uint8_t pastel_live_sounds[PASTEL_LIVE_SOUNDS][2] = {
    {ENGI_PROPHET,1}, {ENGI_FM6,10}, {ENGI_CZ,52}, {3,44},
    {ENGI_PROPHET,9}, {ENGI_FM6,4}, {ENGI_CZ,13}, {3,33},
    {ENGI_PROPHET,36}, {ENGI_FM6,15}, {ENGI_CZ,27}, {3,37},
    {ENGI_PROPHET,65}, {ENGI_FM6,19}, {ENGI_CZ,41}, {3,43},
    {ENGI_PROPHET,99}, {ENGI_FM6,21}, {ENGI_CZ,61}, {3,46},
    {ENGI_PROPHET,151}, {ENGI_FM6,8}, {3,35}, {ENGI_DRUM,2}
};
static uint32_t pastel_live_on(void)
{
    return ui.home && ui.home_pg == 3u && !ui.menu && !ui.confirm &&
           !ui.layer;
}
static void pastel_live_keys(uint32_t notes)
{
    if (!pastel_live_on() || !notes) return;
    for (uint32_t k=0;k<27u;k++) if ((notes>>k)&1u) {
        pastel_live_note=(uint8_t)(k+48u);
        pastel_live_hit=fm1_ms;
        break;
    }
}
static void pastel_live_sound_step(int32_t n)
{
    int32_t to=clamp((int32_t)pastel_live_patch+n,0,PASTEL_LIVE_SOUNDS-1);
    if (to==(int32_t)pastel_live_patch) return;
    pastel_live_patch=(uint8_t)to;
    if (trk_midi_slot(song.sel)) {
        ui_message("MIDI TRACK: NO SYNTH");
        return;
    }
    uint32_t eng=pastel_live_sounds[to][0],pi=pastel_live_sounds[to][1];
    if (!eng_ok(eng) || !ENGINES[eng]->npresets) return;
    engine_load_of(TSEL,eng,pi);
    ui.force=1;
}
static void pastel_live_knob(uint32_t k,int32_t n)
{
    switch(k) {
    case 0: pastel_live_scene=(uint8_t)clamp((int32_t)pastel_live_scene+n,0,3);break;
    case 1: {
        /* The scale-aware CHORD harmonizer is Melodee/ChoralRoot lineage.
         * Keep the existing track parameters and motion recording. */
        int32_t mode=clamp((int32_t)TSEL->p[P_CHRD]+n,TP[P_CHRD].min,TP[P_CHRD].max);
        TSEL->p[P_CHRD]=(int16_t)mode;
        motion_capture(TSEL,P_CHRD,mode);
        break;
    }
    case 2: pastel_live_flow=(uint8_t)clamp((int32_t)pastel_live_flow+n,1,12);break;
    case 3: pastel_live_tint=(uint8_t)((pastel_live_tint+(n%4)+4)%4);break;
    }
    ui.force=1;
}
/* Small cheap per-pixel vibrance: no floating point and no dependence on
 * current audio engine. A motion is visible even with no playing notes. */
static int32_t pastel_live_sin(uint32_t k)
{
    return pastel_liquid_sine32[k&31u];
}
static uint16_t pastel_live_color(uint32_t n,uint32_t strength)
{
    return ux_mix(T_BG,T_TRK((pastel_live_tint+n)&3u),(int32_t)strength);
}
static int32_t pastel_live_energy(void)
{
    uint32_t e=pastel_liquid_energy();
    int32_t peak=2+(int32_t)(e*(uint32_t)pastel_live_sense/2400u);
    if(peak>92)peak=92;
    return peak;
}
static __attribute__((noinline)) void pastel_live_orbit(uint32_t phase,int32_t energy)
{
    for(uint32_t r=0;r<3u;r++){
        int32_t rad=27+(int32_t)r*22+energy/7;
        uint16_t c=pastel_live_color(r,36);
        int32_t px=120+rad,py=88;
        for(uint32_t i=4u;i<=128u;i+=4u){
            int32_t x=120+rad*pastel_live_sin(i+8u)/16;
            int32_t y=88+rad*pastel_live_sin(i)/16;
            cv_line(px,py,x,y,c);
            px=x;py=y;
        }
        cv_disc(120+rad*pastel_live_sin(phase+r*8u+8u)/16,
                88+rad*pastel_live_sin(phase+r*8u)/16,8,
                pastel_live_color(r+1u,72),0);
    }
    cv_disc(120,88,12+energy/10,pastel_live_color(2,70),0);
}

static __attribute__((noinline)) void pastel_live_prism(uint32_t phase,int32_t energy)
{
    for(uint32_t j=0;j<4u;j++){
        int32_t radius=17+(int32_t)j*23+energy/9;
        int32_t sway=pastel_live_sin(phase/(j+2u));
        uint16_t c=pastel_live_color(j,40+j*9u);
        cv_line(120+sway,88-radius,120+radius,88,c);
        cv_line(120+radius,88,120-sway,88+radius,c);
        cv_line(120-sway,88+radius,120-radius,88,c);
        cv_line(120-radius,88,120+sway,88-radius,c);
    }
}

static __attribute__((noinline)) void pastel_live_stars(uint32_t phase,int32_t energy)
{
    for(uint32_t i=0;i<33u;i++){
        int32_t x=(int32_t)((i*67u+phase*(i%3u+1u))%228u)+6;
        int32_t y=(int32_t)((i*41u+phase*(i%4u+1u))%143u)+6;
        uint16_t c=pastel_live_color(i,i%5u==0u?75u:32u);
        cv_rect(x,y,i%5u==0u?3:2,i%5u==0u?3:2,c);
    }
    cv_ring(120,88,38+energy/2,pastel_live_color(0,65));
    cv_ring(120,88,65+energy/2,pastel_live_color(2,30));
}

static __attribute__((noinline)) void pastel_live_liquid(uint32_t phase,int32_t energy)
{
    pastel_liquid_layers(156,81-energy/5,(uint32_t)energy*350u,phase,4u);
    pastel_liquid_bubbles(156,phase);
}

static __attribute__((noinline)) void pastel_live_draw(void)
{
    if (!ui.force && (ui.frame%3u)) return; /* ~20 fps, respect 12 MHz LCD link */
    uint32_t phase=fm1_ms/(37u+(13u-pastel_live_flow)*13u);
    int32_t energy=pastel_live_energy();
    int32_t excited=(int32_t)(fm1_ms-pastel_live_hit)<950;
    uint32_t held=fm1_in.notes;
    if(held)energy+=17;
    if(excited)energy+=10;
    if(energy>112)energy=112;
    for(uint32_t band=0;band<4u;band++){
        cv_begin(240,52,T_BG);
        cv_oy=-(int32_t)(band*52u);
        if(pastel_live_scene==0u)pastel_live_liquid(phase,energy);
        else if(pastel_live_scene==1u)pastel_live_prism(phase,energy);
        else if(pastel_live_scene==2u)pastel_live_orbit(phase,energy);
        else pastel_live_stars(phase,energy);
        cv_text_c(120,ty_y(14,TY_TX),TY_TX,"LIQUID LIVE",T_TEXT,T_BG);
        cv_text_c(120,ty_y(38,TY_LB),TY_LB,pastel_live_scenes[pastel_live_scene],T_THEME,T_BG);
        /* A true audio waveform as in a studio monitoring tool. It moves to
         * the music output (scope_buf), not an invented animation timeline. */
        uint16_t trace=pastel_live_color(1,83);
        int32_t prev=83,prevx=10;
        for(int32_t x=12;x<232;x+=3){
            uint32_t slot=(scope_w-1u-(uint32_t)(232-x)*2u)&(SCOPE_N-1u);
            int32_t v=scope_buf[slot];
            int32_t y=104-(v*(12+energy/4))/32768;
                    cv_line(prevx,prev,x,y,trace);
            prev=y;prevx=x;
        }
        /* Four music-oriented control cards, not decorative dead buttons. */
        static const char *const labels[4]={"SCENE","CHORD","FLOW","TINT"};
        for(uint32_t k=0;k<4u;k++){
            int32_t x=2+(int32_t)k*60;
            uint16_t c=pastel_live_color(k,20);
            cv_rrect(x,158,56,43,6,c,T_BG);
            cv_text_c(x+28,ty_y(171,TY_LB),TY_LB,labels[k],T_TEXT,c);
            char v[8];
            if(k==0u)fmt_int(v,(int32_t)pastel_live_scene+1);
            else if(k==1u)fmt_int(v,TSEL->p[P_CHRD]);
            else if(k==2u)fmt_int(v,pastel_live_flow);
            else fmt_int(v,(int32_t)pastel_live_tint+1);
            cv_text_c(x+28,ty_y(189,TY_LB),TY_LB,v,T_THEME,c);
        }
        /* On PRESET: the actual loaded native engine/voice name. */
        char title[24];
        uint32_t ei=TSEL->eng_req%NENGINES;
        const engine_t *en=ENGINES[ei];
        if(en->npresets && TSEL->preset<en->npresets) {
            const preset_t *p=eng_preset(en,TSEL->preset);
            str_cpy(title,p->name,sizeof title);
        } else str_cpy(title,en->name,sizeof title);
        cv_text_c(120,ty_y(211,TY_LB),TY_LB,title,T_TEXT,T_BG);
        cv_oy=0;
        cv_blit(0,H_HEAD+band*52u);
    }
}

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
static void pastel_live_orbit(uint32_t phase,int32_t energy)
{
    uint16_t c0=pastel_live_color(0,35),c1=pastel_live_color(1,55);
    int32_t cx=120,cy=88;
    for(uint32_t r=0;r<3u;r++) {
        int32_t rad=23+(int32_t)r*21+energy/5;
        int32_t lastx=cx+rad,lasty=cy;
        for(uint32_t i=1;i<=32u;i++) {
            int32_t x=cx+rad*pastel_live_sin(i*4u)/16;
            int32_t y=cy+rad*pastel_live_sin(i*4u+8u)/16;
            cv_line(lastx,lasty,x,y,c0);
            lastx=x;lasty=y;
        }
        uint32_t at=phase/(1u+r)+r*9u;
        int32_t px=cx+rad*pastel_live_sin(at+8u)/16;
        int32_t py=cy+rad*pastel_live_sin(at)/16;
        cv_disc(px,py,7+(r==0?4:0),c1,0);
    }
    cv_disc(cx,cy,12+energy/8,pastel_live_color(2,68),0);
}
static void pastel_live_prism(uint32_t phase,int32_t energy)
{
    int32_t cx=120,cy=88;
    for(uint32_t j=0;j<5u;j++){
        int32_t radius=14+(int32_t)j*18+energy/(j+4u);
        uint16_t c=pastel_live_color(j,35u+j*8u);
        int32_t shift=pastel_live_sin(phase/(j+2u))*3/2;
        cv_line(cx+shift,cy-radius,cx+radius,cy,c);
        cv_line(cx+radius,cy,cx-shift,cy+radius,c);
        cv_line(cx-shift,cy+radius,cx-radius,cy,c);
        cv_line(cx-radius,cy,cx+shift,cy-radius,c);
        if(j&1u){
            cv_disc(cx+radius,cy,6,c,0);
            cv_disc(cx-radius,cy,6,c,0);
        }
    }
    for(uint32_t i=0;i<7u;i++){
        int32_t span=20+(int32_t)i*10;
        int32_t d=pastel_live_sin(phase+i*9u)*energy/30;
        cv_line(cx-span,cy+d,cx+span,cy-d,pastel_live_color(i+2u,24));
    }
}
static void pastel_live_stars(uint32_t phase,int32_t energy)
{
    uint32_t seed=(uint32_t)pastel_live_note*1349u+0x9e3779b9u;
    for(uint32_t i=0;i<56u;i++){
        seed^=seed<<13;seed^=seed>>17;seed^=seed<<5;
        int32_t x=(int32_t)(seed%236u)+2;
        seed=seed*1664525u+1013904223u;
        int32_t yy=(int32_t)(seed%155u)+12;
        int32_t y=(yy+(int32_t)(phase*(1u+i%3u)))%151+10;
        uint16_t c=pastel_live_color(i,(i%7u==0)?77:35);
        int32_t height=(i%5u==0)?4:2;
        cv_rect(x,y,height,height,c);
        if(i%7u==0)cv_line(x-3,y,x+height+3,y,c);
    }
    int32_t pulse=12+energy/3;
    cv_ring(120,88,pulse*2,pastel_live_color(0,62));
    cv_ring(120,88,(pulse+12)*2,pastel_live_color(2,35));
}
static void pastel_live_liquid(uint32_t phase,int32_t energy)
{
    pastel_liquid_layers(156,80-(energy/5), (uint32_t)energy*350u, phase,3u);
    for(uint32_t k=0;k<13u;k++){
        uint32_t at=phase/(k%3u+1u)+k*9u;
        int32_t x=12+(int32_t)((k*29u+phase*(k%4u+1u))%214u);
        int32_t y=31+(int32_t)((k*13u+phase/(k%3u+1u))%119u);
        cv_ring(x,y,6+(int32_t)(k%3u)*3,pastel_live_color(k,31));
        if(k%4u==0)cv_disc(x+pastel_live_sin(at)/3,y,4,pastel_live_color(k,54),0);
    }
}
static void pastel_live_draw(void)
{
    if (!ui.force && (ui.frame&1u)) return;
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
            if(y<45)y=45;
            if(y>151)y=151;
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

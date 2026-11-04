/* SPDX-License-Identifier: GPL-3.0-only
 * Pastel v0.4 Animal Jam pixel-art screen: 8 animals x 2 real sprite poses.
 * The sprite artwork is generated specifically for Pastel, not loaded from
 * third-party UI code. 40x40 4bpp with transparent ink and per-frame palettes.
 * Banded 240x48 / 240x64 drawing respects the real FM-1's 64-row buffer.
 */
#include "pastel_sprites.h"

/* Draw a 40x40 image from a nibble PackBits frame. Each code is either
 * a 1-128 pixel repetition (0x80|length-1, color) or a literal run
 * (length-1, 4bpp pixels in high/low nibble order). One linear scan,
 * no full framebuffer, and 0=transparent ink.
 */
static void pastel_sprite_pixel(uint32_t pixel,uint32_t ink,
                                const uint16_t *pal,int32_t x,int32_t y,
                                uint32_t scale)
{
    if(!ink)return;
    int32_t py=y+(int32_t)((pixel/PASTEL_SPRITE_W)*scale)+cv_oy;
    if(py+(int32_t)scale<=(int32_t)cv_top || py>=(int32_t)(cv_top+cv_rows))return;
    cv_rect(x+(int32_t)((pixel%PASTEL_SPRITE_W)*scale),
            y+(int32_t)((pixel/PASTEL_SPRITE_W)*scale),
            (int32_t)scale,(int32_t)scale,pal[ink]);
}

static void pastel_sprite_draw(uint32_t frame,int32_t x,int32_t y,uint32_t scale)
{
    frame%=16u;
    const uint8_t *src=pastel_sprite_bits+pastel_sprite_ofs[frame];
    const uint16_t *pal=pastel_sprite_pal[frame];
    uint32_t at=0;
    while(at<PASTEL_SPRITE_W*PASTEL_SPRITE_W){
        uint32_t code=*src++, n=(code&127u)+1u;
        if(code&128u){
            uint32_t ink=*src++;
            for(uint32_t k=0;k<n;k++)
                pastel_sprite_pixel(at++,ink,pal,x,y,scale);
        }else{
            const uint8_t *pixels=src;
            for(uint32_t k=0;k<n;k++){
                uint32_t ink=k&1u?pixels[k>>1]&15u:pixels[k>>1]>>4;
                pastel_sprite_pixel(at++,ink,pal,x,y,scale);
            }
            src+=(n+1u)>>1u;
        }
    }
}

static void pastel_animal_draw(void)
{
    if(!ui.force && (ui.frame&1u))return;
    uint32_t id=pastel_animal_selected % PASTEL_ANIMALS;
    uint32_t phase=fm1_ms/70u;
    int32_t active=(int32_t)(fm1_ms-pastel_animal_last_ms)<1200;
    uint32_t frame=id*2u+((fm1_ms/(active?190u:420u))&1u);
    int32_t bob=pastel_liquid_sine32[(phase+id*3u)&31u];
    int32_t hop=(active?(bob+16)/3:(bob+16)/7);
    int32_t sway=bob/(active?3:9);
    uint16_t pale=ux_mix(T_BG,T_TRK(id&3u),16);
    uint16_t shine=ux_mix(T_BG,T_TRK((id+1u)&3u),40);

    /* 240x144 upper stage drawn as three 48-row bands. */
    for(uint32_t b=0;b<3u;b++){
        cv_begin(240,48,T_BG);
        cv_oy=-(int32_t)(b*48u);
        pastel_liquid_layers(144,111,pastel_liquid_energy(),phase,4u);
        for(uint32_t k=0;k<11u;k++){
            int32_t sx=10+(int32_t)((k*41u+phase*(k%3u+1u))%224u);
            int32_t sy=50+(int32_t)((k*19u+phase/(k%3u+1u))%72u);
            if(k&1u)cv_disc(sx,sy,3+(int32_t)(k%3u)*2,shine,0);
            else {cv_line(sx-4,sy,sx+4,sy,shine);cv_line(sx,sy-4,sx,sy+4,shine);}
        }
        cv_disc(120,89,113,pale,0); /* soft sticker halo */
        cv_disc(120,136,62,ux_mix(T_BG,T_TRK(id&3u),12),0);
        pastel_sprite_draw(frame,80+sway,46-hop,2u);
        cv_text_c(120,ty_y(13,TY_TX),TY_TX,"ANIMAL JAM",T_TEXT,T_BG);
        cv_text_c(120,ty_y(32,TY_LB),TY_LB,"REAL ANIMAL SOUNDS",T_MID,T_BG);
        if(active)
            cv_text_c(120,ty_y(134,TY_LB),TY_LB,pastel_animal_calls[id],T_TEXT,T_BG);
        cv_oy=0;
        cv_blit(0,H_HEAD+b*48u);
    }

    /* The lower 240x64 canvas is an 8-button animal picker indicator.
     * Physical piano keys trigger the animal calls while this view is active.
     * No UI button is permanently remapped anywhere else. */
    cv_begin(240,64,T_BG);
    for(uint32_t k=0;k<PASTEL_ANIMALS;k++){
        int32_t col=(int32_t)(k%4u),row=(int32_t)(k/4u);
        int32_t sx=3+col*59,sy=1+row*31;
        uint16_t bg=k==id?ux_mix(T_BG,T_TRK(k&3u),28):T_SURF;
        uint16_t ink=k==id?T_TEXT:T_MID;
        cv_rrect(sx,sy,56,28,7,bg,T_BG);
        if(k==id)cv_frame(sx+1,sy+1,54,26,T_TRK(k&3u));
        const char *name=k==2u?"DUCK":k==3u?"FROG":k==4u?"BIRD":
          k==7u?"BAA":pastel_animal_names[k];
        cv_text_c(sx+28,ty_y(sy+14,TY_LB),TY_LB,name,ink,bg);
    }
    cv_blit(0,H_HEAD+144u);
}

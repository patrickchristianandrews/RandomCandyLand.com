/* SPDX-License-Identifier: GPL-3.0-only
 * Pastel Animal Jam: chibi animals dancing on a liquid pastel stage.
 * Copyright (C) 2026 Pastel contributors.
 *
 * 240x240 LCD, banded canvas; no sprite assets or runtime allocations.
 * This is the third HOME page. Every FM-1 piano key plays a synthesized
 * animal-inspired call. Press HOME to return to the sequencer Stage.
 */
static void pastel_animal_face(uint32_t kind, int32_t x, int32_t y,
                               int32_t d, uint16_t under)
{
    uint16_t fur = ux_mix(T_BG, T_TRK(kind & 3u), 30 + (int32_t)(kind & 1u) * 9);
    uint16_t ear = ux_mix(fur, T_TEXT, 7);
    uint16_t pink = ux_mix(T_BG, T_TRK(0u), 35);
    uint16_t iris = T_TEXT;
    uint16_t nose = ux_mix(T_BG, T_TRK(3u), 52);
    int32_t rad = d / 2;
    if (kind == 3u) { /* frog eyes perched above its head */
        cv_disc(x-rad/2, y-rad+3, d/3, fur, 0);
        cv_disc(x+rad/2, y-rad+3, d/3, fur, 0);
    } else if (kind == 7u) { /* cloudlike sheep's wool */
        for (int32_t j = -2; j <= 2; ++j)
            cv_disc(x + j * d/5, y-rad+3, d/3, fur, 0);
    } else if (kind == 2u || kind == 4u) { /* birds / ducks */
        cv_disc(x-rad/2, y-rad/3, d/3, fur, 0);
    } else {
        int32_t ey = y - rad + d/11;
        cv_disc(x-rad/2, ey, d/3, fur, 0);
        cv_disc(x+rad/2, ey, d/3, fur, 0);
        if (kind == 0u) { /* cat's high pointed ear tips */
            for (int32_t z = 0; z < d/5; ++z) {
                cv_line(x-rad/2-d/8+z/2, ey-z, x-rad/2+d/8-z/2, ey-z, fur);
                cv_line(x+rad/2-d/8+z/2, ey-z, x+rad/2+d/8-z/2, ey-z, fur);
            }
        }
        if (kind == 1u) { /* dog's floppy ear tips */
            cv_disc(x-rad+2, y-5, d/4, ear, 0);
            cv_disc(x+rad-2, y-5, d/4, ear, 0);
        }
    }
    cv_disc(x, y, d, fur, 0);
    if (kind == 5u) { /* cow patches and two tiny horns */
        cv_disc(x-rad/2, y-rad/3, d/4, under, 0);
        cv_disc(x+rad/3, y+rad/3, d/5, under, 0);
        cv_disc(x-rad/2, y-rad+4, d/7, ear, 0);
        cv_disc(x+rad/2, y-rad+4, d/7, ear, 0);
    }
    int32_t ey = y - rad/5, spread = rad/3;
    cv_disc(x-spread, ey, d/9, T_TEXT, 0);
    cv_disc(x+spread, ey, d/9, T_TEXT, 0);
    if (d > 35) {
        cv_disc(x-spread-2, ey-2, d/24+1, T_BG, 0);
        cv_disc(x+spread-2, ey-2, d/24+1, T_BG, 0);
        cv_disc(x-spread-12, y+rad/5, d/7, pink, 0);
        cv_disc(x+spread+12, y+rad/5, d/7, pink, 0);
    }
    if (kind == 2u || kind == 4u) { /* beaks */
        cv_rrect(x-d/7, y+rad/9, d*2/7, d/6+2, 4, nose, fur);
    } else if (kind == 6u) { /* little pig snout */
        cv_disc(x, y+rad/4, d/3, pink, 0);
        cv_disc(x-d/14, y+rad/4, d/15+1, iris, 0);
        cv_disc(x+d/14, y+rad/4, d/15+1, iris, 0);
    } else {
        cv_disc(x, y+rad/6, d/10+1, nose, 0);
        cv_line(x-7, y+rad/4+3, x, y+rad/3+5, iris);
        cv_line(x, y+rad/3+5, x+7, y+rad/4+3, iris);
    }
}

/* Animations are time-based and therefore keep moving even when no instrument
 * sound is playing. Energetic recent presses boost the little hop and swing.
 * Two existing 124/84 row bands avoid allocating a full LCD frame. */
static void pastel_animal_draw(void)
{
    if (!ui.force && (ui.frame & 1u)) return;
    uint32_t id = pastel_animal_selected % PASTEL_ANIMALS;
    uint32_t t = fm1_ms/70u;
    int32_t active = fm1_ms - pastel_animal_last_ms < 1150u;
    int32_t wobble = pastel_liquid_sine32[(t+id*3u)&31u];
    int32_t dx = wobble / (active ? 3 : 8);
    int32_t dy = active ? (wobble<0 ? wobble/4 : -wobble/4) : wobble/9;
    uint16_t fur = ux_mix(T_BG, T_TRK(id&3u), 35);
    uint16_t pale = ux_mix(T_BG, T_TRK(1u+(id&2u)), 15);
    cv_begin(240, 124, T_BG);
    pastel_liquid_layers(124, 100, pastel_liquid_energy(), fm1_ms/85u, 5u);
    for (uint32_t i=0;i<5u;i++) {
        int32_t bx=(int32_t)((i*53u+fm1_ms/(180u+i*15u))%240u);
        int32_t by=(int32_t)((i*29u+fm1_ms/(250u+i*50u))%115u);
        cv_ring(bx,by,6+(int32_t)(i&1u)*4,pale);
    }
    cv_text_c(120, ty_y(17, TY_TX), TY_TX, "ANIMAL JAM", T_TEXT, T_BG);
    cv_text_c(120, ty_y(40, TY_LB), TY_LB, "PLAY KEYS TO DANCE", T_MID, T_BG);
    int32_t x=120+dx,y=88+dy;
    /* Waving arms, tiny bouncing feet, and a shadow for the dance. */
    cv_disc(x, 118, 56, ux_mix(T_BG,T_TRK(id&3u),9), 0);
    cv_line(x-30,y+17,x-43-(dx/2),y+6+dy,T_THEME);
    cv_line(x+30,y+17,x+43-(dx/2),y+6-dy,T_THEME);
    cv_disc(x-43-(dx/2),y+6+dy,10,fur,0);
    cv_disc(x+43-(dx/2),y+6-dy,10,fur,0);
    cv_disc(x-15,y+30,14,fur,0);
    cv_disc(x+15,y+30,14,fur,0);
    pastel_animal_face(id,x,y,64,T_BG);
    cv_blit(0, H_HEAD);

    cv_begin(240, 84, T_BG);
    cv_text_c(120, ty_y(11,TY_LB), TY_LB, pastel_animal_calls[id], T_TEXT, T_BG);
    for (uint32_t a=0;a<PASTEL_ANIMALS;a++) {
        int32_t col=(int32_t)(a%4u),row=(int32_t)(a/4u);
        int32_t sx=3+col*59,sy=23+row*30;
        uint16_t fill = a==id ? ux_mix(T_BG,T_TRK(a&3u),23) : T_SURF;
        cv_rrect(sx,sy,56,27,7,fill,T_BG);
        pastel_animal_face(a,sx+13,sy+13,17,fill);
        cv_text_c(sx+38,ty_y(sy+13,TY_LB),TY_LB,
                  a==2u?"DUK":a==3u?"FRG":a==4u?"BRD":a==7u?"BAA":pastel_animal_names[a],
                  T_TEXT,fill);
    }
    cv_blit(0, H_HEAD+124);
}

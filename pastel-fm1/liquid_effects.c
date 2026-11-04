/* SPDX-License-Identifier: GPL-3.0-only
 * Pastel Liquid Edition: lightweight pastel fluid ribbons for the FM-1.
 * Copyright (C) 2026 Pastel contributors.
 *
 * Included by ui_stage.c, which is included once in Melodee's single C
 * translation unit. No heap, floats, trig, audio ISR work, or new buffers.
 * The 240x30 Stage strip already repaints every other UI frame; these
 * layers use that existing refresh and are never drawn over menus or popups.
 */

static const int8_t pastel_liquid_sine32[32] = {
      0,  3,  6,  9, 11, 13, 15, 16, 16, 16, 15, 13, 11,  9,  6,  3,
      0, -3, -6, -9,-11,-13,-15,-16,-16,-16,-15,-13,-11, -9, -6, -3
};

static int32_t pastel_liquid_wave(int32_t x, uint32_t phase, uint32_t spacing)
{
    /* signed, smooth periodic displacement in [-16, 16] */
    return pastel_liquid_sine32[((uint32_t)x / spacing + phase) & 31u];
}

static uint32_t pastel_liquid_energy(void)
{
    /* Read eight audio-history points without holding an IRQ off.
     * The data are for display only and an inconsistent sample is harmless. */
    uint32_t peak = 0;
    for (uint32_t k = 0; k < 8u; ++k) {
        int32_t s = scope_buf[(scope_w + k * 47u) & (SCOPE_N - 1u)];
        uint32_t a = (uint32_t)(s < 0 ? -s : s);
        if (a > peak) peak = a;
    }
    return peak > 32767u ? 32767u : peak;
}

/* Banded translucent-looking liquid, blended into the currently selected
 * color palette. Even the host-only monochrome palette stays monochrome.
 * y/h are *local canvas* coordinates, so banded canvases clip naturally. */
static void pastel_liquid_layers(int32_t h, int32_t y0, uint32_t energy,
                                 uint32_t phase, uint32_t step)
{
    static const uint8_t tone[3] = {2u, 3u, 0u};
    static const int8_t tint[3] = {14, 19, 25};
    int32_t amp = 2 + (int32_t)(energy / 8000u);
    if (amp > 6) amp = 6;
    if (step < 2u) step = 2u;
    for (uint32_t layer = 0; layer < 3u; layer++) {
        uint16_t c = ux_mix(T_BG, T_TRK(tone[layer]), tint[layer]);
        int32_t base = y0 + (int32_t)(layer * 6u);
        int32_t strength = (amp + (int32_t)layer) * 16 / 8;
        for (int32_t x = 0; x < 240; x += (int32_t)step) {
            uint32_t slide = phase / (layer + 2u) + 9u * layer;
            int32_t s = pastel_liquid_wave(x, slide, 5u + layer * 2u);
            int32_t surface = base + s * strength / 16;
            if (surface < 0) surface = 0;
            if (surface >= h) continue;
            cv_rect(x, surface, (int32_t)step, h - surface, c);
        }
    }
}

/* Animated, very soft floating bubbles. Draw under notes/pattern text. */
static void pastel_liquid_bubbles(int32_t h, uint32_t phase)
{
    for (uint32_t i = 0; i < 5u; i++) {
        int32_t x = 12 + (int32_t)((i * 43u + (phase / (i + 2u)) * (i + 3u)) % 218u);
        int32_t y = h - 3 - (int32_t)((i * 7u + phase / (i + 3u)) % (uint32_t)(h - 5));
        uint16_t color = ux_mix(T_BG, T_TRK((i + 1u) & 3u), 34);
        cv_ring(x, y, 3 + 2 * (int32_t)(i & 1u), color);
    }
}

static void pastel_liquid_band(int32_t h)
{
    uint32_t phase = fm1_ms / 78u;
    pastel_liquid_layers(h, 6, pastel_liquid_energy(), phase, 2u);
    pastel_liquid_bubbles(h, phase);
}

/* The otherwise sparse knob visualizer gets a deeper liquid floor.
 * Draw before the scope, filter or envelope, never over their information. */
static void pastel_liquid_shape(int32_t h)
{
    uint32_t phase = fm1_ms / 85u;
    pastel_liquid_layers(h, h - 38, pastel_liquid_energy(), phase, 3u);
    for (uint32_t k = 0; k < 4u; k++) {
        int32_t x = 24 + (int32_t)((k * 57u + phase * (k + 1u)) % 180u);
        int32_t y = h - 28 - (int32_t)((phase / (k + 2u) + k * 5u) % 14u);
        cv_ring(x, y, 6 + (int32_t)(k & 1u) * 2,
                ux_mix(T_BG, T_TRK((k + 2u) & 3u), 27));
    }
}

/* A few soft, static droplets at each track card's right edge. They don't
 * force full-row animation or interfere with the step-playhead diff updates. */
static void pastel_liquid_droplets(uint16_t bg, uint16_t track, int32_t h)
{
    uint16_t c = ux_mix(bg, track, 15);
    cv_ring(BOX_W - 11, 10, 7, c);
    cv_ring(BOX_W - 22, 16, 4, c);
    if (h >= 65)
        cv_ring(BOX_W - 13, h - 11, 5, c);
}

/* Both boot splashes: a liquid horizon beneath the version number. */
static void pastel_liquid_splash(void)
{
    cv_begin(240, 44, T_BG);
    pastel_liquid_layers(44, 7, 2000u, 7u, 2u);
    pastel_liquid_bubbles(44, 9u);
    cv_blit(0, 196);
}

/* SPDX-License-Identifier: GPL-3.0-only
 * Pastel Liquid Edition: ANIMAL JAM, a playful eight-animal performance mode.
 * Copyright (C) 2026 Pastel contributors.
 *
 * Original, synthesized animal-inspired calls. These are not recordings of
 * real animals. Audio is mixed into the regular output and USB capture, while
 * the playable FM-1 keybed is redirected only while Animal Jam is visible.
 * No dynamic allocation, synthesis-library dependencies or persistent data.
 *
 * Included once at the beginning of firmware/src/seq.c so the audio ISR and
 * UI can share a tiny request queue. Do not include in other translation units.
 */
#include <stdint.h>
#define PASTEL_ANIMALS 8u
#define PASTEL_ANIMAL_VOICES 4u
static volatile uint8_t pastel_animal_active;
static volatile uint8_t pastel_animal_selected;
static volatile uint32_t pastel_animal_requests;
static volatile uint32_t pastel_animal_last_ms;
static const char *const pastel_animal_names[PASTEL_ANIMALS] = {
    "CAT", "DOG", "DUCK", "FROG", "BIRD", "COW", "PIG", "SHEEP"
};
static const char *const pastel_animal_calls[PASTEL_ANIMALS] = {
    "MEOW", "WOOF", "QUACK", "RIBBIT", "TWEET", "MOO", "OINK", "BAA"
};
typedef struct {
    uint32_t phase, pos, noise;
    uint8_t id, running;
} pastel_animal_voice_t;
static pastel_animal_voice_t pastel_animal_voices[PASTEL_ANIMAL_VOICES];
static uint32_t pastel_animal_next_voice;

static void pastel_animal_hit(uint32_t key)
{
    uint32_t id = key % PASTEL_ANIMALS;
    pastel_animal_requests |= 1u << id;
    pastel_animal_selected = (uint8_t)id;
    pastel_animal_last_ms = fm1_ms;
}

/* 100% original synthesized approximation: variable-pitch triangle/pulse
 * oscillators, digital noise, breathy bursts and different rhythm envelopes.
 * The per-voice pitch and volume evolve on each sample, but there is no
 * interpolation table, float division, dynamic memory or external sample.
 */
static void pastel_animal_render(int32_t *out, uint32_t n)
{
    static const uint16_t base_hz[PASTEL_ANIMALS] = {520, 250, 590, 165, 1170, 135, 740, 390};
    static const uint16_t dur_ms[PASTEL_ANIMALS] = {560, 310, 285, 465, 345, 600, 325, 565};
    uint32_t requests = pastel_animal_requests & 255u;
    if (requests) {
        pastel_animal_requests &= ~requests;
        for (uint32_t id = 0; id < PASTEL_ANIMALS; ++id) {
            if (!(requests & (1u << id))) continue;
            pastel_animal_voice_t *v = &pastel_animal_voices[pastel_animal_next_voice++ % PASTEL_ANIMAL_VOICES];
            v->phase = 0u; v->pos = 0u;
            v->noise = 0x9E3779B9u ^ (id * 0x7337u);
            v->id = (uint8_t)id; v->running = 1u;
        }
    }
    for (uint32_t vnum = 0; vnum < PASTEL_ANIMAL_VOICES; ++vnum) {
        pastel_animal_voice_t *v = &pastel_animal_voices[vnum];
        if (!v->running) continue;
        uint32_t id = v->id, limit = (uint32_t)dur_ms[id] * 44u;
        uint32_t ph = v->phase, pos = v->pos, noise = v->noise;
        for (uint32_t i = 0; i < n && pos < limit; ++i, ++pos) {
            uint32_t ms = pos / 44u, f = base_hz[id];
            /* Different species: gliding meow, double bark, nasal quack,
             * pulsing ribbit, trill, low moo, squeak, tremolo baa. */
            switch (id) {
            case 0u: f += ms < 220u ? ms / 3u : (560u - ms) / 5u; break;
            case 1u: f += ms < 130u ? 75u : 25u; break;
            case 2u: f += ms < 130u ? 105u : 15u; break;
            case 3u: f += (ms / 55u & 1u) ? 45u : 0u; break;
            case 4u: f += (ms / 25u & 1u) ? 310u : 30u; break;
            case 5u: f += ms < 300u ? ms / 18u : (600u-ms) / 20u; break;
            case 6u: f += (ms / 42u & 1u) ? 190u : 0u; break;
            default: f += (ms / 95u & 1u) ? 60u : 5u; break;
            }
            ph += f * 97392u; /* 2^32 / ~44.1 kHz */
            uint32_t p = ph >> 16;
            int32_t tri = p < 32768u ? (int32_t)p*2 - 32767 : 98302 - (int32_t)p*2;
            noise ^= noise << 13; noise ^= noise >> 17; noise ^= noise << 5;
            int32_t hiss = (int32_t)(noise & 65535u) - 32768;
            int32_t raw = tri;
            if (id == 1u || id == 2u || id == 6u)
                raw = (tri * 3 + (p < 32768u ? 32767 : -32767)) / 4;
            if (id == 1u || id == 3u || id == 7u)
                raw = (raw * 3 + hiss) / 4;
            /* Soft attack/tail, repeat articulations for bark, quack, frog. */
            uint32_t attack = pos < 192u ? pos : 192u;
            uint32_t tail = (limit - pos) * 192u / limit;
            uint32_t env = attack < tail ? attack : tail;
            if (id == 1u && ms > 130u && ms < 161u) env = 0u;
            if (id == 3u && (ms / 105u & 1u)) env /= 3u;
            int32_t value = (raw * (int32_t)env) / (192 * 12);
            int32_t l = out[i * 2u] + value, r = out[i * 2u + 1u] + value;
            out[i * 2u] = l > 32767 ? 32767 : l < -32767 ? -32767 : l;
            out[i * 2u + 1u] = r > 32767 ? 32767 : r < -32767 ? -32767 : r;
        }
        v->phase = ph; v->pos = pos; v->noise = noise;
        if (pos >= limit) v->running = 0u;
    }
}

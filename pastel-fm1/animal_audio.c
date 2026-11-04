/* SPDX-License-Identifier: GPL-3.0-only
 * Pastel Animal Jam REAL recorded-animal sample player.
 * Eight licensed CC0 field recordings. Generator and per-file credits:
 * pastel-fm1/generate_animal_samples.py and AUDIO_CREDITS.md.
 *
 * Generated samples are 16kHz mono ITU-T G711 mu-law and reside in read-only
 * flash, not in scratch SRAM. Playback resamples with interpolation to FM-1's
 * ~44.118kHz DAC rate. The existing synth/FX continue to work unchanged.
 * No synthesized animal imitation tone is used.
 */
#include <stdint.h>
#include "pastel_recordings.h"
#define PASTEL_ANIMALS 8u
#define PASTEL_ANIMAL_VOICES 3u

static volatile uint8_t pastel_animal_active;
static volatile uint8_t pastel_animal_selected;
static volatile uint32_t pastel_animal_requests;
static volatile uint32_t pastel_animal_last_ms;
static const char *const pastel_animal_names[PASTEL_ANIMALS] = {
    "CAT", "DOG", "DUCK", "FROG", "BIRD", "COW", "PIG", "SHEEP"
};
static const char *const pastel_animal_calls[PASTEL_ANIMALS] = {
    "MEOW", "WOOF", "QUACK", "RIBBIT", "CAW", "MOO", "OINK", "BAA"
};
typedef struct {
    uint32_t position;          /* 16.16 fractional address, local to sample */
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

/* ITU G711 mu-law decoder, bit exact on the integer signal. */
static int32_t pastel_mulaw_decode(uint32_t v)
{
    uint32_t q = (~v) & 255u;
    int32_t magnitude = (int32_t)(((q & 15u) << 3u) + 132u);
    magnitude <<= (q >> 4u) & 7u;
    magnitude -= 132;
    return q & 0x80u ? -magnitude : magnitude;
}

static void pastel_animal_render(int32_t *out, uint32_t n)
{
    uint32_t req = pastel_animal_requests & 255u;
    if (req) {
        pastel_animal_requests &= ~req;
        for (uint32_t id = 0; id < PASTEL_ANIMALS; id++) {
            if (!(req & (1u << id))) continue;
            pastel_animal_voice_t *v=&pastel_animal_voices[
                pastel_animal_next_voice++ % PASTEL_ANIMAL_VOICES];
            v->id=(uint8_t)id;
            v->position=0u;
            v->running=1u;
        }
    }
    /* 16k / (24MHz / 544) = 0.362666 samples per FM-1 output sample. */
    const uint32_t step=(uint32_t)((16000ull * 544ull * 65536ull + 12000000ull) / 24000000ull);
    for (uint32_t vnum = 0; vnum < PASTEL_ANIMAL_VOICES; vnum++) {
        pastel_animal_voice_t *v=&pastel_animal_voices[vnum];
        if (!v->running) continue;
        const uint32_t len=pastel_recording_length[v->id];
        const uint8_t *src=pastel_recorded_pcm+pastel_recording_start[v->id];
        uint32_t pos=v->position;
        for (uint32_t i=0;i<n;i++) {
            uint32_t k=pos>>16;
            if(k>=len) {v->running=0u;break;}
            int32_t a=pastel_mulaw_decode(src[k]);
            int32_t b=pastel_mulaw_decode(src[k+1u<len?k+1u:k]);
            int32_t sample=a+(int32_t)(((int64_t)(b-a)*(int64_t)(pos&65535u))>>16);
            /* Up to three animal calls overlap; 28% per voice leaves headroom. */
            sample=(sample*7)/25;
            int32_t l=out[2u*i]+sample, r=out[2u*i+1u]+sample;
            out[2u*i]=l>32767?32767:l< -32767?-32767:l;
            out[2u*i+1u]=r>32767?32767:r< -32767?-32767:r;
            pos+=step;
        }
        v->position=pos;
    }
}

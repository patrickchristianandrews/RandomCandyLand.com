/* SPDX-License-Identifier: GPL-3.0-only
 * Pastel Animal Jam: ACTUAL CC0 animal field recordings, not imitation tones.
 * 12 kHz mono IMA ADPCM, encoded by generate_animal_samples.py, safely stored
 * in Melodee's existing validated read-only flash .mres region.
 * Audio playback runs in the existing audio render path without heap or
 * flash writes. Up to three sounds can overlap. Preserve all existing DSP.
 */
#include <stdint.h>
#include "pastel_recordings.h"
#ifndef RES_OK
#define RES_OK() 1
#endif
#define PASTEL_ANIMALS 8u
#define PASTEL_ANIMAL_VOICES 3u

static volatile uint8_t pastel_animal_active;
static volatile uint8_t pastel_animal_selected;
static volatile uint32_t pastel_animal_requests;
static volatile uint32_t pastel_animal_last_ms;
static const char *const pastel_animal_names[8]={
    "CAT","DOG","DUCK","FROG","BIRD","COW","PIG","SHEEP"
};
static const char *const pastel_animal_calls[8]={
    "MEOW","WOOF","QUACK","RIBBIT","CAW","MOO","OINK","BAA"
};
static const char *const pastel_animal_abbr[8]={
    "CT","DG","DK","FR","BD","CW","PG","SH"
};

static const uint16_t pastel_ima_steps[89]={
  7,8,9,10,11,12,13,14,16,17,19,21,23,25,28,31,34,37,41,45,
  50,55,60,66,73,80,88,97,107,118,130,143,157,173,190,209,
  230,253,279,307,337,371,408,449,494,544,598,658,724,796,
  876,963,1060,1166,1282,1411,1552,1707,1878,2066,2272,
  2499,2749,3024,3327,3660,4026,4428,4871,5358,5894,6484,
  7132,7845,8630,9493,10442,11487,12635,13899,15289,16818,
  18500,20350,22385,24623,27086,29794,32767
};
static const int8_t pastel_ima_delta[8]={-1,-1,-1,-1,2,4,6,8};
typedef struct {
    uint32_t phase, next_at;
    int32_t predictor, prev, next;
    uint8_t index, id, running;
} pastel_animal_voice_t;
static pastel_animal_voice_t pastel_animal_voices[PASTEL_ANIMAL_VOICES];
static uint32_t pastel_animal_next_voice;

static void pastel_animal_hit(uint32_t key)
{
    uint32_t id=key%PASTEL_ANIMALS;
    pastel_animal_requests |= 1u<<id;
    pastel_animal_selected=(uint8_t)id;
    pastel_animal_last_ms=fm1_ms;
}

/* The sequencer uses DRUM_LANE_NOTE, and its recorded STEP/REC hits map here.
 * The same player and artwork respond to live, recorded and MIDI triggers. */
static void pastel_animal_hit_lane(uint32_t lane)
{
    pastel_animal_hit(lane & 7u);
}

static int32_t pastel_ima_decode(pastel_animal_voice_t *v)
{
    uint32_t at=v->next_at++;
    if(at>=pastel_recording_length[v->id])return v->predictor;
    uint8_t b=pastel_recorded_adpcm[pastel_recording_start[v->id]+(at>>1)];
    uint8_t code=(at&1u)?b>>4:b&15u;
    int32_t step=pastel_ima_steps[v->index];
    int32_t change=step>>3;
    if(code&4u)change+=step;
    if(code&2u)change+=step>>1;
    if(code&1u)change+=step>>2;
    int32_t pred=v->predictor+((code&8u)?-change:change);
    if(pred>32767)pred=32767;
    if(pred< -32768)pred=-32768;
    int32_t index=(int32_t)v->index+pastel_ima_delta[code&7u];
    if(index<0)index=0;
    if(index>88)index=88;
    v->predictor=pred;
    v->index=(uint8_t)index;
    return pred;
}

static void pastel_animal_render(int32_t *out,uint32_t n)
{
    /* Updates can leave the resource flash temporarily invalid while
     * installing. Never play erased/foreign resource bytes in that state. */
    if(!RES_OK())return;
    uint32_t req=pastel_animal_requests & 255u;
    if(req){
        pastel_animal_requests &= ~req;
        for(uint32_t id=0;id<PASTEL_ANIMALS;id++){
            if(!(req&(1u<<id)))continue;
            pastel_animal_voice_t *v=&pastel_animal_voices[
                pastel_animal_next_voice++ % PASTEL_ANIMAL_VOICES];
            v->id=(uint8_t)id;
            v->phase=0;v->next_at=0;v->predictor=0;v->index=0;
            v->prev=pastel_ima_decode(v);
            v->next=pastel_ima_decode(v);
            v->running=1;
        }
    }
    /* 12kHz source / 44.1176kHz DAC. Fractional interpolation avoids
     * pitch or duration errors and preserves recognizable real animal calls. */
    const uint32_t step=(uint32_t)((12000ull*544ull*65536ull+12000000ull)/24000000ull);
    for(uint32_t vnum=0;vnum<PASTEL_ANIMAL_VOICES;vnum++){
        pastel_animal_voice_t *v=&pastel_animal_voices[vnum];
        if(!v->running)continue;
        for(uint32_t i=0;i<n;i++){
            int32_t sample=v->prev+(int32_t)(((int64_t)(v->next-v->prev)*v->phase)>>16);
            sample=(sample*7)/25; /* <30% mix headroom, three calls max */
            int32_t l=out[2u*i]+sample, rr=out[2u*i+1u]+sample;
            out[2u*i]=l>32767?32767:l< -32767?-32767:l;
            out[2u*i+1u]=rr>32767?32767:rr< -32767?-32767:rr;
            v->phase+=step;
            if(v->phase>=65536u){
                v->phase-=65536u;
                v->prev=v->next;
                if(v->next_at>=pastel_recording_length[v->id]){
                    v->running=0;
                    break;
                }
                v->next=pastel_ima_decode(v);
            }
        }
    }
}

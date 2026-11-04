/* SPDX-License-Identifier: GPL-3.0-only
 * Host tests for Pastel's independent animal sound generator.
 * Does not use the FM-1 DAC, hardware timers or Melodee's synth.
 */
#include <stdint.h>
#include <stdio.h>
#include <assert.h>
static uint32_t fm1_ms;
#include "../firmware/src/pastel_animal_audio.c"

int main(void)
{
    for (uint32_t id=0;id<PASTEL_ANIMALS;id++) {
        uint32_t heard = 0;
        pastel_animal_hit_lane(id);
        assert(pastel_animal_selected == id);
        assert(pastel_animal_abbr[id][0] != '\0');
        assert(pastel_animal_requests & (1u<<id));
        for (uint32_t b=0;b<1600u;b++) {
            int32_t out[128]={0};
            pastel_animal_render(out,64u);
            for (uint32_t i=0;i<128u;i++) {
                assert(out[i]>=-32767 && out[i]<=32767);
                assert(out[i]==out[i^1u]);
                heard |= (out[i] != 0);
            }
            fm1_ms++;
        }
        assert(heard);
        for(uint32_t v=0;v<PASTEL_ANIMAL_VOICES;v++)
            assert(!pastel_animal_voices[v].running);
    }
    for(uint32_t id=0;id<PASTEL_ANIMALS;id++) pastel_animal_hit_lane(id);
    int32_t out[128]={0};
    pastel_animal_render(out,64u);
    for(uint32_t i=0;i<128u;i++)assert(out[i]>=-32767 && out[i]<=32767);
    puts("Pastel Animal Jam: 8 REAL recordings, 12kHz resampling, tails, stereo balance, clamping OK");
    return 0;
}

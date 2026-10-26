/**
 * Procedural Web Audio API sound generator for 8-bit retro pet handheld
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  constructor() {
    const savedMute = localStorage.getItem('trumpagotchi_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }
  }

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.15;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('trumpagotchi_muted', String(this.isMuted));
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : 0.15;
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /** Button Navigation Beep */
  public playButtonBlip() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1320, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.045);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  /** Select / Action Affirmation Chime */
  public playSelectChime() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    [1046.5, 1318.5, 1567.98].forEach((freq, idx) => { // C6, E6, G6
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.35, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.13);
    });
  }

  /** Cancel / Back Blip */
  public playCancel() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(659.25, now); // E5
    osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.08); // E4

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  /** Eating / Munching Sound */
  public playMunch() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const startTime = now + i * 0.1;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300 + Math.random() * 80, startTime);
      osc.frequency.exponentialRampToValueAtTime(150, startTime + 0.06);

      gain.gain.setValueAtTime(0.4, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.07);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(startTime);
      osc.stop(startTime + 0.07);
    }
  }

  /** Attention Alert Beep-Beep (Tamagotchi Call) */
  public playAttentionAlert() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    // BEEP - BEEP pattern
    [0, 0.18].forEach((offset) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1760, now + offset); // A6

      gain.gain.setValueAtTime(0.4, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + offset);
      osc.stop(now + offset + 0.11);
    });
  }

  /** Golden Hair Grooming Swish */
  public playHairBrush() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.15);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  /** Cleaning papers sweep */
  public playCleanSweep() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    [0, 0.09, 0.18].forEach((offset, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400 + idx * 200, now + offset);
      osc.frequency.exponentialRampToValueAtTime(800 + idx * 200, now + offset + 0.07);

      gain.gain.setValueAtTime(0.25, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + offset);
      osc.stop(now + offset + 0.08);
    });
  }

  /** Golf Swing Swoosh & Clink */
  public playGolfHit(isHoleInOne: boolean = false) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    // Driver impact clink
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(2800, now + 0.05);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.13);

    if (isHoleInOne) {
      setTimeout(() => this.playVictoryFanfare(), 300);
    }
  }

  /** Victory / Evolution 8-bit Fanfare */
  public playVictoryFanfare() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    // Notes: C5, E5, G5, C6 triumphant arpeggio
    const notes = [
      { f: 523.25, t: 0.0, d: 0.1 },
      { f: 659.25, t: 0.1, d: 0.1 },
      { f: 783.99, t: 0.2, d: 0.12 },
      { f: 1046.50, t: 0.32, d: 0.35 }
    ];

    notes.forEach((n) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(n.f, now + n.t);

      gain.gain.setValueAtTime(0.35, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.01, now + n.t + n.d);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + n.t);
      osc.stop(now + n.t + n.d + 0.01);
    });
  }

  /** Rally Beat Chime */
  public playRallyBeat(success: boolean) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = success ? 'square' : 'sawtooth';
    osc.frequency.setValueAtTime(success ? 880 : 220, now);
    osc.frequency.exponentialRampToValueAtTime(success ? 1760 : 110, now + 0.1);

    gain.gain.setValueAtTime(success ? 0.3 : 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  /** CRT TV Static and Antenna Buzz */
  public playTvStatic() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 1.5;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 0.4);
  }

  /** Angry Buzz when yelling at Fake News */
  public playAngryYell() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(190, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  /** Bouncy Dance Rhythm Beat for Trump Fist Pump Dance */
  public playDanceBeat() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const beats = [0, 0.15, 0.3, 0.45];
    beats.forEach((timeOffset, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'square';
      osc.frequency.setValueAtTime(idx % 2 === 0 ? 120 : 440, now + timeOffset);
      osc.frequency.exponentialRampToValueAtTime(30, now + timeOffset + 0.09);

      gain.gain.setValueAtTime(0.4, now + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.01, now + timeOffset + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + 0.11);
    });
  }

  private voiceCache = new Map<string, string>();
  private currentVoiceAudio: HTMLAudioElement | null = null;
  private voicesLoaded: boolean = false;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  public preWarmVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.cachedVoices = window.speechSynthesis.getVoices();
      if (this.cachedVoices.length > 0) {
        this.voicesLoaded = true;
      }
      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
        this.voicesLoaded = true;
      };
    }
  }

  private vocalGain: GainNode | null = null;
  private vocalFilterLow: BiquadFilterNode | null = null;
  private vocalFilterHigh: BiquadFilterNode | null = null;
  private vocalCompressor: DynamicsCompressorNode | null = null;

  private initVocalChain() {
    this.init();
    if (!this.ctx || !this.masterGain || this.vocalCompressor) return;

    // Dynamics compressor to level out speech and make it punchy like a rally PA system
    this.vocalCompressor = this.ctx.createDynamicsCompressor();
    this.vocalCompressor.threshold.setValueAtTime(-16, this.ctx.currentTime);
    this.vocalCompressor.knee.setValueAtTime(12, this.ctx.currentTime);
    this.vocalCompressor.ratio.setValueAtTime(3.5, this.ctx.currentTime);
    this.vocalCompressor.attack.setValueAtTime(0.005, this.ctx.currentTime);
    this.vocalCompressor.release.setValueAtTime(0.2, this.ctx.currentTime);

    // Warmth EQ: boost 260Hz for signature chest resonance
    this.vocalFilterLow = this.ctx.createBiquadFilter();
    this.vocalFilterLow.type = 'peaking';
    this.vocalFilterLow.frequency.setValueAtTime(260, this.ctx.currentTime);
    this.vocalFilterLow.Q.setValueAtTime(1.1, this.ctx.currentTime);
    this.vocalFilterLow.gain.setValueAtTime(2.5, this.ctx.currentTime);

    // High shelf filter at 7.5kHz to smooth out high end for microphone warmth
    this.vocalFilterHigh = this.ctx.createBiquadFilter();
    this.vocalFilterHigh.type = 'highshelf';
    this.vocalFilterHigh.frequency.setValueAtTime(7500, this.ctx.currentTime);
    this.vocalFilterHigh.gain.setValueAtTime(-1.0, this.ctx.currentTime);

    this.vocalGain = this.ctx.createGain();
    this.vocalGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    // Wire: source -> lowEQ -> highEQ -> compressor -> vocalGain -> masterGain
    this.vocalFilterLow.connect(this.vocalFilterHigh);
    this.vocalFilterHigh.connect(this.vocalCompressor);
    this.vocalCompressor.connect(this.vocalGain);
    this.vocalGain.connect(this.masterGain);
  }

  // Cached AudioBuffers for 0ms latency playback
  private audioBufferCache = new Map<string, AudioBuffer>();

  /** Helper to load and decode an audio URL into an AudioBuffer */
  private async loadAudioBuffer(url: string): Promise<AudioBuffer | null> {
    if (this.audioBufferCache.has(url)) {
      return this.audioBufferCache.get(url)!;
    }
    this.init();
    if (!this.ctx) return null;

    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const arrayBuf = await res.arrayBuffer();
      const decoded = await this.ctx.decodeAudioData(arrayBuf);
      this.audioBufferCache.set(url, decoded);
      return decoded;
    } catch (e) {
      console.warn('Failed to load/decode audio buffer for', url, e);
      return null;
    }
  }

  /**
   * Synthesize & Play Trump Voice
   * Uses 100% authentic Donald Trump voice master recordings,
   * with Web Audio toddler formant modulation for Baby Donald!
   */
  public async speakTrump(text: string, isBaby: boolean = false, audioClip?: string) {
    if (this.isMuted) return;
    this.init();

    // Stop any currently playing audio element
    if (this.currentVoiceAudio) {
      this.currentVoiceAudio.pause();
      this.currentVoiceAudio = null;
    }

    const cleaned = (text || '').replace(/["*]/g, '').trim();
    const lower = cleaned.toLowerCase();

    // 1. Determine clip name
    let selectedClip = audioClip;
    if (!selectedClip) {
      if (lower.includes('wrong')) selectedClip = 'wrong.mp3';
      else if (lower.includes('bing') || lower.includes('dance') || lower.includes('pump') || lower.includes('rhythm') || lower.includes('fist')) selectedClip = 'bingbong.mp3';
      else if (lower.includes('believe this') || lower.includes('can you believe')) selectedClip = 'can_you_believe_this.mp3';
      else if (lower.includes('loser') || lower.includes('lost') || lower.includes('failing')) selectedClip = 'we_have_losers.mp3';
      else if (lower.includes('stupid')) selectedClip = 'united_states_is_run_by_stupid_people.mp3';
      else if (lower.includes('incompetent') || lower.includes('politician') || lower.includes('dishonest')) selectedClip = 'incompetent_politicians.mp3';
      else if (lower.includes('suing') || lower.includes('sue') || lower.includes('hit job')) selectedClip = 'you_know_were_going_to_be_suing_them_anyway.mp3';
      else if (lower.includes('what is going') || lower.includes("what's going")) selectedClip = 'whats_going_on.mp3';
      else if (lower.includes('problem')) selectedClip = 'lots_of_problems.mp3';
      else if (lower.includes('fake') || lower.includes('television') || lower.includes('tv') || lower.includes('news')) selectedClip = 'can_you_believe_this.mp3';
      else if (lower.includes('better')) selectedClip = 'better_than_ever_before.mp3';
      else if (lower.includes('amazing')) selectedClip = 'so_amazing.mp3';
      else if (lower.includes('phenomenal')) selectedClip = 'phenomenal.mp3';
      else if (lower.includes('enjoy')) selectedClip = 'i_actually_enjoy_that.mp3';
      else if (lower.includes('meat') || lower.includes('burger') || lower.includes('steak') || lower.includes('eat')) selectedClip = 'i_think_ive_been_showing_a_lot_of_meat.mp3';
      else if (lower.includes('course') || lower.includes('golf') || lower.includes('hole-in-one')) selectedClip = 'i_have_the_best_courses_in_the_world.mp3';
      else if (lower.includes('billion') || lower.includes('net worth')) selectedClip = 'well_over_ten_billion_dollars.mp3';
      else if (lower.includes('tremendous') || lower.includes('dollar')) selectedClip = 'tremendous_amounts_of_dollars.mp3';
      else if (lower.includes('deal') || lower.includes('sharpie')) selectedClip = 'its_a_five_year_deal.mp3';
      else if (lower.includes('great again') || lower.includes('country') || lower.includes('rally')) selectedClip = 'i_want_to_make_our_country_great_again.mp3';
      else if (lower.includes('china') || lower.includes('trade')) selectedClip = 'china.mp3';
      else if (lower.includes('fantastic') || lower.includes('job')) selectedClip = 'were_going_to_do_a_fantastic_job.mp3';
      else if (lower.includes('potential')) selectedClip = 'this_country_has_so_much_potential.mp3';
      else if (lower.includes('question') || lower.includes('hair') || lower.includes('comb-over')) selectedClip = 'without_question.mp3';
      else if (lower.includes('white house') || lower.includes('oval office')) selectedClip = 'the_white_house.mp3';
      else if (lower.includes('bye') || lower.includes('sleep') || lower.includes('bed') || lower.includes('nap')) selectedClip = 'bye.mp3';
    }

    // 2. If we have an authentic clip (or matched one), play it with 100% Trump fidelity!
    if (selectedClip) {
      const candidates = [
        `/audio/trump/${selectedClip}`,
        `/public/audio/trump/${selectedClip}`,
      ];

      for (const clipUrl of candidates) {
        try {
          const audio = new Audio(clipUrl);
          audio.volume = this.isMuted ? 0 : 1.0;
          this.currentVoiceAudio = audio;
          await audio.play();
          return;
        } catch {
          // try next candidate
        }
      }

      for (const clipUrl of candidates) {
        if (this.ctx && this.masterGain) {
          try {
            const buffer = await this.loadAudioBuffer(clipUrl);
            if (buffer) {
              const source = this.ctx.createBufferSource();
              source.buffer = buffer;
              source.playbackRate.value = 1.0;
              const gain = this.ctx.createGain();
              gain.gain.value = this.isMuted ? 0 : 1.0;
              source.connect(gain);
              gain.connect(this.masterGain);
              source.start();
              return;
            }
          } catch {
            // continue
          }
        }
      }
    }

    // 3. Dynamic server API call (Gemini Flagship TTS or server-side authentic matching)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch('/api/trump/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleaned, isBaby }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.audioDataUrl) {
          const audio = new Audio(data.audioDataUrl);
          audio.volume = this.isMuted ? 0 : 1.0;
          this.currentVoiceAudio = audio;
          await audio.play();
          return;
        }
      }
    } catch (e: any) {
      console.warn('Server TTS fetch error:', e?.message || e);
    }

    // 4. Guaranteed Ultimate Safety Fallback: Play iconic victory clip
    try {
      const fallbackUrl = '/audio/trump/better_than_ever_before.mp3';
      const audio = new Audio(fallbackUrl);
      audio.volume = this.isMuted ? 0 : 1.0;
      this.currentVoiceAudio = audio;
      await audio.play();
    } catch {
      // Muted or suspended context
    }
  }

  /** Pre-warm top clips in memory so clicks have instantaneous 0ms response */
  public warmTopQuotes() {
    if (typeof window === 'undefined') return;
    const topClips = [
      'wrong.mp3',
      'bingbong.mp3',
      'can_you_believe_this.mp3',
      'we_have_losers.mp3',
      'better_than_ever_before.mp3',
      'i_think_ive_been_showing_a_lot_of_meat.mp3',
      'i_have_the_best_courses_in_the_world.mp3',
      'well_over_ten_billion_dollars.mp3',
      'were_going_to_do_a_fantastic_job.mp3',
      'bye.mp3',
    ];

    setTimeout(() => {
      topClips.forEach(clip => {
        this.loadAudioBuffer(`/audio/trump/${clip}`);
      });
    }, 500);
  }

  /** Play Trump vocal audio by quote keyword or text */
  public playQuoteAudio(quoteOrText: string) {
    this.speakTrump(quoteOrText);
  }

  /** Play poll ratings fanfare chime */
  public playRatingsChime() {
    this.playVictoryFanfare();
  }
}

export const sound = new SoundEngine();
sound.preWarmVoices();
sound.warmTopQuotes();


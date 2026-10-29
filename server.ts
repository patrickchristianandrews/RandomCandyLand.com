import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Fallback Headlines if API key is absent or offline
const FALLBACK_HEADLINES = [
  {
    headline: "RATINGS SURGE TO 99%: DONALD DECLARES TOTAL DIGIPET VICTORY!",
    subhead: "Crowds gather outside Mar-a-Lago as pollsters admit nobody has ever seen numbers like this.",
    quote: "The ratings are through the roof, folks! We are winning bigly, believe me!",
    category: "FRONT PAGE NEWS",
  },
  {
    headline: "DOUBLE CHEESEBURGER SUMMIT: RECORD BURGERS CONSUMED IN OVAL OFFICE!",
    subhead: "Secret Service confirms desk button was pressed repeatedly for extra crispy fries.",
    quote: "Winners eat burgers! The greatest prime beef in the entire country!",
    category: "WHITE HOUSE EXCLUSIVE",
  },
  {
    headline: "HISTORIC HOLE-IN-ONE AT BEDMINSTER: CROWD CALLS IT 'A WORK OF ART'!",
    subhead: "PGA experts baffled by magnificent swing into a stiff 30mph headwind.",
    quote: "A perfect 62! Nobody golfs better than me, not even the pros!",
    category: "SPORTS DESK",
  },
  {
    headline: "HAIR DECLARED 100% REAL BY INTERNATIONAL COMMISSION!",
    subhead: "Wind turbines powerless against iconic golden comb-over volume.",
    quote: "They said 'Sir, tears in their eyes, sir, you have the greatest hair in human history!'",
    category: "BREAKING BULLETIN",
  },
  {
    headline: "BABY DONALD DEMANDS GOLDEN MILK BOTTLE: 'WE ARE WINNING FROM THE CRIB!'",
    subhead: "Toddler mogul closes first million-dollar nursery real estate contract.",
    quote: "Ba-ba! Even in the crib, we make the best deals! Tremendous bottle!",
    category: "EARLY YEARS SPECIAL",
  },
];

// Helper for timeout race
function withTimeout<T>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms)),
  ]);
}

// Endpoint: Generate or Fetch Daily Headline
app.post('/api/trump/headline', async (req, res) => {
  const { stage = 'potus', ratings = 85 } = req.body;

  if (!apiKey) {
    // Return curated authentic fallback
    const index = Math.floor(Math.random() * FALLBACK_HEADLINES.length);
    return res.json(FALLBACK_HEADLINES[index]);
  }

  try {
    const callPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are the lead satire editor for the 1997 Trumpagotchi Virtual Pocket Pet Newspaper.
Generate a funny, unmistakable Trump-style Daily Newspaper Headline and quote.
Current Pet Stage: ${stage} (e.g. baby, apprentice, tycoon, potus, legend).
Current Approval Ratings: ${ratings}%.

Return a JSON object with:
- headline: Dramatic ALL-CAPS tabloid headline (max 10 words)
- subhead: 1 short sentence contextualizing it
- quote: 1 unmistakable, punchy Trump quote in his signature cadence (max 18 words)
- category: e.g. "FRONT PAGE", "OVAL OFFICE REPORT", "GOLF DESK", "BOARDROOM BULLETIN"`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const response = await withTimeout(callPromise, 3500, 'Headline generation timed out');
    const parsed = JSON.parse(response.text || '{}');
    if (parsed.headline && parsed.quote) {
      return res.json(parsed);
    }
    const index = Math.floor(Math.random() * FALLBACK_HEADLINES.length);
    return res.json(FALLBACK_HEADLINES[index]);
  } catch (err) {
    console.warn('Gemini headline generation error or timeout, using fallback:', err);
    const index = Math.floor(Math.random() * FALLBACK_HEADLINES.length);
    return res.json(FALLBACK_HEADLINES[index]);
  }
});

// In-memory server audio cache
const serverVoiceCache = new Map<string, string>();

// Pre-load all authentic local Trump MP3 files into memory
const AUTHENTIC_CLIPS_DIR = path.resolve('./public/audio/trump');
const authenticAudioFiles = new Map<string, string>();

try {
  if (fs.existsSync(AUTHENTIC_CLIPS_DIR)) {
    const files = fs.readdirSync(AUTHENTIC_CLIPS_DIR);
    for (const file of files) {
      if (file.endsWith('.mp3')) {
        const filePath = path.join(AUTHENTIC_CLIPS_DIR, file);
        const data = fs.readFileSync(filePath);
        const b64 = data.toString('base64');
        authenticAudioFiles.set(file, `data:audio/mp3;base64,${b64}`);
      }
    }
    console.log(`[Authentic Trump Audio] Loaded ${authenticAudioFiles.size} pristine voice clips into memory.`);
  }
} catch (e: any) {
  console.warn('[Authentic Trump Audio] Error reading directory:', e.message);
}

// Keyword-to-authentic-clip selector for 100% Trump voice impression
function getMatchingAuthenticClip(text: string): string {
  const lower = text.toLowerCase();

  if (lower.includes('wrong')) return 'wrong.mp3';
  if (lower.includes('bing') || lower.includes('dance') || lower.includes('pump') || lower.includes('rhythm') || lower.includes('fist')) return 'bingbong.mp3';
  if (lower.includes('believe this') || lower.includes('can you believe')) return 'can_you_believe_this.mp3';
  if (lower.includes('loser') || lower.includes('lost') || lower.includes('failing')) return 'we_have_losers.mp3';
  if (lower.includes('stupid')) return 'united_states_is_run_by_stupid_people.mp3';
  if (lower.includes('incompetent') || lower.includes('politician') || lower.includes('dishonest')) return 'incompetent_politicians.mp3';
  if (lower.includes('suing') || lower.includes('sue') || lower.includes('court') || lower.includes('hit job')) return 'you_know_were_going_to_be_suing_them_anyway.mp3';
  if (lower.includes('what is going') || lower.includes("what's going")) return 'whats_going_on.mp3';
  if (lower.includes('problem')) return 'lots_of_problems.mp3';
  if (lower.includes('fake') || lower.includes('television') || lower.includes('tv') || lower.includes('media') || lower.includes('news')) return 'can_you_believe_this.mp3';

  if (lower.includes('better')) return 'better_than_ever_before.mp3';
  if (lower.includes('amazing')) return 'so_amazing.mp3';
  if (lower.includes('phenomenal')) return 'phenomenal.mp3';
  if (lower.includes('enjoy')) return 'i_actually_enjoy_that.mp3';
  if (lower.includes('groove') || lower.includes('beat')) return 'bingbong.mp3';
  if (lower.includes('keep going') || lower.includes('energy') || lower.includes('stamina')) return 'we_have_to_keep_going.mp3';
  if (lower.includes('winning') || lower.includes('win')) return 'maybe_winning.mp3';

  if (lower.includes('meat') || lower.includes('burger') || lower.includes('cheeseburger') || lower.includes('eat') || lower.includes('food')) return 'i_think_ive_been_showing_a_lot_of_meat.mp3';
  if (lower.includes('course') || lower.includes('golf') || lower.includes('hole-in-one') || lower.includes('putt')) return 'i_have_the_best_courses_in_the_world.mp3';
  if (lower.includes('billion') || lower.includes('worth') || lower.includes('net worth')) return 'well_over_ten_billion_dollars.mp3';
  if (lower.includes('tremendous') || lower.includes('dollar')) return 'tremendous_amounts_of_dollars.mp3';
  if (lower.includes('deal') || lower.includes('contract') || lower.includes('sharpie')) return 'its_a_five_year_deal.mp3';
  if (lower.includes('great again') || lower.includes('country') || lower.includes('rally') || lower.includes('crowd')) return 'i_want_to_make_our_country_great_again.mp3';
  if (lower.includes('china') || lower.includes('trade') || lower.includes('tariff')) return 'china.mp3';
  if (lower.includes('fantastic') || lower.includes('job')) return 'were_going_to_do_a_fantastic_job.mp3';
  if (lower.includes('potential')) return 'this_country_has_so_much_potential.mp3';
  if (lower.includes('question') || lower.includes('hair') || lower.includes('comb-over')) return 'without_question.mp3';
  if (lower.includes('white house') || lower.includes('oval office')) return 'the_white_house.mp3';
  if (lower.includes('bye') || lower.includes('sleep') || lower.includes('bed') || lower.includes('night') || lower.includes('nap')) return 'bye.mp3';

  // Default default: enthusiastic victory phrase
  return 'better_than_ever_before.mp3';
}

// Endpoint: Generate Real Audio Voice using Gemini TTS with Instant Authentic Trump Voice Fallback
app.post('/api/trump/voice', async (req, res) => {
  const { text, isBaby = false, clipName } = req.body;

  if (!text && !clipName) {
    return res.status(400).json({ error: 'Text or clipName is required' });
  }

  // 1. Direct clip request
  if (clipName && authenticAudioFiles.has(clipName)) {
    return res.json({
      audioDataUrl: authenticAudioFiles.get(clipName),
      clipName,
      source: 'authentic_recording',
    });
  }

  const cacheKey = `${isBaby ? 'baby' : 'adult'}:${(text || '').trim().toLowerCase()}`;
  if (serverVoiceCache.has(cacheKey)) {
    return res.json({
      audioDataUrl: serverVoiceCache.get(cacheKey),
      cached: true,
      source: 'cache',
    });
  }

  // 2. Try Gemini Flagship TTS if API key is present
  if (apiKey) {
    try {
      const cleanedText = text.replace(/["*]/g, '').trim();
      const speaker = isBaby ? 'Baby Donald' : 'Donald';
      const formattedDialogue = `${speaker}: ${cleanedText}`;

      const ttsPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: formattedDialogue,
                speechMetadata: {
                  speaker,
                  style: isBaby
                    ? 'Energetic, confident toddler Donald Trump cooing and babbling with infant New York cadence and cute playful bursts.'
                    : 'Hyper-authentic vocal impression of Donald Trump at a massive stadium rally. Husky, gravelly Queens New York baritone, theatrical pauses, emphatic explosive stress on superlatives like TREMENDOUS, HUGE, BELIEVE ME, and FAKE NEWS, trailing pitch drops at phrase endings, commanding bombastic swagger.',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: isBaby ? 'Puck' : 'Charon' },
            },
          },
        },
      });

      const response = await withTimeout(ttsPromise, 5000, 'TTS generation timed out');
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (base64Audio) {
        const audioDataUrl = `data:audio/wav;base64,${base64Audio}`;
        serverVoiceCache.set(cacheKey, audioDataUrl);
        return res.json({
          audioDataUrl,
          cached: false,
          source: 'gemini_tts',
        });
      }
    } catch (err: any) {
      console.warn('Gemini TTS unavailable or quota reached, serving authentic Trump clip:', err?.message || err);
    }
  }

  // 3. Fallback: Serve matching Authentic Donald Trump Master Recording
  const matchedClip = getMatchingAuthenticClip(text || '');
  if (authenticAudioFiles.has(matchedClip)) {
    const audioDataUrl = authenticAudioFiles.get(matchedClip)!;
    serverVoiceCache.set(cacheKey, audioDataUrl);
    return res.json({
      audioDataUrl,
      cached: false,
      clipName: matchedClip,
      source: 'authentic_recording',
    });
  }

  // Fallback to first available clip
  const firstClip = authenticAudioFiles.values().next().value;
  if (firstClip) {
    return res.json({
      audioDataUrl: firstClip,
      cached: false,
      source: 'authentic_recording',
    });
  }

  return res.status(500).json({ error: 'No audio available' });
});

app.get('/standalone.html', (_req, res) => res.redirect(301, '/'));

app.get('/download-index-html', (_req, res) => {
  const filePath = path.resolve(process.cwd(), 'dist/index.html');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Disposition', 'attachment; filename="index.html"');
    res.setHeader('Content-Type', 'text/html');
    return res.sendFile(filePath);
  }
  return res.status(404).send('File not found');
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Trumpagotchi server running at http://0.0.0.0:${PORT}`);
    console.log(`Authentic Trump voice engine ready with ${authenticAudioFiles.size} clips.`);
  });
}

startServer();

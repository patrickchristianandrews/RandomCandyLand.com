import React, { useState } from 'react';
import { Copy, Dices, Sparkles, WandSparkles } from 'lucide-react';
import { CandyGoo } from './CandyGoo';

/** Full-cycle, persistent shuffle: each generated combination appears once
 * before the billions-long sequence can repeat (unless browser data is cleared).
 */
const HEADLINES = [
  '🚨 OFFICIAL NONSENSE BULLETIN','🍬 EMERGENCY SUGAR UPDATE',
  '👀 THINGS THE CLOUDS ARE HIDING','🎪 CIRCUS BOARD MEETING',
  '📡 MESSAGE FROM PLANET WHAT','🧪 SCIENTIFICALLY IMPOSSIBLE',
  '🦄 UNICORN NEWS NETWORK','📜 VERY SERIOUS ANNOUNCEMENT',
  '🌈 RAINBOW WEATHER ADVISORY','🧀 DEPARTMENT OF CHEESE',
  '🛸 INTERGALACTIC GOSSIP','🧁 CUPCAKE COURT TRANSCRIPT',
  '💌 LETTER FROM ANOTHER DIMENSION','🗞️ ABSOLUTE RUBBISH DAILY',
  '🎺 TINY TRUMPET BREAKING NEWS','🔮 THE ORACLE HAS GIGGLED',
  '🎡 WELCOME TO THE NONSENSE ZONE','🐙 OCTOPUS OFFICE MEMO',
  '🧠 THOUGHTS THAT ESCAPED','🥨 SUSPICIOUS PRETZEL REPORT',
  '🎤 UNNECESSARY PRESS CONFERENCE','🌙 MIDNIGHT MARSHMALLOW ALERT',
  '🪩 DISCO DIMENSION DISPATCH','🏆 NOBODY ASKED FOR THIS AWARD'
] as const;

const HEROES = [
  'A tap-dancing avocado','The mayor of the moon','A suspiciously confident jellybean',
  'A retired circus pickle','A three-legged disco llama','An undercover waffle',
  'The world’s tiniest pirate','A marshmallow in business casual','An emotionally fragile pineapple',
  'A glitter-covered garden gnome','A very dramatic potato','A pancake with a law degree',
  'An overly polite dragon','A raccoon wearing roller skates','The ghost of a birthday cake',
  'A billionaire gummy worm','An astronaut made of pudding','A singing traffic cone',
  'A shark with an excellent mustache','A noodle in a tuxedo','A motivational toaster',
  'A nervous disco ball','An octopus with eight briefcases','A tap-dancing refrigerator',
  'An unusually chatty cactus','A cucumber with a podcast','A sentient cheese puff',
  'A mildly confused time traveler','A fashionable mushroom','A tiny furious teacup',
  'A philosophical chicken nugget','A sparkly haunted umbrella','The royal spaghetti advisor',
  'A sleepwalking flamingo','A cloud with a fake ID','A detective made of cotton candy',
  'A duck with an imaginary yacht','A highly organized swamp monster','A banana who knows too much',
  'A lonely karaoke robot','A jellyfish with a gym membership','A princess of expired coupons',
  'An alarm clock afraid of mornings','A bubblegum-powered submarine','A moonwalking aardvark',
  'A cupcake with stage fright','A secret-agent snowflake','A cheese wizard on vacation'
] as const;

const ACTIONS = [
  'has officially declared war on','is hosting a pajama conference about',
  'has been hired to inspect','was arrested for aggressively complimenting',
  'is attempting to train','has opened a questionable museum of',
  'was caught secretly juggling','has challenged the sun to a dance-off over',
  'is selling lifetime subscriptions to','has been elected supreme supervisor of',
  'has invented a reality show featuring','just adopted',
  'is legally required to sing ballads about','has accidentally launched into orbit',
  'is suing the universe over','is teaching interpretive dance to',
  'is currently negotiating with','has mistaken its own reflection for',
  'was promoted for heroically rescuing','is writing a dramatic autobiography about',
  'has replaced every doorbell with','is giving unsolicited relationship advice to',
  'has built a theme park entirely around','just confessed an undying love for',
  'is attempting to hypnotize','was found asleep underneath',
  'has demanded an official recount of','is starting a detective agency for',
  'is offering questionable spa treatments to','has entered a staring contest with',
  'is quietly plotting to overthrow','has become the official spokesperson for',
  'is broadcasting motivational speeches to','has opened a secret bank for',
  'has begun a rigorous training program for','is planning a surprise wedding with',
  'was awarded a golden spatula for protecting','is building a tiny kingdom for',
  'has written a scandalous opera about','is hosting the Olympics of',
  'has issued a royal pardon to','is interviewing candidates to babysit',
  'is running for president of','is attempting to teach Morse code to',
  'has announced a suspicious partnership with','is secretly moonlighting as a therapist for',
  'is organizing an emergency parade for','just lost a high-stakes game of bingo to'
] as const;

const THINGS = [
  'a choir of invisible cheeseburgers','three thousand emotionally unavailable socks',
  'the last enchanted chicken nugget','a pyramid of suspicious rubber ducks',
  'all the glitter in the known universe','an army of tiny tap-dancing spoons',
  'an inflatable philosophical pineapple','seven haunted birthday candles',
  'a confused family of glitter hamsters','an extremely grumpy cloud',
  'a stack of antique jellybean passports','a volcano made of pudding',
  'the international supply of squeaky bananas','a school of competitive spaghetti',
  'an award-winning inflatable walrus','a bag of moon-flavored popcorn',
  'the secret society of disco potatoes','a collection of invisible hats',
  'forty-two suspiciously intelligent marshmallows','the Great Forbidden Cheesecake',
  'a tap-dancing bag of garden peas','an ancient cursed waffle iron',
  'the world championship of dramatic hiccups','a bucket of unlicensed rainbows',
  'a robotic pigeon named Gerald','the most dramatic lawn ornament in history',
  'a tiny government made entirely of cupcakes','a suitcase packed with yesterday’s dreams',
  'a magical submarine full of noodles','every missing left shoe in the city',
  'the secret recipe for square bubbles','a fountain of fizzy purple gravy',
  'a sentient jar of peanut butter','fifty-six synchronized dancing pickles',
  'the world’s first emotionally intelligent trombone','an enchanted vending machine',
  'a choir of enthusiastic dust bunnies','the entire moon’s sock drawer',
  'a suspiciously glamorous broccoli bouquet','the last honest fortune cookie',
  'an antique dragon-sized toothbrush','a committee of chatty traffic lights',
  'a rebellious gang of tiny teapots','the immortal empire of jelly donuts',
  'a talking top hat full of confetti','a box of invisible disco shoes',
  'the Department of Unfinished Cartwheels','a thousand dancing refrigerators'
] as const;

const PLACES = [
  'inside a haunted candy factory','under the mayor’s suspicious trampoline',
  'in the secret basement of a rainbow','at the annual jellybean summit',
  'while trapped in a disco elevator','on the dark side of the breakfast table',
  'behind the world’s largest gummy bear','aboard an intergalactic ice-cream truck',
  'during a tense marshmallow barbecue','at a forbidden midnight tea party',
  'in a castle made of bubble wrap','on the roof of an upside-down library',
  'at the bottom of a cereal box','inside a time-traveling laundromat',
  'beneath an enormous invisible sombrero','at a diplomatic summit for garden gnomes',
  'in a thunderstorm of sprinkles','inside an abandoned karaoke spaceship',
  'at the legendary Pudding Olympics','in an underwater pillow fort',
  'outside the universe’s least reliable bakery','during the Great Donut Eclipse',
  'at the palace of the Queen of Socks','inside a fancy cardboard box',
  'under a bridge guarded by gummy worms','in a parallel dimension made of waffles',
  'during a parade of tiny elephants','next to a waterfall of melted chocolate',
  'inside a library run by raccoons','at a haunted amusement park on Jupiter',
  'on the moon’s secret mini golf course','at the world’s most nervous petting zoo',
  'in an office staffed by tap-dancing frogs','during an unauthorized pillow rebellion',
  'on a cruise ship made of cheese','at the International School of Nonsense',
  'in a balloon full of rubber chickens','just outside the Museum of Questionable Ideas',
  'inside the legendary Supermarket of Dreams','beneath a waterfall of pink goo',
  'on the set of a soap opera for houseplants','at a picnic organized by confused robots',
  'on the planet formerly known as Tuesday','in the Galactic Jellybean Court',
  'during the Night of the Dancing Pretzels','at a candy-castle slumber party',
  'on a tiny island inside a bathtub','in the basement of an interstellar donut shop'
] as const;

const FINALES = [
  'The only witness was a sandwich, and it is refusing to cooperate.',
  'The ceremony was interrupted by a standing ovation from seven chairs.',
  'Scientists confirm the situation is now 94% sprinkles and 6% mild panic.',
  'All future announcements must be delivered exclusively by kazoo.',
  'The moon has requested that everyone stop making direct eye contact.',
  'Nobody is allowed to mention the incident to the houseplants.',
  'The official response was a single dramatic squeak.',
  'A nearby toaster insists it saw absolutely everything.',
  'The paperwork was signed by a penguin with unusually good handwriting.',
  'A committee has voted to replace gravity with interpretive dance.',
  'The mayor has demanded more frosting and fewer questions.',
  'Everyone involved has been assigned a new name by a confused pigeon.',
  'A full investigation is underway, but the detective is actually a breadstick.',
  'Experts advise staying calm and wearing a macaroni hat.',
  'The entire neighborhood responded with one synchronized hiccup.',
  'The emergency budget has been converted into coupons for invisible soup.',
  'In related news, Tuesday has been postponed indefinitely.',
  'Witnesses report the wallpaper has started asking for a raise.',
  'A local jellybean has declared the beginning of the glitter apocalypse.',
  'Officials are now communicating through enthusiastic finger guns.',
  'Nobody noticed until the furniture started tap-dancing.',
  'The royal hamster has requested a second opinion from a waffle.',
  'The national anthem was briefly replaced with microwave noises.',
  'An international panel of ducks described this as “pretty weird.”',
  'The affair has been given four stars by a highly judgmental mushroom.',
  'A new law requires everyone to whisper “plot twist” before breakfast.',
  'The official rescue plan involves two balloons and a brave crouton.',
  'For legal reasons, the jellybeans have entered witness protection.',
  'The sky turned neon pink and nobody even mentioned it.',
  'Astronauts are calling this a “delightful catastrophe.”',
  'A tiny parade has been organized to celebrate the inconvenience.',
  'A voice shouted “HONK” from inside a filing cabinet.',
  'Local historians have agreed to pretend this never happened.',
  'The incident has somehow improved the ice-cream economy.',
  'An apology was delivered by a singing baked potato.',
  'The neighborhood cat was promoted to Chief of Shenanigans.',
  'Commemorative glow-in-the-dark spoons are already on sale.',
  'The ruling was overturned by a committee of polite ghosts.',
  'The only escape route leads into a giant bowl of custard.',
  'Meteorologists predict a 70% chance of airborne jellybeans.',
  'Three raccoons took full credit and are refusing interviews.',
  'A tiny sign now reads “ABSOLUTELY NO NORMAL BEHAVIOR.”',
  'The nearest vending machine has declared itself emotionally unavailable.',
  'An accordion has started playing dramatic exit music.',
  'The conclusion will follow a mandatory cupcake inspection.',
  'Nobody knows why, but an entire castle has started applauding.',
  'The world record was invalidated because the referee was a turnip.',
  'A press release insists this is excellent news for the noodles.'
] as const;

const POOLS = [HEADLINES, HEROES, ACTIONS, THINGS, PLACES, FINALES] as const;
const TOTAL = POOLS.reduce((result, pool) => result * pool.length, 1);
const KEY = 'random-candy-land-nonsense-complete-cycle-v1';
type Cycle = { current: number; next: number; step: number; shown: number };
function gcd(a: number, b: number): number { while (b) { const t = b; b = a % b; a = t; } return a; }
function fresh(): Cycle {
  const current = Math.floor(Math.random() * TOTAL);
  let step = 1 + Math.floor(Math.random() * (TOTAL - 1));
  while (gcd(step, TOTAL) !== 1) step = step % (TOTAL - 1) + 1;
  return { current, next: (current + step) % TOTAL, step, shown: 1 };
}
function persist(cycle: Cycle) {
  try { localStorage.setItem(KEY, JSON.stringify({ next: cycle.next, step: cycle.step, shown: cycle.shown })); } catch {}
}
function load(): Cycle {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && Number.isInteger(saved.next) && saved.next >= 0 && saved.next < TOTAL &&
      Number.isInteger(saved.step) && saved.step > 0 && saved.step < TOTAL &&
      gcd(saved.step, TOTAL) === 1 && Number.isInteger(saved.shown) && saved.shown > 0 && saved.shown < TOTAL) {
      const cycle: Cycle = {
        current: saved.next, next: (saved.next + saved.step) % TOTAL,
        step: saved.step, shown: saved.shown + 1
      };
      persist(cycle);
      return cycle;
    }
  } catch {}
  const cycle = fresh(); persist(cycle); return cycle;
}
function advance(previous: Cycle): Cycle {
  if (previous.shown >= TOTAL) { const cycle = fresh(); persist(cycle); return cycle; }
  const cycle: Cycle = {
    current: previous.next, next: (previous.next + previous.step) % TOTAL,
    step: previous.step, shown: previous.shown + 1
  };
  persist(cycle); return cycle;
}
function decode(id: number) {
  let remaining = id;
  const words: string[] = [];
  for (const pool of POOLS) {
    words.push(pool[remaining % pool.length]);
    remaining = Math.floor(remaining / pool.length);
  }
  return {
    headline: words[0],
    story: words[1] + ' ' + words[2] + ' ' + words[3] + ' ' + words[4] + '. ' + words[5]
  };
}

export function RandomNonsenseGenerator() {
  const [cycle, setCycle] = useState<Cycle>(load);
  const [copied, setCopied] = useState(false);
  const nonsense = decode(cycle.current);
  const generate = () => { setCycle(advance); setCopied(false); };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(nonsense.headline + '\n\n' + nonsense.story + '\n\n— Random Candy Land');
      setCopied(true);
    } catch { setCopied(false); }
  };
  return (
    <section id="nonsense" className="nonsense-lab" aria-labelledby="nonsense-heading">
      <CandyGoo className="nonsense-lab-drips" color="blueberry" />
      <div className="nonsense-lab-head">
        <div className="nonsense-lab-intro">
          <span className="nonsense-eyebrow"><Sparkles size={17}/> HIGHLY SCIENTIFIC SILLINESS LAB</span>
          <h2 id="nonsense-heading">The Random <em>Nonsense</em> Generator</h2>
          <p>Absurd headlines, ridiculous characters and questionable plot twists. Hit the big button to make reality slightly more confused.</p>
        </div>
        <div className="nonsense-mascot" aria-hidden="true">🍭<span>?!</span></div>
      </div>
      <div className="nonsense-display" key={cycle.current} aria-live="polite" aria-atomic="true">
        <div className="nonsense-stamp">✨ OFFICIAL CERTIFICATE OF ABSOLUTE NONSENSE</div>
        <h3>{nonsense.headline}</h3>
        <p>{nonsense.story}</p>
        <span className="nonsense-fineprint">Certified 100% silly</span>
      </div>
      <div className="nonsense-actions">
        <button className="nonsense-generate" type="button" onClick={generate}>
          <Dices size={24}/> GIVE ME MORE NONSENSE <WandSparkles size={20}/>
        </button>
        <button className="nonsense-copy" type="button" onClick={copy}>
          <Copy size={19}/> {copied ? 'COPIED!' : 'COPY THIS ONE'}
        </button>
      </div>
      <div className="nonsense-facts">
        <span>🎭 <strong>{TOTAL.toLocaleString('en-US')}</strong> possible silly stories</span>
        <span>♻️ <strong>{cycle.shown.toLocaleString('en-US')}</strong> unique discoveries on this device</span>
        <span>🍬 No exact repeats while this device retains its browser data.</span>
      </div>
    </section>
  );
}

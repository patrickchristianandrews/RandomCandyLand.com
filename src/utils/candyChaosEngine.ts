import { ChaosCard, BoardTile3D, ChaosPlayer, CHAOS_CHARACTERS } from '../types/candyChaos';

export const ABSURD_CHAOS_CARDS: ChaosCard[] = [
  {
    id: 'c1',
    title: 'THE SOCKS OF DESTINY',
    whatAnnouncement: 'ALERT: The Department of Agriculture has declared your socks illegal in 48 states. Advance 3 spaces while wearing them on your hands!',
    moveDelta: 3,
    gemDelta: 25,
    color: '#ef4444',
    soundType: 'win'
  },
  {
    id: 'c2',
    title: 'HEATED GUMMY SLUG',
    whatAnnouncement: 'BZZZZT: You stepped on a heated gummy slug. Your turn is over and your dog now legally owns your car.',
    moveDelta: -2,
    gemDelta: -10,
    color: '#a855f7',
    soundType: 'warp'
  },
  {
    id: 'c3',
    title: 'LAWSUIT AGAINST A CLOUD',
    whatAnnouncement: 'CONGRATULATIONS: You won a lawsuit against a cloud for raining without a permit! Leap forward 4 spaces and insult a bagel.',
    moveDelta: 4,
    gemDelta: 50,
    color: '#3b82f6',
    soundType: 'jackpot'
  },
  {
    id: 'c4',
    title: 'SUGAR SHOCK SWAP!',
    whatAnnouncement: 'WHAT?! You ate 400 sour worms and swapped souls with the leader! Positions are reversed!',
    moveDelta: 0,
    gemDelta: 0,
    color: '#eab308',
    soundType: 'laser',
    specialAction: 'SWAP_LEADER'
  },
  {
    id: 'c5',
    title: 'TRUMPAGOTCHI TARIFF ORDER',
    whatAnnouncement: 'EXECUTIVE MEMO: Donald imposes a 300% tariff on cheap foreign chocolate! Steal 40 Sugar Gems from everyone!',
    moveDelta: 2,
    gemDelta: 60,
    color: '#fbbf24',
    soundType: 'trumpet'
  },
  {
    id: 'c6',
    title: 'AGGRESSIVE FLAMINGO INTERVIEW',
    whatAnnouncement: 'A party flamingo wearing a tiny fedora interrogates you about your browser history. Blush and move back 1 space.',
    moveDelta: -1,
    gemDelta: -5,
    color: '#ec4899',
    soundType: 'warp'
  },
  {
    id: 'c7',
    title: 'GUMMY CANNON BARRAGE!',
    whatAnnouncement: 'FIRE IN THE HOLE! Load the 50-caliber Gummy Cannon and blast the player in front of you back 3 tiles!',
    moveDelta: 1,
    gemDelta: 30,
    color: '#22c55e',
    soundType: 'laser',
    specialAction: 'FIRE_CANNON'
  },
  {
    id: 'c8',
    title: 'DENTIST WITH A MEGAPHONE',
    whatAnnouncement: 'Baron Von Toothdecay screams! A dentist shouts flossing instructions into a megaphone. Everyone panics!',
    moveDelta: 2,
    gemDelta: 15,
    color: '#06b6d4',
    soundType: 'win'
  },
  {
    id: 'c9',
    title: 'SENTIENT PANCAKE ARREST',
    whatAnnouncement: 'POLICE NOTICE: A rogue pancake was arrested for pretending to be a trampoline. Skip 1 space.',
    moveDelta: 1,
    gemDelta: 20,
    color: '#f97316',
    soundType: 'win'
  },
  {
    id: 'c10',
    title: 'MICROWAVE BROADCAST GLITCH',
    whatAnnouncement: 'Madame Glaze-a-Lot microwaved her camera. Everything is covered in 4K melted sprinkles! Advance 2 spaces!',
    moveDelta: 2,
    gemDelta: 35,
    color: '#ec4899',
    soundType: 'jackpot'
  },
  {
    id: 'c11',
    title: 'NUCLEAR POP ROCKS',
    whatAnnouncement: 'You poured an entire gallon of soda over Pop Rocks. The sonic shockwave propels you 5 spaces into orbit!',
    moveDelta: 5,
    gemDelta: 45,
    color: '#84cc16',
    soundType: 'laser'
  },
  {
    id: 'c12',
    title: 'CONFUSED MARSHMALLOW SUBPOENA',
    whatAnnouncement: 'Sir Reginald Fluffernutter serves court papers to a jawbreaker. The jawbreaker remains silent.',
    moveDelta: 1,
    gemDelta: 10,
    color: '#f43f5e',
    soundType: 'win'
  }

];

// Extra chaos deck: original whimsical events in two distinct editions.
const EXTRA_SCENARIOS: { title: string; announcement: string }[] = `THE GREAT JELLYBEAN HEIST|A jellybean detective mistakes your pocket for a museum vault. You keep the evidence.
DANCING DONUT EMERGENCY|A disco donut calls a dance-off in the middle of the sugar highway.
THE POPCORN PARADE|A mischievous popcorn kernel bursts through a rainbow parade and demands more sprinkles.
GUMMY BEAR SPACE PROGRAM|A gummy astronaut launches an unlicensed rocket powered entirely by lemonade.
THE SODA GEYSER|An underground soda fountain erupts and propels everyone into a fizzy cloud.
CUPCAKE SPRINKLE CELEBRATION|A royal cupcake throws a huge sprinkle party and invites every candy in the kingdom.
MARSHMALLOW MOONWALK|A floating marshmallow teaches you an extremely suspicious moonwalk.
CHOCOLATE FOUNTAIN REVOLT|The chocolate fountain refuses to flow until it receives a standing ovation.
THE LOLLIPOP LAWYER|An attorney made of candy argues that your dance moves are legally irresistible.
BLUEBERRY TIME WARP|A blueberry wizard turns every clock into a vibrating jellyfish.
THE INFLATABLE TACO|A runaway taco balloon steals the mayor's ceremonial top hat.
SOUR WORM TELEPORT|A portal of sour worms drops your shoes in another dimension.
RAINBOW TRAFFIC JAM|Every rainbow in the universe tries to merge into one tiny roundabout.
THE ICE CREAM DRAGON|A dragon sneezes mint chocolate chip onto the royal boulevard.
COTTON CANDY TORNADO|A cotton-candy twister gives your hair a spectacular makeover.
WAFFLE COURT DRAMA|The Waffle Supreme Court rules that breakfast has gone too far.
THE DANCING PICKLE|A famous pickle challenges you to a viral dance duel on a gumdrop stage.
GOLDEN GUMBALL JACKPOT|A machine coughs up the rarest golden gumball in the kingdom.
THE SINGING PRETZEL|A pretzel forms a boy band with three churros and nobody knows the lyrics.
SKITTLE METEOR SHOWER|A meteor shower of tiny candies illuminates the neon marshmallow fields.
THE MYSTERY MOUSTACHE|A mysterious glitter moustache becomes the most ridiculous candy party accessory.
THE BANANA PAPARAZZI|A banana carrying six cameras demands a group photo before anyone can move.
LEMONADE ROCKET FUEL|Someone pours lemonade into the castle's rocket-powered ice cream truck.
BUBBLEGUM GRAVITY|Gravity takes a coffee break and your entire team starts floating.
THE COSMIC CROISSANT|An enormous croissant appears over the hills and begins issuing prophecies.
THE PINK SPRINKLE STORM|A shower of magic sprinkles makes every character sparkle like a disco ball.
THE UNICORN INTERVIEW|A unicorn podcast host asks you a question that makes absolutely no sense.
FIZZY FORTUNE COOKIE|A fortune cookie predicts a dramatic plot twist involving a trampoline.
THE SECRET GUMDROP CLUB|You discover a candy club where the password changes every seven seconds.
KARAOKE KETCHUP|A ketchup bottle sings a power ballad so loudly that the lollipops shake.
DONUT HOLE WORMHOLE|A donut hole opens a portal to a parallel bakery universe.
THE ROLLER SKATING PANDA|A panda on rocket skates accidentally wins the championship.
GLITTER LIGHTNING|The weather report predicts glitter lightning and unusually fabulous chaos.
THE ROYAL MILKSHAKE|A royal milkshake knights you with an oversized candy cane.
MARSHMALLOW TAX AUDIT|A fluffy accountant finds an unreported stash of rainbow crystals.
PIZZA PLANET PARADE|A marching band of tiny pizzas blocks the road to the castle.
THE GUMMY PHANTOM|A mysterious gummy phantom leaves a trail of glow-in-the-dark footprints.
WATERMELON WIZARD|A melon magician turns every puddle into raspberry soda.
THE NOODLE DIPLOMAT|A spaghetti diplomat negotiates peace between two furious jellybeans.
GINGERBREAD TIME MACHINE|A gingerbread inventor accidentally sends your roller skates to the future.
THE NEON FROG|A frog wearing sunglasses declares itself head of all nightclub operations.
HAMBURGER HALO|A giant golden hamburger appears in the sky and grants a single wish.
THE CARAMEL CANYON|A bridge of chewy caramel stretches across a canyon of fizzy soda.
CINNAMON CLOUD SURF|You catch a ride on a cinnamon cloud and land with perfect style.
CANDY CANE CATAPULT|A candy cane catapult launches confetti across the royal garden.
THE JELLYFISH DJ|A jellyfish DJ drops the beat and the entire ocean starts dancing.
STARLIGHT CEREAL CRISIS|Every cereal star in the bowl demands its own movie trailer.
THE MARZIPAN MYSTERY|A detective made of marzipan investigates a missing birthday candle.
THE DISCO PINEAPPLE|A pineapple on roller skates hosts a surprise disco for all the candy creatures.
THE WAFFLE ROCKET|A waffle-shaped spacecraft arrives from the breakfast galaxy.
THE MAGICAL KAZOO|A kazoo solo somehow transforms the board into an amusement park.
THE PICKLE POTION|A bubbling pickle potion makes everyone's voice sound like a cartoon chipmunk.
THE SUGAR VOLCANO|The volcano erupts with warm pink marshmallow fluff instead of lava.
THE GIANT TEDDY|A teddy bear fifty feet tall demands a group hug from the kingdom.
THE MILK CARTON SAGA|A milk carton tells an epic story about the last lost cookie.
COSMIC CANDY RAIN|A candy rainstorm refills every pocket with edible glitter.
THE CRYSTAL CUPCAKE|An enchanted cupcake reveals the location of a secret shortcut.
THE CHOCOLATE CHAMPION|A chocolate bar challenges you to an impossible sporting event.
THE ICE POP INVASION|An army of ice pops marches across the board in perfect formation.
THE LEMON DROP COMET|A glowing lemon comet paints a smiley face across the night sky.
CANDY CORN CONFUSION|Three candy corn siblings swap places and blame the moon.
THE FROSTING FIASCO|A frosting cannon misfires and gives the castle a fresh coat of pink.
THE BUBBLE TEA PORTAL|A giant boba pearl opens a shortcut through space and time.
THE GUMDROP OLYMPICS|A tiny gumdrop wins a medal for professional bouncing.
POPSICLE PLOT TWIST|A talking popsicle reveals that the final boss is a waffle.
THE JAZZY JELLY|A jelly cube starts a jazz quartet in the middle of a traffic jam.
THE RAINBOW ELEVATOR|A vertical rainbow carries your entire party to a cloud palace.
THE PEPPERMINT PARADE|Peppermint soldiers march by wearing tiny disco helmets.
THE SPARKLY SANDWICH|A sandwich made of stardust declares itself a fashion icon.
THE CANDY COMET CRASH|A gumdrop-shaped comet lands with a soft and very theatrical boing.
THE CRUNCHY MEDAL|A cereal champion awards you a shiny, edible medal.
THE SASSY MACARON|A macaron gives a devastating fashion critique to the moon.
THE CHEESECAKE HEIST|A masked cheesecake burglar runs off with a candy treasure map.
GUMDROP GLITCH PARTY|The entire kingdom glitches into pixel art for one bizarre moment.
THE PINK PLANET|A pink candy planet drifts overhead and drops a mystery package.
THE STAR-SPANGLED SPRINKLE|The kingdom celebrates a nonsensical holiday with fireworks made of frosting.
THE CUPCAKE COMEBACK|A retired cupcake announces a comeback tour on a floating stage.
THE LOLLIPOP LABYRINTH|A lollipop maze rearranges itself every time you blink.
THE ROLLER COASTER RIDDLE|A roller coaster demands the correct answer before returning your shoes.
THE JELLY KING'S SPEECH|The jelly king gives a seven-second speech and asks for a ten-minute ovation.`
.trim().split('\n').map(line => {
  const separator = line.indexOf('|');
  return { title: line.slice(0, separator), announcement: line.slice(separator + 1) };
});

const EDITIONS = [
  { name: 'SUGAR RUSH', text: 'A rainbow shortcut appears! ', movement: 2, gems: 22 },
  { name: 'SWEET REVENGE', text: 'A mischievous candy gremlin scrambles the rules! ', movement: -1, gems: -12 },
] as const;

const EXTRA_CARDS: ChaosCard[] = EXTRA_SCENARIOS.flatMap((scenario, index) =>
  EDITIONS.map((edition, flavor) => {
    const colors = ['#fb7185','#c084fc','#22d3ee','#facc15','#34d399','#ff8a4c','#e879f9'];
    const isLucky = (index + flavor) % 5 !== 0;
    return {
      id: `sweet-${index + 1}-${flavor + 1}`,
      title: `${scenario.title} · ${edition.name}`,
      whatAnnouncement: `${scenario.announcement} ${edition.text}${flavor === 0 ? 'Take a magical leap forward!' : 'The board shifts under your feet!'}`,
      moveDelta: Math.max(-4, Math.min(5, edition.movement + ((index % 4) - 1) * (isLucky ? 1 : -1))),
      gemDelta: edition.gems + (isLucky ? (index % 5) * 5 : -(index % 4) * 5),
      color: colors[index % colors.length],
      soundType: flavor === 0 ? 'jackpot' : 'warp',
      specialAction: (index % 21 === 0 && flavor === 1) ? 'SWAP_LEADER' : undefined,
    };
  })
);

ABSURD_CHAOS_CARDS.push(...EXTRA_CARDS);

// Generate the 3D Track Layout (S-Curve Rollercoaster Spine)
export function generate3DBoardTiles(): BoardTile3D[] {
  const tiles: BoardTile3D[] = [];
  const TOTAL_TILES = 30;
  const TILE_COLORS = [
    { color: '#ef4444', name: 'Cherry Red' },
    { color: '#facc15', name: 'Lemon Drop' },
    { color: '#3b82f6', name: 'Blueberry' },
    { color: '#22c55e', name: 'Lime Green' },
    { color: '#f97316', name: 'Orange Pop' },
    { color: '#a855f7', name: 'Grape Swirl' },
  ];

  for (let i = 0; i < TOTAL_TILES; i++) {
    const t = i / (TOTAL_TILES - 1);
    
    // Winding rollercoaster path
    const angle = t * Math.PI * 3.5;
    const radius = 18 - t * 6;
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * (radius * 0.8) - (t * 8);
    const y = Math.sin(t * Math.PI * 4) * 2 + (t * 6); // Rises toward the castle!

    const colorObj = TILE_COLORS[i % TILE_COLORS.length];
    
    let landmark: BoardTile3D['landmark'] = undefined;
    let trapType: BoardTile3D['trapType'] = undefined;

    if (i === 0) landmark = 'START';
    else if (i === 5) { landmark = 'PEPPERMINT_MINEFIELD'; trapType = 'trampoline'; }
    else if (i === 11) { landmark = 'GUMDROP_MOUNTAIN'; trapType = 'sugar_rush'; }
    else if (i === 17) { landmark = 'FUDGE_ABYSS'; trapType = 'fudge_slide'; }
    else if (i === 23) { landmark = 'DONUT_VOLCANO'; trapType = 'cannon'; }
    else if (i === TOTAL_TILES - 1) landmark = 'CANDY_CASTLE';

    tiles.push({
      index: i,
      color: colorObj.color,
      colorName: colorObj.name,
      landmark,
      trapType,
      gems: Math.floor(Math.random() * 20) + 10,
      x,
      y,
      z
    });
  }

  return tiles;
}

export function createDefaultAiPlayers(): ChaosPlayer[] {
  return [
    {
      id: 'ai_trump',
      name: 'Donald',
      characterId: 'trumpagotchi',
      tileIndex: 0,
      sugarGems: 100,
      isHost: false,
      isAi: true,
      isConnected: true,
      score: 0,
      shieldActive: false
    },
    {
      id: 'ai_fluffer',
      name: 'Reginald',
      characterId: 'marshmallow',
      tileIndex: 0,
      sugarGems: 50,
      isHost: false,
      isAi: true,
      isConnected: true,
      score: 0,
      shieldActive: false
    },
    {
      id: 'ai_toothdecay',
      name: 'Baron Mint',
      characterId: 'peppermint',
      tileIndex: 0,
      sugarGems: 75,
      isHost: false,
      isAi: true,
      isConnected: true,
      score: 0,
      shieldActive: false
    }
  ];
}

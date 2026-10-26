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

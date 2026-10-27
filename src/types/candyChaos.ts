export type ChaosCharacterId = 
  | 'trumpagotchi'
  | 'marshmallow'
  | 'peppermint'
  | 'gummy'
  | 'donut'
  | 'skittle'
  | 'taylor' | 'sabrina' | 'bunny' | 'beyonce'
  | 'lebron' | 'gaga' | 'bruno' | 'billie';

export interface ChaosCharacter {
  id: ChaosCharacterId;
  name: string;
  title: string;
  quote: string;
  color: string;
  emoji: string;
  abilityName: string;
  abilityDesc: string;
}

export const CHAOS_CHARACTERS: ChaosCharacter[] = [
  {
    id: 'trumpagotchi',
    name: 'Presidential Trumpagotchi',
    title: 'Billionaire Comb-Over Maestro with a 300% Tariff on Foreign Licorice',
    quote: 'Nobody has better 3D candy than us, believe me. Tremendous sugar!',
    color: '#fbbf24',
    emoji: '👱‍♂️',
    abilityName: 'The Art of the Deal',
    abilityDesc: 'Forces another player to trade positions when you land on a yellow square!'
  },
  {
    id: 'marshmallow',
    name: 'Sir Reginald Fluffernutter III',
    title: 'Sentient Marshmallow Attorney suing a waffle for emotional damages',
    quote: 'My client was promised hot chocolate, NOT aggressive spooning!',
    color: '#ffffff',
    emoji: '🎩',
    abilityName: 'Fluffy Injunction',
    abilityDesc: 'Immune to sticky fudge traps and lawsuits for 2 turns.'
  },
  {
    id: 'peppermint',
    name: 'Baron Von Toothdecay',
    title: 'A Peppermint Knight deathly terrified of pediatric dentists',
    quote: 'Stay back! If I hear the buzz of an ultrasonic scaler I will faint!',
    color: '#ef4444',
    emoji: '🛡️',
    abilityName: 'Minty Shield',
    abilityDesc: 'Blocks one incoming gummy cannon blast.'
  },
  {
    id: 'gummy',
    name: 'Sgt. Gummy Bear',
    title: 'Dishonorably discharged from the Jello Military for eating the camouflage',
    quote: 'Sir! The enemy is delicious and gelatinous, request permission to bite!',
    color: '#22c55e',
    emoji: '🐻',
    abilityName: 'Gelatin Bounce',
    abilityDesc: 'Springs 3 extra spaces forward over any red tile.'
  },
  {
    id: 'donut',
    name: 'Madame Glaze-a-Lot',
    title: 'An aggressively confused TikTok donut influencer streaming from a microwave',
    quote: 'OMG guys, like and subscribe or I get heated to 450 degrees!!',
    color: '#ec4899',
    emoji: '🍩',
    abilityName: 'Viral Sprinkle Storm',
    abilityDesc: 'Blinds all other players with confetti sprinkles, freezing them for 1 turn.'
  },
  {
    id: 'skittle',
    name: "Lil' Skittle-Brain",
    title: 'Vibrating at 400 MPH from pure high-fructose corn syrup & existential dread',
    quote: 'I CAN TASTE COLORS IN 4 DIMENSIONS AND MY BONES ARE VIBRATING!',
    color: '#a855f7',
    emoji: '⚡',
    abilityName: 'Sugar Hyperdrive',
    abilityDesc: 'Rolls 2 dice instead of 1, but has a 20% chance to run backwards!'
  }
  {
    id: 'taylor', name: 'Taylor Swift', title: 'The Glitter-Era Storyteller',
    quote: 'This candy kingdom needs a bridge, a chorus, and exactly thirteen glitter stars.',
    color: '#f9a8d4', emoji: '🎸',
    abilityName: 'Glitter Era', abilityDesc: 'Turns a normal moment into a grand finale.'
  },
  {
    id: 'sabrina', name: 'Sabrina Carpenter', title: 'The Espresso Mischief Maker',
    quote: 'I ordered an espresso. Why is the espresso riding a roller coaster?',
    color: '#f5d0a9', emoji: '☕',
    abilityName: 'Espresso Boost', abilityDesc: 'Turns a snack break into an encore.'
  },
  {
    id: 'bunny', name: 'Bad Bunny', title: 'The Neon Rhythm King',
    quote: 'The beat hits so hard that the gumdrop mountains start dancing.',
    color: '#8bf2cd', emoji: '🐰',
    abilityName: 'Neon Beat', abilityDesc: 'A spontaneous dance party shakes the candy lane.'
  },
  {
    id: 'beyonce', name: 'Beyoncé', title: 'The Crowned Stage Commander',
    quote: 'Formation, everybody. Even the gummy bears have choreography.',
    color: '#f5c451', emoji: '👑',
    abilityName: 'Queen Energy', abilityDesc: 'Every entrance is an unforgettable finale.'
  },
  {
    id: 'lebron', name: 'LeBron James', title: 'The Slam-Dunk Sugar Titan',
    quote: 'That gumdrop is going straight through the hoop.',
    color: '#a78bfa', emoji: '🏀',
    abilityName: 'Full Court Candy', abilityDesc: 'Slam dunks a gumdrop into a sugar jackpot.'
  },
  {
    id: 'gaga', name: 'Lady Gaga', title: 'The Chromatic Shape-Shifter',
    quote: 'I need a bigger stage, more sparkle, and one extremely dramatic entrance.',
    color: '#ef8fff', emoji: '✨',
    abilityName: 'Costume Chaos', abilityDesc: 'Changes outfits in an explosion of spectacle.'
  },
  {
    id: 'bruno', name: 'Bruno Mars', title: 'The Golden Groove Wizard',
    quote: 'Bring the groove! These candy canes can definitely dance.',
    color: '#fbbf24', emoji: '🪩',
    abilityName: '24K Candy Funk', abilityDesc: 'Everyone catches the beat and bounces.'
  },
  {
    id: 'billie', name: 'Billie Eilish', title: 'The Midnight Mood-Maker',
    quote: 'I like it a little strange. This glowing donut is perfect.',
    color: '#8dea92', emoji: '🌙',
    abilityName: 'Midnight Dream', abilityDesc: 'A quiet wave of neon makes the board shimmer.'
  },

];

export interface ChaosPlayer {
  id: string;
  name: string;
  characterId: ChaosCharacterId;
  tileIndex: number;
  sugarGems: number;
  isHost: boolean;
  isAi: boolean;
  isConnected: boolean;
  score: number;
  shieldActive: boolean;
}

export type TileLandmark = 
  | 'START'
  | 'PEPPERMINT_MINEFIELD'
  | 'GUMDROP_MOUNTAIN'
  | 'FUDGE_ABYSS'
  | 'DONUT_VOLCANO'
  | 'LOLLIPOPS'
  | 'CANDY_CASTLE';

export interface BoardTile3D {
  index: number;
  color: string;
  colorName: string;
  landmark?: TileLandmark;
  trapType?: 'cannon' | 'trampoline' | 'fudge_slide' | 'sugar_rush' | 'mystery';
  gems: number;
  x: number;
  y: number;
  z: number;
}

export interface ChaosCard {
  id: string;
  title: string;
  whatAnnouncement: string;
  moveDelta: number;
  gemDelta: number;
  color: string;
  soundType: 'win' | 'jackpot' | 'warp' | 'fart' | 'trumpet' | 'laser';
  specialAction?: 'SWAP_LEADER' | 'FIRE_CANNON' | 'FREEZE_OPPONENT' | 'REVERSE_ALL';
}

export interface ChaosGameState {
  roomId: string;
  phase: 'LOBBY' | 'ROLLING' | 'MOVING' | 'CARD_EVENT' | 'VICTORY';
  players: ChaosPlayer[];
  currentTurnPlayerId: string;
  turnNumber: number;
  lastDiceRoll: number | null;
  activeCard: ChaosCard | null;
  lastAnnouncement: string;
  cannonTargetId: string | null;
  winnerPlayerId: string | null;
}

export type ChaosCharacterId = 
  | 'trumpagotchi'
  | 'marshmallow'
  | 'peppermint'
  | 'gummy'
  | 'donut'
  | 'skittle';

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

/**
 * Pixel Sprite Definitions for Trumpagotchi LCD Display
 * 
 * 0 = Transparent / LCD background
 * 1 = Black/Dark outline (#)
 * 2 = Golden Comb-Over Hair (G)
 * 3 = Bright Red Necktie / MAGA cap (R)
 * 4 = Navy Blue Business Suit (B)
 * 5 = Crisp White Collar / Papers (W)
 * 6 = Warm Peach/Tan Skin Tone (S)
 * 7 = Hair Highlight / Gold Sparkle (Y)
 * 8 = Presidential Podium Wood (P)
 */

export type PixelGrid = number[][];

export function parseAsciiSprite(ascii: string[]): PixelGrid {
  return ascii.map(row => 
    row.split('').map(ch => {
      if (ch === ' ' || ch === '.') return 0;
      if (ch === '#') return 1; // Dark outline / LCD on
      if (ch === 'G') return 2; // Golden Hair
      if (ch === 'R') return 3; // Red Tie / Cap
      if (ch === 'B') return 4; // Navy Suit
      if (ch === 'W') return 5; // White Collar / Papers
      if (ch === 'S') return 6; // Skin / Tan
      if (ch === 'Y') return 7; // Bright Blonde Highlight
      if (ch === 'P') return 8; // Podium Brown
      return 1;
    })
  );
}

// ============================================================================
// 1. BABY DONALD SPRITE (Small version you grow into President!) - 24x24
// ============================================================================
export const SPRITE_TRUMP_BABY: PixelGrid = parseAsciiSprite([
  "........................",
  ".........YYYY...........",
  ".......GGGGYYYY.........",
  ".....GGGGGGGGYYYY.......",
  "....GGGGGGGGGGGGYY......",
  "....GGGGGGGGGGGGGG......",
  "...GGGG......GGGGG......",
  "..#SSSSSSSSSSSSSS#......",
  ".#SSSSSSSSSSSSSSSS#.....",
  ".#SS##SSSSSSSS##SS#.....",
  ".#SS##SSSSSSSS##SS#.....",
  ".#SSSSSSSSSSSSSSSS#.....",
  ".#SSSSSS#SS#SSSSSS#.....",
  "..#SSSSSS##SSSSSS#......",
  "...#SSSSSSSSSSSS#.......",
  "....##SSSSSSSS##........",
  ".....#WW#RR#WW#.........",
  "....#BBW#RR#WBB#........",
  "....#BBBB#R#BBBB#.......",
  "....#BBBB.R.BBBB#.......",
  ".....#BB.RRR.BB#........",
  ".....#S#..R..#S#........",
  "......#..YYY..#.........",
  "........................",
]);

// Baby Donald Idle 2 (Bouncing waddle with bottle)
export const SPRITE_TRUMP_BABY_2: PixelGrid = parseAsciiSprite([
  "........................",
  ".........YYYY...........",
  ".......GGGGYYYY.........",
  ".....GGGGGGGGYYYY.......",
  "....GGGGGGGGGGGGYY......",
  "....GGGGGGGGGGGGGG......",
  "...GGGG......GGGGG......",
  "..#SSSSSSSSSSSSSS#......",
  ".#SSSSSSSSSSSSSSSS#.....",
  ".#SS##SSSSSSSS##SS#.....",
  ".#SS##SSSSSSSS##SS#.....",
  ".#SSSSSSSSSSSSSSSS#.....",
  ".#SSSSSS#SS#SSSSSS#.....",
  "..#SSSSSS##SSSSSS#......",
  "...#SSSSSSSSSSSS#.......",
  "....##SSSSSSSS##........",
  ".....#WW#RR#WW#.........",
  "....#BBW#RR#WBB#...Y....",
  "....#BBBB#R#BBBB#.YYY...",
  "....#BBBB.R.BBBB#.YYY...",
  ".....#BB.RRR.BB#...Y....",
  ".....#S#..R..#S#........",
  "......#.......#.........",
  "........................",
]);

// ============================================================================
// 2. ADULT DONALD IDLE 1 (32x32 Detailed Pixel Art - Unmistakable Trump!)
// Sweeping golden comb-over with forward crest, tanned skin, navy suit, long red tie
// ============================================================================
export const SPRITE_TRUMP_IDLE_1: PixelGrid = parseAsciiSprite([
  "...........YYYYYYYY.............",
  "........YYYYGGGGGGYYYY..........",
  "......YYGGGGGGGGGGGGYYYY........",
  "....YYGGGGGGGGGGGGGGGGYYYY......",
  "...YYGGGGGGGGGGGGGGGGGGYYYY.....",
  "..YYGGGGGGGGGGGGGGGGGGGGYYYY....",
  "..YYGGGGGGGGGGGGGGGGGGGGYYYY....",
  "...GGGGGGGG..........GGGGYY.....",
  "....#SSSSSSSSSSSSSSSSSS#........",
  "...#SSSSSSSSSSSSSSSSSSSS#.......",
  "..#SSSS##SSSSSSSSSS##SSSS#......",
  "..#SSSS##SSSSSSSSSS##SSSS#......",
  "..#SSSSSSSSSSSSSSSSSSSSSS#......",
  "...#SSSSSS#SSSSSS#SSSSSS#.......",
  "....#SSSSSS######SSSSSS#........",
  ".....#SSSSSSSSSSSSSSSS#.........",
  "......##SSSSSSSSSSSS##..........",
  "........#SSSSSSSSSS#............",
  "........#WW#RRRR#WW#............",
  ".......#BBBW#RR#WBBB#...........",
  "......#BBBBBW#R#WBBBB#..........",
  ".....#BBBBBBB#R#BBBBBB#.........",
  ".....#BBBBBBB#R#BBBBBB#.........",
  ".....#BBBBBBB#R#BBBBBB#.........",
  "......#BBBBBB#R#BBBBBB#.........",
  "......#BBBBBB#R#BBBBBB#.........",
  ".......#BBBB#RR#BBBB#...........",
  ".......#S#..#RR#..#S#...........",
  "........#...#RR#...#............",
  "............#RR#................",
  "............#RR#................",
  ".............##.................",
]);

// Adult Donald Idle 2 (Hair gleam & confident smirk bounce)
export const SPRITE_TRUMP_IDLE_2: PixelGrid = parseAsciiSprite([
  "...........YYYYYYYY.............",
  "........YYYYGGGGGGYYYY..........",
  "......YYGGGGGGGGGGGGYYYY........",
  "....YYGGGGGGGGGGGGGGGGYYYY......",
  "...YYGGGGGGGGGGGGGGGGGGYYYY.....",
  "..YYGGGGGGGGGGGGGGGGGGGGYYYY....",
  "..YYGGGGGGGGGGGGGGGGGGGGYYYY....",
  "...GGGGGGGG..........GGGGYY.....",
  "....#SSSSSSSSSSSSSSSSSS#........",
  "...#SSSSSSSSSSSSSSSSSSSS#.......",
  "..#SSSS##SSSSSSSSSS##SSSS#......",
  "..#SSSS##SSSSSSSSSS##SSSS#......",
  "..#SSSSSSSSSSSSSSSSSSSSSS#......",
  "...#SSSSSS#SSSSSS#SSSSSS#.......",
  "....#SSSSSS######SSSSSS#........",
  ".....#SSSSSSSSSSSSSSSS#.........",
  "......##SSSSSSSSSSSS##..........",
  "........#SSSSSSSSSS#............",
  "........#WW#RRRR#WW#............",
  ".......#BBBW#RR#WBBB#...........",
  "......#BBBBBW#R#WBBBB#..........",
  ".....#BBBBBBB#R#BBBBBB#....S....",
  ".....#BBBBBBB#R#BBBBBB#...SSS...",
  ".....#BBBBBBB#R#BBBBBB#...#S#...",
  "......#BBBBBB#R#BBBBBB#....#....",
  "......#BBBBBB#R#BBBBBB#.........",
  ".......#BBBB#RR#BBBB#...........",
  ".......#S#..#RR#................",
  "........#...#RR#................",
  "............#RR#................",
  "............#RR#................",
  ".............##.................",
]);

// ============================================================================
// 3. TRUMP TALKING / GESTURING (Accordion Hands & Pointing Finger!)
// ============================================================================
export const SPRITE_TRUMP_TALK: PixelGrid = parseAsciiSprite([
  "...........YYYYYYYY.............",
  "........YYYYGGGGGGYYYY..........",
  "......YYGGGGGGGGGGGGYYYY........",
  "....YYGGGGGGGGGGGGGGGGYYYY......",
  "...YYGGGGGGGGGGGGGGGGGGYYYY.....",
  "..YYGGGGGGGGGGGGGGGGGGGGYYYY....",
  "..YYGGGGGGGGGGGGGGGGGGGGYYYY....",
  "...GGGGGGGG..........GGGGYY.....",
  "....#SSSSSSSSSSSSSSSSSS#........",
  "...#SSSSSSSSSSSSSSSSSSSS#...S...",
  "..#SSSS##SSSSSSSSSS##SSSS#..SS..",
  "..#SSSS##SSSSSSSSSS##SSSS#...S..",
  "..#SSSSSSSSSSSSSSSSSSSSSS#...S..",
  "...#SSSSSS#SSSSSS#SSSSSS#...SS..",
  "....#SSSSSS######SSSSSS#....S...",
  ".....#SSSSSSSSSSSSSSSS#.....#...",
  "......##SSSSSSSSSSSS##..........",
  "........#SSSSSSSSSS#............",
  "...S....#WW#RRRR#WW#............",
  "..SS...#BBBW#RR#WBBB#...........",
  "..SS..#BBBBBW#R#WBBBB#..........",
  "...S.#BBBBBBB#R#BBBBBB#.........",
  "....#BBBBBBBB#R#BBBBBBB#........",
  "....#BBBBBBBB#R#BBBBBBB#........",
  ".....#BBBBBBB#R#BBBBBB#.........",
  "......#BBBBBB#R#BBBBBB#.........",
  ".......#BBBB#RR#BBBB#...........",
  "........#...#RR#...#............",
  "............#RR#................",
  "............#RR#................",
  "............#RR#................",
  ".............##.................",
]);

// ============================================================================
// 4. TRUMP EATING BURGER (Two-handed Double Cheeseburger with bites)
// ============================================================================
export const SPRITE_TRUMP_EAT: PixelGrid = parseAsciiSprite([
  "...........YYYYYYYY.............",
  "........YYYYGGGGGGYYYY..........",
  "......YYGGGGGGGGGGGGYYYY........",
  "....YYGGGGGGGGGGGGGGGGYYYY......",
  "...YYGGGGGGGGGGGGGGGGGGYYYY.....",
  "..YYGGGGGGGGGGGGGGGGGGGGYYYY....",
  "..YYGGGGGGGGGGGGGGGGGGGGYYYY....",
  "...GGGGGGGG..........GGGGYY.....",
  "....#SSSSSSSSSSSSSSSSSS#........",
  "...#SSSSSSSSSSSSSSSSSSSS#.......",
  "..#SSSS##SSSSSSSSSS##SSSS#......",
  "..#SSSS##SSSSSSSSSS##SSSS#......",
  "..#SSSSSSSSSSSSSSSSSSSSSS#......",
  "...#SSSSSS#SSSSSS#SSSSSS#.......",
  "....#SSSSS########SSSSS#........",
  ".....#SSSS########SSSS#.........",
  "......##SSSSSSSSSSSS##..........",
  "........#SSSSSSSSSS#............",
  "........#WW#RRRR#WW#............",
  "......#S#BBW#RR#WBB#S#..........",
  ".....#SSSS#GGGGGG#SSSS#.........",
  ".....#SSSS#GGGGGG#SSSS#.........",
  "......#SS#RRRRRRRR#SS#..........",
  ".......#S#GGGGGGGG#S#...........",
  "........#BBBB##BBBB#............",
  "........#BBBB##BBBB#............",
  ".........#BB#RR#BB#.............",
  "..........#.#RR#.#..............",
  "............#RR#................",
  "............#RR#................",
  "............#RR#................",
  ".............##.................",
]);

// ============================================================================
// 5. TRUMP RALLY / PODIUM (Red MAGA Cap, Presidential Podium & Seal)
// ============================================================================
export const SPRITE_TRUMP_RALLY: PixelGrid = parseAsciiSprite([
  ".........RRRRRRRRRRRR...........",
  ".......RRRRRRRRRRRRRRRR.........",
  "......RRRRRRRRRRRRRRRRRR........",
  ".....RRRRRRRRRRRRRRRRRRRR.......",
  "....RRRRRRRRWWWWWRRRRRRRRR......",
  "....RRRRRRRRWWWWWRRRRRRRRR......",
  ".....RRRRRRRRRRRRRRRRRRRR.......",
  "...GGGGGGGG..........GGGGYY.....",
  "....#SSSSSSSSSSSSSSSSSS#........",
  "...#SSSSSSSSSSSSSSSSSSSS#.......",
  "..#SSSS##SSSSSSSSSS##SSSS#......",
  "..#SSSS##SSSSSSSSSS##SSSS#......",
  "..#SSSSSSSSSSSSSSSSSSSSSS#......",
  "...#SSSSSS#SSSSSS#SSSSSS#.......",
  "....#SSSSSS######SSSSSS#........",
  ".....#SSSSSSSSSSSSSSSS#.........",
  "......##SSSSSSSSSSSS##..........",
  "........#SSSSSSSSSS#............",
  "........#WW#RRRR#WW#............",
  ".......#BBBW#RR#WBBB#...........",
  "......#BBBBBW#R#WBBBB#..........",
  ".....PPPPPPPPPPPPPPPPPP.........",
  ".....PPPPPP#P#PP#P#PPPP.........",
  ".....PPPPPPP#####PPPPPP.........",
  ".....PPPPPPP#YYY#PPPPPP.........",
  ".....PPPPPPP#YYY#PPPPPP.........",
  ".....PPPPPPP#####PPPPPP.........",
  ".....PPPPPPPPPPPPPPPPPP.........",
  ".....PPPPPPPPPPPPPPPPPP.........",
  ".....PPPPPPPPPPPPPPPPPP.........",
  "......PPPPPPPPPPPPPPPP..........",
  ".......PPPPPPPPPPPPPP...........",
]);

// ============================================================================
// 6. TRUMP GOLFING (Holding Golden Golf Driver)
// ============================================================================
export const SPRITE_TRUMP_GOLF: PixelGrid = parseAsciiSprite([
  ".........WWWWWWWWWWWW...........",
  ".......WWWWWWWWWWWWWWWW.........",
  "......WWWWWWWWWWWWWWWWWW........",
  ".....WWWWWWWWWWWWWWWWWWWW.......",
  "....WWWWWWWWWWWWWWWWWWWWWW......",
  "....WWWWWWWWWWWWWWWWWWWWWW......",
  "...GGGGGGGG..........GGGGYY.....",
  "....#SSSSSSSSSSSSSSSSSS#........",
  "...#SSSSSSSSSSSSSSSSSSSS#.......",
  "..#SSSS##SSSSSSSSSS##SSSS#...YY.",
  "..#SSSS##SSSSSSSSSS##SSSS#..YYYY",
  "..#SSSSSSSSSSSSSSSSSSSSSS#...YY.",
  "...#SSSSSS#SSSSSS#SSSSSS#....Y..",
  "....#SSSSSS######SSSSSS#.....Y..",
  ".....#SSSSSSSSSSSSSSSS#......Y..",
  "......##SSSSSSSSSSSS##.......Y..",
  "........#SSSSSSSSSS#.........Y..",
  "........#WW#WWWW#WW#.........Y..",
  ".......#WWWWWWWWWWWW#........Y..",
  "......#WWWWWWWWWWWWWW#.......Y..",
  ".....#WWWWWWWWWWWWWWWW#......Y..",
  ".....#WWWWWWWWWWWWWWWW#......Y..",
  ".....#WWWWWWWWWWWWWWWW#......Y..",
  "......#WWWWWWWWWWWWWW#.......Y..",
  "......#WWWWWWWWWWWWWW#.......Y..",
  ".......#WWWW####WWWW#........Y..",
  ".......#S#..####..#S#........Y..",
  "........#...####...#.........Y..",
  "............####.............Y..",
  "............####.............Y..",
  "............####.............Y..",
  "............####.............Y..",
]);

// ============================================================================
// 7. TRUMP SLEEPING (Silk Eye Mask with "45" and Zzz)
// ============================================================================
export const SPRITE_TRUMP_SLEEP: PixelGrid = parseAsciiSprite([
  "...........YYYYYYYY.............",
  "........YYYYGGGGGGYYYY....ZZ....",
  "......YYGGGGGGGGGGGGYYYY...Z....",
  "....YYGGGGGGGGGGGGGGGGYYYYZZ....",
  "...YYGGGGGGGGGGGGGGGGGGYYYY.....",
  "..YYGGGGGGGGGGGGGGGGGGGGYYYY....",
  "..YYGGGGGGGGGGGGGGGGGGGGYYYY....",
  "...GGGGGGGG..........GGGGYY.ZZ..",
  "....#BBBBBBBBBBBBBBBBBB#.....Z..",
  "...#BBBBBBBBBBBBBBBBBBBB#...ZZ..",
  "..#BBBB#Y##YY#BBBBBBBBBBB#......",
  "..#BBBB#Y##YY#BBBBBBBBBBB#......",
  "..#BBBB#YYYYY#BBBBBBBBBBB#......",
  "...#BBBBBB#YY#BBBBBBBBBB#.......",
  "....#BBBBBBBBBBBBBBBBBB#........",
  ".....#SSSSSSSSSSSSSSSS#.........",
  "......##SSSSSSSSSSSS##..........",
  "........#SSSSSSSSSS#............",
  "........#WW#RRRR#WW#............",
  ".......#BBBW#RR#WBBB#...........",
  "......#BBBBBW#R#WBBBB#..........",
  ".....#BBBBBBB#R#BBBBBB#.........",
  ".....#BBBBBBB#R#BBBBBB#.........",
  ".....#BBBBBBB#R#BBBBBB#.........",
  "......#BBBBBB#R#BBBBBB#.........",
  "......#BBBBBB#R#BBBBBB#.........",
  ".......#BBBB#RR#BBBB#...........",
  ".......#S#..#RR#..#S#...........",
  "........#...#RR#...#............",
  "............#RR#................",
  "............#RR#................",
  ".............##.................",
]);

// ============================================================================
// 8. TRUMP GROOMING (Golden comb through the hair with sparkles)
// ============================================================================
export const SPRITE_TRUMP_GROOM: PixelGrid = parseAsciiSprite([
  "...........YYYYYYYY....YYY......",
  "........YYYYGGGGGGYYYY.YYYY.....",
  "......YYGGGGGGGGGGGGYY.YYY......",
  "....YYGGGGGGGGGGGGGGGGYYYY......",
  "...YYGGGGGGGGGGGGGGGGGGYYYY.....",
  "..YYGGGGGGGGGGGGGGGGGGGGYYYY....",
  "..YYGGGGGGGGGGGGGGGGGGGGYYYY....",
  "...GGGGGGGG..........GGGGYY.....",
  "....#SSSSSSSSSSSSSSSSSS#........",
  "...#SSSSSSSSSSSSSSSSSSSS#.......",
  "..#SSSS##SSSSSSSSSS##SSSS#..YY..",
  "..#SSSS##SSSSSSSSSS##SSSS#.YYYY.",
  "..#SSSSSSSSSSSSSSSSSSSSSS#..YY..",
  "...#SSSSSS#SSSSSS#SSSSSS#.......",
  "....#SSSSSS######SSSSSS#........",
  ".....#SSSSSSSSSSSSSSSS#.........",
  "......##SSSSSSSSSSSS##..........",
  "........#SSSSSSSSSS#............",
  "........#WW#RRRR#WW#............",
  ".......#BBBW#RR#WBBB#...........",
  "......#BBBBBW#R#WBBBB#..........",
  ".....#BBBBBBB#R#BBBBBB#.........",
  ".....#BBBBBBB#R#BBBBBB#.........",
  ".....#BBBBBBB#R#BBBBBB#.........",
  "......#BBBBBB#R#BBBBBB#.........",
  "......#BBBBBB#R#BBBBBB#.........",
  ".......#BBBB#RR#BBBB#...........",
  ".......#S#..#RR#..#S#...........",
  "........#...#RR#...#............",
  "............#RR#................",
  "............#RR#................",
  ".............##.................",
]);

// ============================================================================
// 9. TRUMP ANGRY / HANGRED TANTRUM
// ============================================================================
export const SPRITE_TRUMP_ANGRY: PixelGrid = parseAsciiSprite([
  "...........YYYYYYYY.............",
  "........YYYYGGGGGGYYYY..........",
  "......YYGGGGGGGGGGGGYYYY........",
  "....YYGGGGGGGGGGGGGGGGYYYY......",
  "...YYGGGGGGGGGGGGGGGGGGYYYY.....",
  "..YYGGGGGGGGGGGGGGGGGGGGYYYY....",
  "..YYGGGGGGGGGGGGGGGGGGGGYYYY....",
  "...GGGGGGGG..........GGGGYY.....",
  "....#SSSSSSSSSSSSSSSSSS#........",
  "...#SSSSSSSSSSSSSSSSSSSS#.......",
  "..#SSS####SSSSSSSS####SSS#......",
  "..#SSSS##SSSSSSSSSS##SSSS#......",
  "..#SSSSSSSSSSSSSSSSSSSSSS#......",
  "...#SSSSS#SSSSSSSS#SSSSS#.......",
  "....#SSSS##########SSSS#........",
  ".....#SSSS########SSSS#.........",
  "......##SSSSSSSSSSSS##..........",
  "........#SSSSSSSSSS#............",
  "........#WW#RRRR#WW#............",
  ".......#BBBW#RR#WBBB#...........",
  "......#BBBBBW#R#WBBBB#..........",
  ".....#BBBBBBB#R#BBBBBB#.........",
  ".....#BBBBBBB#R#BBBBBB#.........",
  ".....#BBBBBBB#R#BBBBBB#.........",
  "......#BBBBBB#R#BBBBBB#.........",
  "......#BBBBBB#R#BBBBBB#.........",
  ".......#BBBB#RR#BBBB#...........",
  ".......#S#..#RR#..#S#...........",
  "........#...#RR#...#............",
  "............#RR#................",
  "............#RR#................",
  ".............##.................",
]);

// Classified Document / Secret Paper Mess Sprite (12x12)
export const SPRITE_PAPER_MESS: PixelGrid = parseAsciiSprite([
  "WWWWWWWW....",
  "W......W....",
  "W.TOP..W....",
  "W.SECR.W....",
  "W.ET!..W....",
  "WWWWWWWW.WWW",
  "....W......W",
  "....W.CONF.W",
  "....W......W",
  "....WWWWWWWW",
  "............",
  "............",
]);

// Burger Item (12x12)
export const SPRITE_BURGER: PixelGrid = parseAsciiSprite([
  "...GGGGGG...",
  "..GGGGGGGG..",
  ".GGGGGGGGGG.",
  ".RRRRRRRRRR.",
  "GGGGGGGGGGGG",
  "############",
  ".GGGGGGGGGG.",
  "..GGGGGGGG..",
  "............",
  "............",
  "............",
  "............",
]);

// Trophy Item (12x12)
export const SPRITE_TROPHY: PixelGrid = parseAsciiSprite([
  ".GGGGGGGGGG.",
  "GG.GGGGGG.GG",
  "GG.GGGGGG.GG",
  ".G.GGGGGG.G.",
  "...GGGGGG...",
  "....GGGG....",
  ".....GG.....",
  ".....GG.....",
  "....GGGG....",
  "...GGGGGG...",
  "..GGGGGGGG..",
  "............",
]);

// Golf Ball & Flag (12x12)
export const SPRITE_GOLF_FLAG: PixelGrid = parseAsciiSprite([
  ".....RRRR...",
  ".....RRRR...",
  ".....RR.....",
  ".....#......",
  ".....#......",
  ".....#......",
  ".....#......",
  ".....#......",
  "....###.....",
  "............",
  "..##........",
  "..##........",
]);

// Heart Sparkle (8x8)
export const SPRITE_HEART: PixelGrid = parseAsciiSprite([
  ".RR.RR..",
  "RRRRRRR.",
  "RRRRRRR.",
  ".RRRRR..",
  "..RRR...",
  "...R....",
  "........",
  "........",
]);

// Exclamation Bubble Alert (8x8)
export const SPRITE_ALERT: PixelGrid = parseAsciiSprite([
  "..RRRR..",
  ".RRRRRR.",
  ".RR##RR.",
  ".RR##RR.",
  ".RR..RR.",
  ".RR##RR.",
  ".RRRRRR.",
  "..RRRR..",
]);

// ============================================================================
// 10. TRUMP DANCING (The Iconic Double-Fist Pump YMCA Groove) - 32x32
// ============================================================================
export const SPRITE_TRUMP_DANCE_1: PixelGrid = parseAsciiSprite([
  "...........YYYYYYYY.............",
  "........YYYYGGGGGGYYYY...S......",
  "......YYGGGGGGGGGGGGYYYY.SS.....",
  "....YYGGGGGGGGGGGGGGGGYYYYSS....",
  "...YYGGGGGGGGGGGGGGGGGGYYYYSS...",
  "..YYGGGGGGGGGGGGGGGGGGGGYYYY#...",
  "..YYGGGGGGGGGGGGGGGGGGGGYYYY....",
  "...GGGGGGGG..........GGGGYY.....",
  "....#SSSSSSSSSSSSSSSSSS#........",
  "...#SSSSSSSSSSSSSSSSSSSS#.......",
  "..#SSSS##SSSSSSSSSS##SSSS#......",
  "..#SSSS##SSSSSSSSSS##SSSS#......",
  "..#SSSSSSSSSSSSSSSSSSSSSS#......",
  "...#SSSSSS#SSSSSS#SSSSSS#.......",
  "....#SSSSS########SSSSS#........",
  ".....#SSSSSSSSSSSSSSSS#.........",
  "......##SSSSSSSSSSSS##..........",
  "........#SSSSSSSSSS#............",
  "...S....#WW#RRRR#WW#...S........",
  "..SS...#BBBW#RR#WBBB#.SS........",
  "..SS..#BBBBBW#R#WBBBB#SS........",
  "...S.#BBBBBBB#R#BBBBBB#S........",
  "....#BBBBBBBB#R#BBBBBBB#........",
  "....#BBBBBBBB#R#BBBBBBB#........",
  ".....#BBBBBBB#R#BBBBBB#.........",
  "......#BBBBBB#R#BBBBBB#.........",
  ".......#BBBB#RR#BBBB#...........",
  ".......#S#..#RR#..#S#...........",
  "........#...#RR#...#............",
  "............#RR#................",
  "............#RR#................",
  ".............##.................",
]);

export const SPRITE_TRUMP_DANCE_2: PixelGrid = parseAsciiSprite([
  "...........YYYYYYYY.............",
  "..S.....YYYYGGGGGGYYYY..........",
  ".SS...YYGGGGGGGGGGGGYYYY........",
  "SS..YYGGGGGGGGGGGGGGGGYYYY......",
  "..YYGGGGGGGGGGGGGGGGGGGGYYYY....",
  "..YYGGGGGGGGGGGGGGGGGGGGYYYY....",
  "...GGGGGGGG..........GGGGYY.....",
  "....#SSSSSSSSSSSSSSSSSS#........",
  "...#SSSSSSSSSSSSSSSSSSSS#.......",
  "..#SSSS##SSSSSSSSSS##SSSS#......",
  "..#SSSS##SSSSSSSSSS##SSSS#......",
  "..#SSSSSSSSSSSSSSSSSSSSSS#......",
  "...#SSSSSS#SSSSSS#SSSSSS#.......",
  "....#SSSSS########SSSSS#........",
  ".....#SSSSSSSSSSSSSSSS#.........",
  "......##SSSSSSSSSSSS##..........",
  "........#SSSSSSSSSS#............",
  "........#WW#RRRR#WW#...S........",
  ".......#BBBW#RR#WBBB#.SS........",
  "......#BBBBBW#R#WBBBB#SS........",
  ".....#BBBBBBB#R#BBBBBB#S........",
  ".....#BBBBBBB#R#BBBBBBB#........",
  ".....#BBBBBBB#R#BBBBBBB#........",
  "......#BBBBBB#R#BBBBBB#.........",
  "......#BBBBBB#R#BBBBBB#.........",
  ".......#BBBB#RR#BBBB#...........",
  ".......#S#..#RR#..#S#...........",
  "........#...#RR#...#............",
  "............#RR#................",
  "............#RR#................",
  ".............##.................",
  "................................",
]);

// ============================================================================
// 11. TRUMP YELLING AT TV NEWS ("FAKE NEWS!") - 32x32
// ============================================================================
export const SPRITE_TRUMP_TV_FAKENEWS_1: PixelGrid = parseAsciiSprite([
  "...........YYYYYYYY.............",
  "........YYYYGGGGGGYYYY..........",
  "......YYGGGGGGGGGGGGYYYY........",
  "....YYGGGGGGGGGGGGGGGGYYYY......",
  "...YYGGGGGGGGGGGGGGGGGGYYYY.....",
  "..YYGGGGGGGGGGGGGGGGGGGGYYYY....",
  "...GGGGGGGG..........GGGGYY.....",
  "....#RRRRRRRRRRRRRRRRRR#........",
  "...#RRRRRRRRRRRRRRRRRRRR#.......",
  "..#RRR####RRRRRRRR####RRR#......",
  "..#RRRR##RRRRRRRRRR##RRRR#......",
  "..#RRRRRRRRRRRRRRRRRRRRRR#......",
  "...#RRRRRR########RRRRRR#.......",
  "....#RRRRR########RRRRR#........",
  ".....#RRRR########RRRR#.........",
  "......##RRRRRRRRRRRR##..........",
  "........#RRRRRRRRRR#............",
  "...S....#WW#RRRR#WW#............",
  "..SS...#BBBW#RR#WBBB#...S.......",
  "..SS..#BBBBBW#R#WBBBB#..SS......",
  "...S.#BBBBBBB#R#BBBBBB#.SS......",
  "....#BBBBBBBB#R#BBBBBBB#S.......",
  "....#BBBBBBBB#R#BBBBBBB#........",
  ".....#BBBBBBB#R#BBBBBB#.........",
  "......#BBBBBB#R#BBBBBB#.........",
  ".......#BBBB#RR#BBBB#...........",
  ".......#S#..#RR#..#S#...........",
  "........#...#RR#...#............",
  "............#RR#................",
  "............#RR#................",
  ".............##.................",
  "................................",
]);

export const SPRITE_TRUMP_TV_FAKENEWS_2: PixelGrid = parseAsciiSprite([
  "..S........YYYYYYYY.........S...",
  ".SS.....YYYYGGGGGGYYYY.....SS...",
  ".SS...YYGGGGGGGGGGGGYYYY...SS...",
  "..S.YYGGGGGGGGGGGGGGGGYYYY.S....",
  "...YYGGGGGGGGGGGGGGGGGGYYYY.....",
  "..YYGGGGGGGGGGGGGGGGGGGGYYYY....",
  "...GGGGGGGG..........GGGGYY.....",
  "....#RRRRRRRRRRRRRRRRRR#........",
  "...#RRRRRRRRRRRRRRRRRRRR#.......",
  "..#RRR####RRRRRRRR####RRR#......",
  "..#RRRR##RRRRRRRRRR##RRRR#......",
  "..#RRRRRRRRRRRRRRRRRRRRRR#......",
  "...#RRRRRR########RRRRRR#.......",
  "....#RRRRR########RRRRR#........",
  ".....#RRRR########RRRR#.........",
  "......##RRRRRRRRRRRR##..........",
  "........#RRRRRRRRRR#............",
  "........#WW#RRRR#WW#............",
  ".......#BBBW#RR#WBBB#...........",
  "......#BBBBBW#R#WBBBB#..........",
  ".....#BBBBBBB#R#BBBBBB#.........",
  ".....#BBBBBBB#R#BBBBBB#.........",
  ".....#BBBBBBB#R#BBBBBB#.........",
  "......#BBBBBB#R#BBBBBB#.........",
  "......#BBBBBB#R#BBBBBB#.........",
  ".......#BBBB#RR#BBBB#...........",
  ".......#S#..#RR#..#S#...........",
  "........#...#RR#...#............",
  "............#RR#................",
  "............#RR#................",
  ".............##.................",
  "................................",
]);

// ============================================================================
// 12. RETRO CRT TELEVISION WITH NEWS STATIC (16x16)
// ============================================================================
export const SPRITE_CRT_TV: PixelGrid = parseAsciiSprite([
  "......#...#.....",
  ".......#.#......",
  "........#.......",
  "################",
  "#WWWWWWWWWWWWWW#",
  "#W............W#",
  "#W.R.R.W.W.R..W#",
  "#W..W...R...W.W#",
  "#W.FAKE.NEWS..W#",
  "#W............W#",
  "#WWWWWWWWWWWWWW#",
  "################",
  ".....######.....",
  ".....######.....",
  "....########....",
  "................",
]);

// Music Note (8x8)
export const SPRITE_MUSIC_NOTE: PixelGrid = parseAsciiSprite([
  "....YY..",
  "...YYY..",
  "...Y.Y..",
  "...Y.Y..",
  ".YYY.Y..",
  "YYYY.YY.",
  ".YY..YY.",
  ".....Y..",
]);

// "FAKE!" Speech Callout Bubble (16x10)
export const SPRITE_FAKE_BUBBLE: PixelGrid = parseAsciiSprite([
  "..############..",
  ".#RRRRRRRRRRRR#.",
  "#RR.FAKE!.NEWS.#",
  "#RRRRRRRRRRRRRR#",
  ".#RRRRRRRRRRRR#.",
  "..###########...",
  "....#RR#........",
  ".....#R#........",
  "......##........",
  "................",
]);

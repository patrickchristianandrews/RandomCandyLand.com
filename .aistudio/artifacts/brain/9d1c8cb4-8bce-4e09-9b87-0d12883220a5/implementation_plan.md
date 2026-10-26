# Implementation Plan: Crazy 3D Candy Land Remix (Multiplayer QR Sync)

Build a wild, hilarious, 3D interactive party game remix of Candy Land called **"Candy Land: Sugar Chaos 3D"** on `randomcandyland.com`, featuring live cross-device multiplayer via scannable QR codes, absurd characters, slapstick sabotage cards, gummy cannon traps, and constant laugh-out-loud moments.

---

## 1. High-Level Concept & Game Loop

### A. The Vibe: "Mario Party meets Candy Land on 500g of Pure Sugar"
- **3D Interactive Board (Three.js)**: A colorful, winding 3D rollercoaster rainbow track through Candy Land with animated landmark zones (The Candy Castle, Mount Sugar-Crush, Fudge Abyss, Peppermint Minefield, Donut Volcano).
- **Multiplayer with QR Code Sync**:
  - Host creates a room on computer or tablet &rarr; dynamic QR code is displayed on screen.
  - Friends scan with their phones (iPhone or Android) to instantly join the room as their wireless gamepad/character controller.
  - Real-time bidirectional WebSockets sync game state, card draws, dice rolls, and pawn animations across all screens simultaneously.
  - Single-player / Pass-and-Play mode is also fully supported with hilarious AI bots.

### B. Playable Absurd Characters
1. **Presidential Trumpagotchi** &mdash; *"Billionaire Comb-Over Maestro with 300% Tariff on Foreign Licorice"*
2. **Sir Reginald Fluffernutter III** &mdash; *"Sentient Marshmallow Attorney suing a waffle for emotional damages"*
3. **Baron Von Toothdecay** &mdash; *"A Peppermint Knight who is deathly afraid of pediatric dentists"*
4. **Sgt. Gummy Bear** &mdash; *"Dishonorably discharged from the Jello Armed Forces for eating the camouflage"*
5. **Madame Glaze-a-Lot** &mdash; *"An aggressively confused TikTok donut influencer streaming from a microwave"*
6. **Lil' Skittle-Brain** &mdash; *"Vibrating at 400 MPH from pure high-fructose corn syrup & existential dread"*

### C. Wild Gameplay Mechanics & Constant Engagement
- **The Crazy Card Deck**:
  - Draw hilarious movement & sabotage cards: e.g., *"Double Cherry Rocket"*, *"Sugar Shock Swap"* (swap spaces with the leader), *"Tax Fraud Audit"* (steal 50 sugar gems), *"Nuclear Pop Rocks"* (blast everyone within 3 tiles back).
- **The "WHAT?!" Absurd Event Generator**:
  - Every tile triggers bizarre random announcements that make players stop, say *"Wait, WHAT?!"* and laugh out loud.
  - Examples:
    - *"ALERT: The Department of Agriculture has declared your socks illegal in 48 states. Skip 1 turn."*
    - *"BZZZZT: You stepped on a heated gummy slug. Your dog now legally owns your car."*
    - *"CONGRATULATIONS: You won a lawsuit against a cloud. Advance 3 spaces and insult a bagel."*
- **Gummy Cannon & Trap System**:
  - Active traps on the 3D board: spring-loaded jelly trampolines, molten fudge slides, rolling jawbreakers, and aimable gummy cannons that players can fire at rivals on their phones!

---

## 1.5. Trumpagotchi Emergency Phone Notifications System
- **Real-Time Phone Lock Screen Alerts**:
  - When installed to an Apple iPhone or Android home screen, Trumpagotchi requests notification permissions (`Notification.requestPermission()`).
  - If Trump's vitals start going bad (Hunger drops below 25%, Health drops, Fake News polls sink below 30%, or messy classified papers pile up), the phone sends urgent executive alerts:
    - *"🚨 EMERGENCY EXECUTIVE MEMO: Donald is STARVING! Bring prime steaks immediately!"*
    - *"📺 RATINGS CRISIS: Fake news media is attacking! Tap to rally the base!"*
    - *"👑 COMB-OVER DISASTER: 40mph wind hit Mar-a-Lago! Urgent hair grooming needed!"*
    - *"💊 DR. JACKSON SUMMONS: Donald has low energy! Need emergency executive nap or vitamin pack!"*
  - Tapping the notification takes the user straight into the pocket pet to nurse him back to 100%!
  - Includes a dedicated **"🔔 Executive Phone Alerts"** toggle switch on the handheld shell and pause menu.

---

## 2. Technical Architecture & Tech Stack

1. **3D Visual Engine (`threejs`, `@types/three`)**:
   - Smooth 60fps WebGL rendering with playful lighting, soft shadows, particle trails, and interactive raycasting.
   - Procedural 3D track generator with curved splines, animated character pawns, rolling jawbreakers, and confetti cannons.
2. **Real-Time Multiplayer Server (`ws` WebSocket on `server.ts`)**:
   - Lightweight, robust server-authoritative room state engine.
   - Rooms indexed by short 4-letter codes (e.g., `YUMM`, `SUGR`, `CHOC`).
   - Handles room creation, player joins, turn progression, dice rolls, sabotage cards, and game over victory fanfare.
3. **QR Code Generator (`qrcode.react` / `qrcode`)**:
   - Generates instant SVG/Canvas QR codes for easy camera scanning on iOS Camera & Android Google Lens.
4. **Mobile Controller View**:
   - When joining on a phone via QR code, the player gets a tactile controller UI: roll dice, tap card deck, fire gummy cannons, trigger funny soundboards, and buzz haptic feedback!
5. **Audio Synthesizer & Voice Integration**:
   - Uses our existing audio synthesizers and audio clips for slapstick sound effects, honks, cartoon boings, and victory fanfare.

---

## 3. Step-by-Step Implementation Plan

### Step 1: Install Dependencies
- Install `three`, `@types/three`, `ws`, `@types/ws`, and `qrcode.react`.

### Step 2: Real-Time Server Engine (`server.ts` & `src/server/gameRooms.ts`)
- Implement room management, message types (`JOIN_ROOM`, `ROLL_DICE`, `DRAW_CARD`, `FIRE_CANNON`, `TRIGGER_TRAP`), and broadcast sync.

### Step 3: 3D Candy Land Canvas Component (`src/components/candyland3d/CandyLandCanvas.tsx`)
- Build the 3D curved rollercoaster track, themed terrain zones, lighting, animated pawns, and camera panning on player moves.

### Step 4: Absurd Cards & "What?!" Statement Engine (`src/utils/candyCards.ts`)
- Write 50+ outrageously funny, unexpected card events, traps, and sound triggers.

### Step 5: Mobile Gamepad & Host Controller (`src/pages/CandyLand3DPage.tsx`)
- Dual-mode view:
  - **Host / Big Screen Mode**: Full 3D board display with QR code in corner, animated pawns, leaderboard, and drama.
  - **Mobile Player Gamepad Mode**: Large touch buttons, card draw animations, slingshot gummy cannon controls.

### Step 6: Navigation & Homepage Integration
- Add a flashy, colorful portal link on `RandomCandyLandHome.tsx` and top bar: **"🍭 Play Candy Land 3D Sugar Chaos (Multiplayer)"**.

### Step 7: Build & Production Verification
- Run `npm run build`, compile standalone and server assets, push to GitHub on `main`, and verify live endpoints.

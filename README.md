# 🦖 Dino Dash — Wild Frontier
### High-Graphics 3D Endless Runner With Switchable Third-Person Camera & Prehistoric Species Collection

[![Build and Deploy to GitHub Pages](https://github.com/username/dino-dash-wild-frontier/actions/workflows/deploy.yml/badge.svg)](https://github.com/username/dino-dash-wild-frontier/actions/workflows/deploy.yml)
[![Tests: 23 Passed](https://img.shields.io/badge/Vitest-23%20Passed-brightgreen)](file:///d:/Dragon%20game/src/tests)
[![Platform: WebGL / HTML5](https://img.shields.io/badge/Platform-WebGL%20%7C%20HTML5-blue)](index.html)
[![Target: Intel UHD Graphics 60 FPS](https://img.shields.io/badge/Target-Intel%20UHD%2060%20FPS-orange)](src/graphics/RendererManager.ts)
[![Browser Play Link](https://starkarchitect.github.io/dino-dash-wild-frontier)
**Dino Dash — Wild Frontier** is a browser-based 3D endless runner built with **TypeScript**, **Three.js**, and **Vite**. Inspired by the classic dinosaur runner, it elevates the gameplay loop into an indie-grade 3D experience featuring **real-time switchable camera perspectives** (Cinematic Side-View and Third-Person Chase View), an articulated PBR-textured dinosaur character with 8 unlockable species, 3D collectible coins, a Paleo-Archive shop with interactive 3D rotating preview, dynamic canyon environments with Day/Dusk/Night cycles, responsive physics, procedural Web Audio sound synthesis, and graphics optimization tailored for **Intel UHD integrated graphics**.

---

## 🎮 Key Features

### 1. Dual Seamless Camera Modes (Press `V`)
- **Mode A: Cinematic Side-View**: Classic 2.5D side-on perspective framing the runner against layered red rock canyon mesas, rolling sand dunes, and distant atmospheric horizon.
- **Mode B: Third-Person Follow Camera**: Over-the-shoulder 3D chase camera looking forward behind and slightly above the dinosaur, providing true depth perception and obstacle visibility.
- **Seamless Real-Time Transition**: Toggle instantly mid-run with `V` or the on-screen camera pill without resetting position, speed, score, or active obstacles.

### 2. Prehistoric Species Collection & Paleo-Archive Shop
- **8 Unique Playable Dinosaur Variants**:
  1. 🦖 **Classic Rex** (*Common*): The balanced prehistoric pioneer.
  2. 🐆 **Swift Raptor** (*Uncommon*): +15% sprint velocity, feather crest, cheetah rosettes.
  3. 🪙 **Coin Hunter** (*Uncommon*): +35% magnetic coin radius, +25% coin yield, gilded scales.
  4. 🦘 **Jumper Rex** (*Rare*): +20% jump apex height, kangaroo hindquarters, desert quartz eyes.
  5. 🛡️ **Ironhide Triceratops** (*Rare*): Heavy bone frill, 3 brow horns, **Defensive Shield** absorbing 1 hazard hit.
  6. 🔥 **Ember Rex** (*Epic*): +30% score multiplier, obsidian volcanic plating, fiery amber eyes.
  7. 🔮 **Shadow Raptor** (*Legendary*): Midnight obsidian skin, +15% speed, +20% coins, +20% score multiplier.
  8. ❄️ **Frost Spinosaurus** (*Epic*): Crystalline dorsal sail, arctic cerulean hide, +25% magnet radius, +15% extra coins.
- **Interactive 3D Shop Preview**: Dedicated WebGL inspection turntable with inertia rotation, lighting, and real-time attribute comparisons.
- **Persistent Coin Economy**: 3D spinning gold coins scattered along high/low flight paths and ground corridors. Wallet and equipped dinosaur persist across browser sessions in `localStorage`.

### 3. High-Quality Articulated Dinosaur Character
- **Anatomy**: Hierarchical skeletal structure with articulated skull, hinged lower jaw with serrated teeth, expressive amber eyes, muscular neck and torso, dorsal spinal plates, predator clawed forearms, digitigrade hind legs, and a 5-segment counterbalanced tail.
- **PBR Texturing**: Procedural reptilian scale diffuse and bump/normal maps baked in-memory for instant loading and zero network dependencies.
- **State-Blended Animations**:
  - `run`: Sinusoidal leg cycles, spine bobbing, stabilization head counter-bob, and fluid multi-segment tail sway.
  - `jump`: Explosive upward leap with tucked talons and raised tail.
  - `fall`: Aerodynamic descent reaching for ground contact.
  - `land`: Vertical compression squash and shockwave dust burst.
  - `crouch`: Low streamlined sprint reducing character height by 55% to slide under flying hazards.
  - `hit`: Backward recoil, head snap, and collapse upon collision.

### 4. Living Procedural Canyon Environment
- Infinite procedural chunk streaming with seamless terrain stitching and automated object pooling.
- Layered sedimentary red sandstone mesas and buttes with geological strata.
- Saguaro cacti with fluted ridges and needle clusters, blooming prickly pears, and desert boulders placed safely on northern canyon flanks for 100% unobstructed camera sightlines.
- **Dynamic Day-Dusk-Night Cycle**: Atmosphere shifts smoothly from Golden Morning $\rightarrow$ High Noon $\rightarrow$ Sunset Orange/Red $\rightarrow$ Moonlit Night with glowing moon and star field.

### 5. Dynamic Obstacles & Fair Hitboxes
- **Small Saguaro Cacti**: Low jump obstacles.
- **Large Saguaro Clusters**: Tall multi-armed hazards requiring precise jump timing.
- **Sandstone Boulder Piles**: Wide ground obstacles.
- **Flying Pterosaurs**: Prehistoric flyers with flapping wings at two distinct altitudes:
  - *High Altitude* ($y \approx 2.45\text{m}$): Player must **crouch/duck** underneath!
  - *Low Altitude* ($y \approx 0.85\text{m}$): Player must **jump** over!
- Tight capsule/box intersection collision math (`CollisionMath`) ensuring crisp, fair gameplay.

### 6. Procedural Web Audio Engine
- 100% synthesized audio via the browser **Web Audio API** (zero external MP3/WAV files required, zero CORS errors).
- Synthesized sounds for footsteps, jump frequency sweeps, sub-bass landing impacts, crouch slides, collision crashes, game-over arpeggios, coin clinks, score milestone chimes, UI clicks, and continuous desert canyon wind ambiance.

### 7. Hardware Optimization for Intel UHD Graphics
- Three graphics presets: **Low**, **Medium (Default, optimized for Intel UHD)**, and **High**.
- Configurable shadow map resolutions (Off / 1024 / 2048), dynamic pixel ratio scaling, particle pooling, and geometry/texture disposal on chunk recycling.
- Real-time diagnostic FPS and hardware preset monitor pill.

---

## ⌨️ Controls Guide

| Action | Desktop Keyboard | Mouse / Touch Interface |
|---|---|---|
| **Jump** | `Space` / `↑` / `W` | Click/Tap `JUMP` Button |
| **Crouch / Duck** | `↓` / `S` | Click/Tap `DUCK` Button |
| **Switch Camera** | `V` | Click `[V] CAMERA TOGGLE` Pill |
| **Pause / Resume** | `ESC` / `P` | Click `⏸` HUD Button |
| **Restart Run** | `R` | Click `RETRY EXPEDITION` Button |
| **Mute Audio** | `M` | Click `🔊/🔇` HUD Button |

---

## 🚀 Quick Start (1-Click Launcher)

Simply double-click:
```
play.bat
```
(or `run_game.bat`) located directly in the root folder. It automatically checks Node.js, installs dependencies if needed, launches the local server, and opens **Dino Dash** in your default web browser!

---

## 🛠️ Manual Launch Commands

```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build & Preview
```bash
# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

### Automated Unit Tests
```bash
npm run test
```
Runs 23 automated unit tests across 5 test suites covering:
- Dino catalog attributes, variants, and fallback lookups (`DinoCatalog.test.ts`)
- Persistent coin wallet, transactions, and dinosaur purchases (`Economy.test.ts`)
- Game state transitions, score, and distance multipliers (`GameState.test.ts`)
- 3D jump clearance and crouch ducking hitboxes (`Collisions.test.ts`)
- Speed acceleration curves and distance scaling (`Difficulty.test.ts`)

---

## 📦 Distribution Packages

- **Standalone HTML5 Web ZIP**: `dino-dash-wild-frontier-web.zip` (ready to drag-and-drop upload directly to [Itch.io](https://itch.io) or Newgrounds).
- **GitHub Pages CI/CD**: Automatic zero-config deployment via `.github/workflows/deploy.yml` on push to `main`.
- **Relative Asset Paths**: Configured with `base: './'` in `vite.config.ts` so the game can be hosted at any domain root or nested repository subpath.

---

## 📁 Project Architecture

```
d:/Dragon game/
├── index.html                 # Main entry point & Glassmorphic UI overlays
├── package.json               # Dependencies (Three.js, Vite, TypeScript, Vitest)
├── tsconfig.json              # Strict TypeScript configuration
├── vite.config.ts             # Vite server & bundler config (base: './')
├── .github/workflows/         # GitHub Actions automated build & Pages deployment
│   └── deploy.yml
├── src/
│   ├── main.ts                # Bootstrap script
│   ├── style.css              # Responsive UI stylesheet with mobile landscape/portrait rules
│   ├── core/
│   │   ├── Game.ts            # Master coordinator & requestAnimationFrame loop
│   │   ├── GameState.ts       # Finite State Machine & metric progression
│   │   ├── InputManager.ts    # Debounced multi-input controller
│   │   └── EventBus.ts        # Decoupled pub-sub event bus
│   ├── graphics/
│   │   ├── RendererManager.ts # WebGLRenderer & graphics presets (Low/Med/High)
│   │   ├── CameraController.ts# Dual-mode camera with cubic easing transitions
│   │   ├── LightingManager.ts # Directional sun, hemisphere, and Day/Night cycles
│   │   └── TextureGenerator.ts# Procedural PBR reptilian scales, sand, rock textures
│   ├── entities/
│   │   ├── DinoCatalog.ts     # 8 dinosaur variants, rarity tiers, attribute modifiers
│   │   ├── DinoCharacter.ts   # Articulated 3D dinosaur anatomical hierarchy & attachments
│   │   ├── DinoAnimator.ts    # State-blended run/jump/land/crouch/hit controller
│   │   ├── CoinManager.ts     # 3D spinning coins, magnetic collection, sound triggers
│   │   ├── ObstacleFactory.ts # Saguaro, rock, and pterosaur obstacle builders
│   │   ├── Pterosaur.ts       # Flapping flying hazard
│   │   └── ObstacleManager.ts # Procedural spawner, pooling, and collision checking
│   ├── world/
│   │   ├── WorldGenerator.ts  # Seamless chunk streaming & mathematical Hermite terrain
│   │   ├── CanyonScenery.ts   # Layered red sandstone mesas and background scenery
│   │   └── ParticleSystem.ts  # Footstep dust, landing impacts, speed streaks
│   ├── audio/
│   │   └── SoundEngine.ts     # Procedural Web Audio API synthesizer
│   ├── ui/
│   │   ├── UIManager.ts       # DOM screens (Title, HUD, Pause, Settings, GameOver)
│   │   ├── ShopModal.ts       # Paleo-Archive & dinosaur skin store controller
│   │   └── ShopPreview.ts     # 3D rotating dinosaur turntable preview
│   ├── utils/
│   │   ├── Collisions.ts      # 3D AABB & Capsule collision detection
│   │   ├── Storage.ts         # LocalStorage persistence for records & wallet
│   │   └── FPSMonitor.ts      # Real-time framerate tracker & preset pill
│   └── tests/
│       ├── Collisions.test.ts # Jump clearance & crouch ducking unit tests
│       ├── Difficulty.test.ts # Speed acceleration curve unit tests
│       ├── DinoCatalog.test.ts# Species attributes and fallback unit tests
│       ├── Economy.test.ts    # Coin balance, unlock, and equip unit tests
│       └── GameState.test.ts  # State flow & high score persistence unit tests
```

---

## 📜 License
MIT License. Built for high-performance browser gaming.

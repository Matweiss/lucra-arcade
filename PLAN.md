# Lucra Arcade — Game Template Build Plan
**Version:** 1.0 | **Status:** Pre-build review  
**Starting game:** Kart Racing | **Next:** Golf, Pickleball

---

## 1. Product Vision

Lucra Arcade is a **white-label mini-game platform** sold to brands and companies as:
- A **licensed product** (flat fee)
- A **rev-share** deal
- An **add-on** to Lucra's existing services

Each game is a **brandable template** — same engine, swappable skin. Brands provide logos, colors, and assets. Lucra generates a custom build in minutes. Three templates ship first: **Kart Racing, Golf, Pickleball**.

The contest system mirrors Betr Arcade's proven model:
- **Free Play** — no stakes, unlimited runs
- **Practice** — warm-up, no score submission
- **Tournament** — one run submitted, top score wins after field closes
- **Skill Play** — asynchronous head-to-head, score settles the result

---

## 2. Technical Architecture

### Stack
| Layer | Choice | Reason |
|-------|--------|--------|
| Game engine | **Phaser 3** | Best 2D arcade framework; touch-ready; fast to prototype |
| Language | **ES6 modules** | Clean imports; no build step needed for prototype |
| Bundler | **Vite** (later) | Fast dev server; simple prod build |
| Config | **JSON/JS objects** | Brand skins live in config, never in gameplay code |
| Backend hooks | **REST stubs** | Plugs into Lucra backend when ready; no coupling now |

### Why not 3D / Unity / native?
- Asynchronous score-attack doesn't need real-time multiplayer → browser game wins
- Brands want **embeddable** experiences (iframe, webview, app shell) → web-first
- Speed to pitch > visual fidelity at this stage

---

## 3. File Structure

```
lucra-arcade/
├── PLAN.md                          ← this file
├── games/
│   └── racing/
│       ├── index.html               ← game entry point
│       ├── src/
│       │   ├── main.js              ← Phaser init, scene registration
│       │   ├── scenes/
│       │   │   ├── BootScene.js     ← asset preload
│       │   │   ├── MenuScene.js     ← title screen
│       │   │   ├── RaceScene.js     ← core gameplay loop
│       │   │   └── ResultScene.js   ← score breakdown + CTA
│       │   ├── systems/
│       │   │   ├── PlayerController.js   ← movement, crash, boost state
│       │   │   ├── TrackSystem.js        ← scrolling track, obstacle/gate/pad spawning
│       │   │   ├── ScoreSystem.js        ← all scoring logic + breakdown
│       │   │   └── BrandingSystem.js     ← applies brandConfig to all visuals
│       │   └── config/
│       │       ├── gameConfig.js    ← speeds, timings, scoring weights (tunable)
│       │       └── brandConfig.js   ← all brand-facing fields (DEFAULT + override pattern)
│       └── assets/
│           └── brands/
│               └── default/         ← placeholder assets
└── shared/                          ← reused across all 3 games (phase 2+)
    ├── contest/                     ← mode wrappers (free_play, tournament, skill_play)
    └── ui/                          ← shared result screen, leaderboard components
```

---

## 4. The brandConfig Schema (commercial cornerstone)

Every field a brand sponsor needs to provide. This is the intake form for sales.

```js
{
  // Identity
  name: 'Lucra Turbo Sprint',      // game title shown in UI
  sponsor: 'Lucra',                 // brand name
  tagline: 'Race. Score. Win.',

  // Colors
  colors: {
    primary: '#00E5FF',             // kart, UI accents, buttons
    secondary: '#FF6B00',           // boost, highlights
    background: '#0A0A1A',          // track bg
    trackLine: '#1A1A3A',           // lane dividers
    text: '#FFFFFF',
    textDim: '#888888',
  },

  // Assets (all optional — falls back to shapes/defaults)
  assets: {
    logo: null,                     // PNG, shown on menu + result screen
    kartSkin: null,                 // kart sprite sheet or PNG
    trackBanner: null,              // repeating side banner image
    boostIcon: null,                // pickup icon
    finishFlair: null,              // result screen background
  },

  // Copy
  copy: {
    menuCTA: 'Start Race',
    practiceCTA: 'Practice',
    resultHeading: 'Race Complete!',
    sponsorMessage: '',             // "Presented by Acme Corp"
    prizeText: '',                  // "Top score wins $500"
  },

  // Contest (connects to Lucra backend)
  contest: {
    mode: 'free_play',              // free_play | tournament | skill_play | practice
    entryFee: 0,
    prizePool: 0,
    maxEntries: null,
    submissionEndpoint: null,       // POST endpoint for score submission
  },
}
```

To create a branded version: `{ ...DEFAULT_BRAND, colors: { ...DEFAULT_BRAND.colors, primary: '#FF0000' }, ... }` — one object, no gameplay changes.

---

## 5. Gameplay Design — Kart Racing

### Core loop
- **Duration:** 60 seconds per run
- **View:** Top-down scrolling track
- **Input:** Left/right steer (keyboard or touch), boost (space/center tap)
- **Failure state:** Crash slows you down — does NOT end the run (keeps it fun and replayable)

### Scoring model
| Event | Points | Notes |
|-------|--------|-------|
| Distance | speed × 0.08 pts/px | Passive, rewards going fast |
| Gate hit | 150 pts | Gates spawn across lanes |
| Gate streak bonus | +75 per consecutive gate | Rewards consistency |
| Near miss | 200 pts | Passing within 30px of obstacle |
| Drift combo | 50 pts/sec | Sustained steering |
| Boost pad | 100 pts | Pickup on track |
| Finish bonus | 500 pts | Surviving the full 60s |

**Design intent:** Skill players optimize gate streaks and near misses. Casual players still score via distance. Score spread supports tournament differentiation.

### Track objects
| Object | Behavior |
|--------|---------|
| Obstacles | Cones, barriers — crash = slow |
| Gates | Pass through center = points |
| Boost pads | Speed burst + points |
| Lane lines | Visual only |

### Physics (intentionally arcade, not simulation)
- Constant forward scroll speed (scales with player speed)
- Left/right only — no actual physics engine needed
- Boost = speed multiplier for 1.2s
- Crash = speed penalty for 1.0s, flash red

---

## 6. Build Milestones

### Milestone 1 — Gray-box playable ✅ (in progress)
- [x] Project scaffolded
- [x] `gameConfig.js` + `brandConfig.js` defined
- [x] All 4 scenes created (Boot, Menu, Race, Result)
- [x] PlayerController (movement, crash, boost)
- [ ] TrackSystem (scrolling, obstacle/gate/pad spawning)
- [ ] ScoreSystem (all event types + breakdown)
- [ ] `main.js` + `index.html` wiring everything together
- [ ] **Playable in browser with no assets**

### Milestone 2 — Feel tuning
- [ ] Adjust speeds, spawn rates, scoring weights in `gameConfig.js`
- [ ] Add screen shake, sound stubs, particle flash on near miss
- [ ] Mobile touch controls validated
- [ ] Score curve feels fair and competitive at 60s

### Milestone 3 — Brand layer
- [ ] `BrandingSystem.js` applies colors + assets at runtime
- [ ] Build one demo branded skin (fake sponsor)
- [ ] Brand intake checklist finalized (sales tool)

### Milestone 4 — Contest wrappers
- [ ] Mode selector on menu (free play / tournament / skill play / practice)
- [ ] Score submission stub (POST to endpoint)
- [ ] Result screen shows mode-specific messaging

### Milestone 5 — Golf template (reuse 80% of racing)
- [ ] Swap `RaceScene` for `GolfScene` — swing timing mechanic
- [ ] Reuse Menu, Result, ScoreSystem, BrandingSystem unchanged
- [ ] New `gameConfig` for golf parameters

### Milestone 6 — Pickleball template
- [ ] Rally timing + placement mechanic
- [ ] Same shared layer reused

---

## 7. What Stays Shared Across All 3 Games

| Component | Shared? |
|-----------|---------|
| `brandConfig.js` schema | ✅ Identical |
| `MenuScene.js` | ✅ Reused |
| `ResultScene.js` | ✅ Reused |
| `BrandingSystem.js` | ✅ Reused |
| Contest mode wrappers | ✅ Reused |
| `ScoreSystem.js` | ✅ Reused (different events per game) |
| `PlayerController.js` | ❌ Game-specific |
| `TrackSystem.js` / course logic | ❌ Game-specific |
| `gameConfig.js` | ❌ Game-specific values |

---

## 8. What NOT to Build Yet

- Real-money transaction logic in frontend
- Actual multiplayer / real-time opponents
- 3D graphics or physics engine
- Custom asset pipeline / CMS
- Native mobile app (web-first wins for pitching)
- Sound system (stub it, add later)

---

## 9. Open Questions for Review

1. **Phaser via CDN vs. npm + Vite?** CDN is faster to prototype; Vite gives better long-term DX. Recommend: CDN for M1, switch to Vite at M3.
2. **Score submission:** Does Lucra have a backend endpoint ready, or should the stub POST to a local mock server?
3. **Touch zones:** Left/right/boost split at 33%/33%/33%. Should boost be a button instead?
4. **60s duration:** Right for skill play? Betr uses variable lengths. Worth A/B testing at M2.
5. **Gate design:** Fixed 3-lane gates vs. random single-lane gaps? Random is harder, more skill-differentiating.

---

## 10. Immediate Next Step

Complete Milestone 1:
1. `TrackSystem.js` — scrolling lanes, spawner logic
2. `ScoreSystem.js` — all events, breakdown getter
3. `main.js` + `index.html` — wire Phaser + all scenes
4. Open in browser — car moves, obstacles appear, score counts, result screen shows

**No art. No sound. Just playable.**

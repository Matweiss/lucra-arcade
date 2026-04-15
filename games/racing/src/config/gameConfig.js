// gameConfig.js — Core game constants. Tune these without touching gameplay code.
export const GAME_CONFIG = {
  width: 400,
  height: 700,
  duration: 60,          // seconds per run
  targetFPS: 60,

  player: {
    speed: 310,          // base forward speed (px/s) — snappier start
    maxSpeed: 560,       // speed cap — feels fast without losing control
    acceleration: 22,    // speed gain per second — reaches max ~midway through run
    steerSpeed: 290,     // lateral movement (px/s) — responsive lane switching
    boostMultiplier: 1.7,
    boostDuration: 1.4,  // seconds — long enough to feel rewarding
    crashSlowDuration: 0.8, // shorter recovery — less punishing, more fun
    crashSpeedFactor: 0.35,
  },

  scoring: {
    distancePerPixel: 0.06,  // slightly lower — distance is passive, shouldn't dominate
    gateHit: 175,
    gateStreak: 100,         // bigger streak reward — incentivizes skill
    nearMiss: 250,           // near misses are the highlight play
    nearMissWindow: 34,
    driftCombo: 60,          // per second of sustained drift
    boostPad: 120,
    finishBonus: 500,
  },

  track: {
    scrollSpeed: 310,     // matches player base speed
    laneWidth: 80,
    lanes: 5,
    obstacleSpawnRate: 1.6,   // slightly denser — more near-miss opportunities
    boostPadRate: 0.22,
    gateSpawnRate: 0.55,
  },

  // M2: Visual juice config
  fx: {
    crashShakeIntensity: 0.018,
    crashShakeDuration: 280,
    nearMissFlashDuration: 200,
    nearMissParticleCount: 8,
    boostFlashDuration: 150,
    scorePopupDuration: 1000,
    scorePopupRise: 60,
  },
};

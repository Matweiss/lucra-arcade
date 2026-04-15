// gameConfig.js — Core game constants. Tune these without touching gameplay code.
export const GAME_CONFIG = {
  width: 400,
  height: 700,
  duration: 60,          // seconds per run
  targetFPS: 60,

  player: {
    speed: 280,          // base forward speed (px/s)
    maxSpeed: 520,       // speed cap
    acceleration: 18,    // speed gain per second
    steerSpeed: 260,     // lateral movement (px/s)
    boostMultiplier: 1.6,
    boostDuration: 1.2,  // seconds
    crashSlowDuration: 1.0,
    crashSpeedFactor: 0.4,
  },

  scoring: {
    distancePerPixel: 0.08,
    gateHit: 150,
    gateStreak: 75,       // bonus per gate in streak (cumulative)
    nearMiss: 200,        // passing within 30px of obstacle
    nearMissWindow: 30,
    driftCombo: 50,       // per second of sustained drift
    boostPad: 100,
    finishBonus: 500,     // awarded if player survives full run
  },

  track: {
    scrollSpeed: 280,     // matches player base speed
    laneWidth: 80,
    lanes: 5,
    obstacleSpawnRate: 1.4,   // obstacles per second
    boostPadRate: 0.18,
    gateSpawnRate: 0.5,
  },
};

export class ScoreSystem {
  constructor(config) {
    this._config = config;
    this.score = 0;
    this._breakdown = {
      distance: 0,
      gates: 0,
      nearMisses: 0,
      drift: 0,
      boostPads: 0,
      finish: 0,
    };
    this._driftAccum = 0;
  }

  addDistance(pixels, rate) {
    const pts = Math.floor(pixels * rate);
    this.score += pts;
    this._breakdown.distance += pts;
  }

  addGate(streak) {
    const base = this._config.gateHit;
    const bonus = Math.max(0, streak - 1) * this._config.gateStreak;
    const pts = base + bonus;
    this.score += pts;
    this._breakdown.gates += pts;
    return pts;
  }

  addNearMiss() {
    const pts = this._config.nearMiss;
    this.score += pts;
    this._breakdown.nearMisses += pts;
    return pts;
  }

  addDrift(dt) {
    this._driftAccum += dt;
    if (this._driftAccum >= 1.0) {
      const pts = this._config.driftCombo;
      this.score += pts;
      this._breakdown.drift += pts;
      this._driftAccum -= 1.0;
      return pts;
    }
    return 0;
  }

  addBoostPad() {
    const pts = this._config.boostPad;
    this.score += pts;
    this._breakdown.boostPads += pts;
    return pts;
  }

  addFinishBonus() {
    const pts = this._config.finishBonus;
    this.score += pts;
    this._breakdown.finish += pts;
    return pts;
  }

  getBreakdown() {
    return { ...this._breakdown };
  }
}

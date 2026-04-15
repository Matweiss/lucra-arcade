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
    this._events = [];
    this._startTs = Date.now();
  }

  _record(type, delta, meta = {}) {
    this._events.push({ type, ts: Date.now() - this._startTs, delta, ...meta });
  }

  addDistance(pixels, rate) {
    const pts = Math.floor(pixels * rate);
    this.score += pts;
    this._breakdown.distance += pts;
    // Distance is high-frequency; batch into the event log only when significant
    if (pts > 0 && this._events.length % 10 === 0) {
      this._record('distance', pts, { pixels: Math.floor(pixels) });
    }
  }

  addGate(streak) {
    const base = this._config.gateHit;
    const bonus = Math.max(0, streak - 1) * this._config.gateStreak;
    const pts = base + bonus;
    this.score += pts;
    this._breakdown.gates += pts;
    this._record('gate', pts, { streak });
    return pts;
  }

  addNearMiss() {
    const pts = this._config.nearMiss;
    this.score += pts;
    this._breakdown.nearMisses += pts;
    this._record('near_miss', pts);
    return pts;
  }

  addDrift(dt) {
    this._driftAccum += dt;
    if (this._driftAccum >= 1.0) {
      const pts = this._config.driftCombo;
      this.score += pts;
      this._breakdown.drift += pts;
      this._driftAccum -= 1.0;
      this._record('drift', pts);
      return pts;
    }
    return 0;
  }

  addBoostPad() {
    const pts = this._config.boostPad;
    this.score += pts;
    this._breakdown.boostPads += pts;
    this._record('boost_pad', pts);
    return pts;
  }

  addFinishBonus() {
    const pts = this._config.finishBonus;
    this.score += pts;
    this._breakdown.finish += pts;
    this._record('finish', pts);
    return pts;
  }

  getBreakdown() {
    return { ...this._breakdown };
  }

  /**
   * Returns the structured event log for anti-cheat score submission.
   * The server replays events to verify the final score is plausible.
   *
   * Shape: { sessionId, startTs, duration, events: [{type, ts, delta, ...meta}], finalScore, breakdown }
   */
  getEventLog(sessionId) {
    const duration = Date.now() - this._startTs;
    return {
      sessionId: sessionId || null,
      startTs: this._startTs,
      duration,
      events: [...this._events],
      finalScore: this.score,
      breakdown: this.getBreakdown(),
    };
  }
}

/**
 * ContestClient — shared contest submission wrapper
 *
 * Used by all Lucra Arcade games. Handles score submission via the
 * event-log format (anti-cheat), session management, and result polling.
 *
 * Games call: ContestClient.submit(scoreSystem.getEventLog(sessionId))
 */

export class ContestClient {
  constructor(brandConfig) {
    this._cfg = brandConfig?.contest ?? {};
  }

  /**
   * Submit an event-log score payload to the contest endpoint.
   * @param {object} eventLog - from ScoreSystem.getEventLog()
   * @returns {Promise<{ok: boolean, rank?: number, error?: string}>}
   */
  async submit(eventLog) {
    const endpoint = this._cfg.submissionEndpoint;
    if (!endpoint) {
      console.warn('[ContestClient] No submissionEndpoint configured — skipping submit');
      return { ok: false, error: 'no_endpoint' };
    }

    const payload = {
      schemaVersion: 1,
      sessionId: eventLog.sessionId,
      startTs: eventLog.startTs,
      duration: eventLog.duration,
      events: eventLog.events,
      finalScore: eventLog.finalScore,
      breakdown: eventLog.breakdown,
    };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return { ok: false, error: `http_${res.status}` };
      const data = await res.json();
      return { ok: true, rank: data.rank, totalEntries: data.totalEntries };
    } catch (err) {
      console.error('[ContestClient] Submit failed:', err);
      return { ok: false, error: err.message };
    }
  }

  /**
   * Generate a client-side session ID.
   * Prefixed with brandConfig.analytics.sessionIdPrefix if set.
   */
  static generateSessionId(brandConfig) {
    const prefix = brandConfig?.analytics?.sessionIdPrefix ?? 'la';
    const rand = Math.random().toString(36).slice(2, 10);
    return `${prefix}_${Date.now()}_${rand}`;
  }
}

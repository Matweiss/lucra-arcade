import { GAME_CONFIG } from '../config/gameConfig.js';
import { DEFAULT_BRAND } from '../config/brandConfig.js';
import { ScoreSystem } from '../systems/ScoreSystem.js';
import { TrackSystem } from '../systems/TrackSystem.js';
import { PlayerController } from '../systems/PlayerController.js';

export class RaceScene extends Phaser.Scene {
  constructor() { super('Race'); }

  init(data) {
    this.mode = data.mode || 'free_play';
  }

  create() {
    const { width, height } = this.scale;
    const G = GAME_CONFIG;
    const B = DEFAULT_BRAND;

    this._width = width;
    this._height = height;
    this._running = false;
    this._finished = false;
    this._timeLeft = G.duration;

    // Systems
    this.scoreSystem = new ScoreSystem(G.scoring);
    this.trackSystem = new TrackSystem(this, G, B, width, height);
    this.playerController = new PlayerController(this, G, B, width, height);

    // HUD
    this._buildHUD(B);

    // Countdown then go
    this._startCountdown(B);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({ left: 'A', right: 'D', boost: 'SPACE' });

    // Touch input
    this._setupTouchInput(width, height, B);

    // FX layer (particles, flashes)
    this._fxGfx = this.add.graphics().setDepth(12);
    this._particles = [];
  }

  update(time, delta) {
    if (!this._running || this._finished) return;

    const dt = delta / 1000;
    const G = GAME_CONFIG;

    // Input
    const leftHeld = this.cursors.left.isDown || this.wasd.left.isDown || this._touchLeft;
    const rightHeld = this.cursors.right.isDown || this.wasd.right.isDown || this._touchRight;
    const boostHeld = this.cursors.up.isDown || this.wasd.boost.isDown || this._touchBoost;

    // Update systems
    this.playerController.update(dt, leftHeld, rightHeld, boostHeld);
    this.trackSystem.update(dt, this.playerController.currentSpeed);

    // Collision: obstacles
    const playerBounds = this.playerController.getBounds();
    const { hit, nearMiss } = this.trackSystem.checkCollisions(playerBounds, G.scoring.nearMissWindow);

    if (hit && !this.playerController.crashed) {
      this.playerController.triggerCrash();
      this.cameras.main.shake(G.fx.crashShakeDuration, G.fx.crashShakeIntensity);
      this._flashScreen(0xff4444, 0.3, G.fx.crashShakeDuration);
    }

    if (nearMiss) {
      const pts = this.scoreSystem.addNearMiss();
      const px = this.playerController.getPosition();
      this._showFloatingAt('+' + pts + ' NEAR MISS!', px.x, px.y - 40, 0xff6b00);
      this._spawnParticleBurst(px.x, px.y, 0xff6b00, G.fx.nearMissParticleCount);
      this._flashScreen(0xff6b00, 0.15, G.fx.nearMissFlashDuration);
    }

    // Collision: gates
    const gateResult = this.trackSystem.checkGates(playerBounds);
    if (gateResult.hit) {
      const pts = this.scoreSystem.addGate(gateResult.streak);
      const px = this.playerController.getPosition();
      const streakLabel = gateResult.streak > 1 ? ' x' + gateResult.streak + ' STREAK!' : '';
      this._showFloatingAt('+' + pts + streakLabel, px.x, px.y - 40, 0x00e5ff);
      if (gateResult.streak > 1) {
        this._spawnParticleBurst(px.x, px.y, 0x00e5ff, 4 + gateResult.streak * 2);
      }
    }

    // Collision: boost pads
    if (this.trackSystem.checkBoostPad(playerBounds)) {
      this.playerController.triggerBoost();
      const pts = this.scoreSystem.addBoostPad();
      const px = this.playerController.getPosition();
      this._showFloatingAt('+' + pts + ' BOOST!', px.x, px.y - 40, 0xffdd00);
      this._spawnParticleBurst(px.x, px.y, 0xffdd00, 6);
      this._flashScreen(0xffdd00, 0.12, G.fx.boostFlashDuration);
    }

    // Drift bonus
    const drifting = this.playerController.isDrifting(leftHeld, rightHeld);
    if (drifting) {
      const pts = this.scoreSystem.addDrift(dt);
      if (pts > 0) {
        const px = this.playerController.getPosition();
        this._showFloatingAt('+' + pts, px.x + Phaser.Math.Between(-20, 20), px.y - 30, 0xff00ff, true);
      }
    }

    // Distance score
    this.scoreSystem.addDistance(this.playerController.currentSpeed * dt, G.scoring.distancePerPixel);

    // Timer
    this._timeLeft -= dt;
    if (this._timeLeft <= 0) {
      this._timeLeft = 0;
      this._endRace();
    }

    // Update particles
    this._updateParticles(dt);

    // Update HUD
    this._updateHUD();
  }

  _startCountdown(B) {
    const { width, height } = this.scale;
    const nums = ['3', '2', '1', 'GO!'];
    let i = 0;

    const show = () => {
      if (i >= nums.length) {
        this._running = true;
        return;
      }
      const t = this.add.text(width / 2, height / 2, nums[i], {
        fontSize: '80px', fontFamily: 'monospace', fontStyle: 'bold',
        color: i === nums.length - 1 ? B.colors.secondary : '#ffffff',
      }).setOrigin(0.5).setDepth(20);

      this.tweens.add({
        targets: t, scaleX: 1.4, scaleY: 1.4, alpha: 0,
        duration: 700, ease: 'Power2',
        onComplete: () => { t.destroy(); i++; show(); },
      });
    };
    this.time.delayedCall(300, show);
  }

  _buildHUD(B) {
    const { width } = this.scale;
    const style = { fontSize: '14px', fontFamily: 'monospace', color: '#ffffff' };

    // Score
    this._scoreLabel = this.add.text(12, 12, 'SCORE', { ...style, fontSize: '11px', color: B.colors.textDim }).setDepth(10);
    this._scoreText = this.add.text(12, 26, '0', { ...style, fontSize: '28px', fontStyle: 'bold', color: B.colors.primary }).setDepth(10);

    // Timer
    this._timerLabel = this.add.text(width - 12, 12, 'TIME', { ...style, fontSize: '11px', color: B.colors.textDim }).setOrigin(1, 0).setDepth(10);
    this._timerText = this.add.text(width - 12, 26, '0:60', { ...style, fontSize: '28px', fontStyle: 'bold' }).setOrigin(1, 0).setDepth(10);

    // Speed bar bg
    const primaryColor = Phaser.Display.Color.HexStringToColor(B.colors.primary).color;
    this._speedBarBg = this.add.rectangle(width / 2, this.scale.height - 12, 140, 8, 0x333333).setDepth(10);
    this._speedBar = this.add.rectangle(width / 2 - 70, this.scale.height - 12, 0, 8, primaryColor).setOrigin(0, 0.5).setDepth(11);

    // Mode badge (practice)
    if (this.mode === 'practice') {
      this.add.text(width / 2, 14, 'PRACTICE', {
        fontSize: '12px', fontFamily: 'monospace', color: B.colors.textDim,
      }).setOrigin(0.5).setDepth(10);
    }
  }

  _updateHUD() {
    const G = GAME_CONFIG;
    const B = DEFAULT_BRAND;
    this._scoreText.setText(this.scoreSystem.score.toLocaleString());

    const secs = Math.ceil(this._timeLeft);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    this._timerText.setText(m + ':' + String(s).padStart(2, '0'));

    // Color timer red when low
    this._timerText.setColor(this._timeLeft <= 10 ? '#ff4444' : '#ffffff');

    // Pulse timer at 10s
    if (this._timeLeft <= 10 && this._timeLeft > 0 && Math.ceil(this._timeLeft) !== this._lastTimerPulse) {
      this._lastTimerPulse = Math.ceil(this._timeLeft);
      this.tweens.add({
        targets: this._timerText, scaleX: 1.2, scaleY: 1.2,
        duration: 120, yoyo: true, ease: 'Bounce.easeOut',
      });
    }

    // Speed bar
    const pct = Math.min(this.playerController.currentSpeed / G.player.maxSpeed, 1);
    const barColor = pct > 0.85 ? 0xffdd00 : Phaser.Display.Color.HexStringToColor(B.colors.primary).color;
    this._speedBar.setDisplaySize(140 * pct, 8);
    this._speedBar.setFillStyle(barColor);
  }

  _showFloatingAt(text, x, y, color, small = false) {
    const G = GAME_CONFIG;
    const t = this.add.text(x, y, text, {
      fontSize: small ? '14px' : '20px',
      fontFamily: 'monospace', fontStyle: 'bold',
      color: '#' + color.toString(16).padStart(6, '0'),
      stroke: '#000000', strokeThickness: small ? 2 : 3,
    }).setOrigin(0.5).setDepth(15);

    this.tweens.add({
      targets: t,
      y: y - G.fx.scorePopupRise,
      alpha: 0,
      scaleX: small ? 1 : 1.3,
      scaleY: small ? 1 : 1.3,
      duration: G.fx.scorePopupDuration,
      ease: 'Power2',
      onComplete: () => t.destroy(),
    });
  }

  _spawnParticleBurst(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Phaser.Math.FloatBetween(-0.3, 0.3);
      const speed = Phaser.Math.FloatBetween(80, 200);
      this._particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.4 + Math.random() * 0.3,
        color,
        size: Phaser.Math.FloatBetween(2, 5),
      });
    }
  }

  _updateParticles(dt) {
    this._fxGfx.clear();
    for (let i = this._particles.length - 1; i >= 0; i--) {
      const p = this._particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this._particles.splice(i, 1);
        continue;
      }
      const alpha = p.life / p.maxLife;
      this._fxGfx.fillStyle(p.color, alpha);
      this._fxGfx.fillCircle(p.x, p.y, p.size * alpha);
    }
  }

  _flashScreen(color, alpha, duration) {
    const flash = this.add.rectangle(
      this._width / 2, this._height / 2,
      this._width, this._height,
      color, alpha
    ).setDepth(18);

    this.tweens.add({
      targets: flash, alpha: 0, duration,
      ease: 'Power2',
      onComplete: () => flash.destroy(),
    });
  }

  _setupTouchInput(width, height, B) {
    this._touchLeft = false;
    this._touchRight = false;
    this._touchBoost = false;

    const boostColor = Phaser.Display.Color.HexStringToColor(B.colors.secondary).color;
    const boostBtn = this.add.rectangle(width / 2, height - 48, 100, 44, boostColor, 0.25)
      .setStrokeStyle(2, boostColor)
      .setDepth(20)
      .setInteractive();

    this.add.text(width / 2, height - 48, '⚡ BOOST', {
      fontSize: '13px', fontFamily: 'monospace', fontStyle: 'bold',
      color: B.colors.secondary,
    }).setOrigin(0.5).setDepth(21);

    boostBtn.on('pointerdown', () => { this._touchBoost = true; });
    boostBtn.on('pointerup', () => { this._touchBoost = false; });
    boostBtn.on('pointerout', () => { this._touchBoost = false; });

    this.input.on('pointerdown', (p) => {
      if (p.y > height - 70) return;
      if (p.x < width / 2) this._touchLeft = true;
      else this._touchRight = true;
    });
    this.input.on('pointerup', (p) => {
      if (p.y > height - 70) return;
      this._touchLeft = false;
      this._touchRight = false;
    });
  }

  _endRace() {
    if (this._finished) return;
    this._finished = true;
    this._running = false;

    this.scoreSystem.addFinishBonus();
    this.playerController.freeze();

    // End-of-race flash
    this._flashScreen(0xffffff, 0.5, 400);

    this.time.delayedCall(800, () => {
      this.scene.start('Result', {
        score: this.scoreSystem.score,
        breakdown: this.scoreSystem.getBreakdown(),
        mode: this.mode,
      });
    });
  }
}

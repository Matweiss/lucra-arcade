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
    this._setupTouchInput(width, height);
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
      this.cameras.main.shake(200, 0.012);
    }

    if (nearMiss) {
      const pts = this.scoreSystem.addNearMiss();
      this._showFloating('+' + pts + ' NEAR MISS!', 0xff6b00);
    }

    // Collision: gates
    const gateResult = this.trackSystem.checkGates(playerBounds);
    if (gateResult.hit) {
      const pts = this.scoreSystem.addGate(gateResult.streak);
      this._showFloating('+' + pts + (gateResult.streak > 1 ? ' x' + gateResult.streak : ''), 0x00e5ff);
    }

    // Collision: boost pads
    if (this.trackSystem.checkBoostPad(playerBounds)) {
      this.playerController.triggerBoost();
      const pts = this.scoreSystem.addBoostPad();
      this._showFloating('+' + pts + ' BOOST!', 0xffdd00);
    }

    // Drift bonus
    const drifting = this.playerController.isDrifting(leftHeld, rightHeld);
    if (drifting) {
      const pts = this.scoreSystem.addDrift(dt);
      if (pts > 0) this._showFloating('+' + pts, 0xff00ff, true);
    }

    // Distance score
    this.scoreSystem.addDistance(this.playerController.currentSpeed * dt, G.scoring.distancePerPixel);

    // Timer
    this._timeLeft -= dt;
    if (this._timeLeft <= 0) {
      this._timeLeft = 0;
      this._endRace();
    }

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
    this._speedBarBg = this.add.rectangle(width / 2, this.scale.height - 12, 140, 8, 0x333333).setDepth(10);
    this._speedBar = this.add.rectangle(width / 2 - 70, this.scale.height - 12, 0, 8, 0x00e5ff).setOrigin(0, 0.5).setDepth(11);

    // Mode badge (practice)
    if (this.mode === 'practice') {
      this.add.text(width / 2, 14, 'PRACTICE', {
        fontSize: '12px', fontFamily: 'monospace', color: B.colors.textDim,
      }).setOrigin(0.5).setDepth(10);
    }
  }

  _updateHUD() {
    const G = GAME_CONFIG;
    this._scoreText.setText(this.scoreSystem.score.toLocaleString());

    const secs = Math.ceil(this._timeLeft);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    this._timerText.setText(m + ':' + String(s).padStart(2, '0'));

    // Color timer red when low
    this._timerText.setColor(this._timeLeft <= 10 ? '#ff4444' : '#ffffff');

    // Speed bar
    const pct = Math.min(this.playerController.currentSpeed / G.player.maxSpeed, 1);
    this._speedBar.setDisplaySize(140 * pct, 8);
  }

  _showFloating(text, color, small = false) {
    const { width } = this.scale;
    const x = Phaser.Math.Between(width * 0.3, width * 0.7);
    const y = Phaser.Math.Between(this.scale.height * 0.3, this.scale.height * 0.6);
    const t = this.add.text(x, y, text, {
      fontSize: small ? '13px' : '18px',
      fontFamily: 'monospace', fontStyle: 'bold',
      color: '#' + color.toString(16).padStart(6, '0'),
    }).setOrigin(0.5).setDepth(15);

    this.tweens.add({ targets: t, y: y - 50, alpha: 0, duration: 900, ease: 'Power2',
      onComplete: () => t.destroy() });
  }

  _setupTouchInput(width, height) {
    this._touchLeft = false;
    this._touchRight = false;
    this._touchBoost = false;

    // Left third = steer left, right third = steer right, center = boost
    this.input.on('pointerdown', (p) => {
      if (p.x < width * 0.33) this._touchLeft = true;
      else if (p.x > width * 0.66) this._touchRight = true;
      else this._touchBoost = true;
    });
    this.input.on('pointerup', () => {
      this._touchLeft = false;
      this._touchRight = false;
      this._touchBoost = false;
    });
  }

  _endRace() {
    if (this._finished) return;
    this._finished = true;
    this._running = false;

    this.scoreSystem.addFinishBonus();
    this.playerController.freeze();

    this.time.delayedCall(600, () => {
      this.scene.start('Result', {
        score: this.scoreSystem.score,
        breakdown: this.scoreSystem.getBreakdown(),
        mode: this.mode,
      });
    });
  }
}

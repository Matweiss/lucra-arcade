import { DEFAULT_BRAND } from '../config/brandConfig.js';

export class ResultScene extends Phaser.Scene {
  constructor() { super('Result'); }

  init(data) {
    this.finalScore = data.score || 0;
    this.breakdown = data.breakdown || {};
    this.mode = data.mode || 'free_play';
  }

  create() {
    const { width, height } = this.scale;
    const B = DEFAULT_BRAND;

    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a);

    // Heading
    this.add.text(width / 2, height * 0.12, B.copy.resultHeading, {
      fontSize: '22px', fontFamily: 'monospace', fontStyle: 'bold', color: B.colors.primary,
    }).setOrigin(0.5);

    // Score
    this.add.text(width / 2, height * 0.22, 'FINAL SCORE', {
      fontSize: '12px', fontFamily: 'monospace', color: B.colors.textDim,
    }).setOrigin(0.5);

    const scoreText = this.add.text(width / 2, height * 0.32, '0', {
      fontSize: '56px', fontFamily: 'monospace', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);

    // Animate score count-up
    this.tweens.addCounter({
      from: 0, to: this.finalScore, duration: 1200, ease: 'Power2',
      onUpdate: (t) => scoreText.setText(Math.floor(t.getValue()).toLocaleString()),
    });

    // Score breakdown
    const bk = this.breakdown;
    const rows = [
      ['Distance',    bk.distance    || 0],
      ['Gates',       bk.gates       || 0],
      ['Near Misses', bk.nearMisses  || 0],
      ['Drift Bonus', bk.drift       || 0],
      ['Boost Pads',  bk.boostPads   || 0],
      ['Finish Bonus', bk.finish     || 0],
    ];

    let yStart = height * 0.46;
    rows.forEach(([label, pts]) => {
      if (pts === 0) return;
      this.add.text(width * 0.25, yStart, label, {
        fontSize: '13px', fontFamily: 'monospace', color: B.colors.textDim,
      }).setOrigin(0, 0.5);
      this.add.text(width * 0.78, yStart, pts.toLocaleString(), {
        fontSize: '13px', fontFamily: 'monospace', color: '#ffffff',
      }).setOrigin(1, 0.5);
      yStart += 28;
    });

    // Divider
    this.add.line(width / 2, yStart + 4, 0, 0, width * 0.6, 0, 0x333333).setOrigin(0.5);
    yStart += 14;

    if (B.copy.prizeText && this.mode !== 'practice') {
      this.add.text(width / 2, yStart + 10, B.copy.prizeText, {
        fontSize: '13px', fontFamily: 'monospace', color: B.colors.secondary,
      }).setOrigin(0.5);
      yStart += 36;
    }

    // Buttons
    this._makeButton(width / 2, height * 0.84, 'RACE AGAIN', B, () => {
      this.scene.start('Race', { mode: this.mode });
    });
    this._makeButton(width / 2, height * 0.92, 'MENU', B, () => {
      this.scene.start('Menu');
    }, 0.6);
  }

  _makeButton(x, y, label, B, cb, alpha = 1) {
    const bg = this.add.rectangle(x, y, 200, 38, 0x00e5ff, 0.12)
      .setStrokeStyle(1.5, Phaser.Display.Color.HexStringToColor(B.colors.primary).color)
      .setAlpha(alpha).setInteractive({ useHandCursor: true });
    const t = this.add.text(x, y, label, {
      fontSize: '14px', fontFamily: 'monospace', fontStyle: 'bold', color: B.colors.primary,
    }).setOrigin(0.5).setAlpha(alpha);
    bg.on('pointerover', () => bg.setFillStyle(0x00e5ff, 0.28));
    bg.on('pointerout', () => bg.setFillStyle(0x00e5ff, 0.12));
    bg.on('pointerdown', () => {
      this.tweens.add({ targets: [bg, t], scaleX: 0.95, scaleY: 0.95, duration: 80, yoyo: true, onComplete: cb });
    });
  }
}

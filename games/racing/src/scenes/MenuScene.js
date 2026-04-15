import { DEFAULT_BRAND } from '../config/brandConfig.js';

export class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    const { width, height } = this.scale;
    const b = DEFAULT_BRAND;
    const bgColor = Phaser.Display.Color.HexStringToColor(b.colors.background).color;
    const primaryColor = Phaser.Display.Color.HexStringToColor(b.colors.primary).color;
    const trackLineColor = Phaser.Display.Color.HexStringToColor(b.colors.trackLine).color;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, bgColor);

    // Animated track lines
    const laneCount = 5;
    const laneW = width / laneCount;
    for (let i = 1; i < laneCount; i++) {
      this.add.rectangle(laneW * i, height / 2, 2, height, trackLineColor).setAlpha(0.6);
    }

    // Logo / title
    if (this.textures.exists('logo')) {
      this.add.image(width / 2, height * 0.28, 'logo').setDisplaySize(160, 80);
    } else {
      this.add.text(width / 2, height * 0.25, b.sponsor, {
        fontSize: '36px', fontFamily: 'monospace', fontStyle: 'bold',
        color: b.colors.primary,
      }).setOrigin(0.5);
    }

    this.add.text(width / 2, height * 0.38, b.name, {
      fontSize: '20px', fontFamily: 'monospace', color: b.colors.text,
    }).setOrigin(0.5);

    if (b.tagline) {
      this.add.text(width / 2, height * 0.44, b.tagline, {
        fontSize: '13px', fontFamily: 'monospace', color: b.colors.textDim,
      }).setOrigin(0.5);
    }

    if (b.copy.sponsorMessage) {
      this.add.text(width / 2, height * 0.50, b.copy.sponsorMessage, {
        fontSize: '13px', fontFamily: 'monospace', color: b.colors.textDim,
      }).setOrigin(0.5);
    }

    // Start button
    this._makeButton(width / 2, height * 0.62, b.copy.menuCTA, b, () => {
      this.scene.start('Race', { mode: b.contest.mode });
    });

    // Practice button
    this._makeButton(width / 2, height * 0.74, b.copy.practiceCTA, b, () => {
      this.scene.start('Race', { mode: 'practice' });
    }, 0.7);

    if (b.copy.prizeText) {
      this.add.text(width / 2, height * 0.88, b.copy.prizeText, {
        fontSize: '13px', fontFamily: 'monospace', color: b.colors.secondary,
      }).setOrigin(0.5);
    }

    // Legal footer
    if (b.legal.disclaimerText) {
      this.add.text(width / 2, height - 8, b.legal.disclaimerText, {
        fontSize: '9px', fontFamily: 'monospace', color: b.colors.textDim,
        wordWrap: { width: width - 24 }, align: 'center',
      }).setOrigin(0.5, 1).setAlpha(0.5);
    }
  }

  _makeButton(x, y, label, brand, callback, alpha = 1) {
    const primaryColor = Phaser.Display.Color.HexStringToColor(brand.colors.primary).color;

    const bg = this.add.rectangle(x, y, 200, 44, primaryColor, 0.15)
      .setStrokeStyle(2, primaryColor)
      .setAlpha(alpha)
      .setInteractive({ useHandCursor: true });

    const text = this.add.text(x, y, label, {
      fontSize: '16px', fontFamily: 'monospace', fontStyle: 'bold',
      color: brand.colors.primary,
    }).setOrigin(0.5).setAlpha(alpha);

    bg.on('pointerover', () => bg.setFillStyle(primaryColor, 0.3));
    bg.on('pointerout', () => bg.setFillStyle(primaryColor, 0.15));
    bg.on('pointerdown', () => {
      this.tweens.add({ targets: [bg, text], scaleX: 0.95, scaleY: 0.95, duration: 80,
        yoyo: true, onComplete: callback });
    });
  }
}

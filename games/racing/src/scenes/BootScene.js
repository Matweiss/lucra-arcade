import { DEFAULT_BRAND } from '../config/brandConfig.js';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    const b = DEFAULT_BRAND;
    // Load brand assets if provided
    if (b.assets.logo) this.load.image('logo', b.assets.logo);
    if (b.assets.kartSkin) this.load.image('kart', b.assets.kartSkin);
    if (b.assets.boostIcon) this.load.image('boost-icon', b.assets.boostIcon);
  }

  create() {
    this.scene.start('Menu');
  }
}

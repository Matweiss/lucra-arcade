import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { RaceScene } from './scenes/RaceScene.js';
import { ResultScene } from './scenes/ResultScene.js';
import { GAME_CONFIG } from './config/gameConfig.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  backgroundColor: '#0a0a1a',
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MenuScene, RaceScene, ResultScene],
};

new Phaser.Game(config);

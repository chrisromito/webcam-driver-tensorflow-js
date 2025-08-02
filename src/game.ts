import 'phaser';
import './css/styles.css';
import { BootScene } from './scenes/BootScene';
import { gameConfig } from './config/GameConfig';
// import type { Phaser } from 'phaser'
import { LoadScene } from './scenes/LoadScene';
import { GameScene } from './scenes/GameScene';
import { RaceUiScene } from './scenes/RaceUiScene';

// set up game class, and global stuff
export class DriverGame extends Phaser.Game {
  private debug: boolean = false;

  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

// start the game
export function run(): DriverGame {
  const game = new DriverGame(gameConfig);

  // set up stats
  // if (window.env.buildType !== 'production') {
    // const Stats = require('stats-js');
    // const stats = new Stats();
    // stats.setMode(0); // 0: fps, 1: ms
    // stats.domElement.style.position = 'absolute';
    // stats.domElement.style.left = '0px';
    // stats.domElement.style.top = '0px';
    // document.body.appendChild(stats.domElement);

    // game.events.on('prestep', () => stats.begin());
    // game.events.on('postrender', () => stats.end());
  // }

  game.scene.add('BootScene', BootScene, true);
  game.scene.add('LoadScene', LoadScene, false);
  game.scene.add('GameScene', GameScene, false);
  game.scene.add('RaceUiScene', RaceUiScene, false);
  return game
}

/**
 * @ref https://github.com/enable3d/enable3d-phaser-project-template/blob/master/src/scripts/game.ts
 */
import * as Phaser from 'phaser'

import { BootScene } from '../scenes/BootScene';
import { LoadScene } from '../scenes/LoadScene';
// import { GameScene } from '../scenes/GameScene';
// import { RaceUiScene } from '../scenes/RaceUiScene';

// phaser game config
export const gameConfig: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	scale: {
		parent: 'game-container',
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: 320,
		height: 180,
	},
	render: {
		pixelArt: true,
	},
	scene: [
		BootScene,
		LoadScene
	]
};

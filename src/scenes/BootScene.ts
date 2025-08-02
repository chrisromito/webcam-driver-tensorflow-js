import { BaseScene } from './BaseScene';

export class BootScene extends BaseScene {
	constructor(key: string, options: any) {
		super('BootScene');
	}

	public preload(): void {
		this.load.bitmapFont('retro', 
			new URL('/public/fonts/cosmicavenger.png', import.meta.url).href, 
			new URL('/public/fonts/cosmicavenger.xml', import.meta.url).href
		);
	}

	public create(): void {
		this.registry.set('speed', 0);
		this.registry.set('racetime', 0);
		this.registry.set('trackposition', 0);
		this.registry.set('raceposition', 0);
		this.registry.set('playerx', 0);

		this.scene.start('LoadScene', {});
	}
}

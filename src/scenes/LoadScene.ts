import { BaseScene } from './BaseScene';
const CarUrl = new URL('/public/3d/car.glb', import.meta.url).href

export class LoadScene extends BaseScene {
	constructor(key: string, options: any) {
		super('LoadScene');
	}

	public preload(): void {
		const progress = this.add.graphics();

		this.load.on('progress', (value: number) => {
			progress.clear();
			progress.fillStyle(0xffffff, 1);
			progress.fillRect(
				0,
				this.scale.gameSize.height / 2,
				this.scale.gameSize.width * value,
				60,
			);
		});

		this.load.on('complete', () => {
			progress.destroy();
		});

		this.load.image('clouds1', new URL('/public/clouds.png', import.meta.url).href);
		this.load.image('clouds2', new URL('/public/clouds2.png', import.meta.url).href)
		this.load.image('mountain', new URL('/public/mountain.png', import.meta.url).href)
		this.load.image('hills', new URL('/public/hills.png', import.meta.url).href)
		this.load.image('boulder1', new URL('/public/boulder.png', import.meta.url).href)
		this.load.image('boulder2', new URL('/public/boulder2.png', import.meta.url).href)
		this.load.image('tree1', new URL('/public/tree.png', import.meta.url).href)
		this.load.image('tree2', new URL('/public/tree2.png', import.meta.url).href)
		this.load.image('tree3', new URL('/public/tree3.png', import.meta.url).href)
		this.load.image('turnsign', new URL('/public/turn-sign.png', import.meta.url).href)

		this.load.spritesheet('particles', new URL('/public/smoke-particle.png',import.meta.url).href, { frameWidth: 16, frameHeight: 16 });

		this.load.spritesheet('car-green', new URL('/public/car-green.png',import.meta.url).href, { frameWidth: 64, frameHeight: 64 });
		this.load.spritesheet('car-army', new URL('/public/car-army.png',import.meta.url).href, { frameWidth: 64, frameHeight: 64 });
		this.load.spritesheet('car-red', new URL('/public/car-red.png',import.meta.url).href, { frameWidth: 64, frameHeight: 64 });
		this.load.spritesheet('car-yellow', new URL('/public/car-yellow.png',import.meta.url).href, { frameWidth: 64, frameHeight: 64 });
		this.load.spritesheet('car-blue', new URL('/public/car-blue.png',import.meta.url).href, { frameWidth: 64, frameHeight: 64 });

		this.load.binary('playercar', CarUrl);

		this.load.audio('engine', [new URL('/public/sound/engine-loop.wav', import.meta.url).href]);
		this.load.audio('tire-squeal', [new URL('/public/sound/tire-squeal.wav', import.meta.url).href]);
		this.load.audio('collision', [new URL('/public/sound/car-collision.wav', import.meta.url).href]);
		this.load.audio('confirm', [new URL('/public/sound/confirm.wav', import.meta.url).href]);
		this.load.audio('explosion', [new URL('/public/sound/explosion.wav',import.meta.url).href]);
		this.load.audio('select', [new URL('/public/sound/select.wav', import.meta.url).href]);
		this.load.audio('time-extended', [new URL('/public/sound/time-extended.wav', import.meta.url).href]);

		this.load.binary('dream-candy', new URL('/public/sound/drozerix_-_dream_candy.xm', import.meta.url).href);

		this.load.bitmapFont('numbers', 
			new URL('/public/fonts/number-font.png',import.meta.url).href,
			 new URL('/public/fonts/number-font.xml', import.meta.url).href
		);
		this.load.bitmapFont('impact', 
			new URL('/public/fonts/impact-24-outline.png', import.meta.url).href, 
			new URL('/public/fonts/impact-24-outline.xml', import.meta.url).href
		);
	}

	public create(): void {
		this.scene.start('GameScene', {});
	}

}

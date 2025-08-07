import * as Phaser from 'phaser'

export class BaseScene extends Phaser.Scene {
	constructor(key: string, options?: any) {
		super(key);
	}

	public setTimerEvent(timeMin: number, timeMax: number, callback: () => {}, params?: any[]): Phaser.Time.TimerEvent {
		return this.time.delayedCall(Phaser.Math.Between(timeMin, timeMax), callback, params || [], this);
	}
}

import { WINDOW_HEIGHT, WINDOW_WIDTH } from './const.js';

export default class Stage {
	constructor (params = {}) {
		const { width, height } = params;
		this.width = width || WINDOW_WIDTH;
		this.height = height || WINDOW_HEIGHT;

		this.animation_frame = null;
		this.last_time = 0;
		this.now_time = 0;

		this.players = [];

		this.stage = new PIXI.Container;
		this.renderer = PIXI.autoDetectRenderer(this.width, this.height, { transparent : true });
	}

	clear () {
		this.stage.removeChildren();
		this.players = [];
	}

	addSpinePlayer (spine_player) {
		this.players.push(spine_player);
		this.stage.addChild(spine_player);
		this.renderer.render(this.stage);
	}

	start (callback = () => {}) {
		this.animation_frame = window.requestAnimationFrame(async (time) => {
			await this.animate(time, callback);
		});
	}

	async animate (t, callback) {
		this.animation_frame = window.requestAnimationFrame(async (time) => {
			await this.animate(time, callback);
			await callback(time);
		});

		this.last_time = this.now_time;
		this.now_time = t;
		const time_diff = this.now_time - this.last_time;

		for(let i = 0; i < this.players.length; i++){
			if(this.players[i].update) {
				this.players[i].update(time_diff / 1000);
			}
		}

		this.renderer.render(this.stage);
	}
}

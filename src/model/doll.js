import { FILE_TYPES, PATH_DIR, WINDOW_HEIGHT, WINDOW_WIDTH, STEP } from "./const.js";

export default class Doll {
  genus = '';
  name = '';
  file_list = [];
  file_record = {};
  player = null;
  step = STEP;
  auto_run = true;
  can_run = true;
  start_run_time = 0;

  constructor (genus, name) {
    this.genus = genus;
    this.name = name;

    for (let ext of FILE_TYPES) {
      const item_name = `${genus}_${name}_${ext}`;
      const path = `${PATH_DIR}/${genus}/${name}/${name}.${ext}`;
      const item = { name: item_name, path };

      this.file_list.push(item);
      this.file_record[ext] = item;
    }
  }

  _initPlayer (skeleton_data) {
    const player = new PIXI.spine.Spine(skeleton_data);
		const animations = player.spineData.animations;

    const animation_record = animations.reduce((a, b) => {
      a[b.name] = b;
      return a;
    }, {})

		player.position.set(WINDOW_WIDTH / 2 - 15, WINDOW_HEIGHT - 60);
		player.scale.set(1);
		player.animation_num = 0;
    player.animation_record = animation_record;
		player.state.setAnimationByName(0, animations[0].name, true);
		player.skeleton.setToSetupPose();
		player.autoUpdate = false;
		player.update(0);

    player.interactive = true
    player.on('click', () => {
      this.nextAnimation();
    });

    player.on('mouseover', () => {
      this.stopRun();

      const animation = this.getCurrentAnimation();
      if (animation.name === 'move') {
        this.changeAnimationByName("victory");
      }
    })

    player.on('mouseout', () => {
      if (this.auto_run) {
        this.startRun();
      }
    })

    this.player = player;
    return player;
  }

  async init (skeleton_data) {
    this._initPlayer(skeleton_data);

    return this.player;
  }

  changeAnimationByName (name) {
    const animations = this.player.spineData.animations;
    this.player.animation_num = animations.findIndex(v => v.name === name);
    this.player.state.setAnimationByName(0, name, true);
    this.player.update(0);
  }

  nextAnimation () {
		if(this.player && this.player.spineData && this.player.spineData.animations){
			const animations = this.player.spineData.animations;
			this.player.animation_num = (this.player.animation_num + 1) % animations.length;
      this.changeAnimationByName(animations[this.player.animation_num].name);
		}
	}

  getCurrentAnimation () {
    const animations = this.player.spineData.animations;
    return animations[this.player.animation_num];
  }

  startRun () {
    this.can_run = true;
  }

  stopRun () {
    this.can_run = false;
  }

  isRunAnimation () {
    const animation = this.getCurrentAnimation()
    return animation.name === 'move';
  }

  canRun () {
    return this.can_run && this.isRunAnimation();
  }

  async checkAutoRun (time) {
    if (this.isRunAnimation() || !this.auto_run) {
      return;
    }

    if (!this.isRunAnimation() && this.can_run && !this.start_run_time) {
      this.start_run_time = time;
    }

    if (this.start_run_time && time - this.start_run_time >= 2000) {
      this.changeAnimationByName('move');
      this.start_run_time = 0;
    }
  }

  async run (time) {
    await this.checkAutoRun(time);

    if (!this.canRun()) {
      return;
    }

    const { getWindowPosition, setWindowPosition, isReachScreenEdge } = window.electron_api;
    const position = await getWindowPosition();
    const result = await isReachScreenEdge();

    if (result.x) {
      this.step = result.is_left_edge ? STEP : -STEP
      this.player.scale.x = result.is_left_edge ? 1 : -1;
    }

    await setWindowPosition(position[0] + this.step, position[1])
  }
}

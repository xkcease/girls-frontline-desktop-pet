import Doll from "./model/doll.js";
import SkeletonLoader from './model/SkeletonLoader.js';
import Stage from "./model/stage.js";

const enableDrag = async () => {
  const { getWindowPosition, setWindowPosition } = window.electron_api;

  let dragging = false
  let gap_x = 0;
  let gap_y = 0;

  document.addEventListener('mousedown', async (e) => {
    dragging = true;
    const position = await getWindowPosition();
    gap_x = e.screenX - position[0];
    gap_y = e.screenY - position[1];
  });

  document.addEventListener('mouseup', () => dragging = false);
  document.addEventListener('mousemove', (e) => {
    if (!dragging) {
      return;
    }

    const x = e.screenX - gap_x;
    const y = e.screenY - gap_y;
    setWindowPosition(x, y);
  });
}

const main = async () => {
  const stage = new Stage();
  const doll = new Doll('HK416', 'HK416');
  // const doll = new Doll('HK416', 'HK416_3401');
  // const doll = new Doll('UMP45', 'UMP45_3403');
  // const doll = new Doll('M4A1', 'M4A1_4505');

  const skelenton_loader = new SkeletonLoader('assets/character')
  const skeleton_data = await skelenton_loader.load(doll);
  const player = await doll.init(skeleton_data);

  stage.addSpinePlayer(player);

  const main_dom = document.querySelector('#main');
  main_dom.append(stage.renderer.view);

  enableDrag();


  stage.start(async (time) => {
    await doll.run(time);
  });
};

const execute = () => {
  window.onload = () => {
    main();
  };
};
execute();
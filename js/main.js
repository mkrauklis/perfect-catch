
Game.sm.register("menu", MenuScene);
Game.sm.register("character", CharacterCreatorScene);
Game.sm.register("tacklebox", TackleBoxScene);
Game.sm.register("levels", LevelSelectScene);
Game.sm.register("fishing", FishingScene);

new window.p5((p) => {
  p.setup = () => {
    const canvas = p.createCanvas(CANVAS_W, CANVAS_H);
    canvas.parent("canvas-holder");
    Game.p = p;
    Game.init();
    Game.sm.goto("menu");
  };
  p.draw = () => {
    Game.sm.draw(p);
  };
});

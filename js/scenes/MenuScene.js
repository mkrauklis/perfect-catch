
const pondTheme = { sky: ["#7fb8c9", "#cfe8d8"], water: ["#3a7d6b", "#1f4d42"], accent: "#e0a940", decor: "lilypads" };

const MenuScene = {
  enter(Game) {
    const s = Game.state.data;
    const nextUp = LEVELS.find((l) => Game.state.isLevelUnlocked(l.id) && !Game.state.data.bestCatches[l.id]) || LEVELS[0];

    const panel = [
      el("h2", {}, "Perfect Catch"),
      el("p", {}, "Catch fish by writing the code that runs your rod and reel. Four adventures, each teaching a new programming idea — starting calm, ending with a monster in the open ocean."),
      el("h3", {}, "Your Progress"),
      el("p", {}, `Total caught: ${s.stats.totalCaught} · Lifetime earnings: $${s.stats.totalEarnings} · Lines snapped: ${s.stats.linesSnapped}`),
      el("div", { class: "btn-row" }, [
        el("button", { class: "btn", onclick: () => Game.sm.goto("levels") }, `Go Fish (${nextUp.name})`),
        el("button", { class: "btn secondary", onclick: () => Game.sm.goto("character") }, "Customize Angler"),
      ]),
      el("h3", {}, "How It Works"),
      el("p", {}, "In each adventure you write a short script using functions like cast(), reelIn(), letOut(), and setDrag(). Run it, watch the fight play out, and adjust your code to land the fish."),
    ];
    if (s.stats.totalCaught === 0) {
      panel.push(el("div", { class: "tutorial-box" }, "New here? Start with The Quiet Pond under Adventures — it only needs a few function calls."));
    }
    Game.setPanel(panel);
  },
  draw(Game, p) {
    drawScene(p, CANVAS_W, CANVAS_H, pondTheme, p.frameCount / 60);
    const c = Game.state.data.character;
    drawAngler(p, CANVAS_W * 0.5, CANVAS_H * 0.62, 2.6, c, { facing: 1 });

    p.push();
    p.textAlign(p.CENTER, p.CENTER);
    p.fill(0, 0, 0, 90);
    p.textSize(46);
    p.text("Perfect Catch", CANVAS_W / 2 + 3, 78 + 3);
    p.fill(255);
    p.text("Perfect Catch", CANVAS_W / 2, 78);
    p.textSize(16);
    p.fill(255, 255, 255, 220);
    p.text("Code your rod. Catch your fish.", CANVAS_W / 2, 112);
    p.pop();
  },
};

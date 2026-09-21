
const LevelSelectScene = {
  enter(Game) {
    const s = Game.state;
    const cards = LEVELS.map((lvl) => {
      const unlocked = s.isLevelUnlocked(lvl.id);
      const best = s.data.bestCatches[lvl.id];
      const card = el(
        "div",
        {
          class: "level-card" + (unlocked ? "" : " locked"),
          onclick: unlocked ? () => Game.sm.goto("fishing", { levelId: lvl.id }) : null,
        },
        [
          el("div", { class: "level-title" }, [
            el("span", {}, lvl.name),
            el("span", { style: "color:var(--ink-dim);font-weight:400;font-size:0.8rem" }, unlocked ? lvl.subtitle : "🔒 Locked"),
          ]),
          el("p", { style: "margin-top:4px" }, best ? `Best catch: ${best.name} (${best.weight}kg)` : unlocked ? "Not yet fished." : "Complete the previous adventure to unlock."),
          el("div", { class: "level-concepts" }, [el("span", { class: "concept-pill" }, lvl.conceptLabel)]),
        ]
      );
      return card;
    });

    Game.setPanel([
      el("h2", {}, "Adventures"),
      el("p", {}, "Each adventure introduces a new programming idea, building on the last."),
      ...cards,
    ]);
  },
  draw(Game, p) {
    const theme = { sky: ["#4a6b85", "#9fb2a0"], water: ["#26414d", "#0f1f26"], accent: "#3fb6a8", decor: "waves" };
    drawScene(p, CANVAS_W, CANVAS_H, theme, p.frameCount / 60);
    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(28);
    p.text("Choose Your Adventure", CANVAS_W / 2, CANVAS_H * 0.5);
    p.textSize(14);
    p.fill(255, 255, 255, 210);
    p.text("Pond → Stream → River → Ocean", CANVAS_W / 2, CANVAS_H * 0.5 + 30);
  },
};

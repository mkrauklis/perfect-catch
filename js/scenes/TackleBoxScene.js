
const theme = { sky: ["#6f8494", "#c7cdb8"], water: ["#33474f", "#1a262b"], accent: "#e0a940", decor: "rocks" };

function statLine(item, kind) {
  if (kind === "rods") return `Break point ${item.tensionBreak} · Drag smoothness x${item.dragSmoothness}`;
  if (kind === "reels") return `Reel efficiency x${item.reelEfficiency} · Capacity ${item.lineCapacity}m`;
  return `Bite bonus +${Math.round(item.biteBonus * 100)}% · Stamina drain x${item.staminaMod}`;
}

function gearSection(Game, title, list, kind, equippedKey, rerender) {
  const s = Game.state;
  const cards = list.map((item) => {
    const owned = s.isOwned(kind, item.id);
    const equipped = s.data.equipped[equippedKey] === item.id;
    const btn = equipped
      ? el("button", { class: "btn secondary", disabled: "true" }, "Equipped")
      : owned
      ? el("button", { class: "btn", onclick: () => { s.equip(equippedKey, item.id); rerender(); } }, "Equip")
      : el("button", {
          class: "btn",
          onclick: () => {
            if (s.buy(kind, item.id, item.price)) {
              s.equip(equippedKey, item.id);
              Game.updateMoney();
              Game.toast(`Bought ${item.name}!`);
            } else {
              Game.toast("Not enough money.");
            }
            rerender();
          },
        }, `Buy $${item.price}`);

    return el("div", { class: "gear-card" + (equipped ? " equipped" : "") }, [
      el("div", { class: "gear-title" }, [
        el("span", {}, item.name + (equipped ? " " : "")),
        equipped ? el("span", { class: "tag owned" }, "Equipped") : owned ? el("span", { class: "tag owned" }, "Owned") : el("span", { class: "tag locked" }, `$${item.price}`),
      ]),
      el("div", { class: "gear-stats" }, statLine(item, kind)),
      el("p", { style: "margin-bottom:8px" }, item.desc),
      btn,
    ]);
  });
  return [el("h3", {}, title), ...cards];
}

const TackleBoxScene = {
  enter(Game) {
    this.render(Game);
  },
  render(Game) {
    const rerender = () => this.render(Game);
    const panel = [
      el("h2", {}, "Tackle Box"),
      el("p", {}, "Equip what you own, or buy new gear with money earned from catches."),
      ...gearSection(Game, "Rods", RODS, "rods", "rod", rerender),
      ...gearSection(Game, "Reels", REELS, "reels", "reel", rerender),
      ...gearSection(Game, "Lures", LURES, "lures", "lure", rerender),
      el("div", { class: "btn-row" }, [
        el("button", { class: "btn", onclick: () => Game.sm.goto("levels") }, "Go Fishing"),
      ]),
    ];
    Game.setPanel(panel);
  },
  draw(Game, p) {
    drawScene(p, CANVAS_W, CANVAS_H, theme, p.frameCount / 60);
    const c = Game.state.data.character;
    const eq = Game.state.data.equipped;
    const rod = getGearById(RODS, eq.rod);
    const reel = getGearById(REELS, eq.reel);
    const lure = getGearById(LURES, eq.lure);

    drawAngler(p, CANVAS_W * 0.35, CANVAS_H * 0.68, 3.4, c, { facing: 1 });

    // simple rod line from hand out to a bobber, purely decorative
    p.stroke(255, 255, 255, 180);
    p.strokeWeight(1.5);
    const handX = CANVAS_W * 0.35 - 40;
    const handY = CANVAS_H * 0.68 - 40;
    p.line(handX, handY, CANVAS_W * 0.72, CANVAS_H * 0.58);
    p.noStroke();
    p.fill(224, 169, 64);
    p.circle(CANVAS_W * 0.72, CANVAS_H * 0.58, 10);

    p.fill(255, 255, 255, 230);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(14);
    p.text(`Rod: ${rod.name}`, 24, 24);
    p.text(`Reel: ${reel.name}`, 24, 44);
    p.text(`Lure: ${lure.name}`, 24, 64);
  },
};

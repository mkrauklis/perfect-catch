const previewTheme = { sky: ["#5f7f95", "#c9d8c2"], water: ["#2c4c58", "#16292f"], accent: "#3fb6a8", decor: "rocks" };

function label(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/([A-Z])/g, " $1");
}

function swatchRow(options, current, onPick) {
  return el(
    "div",
    { class: "swatch-row" },
    options.map((c) =>
      el("div", {
        class: "swatch" + (c === current ? " selected" : ""),
        style: `background:${c}`,
        onclick: () => onPick(c),
      })
    )
  );
}

function chipRow(options, current, onPick) {
  return el(
    "div",
    { class: "option-row" },
    options.map((o) =>
      el(
        "div",
        { class: "option-chip" + (o === current ? " selected" : ""), onclick: () => onPick(o) },
        label(o)
      )
    )
  );
}

const CharacterCreatorScene = {
  enter(Game) {
    this.render(Game);
  },
  render(Game) {
    const c = Game.state.data.character;
    const update = (patch) => {
      Game.state.updateCharacter(patch);
      this.render(Game);
    };

    const panel = [
      el("h2", {}, "Angler Creator"),
      el("p", {}, "Make your angler yours. This is who shows up in every adventure."),

      el("h3", {}, "Skin Tone"),
      swatchRow(SKIN_TONES, c.skinTone, (v) => update({ skinTone: v })),

      el("h3", {}, "Body Type"),
      chipRow(BODY_TYPES, c.bodyType, (v) => update({ bodyType: v })),

      el("h3", {}, "Hair Style"),
      chipRow(HAIR_STYLES, c.hairStyle, (v) => update({ hairStyle: v })),
      el("h3", {}, "Hair Color"),
      swatchRow(HAIR_COLORS, c.hairColor, (v) => update({ hairColor: v })),

      el("h3", {}, "Outfit Style"),
      chipRow(OUTFIT_STYLES, c.outfitStyle, (v) => update({ outfitStyle: v })),
      el("h3", {}, "Outfit Color"),
      swatchRow(OUTFIT_COLORS, c.outfitColor, (v) => update({ outfitColor: v })),

      el("h3", {}, "Hat"),
      chipRow(HATS, c.hat, (v) => update({ hat: v })),

      el("h3", {}, "Sunglasses"),
      chipRow(SUNGLASSES, c.sunglasses, (v) => update({ sunglasses: v })),

      el("h3", {}, "Accessory"),
      chipRow(ACCESSORIES, c.accessory, (v) => update({ accessory: v })),

      el("div", { class: "btn-row" }, [
        el("button", { class: "btn", onclick: () => Game.sm.goto("tacklebox") }, "Next: Tackle Box"),
      ]),
    ];
    Game.setPanel(panel);
  },
  draw(Game, p) {
    drawScene(p, CANVAS_W, CANVAS_H, previewTheme, p.frameCount / 60);
    const c = Game.state.data.character;
    drawAngler(p, CANVAS_W * 0.5, CANVAS_H * 0.68, 4.4, c, { facing: 1 });
  },
};

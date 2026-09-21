// Procedurally draws the player's customized angler. No image assets —
// everything is p5 primitives so any cosmetic combination "just renders".

function bodyWidthFor(bodyType) {
  if (bodyType === "A") return 0.85;
  if (bodyType === "C") return 1.15;
  return 1.0;
}

function drawAngler(p, x, y, scale, character, opts = {}) {
  const { facing = 1, rodBendDeg = 0 } = opts;
  const s = scale;
  const wMul = bodyWidthFor(character.bodyType);

  p.push();
  p.translate(x, y);
  p.scale(facing, 1);

  // legs
  p.noStroke();
  p.fill(40, 45, 55);
  p.rect(-10 * s * wMul, 30 * s, 8 * s, 26 * s, 3);
  p.rect(4 * s * wMul, 30 * s, 8 * s, 26 * s, 3);

  // torso / outfit
  p.fill(character.outfitColor);
  const torsoW = 34 * s * wMul;
  if (character.outfitStyle === "jacket") {
    p.rect(-torsoW / 2, -2 * s, torsoW, 36 * s, 6 * s);
    p.fill(0, 0, 0, 60);
    p.rect(-2 * s, -2 * s, 4 * s, 36 * s, 2);
  } else if (character.outfitStyle === "flannel") {
    p.rect(-torsoW / 2, -2 * s, torsoW, 36 * s, 6 * s);
    p.stroke(0, 0, 0, 45);
    p.strokeWeight(1.5 * s);
    for (let i = -3; i <= 3; i++) p.line(-torsoW / 2, (-2 + i * 6) * s, torsoW / 2, (-2 + i * 6) * s);
    p.noStroke();
  } else {
    p.rect(-torsoW / 2, -2 * s, torsoW, 36 * s, 6 * s);
    p.fill(255, 255, 255, 230);
    p.rect(-torsoW / 2 + 4 * s, 2 * s, torsoW - 8 * s, 26 * s, 4 * s);
  }

  // arms
  p.fill(character.skinTone);
  p.push();
  p.translate(-torsoW / 2 - 2 * s, 4 * s);
  p.rotate(p.radians(20 + rodBendDeg * 0.15));
  p.rect(-4 * s, 0, 8 * s, 22 * s, 4 * s);
  p.pop();
  p.push();
  p.translate(torsoW / 2 + 2 * s, 4 * s);
  p.rotate(p.radians(-25));
  p.rect(-4 * s, 0, 8 * s, 22 * s, 4 * s);
  p.pop();

  // neck + head
  p.fill(character.skinTone);
  p.rect(-4 * s, -8 * s, 8 * s, 8 * s);
  p.circle(0, -20 * s, 26 * s);

  // hair (behind/around head, drawn before face features so bangs sit on top)
  drawHair(p, character, s);

  // sunglasses
  if (character.sunglasses !== "none") {
    p.fill(20, 20, 25);
    if (character.sunglasses === "aviator") {
      p.ellipse(-6 * s, -21 * s, 9 * s, 7 * s);
      p.ellipse(6 * s, -21 * s, 9 * s, 7 * s);
    } else {
      p.circle(-6 * s, -21 * s, 8 * s);
      p.circle(6 * s, -21 * s, 8 * s);
    }
    p.rect(-2 * s, -22 * s, 4 * s, 1.5 * s);
  } else {
    p.fill(30, 30, 35);
    p.circle(-6 * s, -21 * s, 2.2 * s);
    p.circle(6 * s, -21 * s, 2.2 * s);
  }

  // hat
  drawHat(p, character, s);

  // accessory
  if (character.accessory === "bandana") {
    p.fill(character.outfitColor);
    p.rect(-13 * s, -8 * s, 26 * s, 4 * s, 2);
  } else if (character.accessory === "badge") {
    p.fill(224, 169, 64);
    p.circle(-torsoW / 2 + 8 * s, 4 * s, 5 * s);
  }

  p.pop();
}

function drawHair(p, character, s) {
  p.fill(character.hairColor);
  const style = character.hairStyle;
  if (style === "bald") return;
  if (style === "short") {
    p.arc(0, -22 * s, 27 * s, 27 * s, p.PI, p.TWO_PI + 0.3);
  } else if (style === "buzz") {
    p.arc(0, -22 * s, 26.5 * s, 26.5 * s, p.PI + 0.2, p.TWO_PI - 0.2);
  } else if (style === "long") {
    p.arc(0, -22 * s, 27 * s, 27 * s, p.PI, p.TWO_PI + 0.3);
    p.rect(-13 * s, -18 * s, 6 * s, 30 * s, 3 * s);
    p.rect(7 * s, -18 * s, 6 * s, 30 * s, 3 * s);
  } else if (style === "ponytail") {
    p.arc(0, -22 * s, 27 * s, 27 * s, p.PI, p.TWO_PI + 0.3);
    p.push();
    p.translate(11 * s, -18 * s);
    p.rotate(p.radians(35));
    p.ellipse(0, 0, 6 * s, 18 * s);
    p.pop();
  } else if (style === "curly") {
    for (let a = 0; a < p.TWO_PI; a += 0.55) {
      const cx = Math.cos(a) * 13 * s;
      const cy = -22 * s + Math.sin(a) * 13 * s;
      if (cy < -14 * s) p.circle(cx, cy, 9 * s);
    }
  }
}

function drawHat(p, character, s) {
  if (character.hat === "none") return;
  p.fill(character.outfitColor);
  if (character.hat === "cap") {
    p.arc(0, -30 * s, 26 * s, 20 * s, p.PI, p.TWO_PI);
    p.fill(p.red(p.color(character.outfitColor)) * 0.8, p.green(p.color(character.outfitColor)) * 0.8, p.blue(p.color(character.outfitColor)) * 0.8);
    p.ellipse(9 * s, -28 * s, 14 * s, 5 * s);
  } else if (character.hat === "bucket") {
    p.arc(0, -31 * s, 30 * s, 16 * s, p.PI, p.TWO_PI);
    p.ellipse(0, -25 * s, 34 * s, 6 * s);
  } else if (character.hat === "widebrim") {
    p.ellipse(0, -26 * s, 46 * s, 8 * s);
    p.arc(0, -30 * s, 22 * s, 16 * s, p.PI, p.TWO_PI);
  }
}

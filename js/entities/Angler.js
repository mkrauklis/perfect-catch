// Procedurally draws the player's customized angler. No image assets —
// everything is p5 primitives so any cosmetic combination "just renders".

function bodyWidthFor(bodyType) {
  if (bodyType === "A") return 0.85;
  if (bodyType === "C") return 1.15;
  return 1.0;
}

// p5's rotate() is a standard rotation matrix applied to a Y-down canvas,
// so a point at local (0, len) after rotate(thetaDeg) lands at this offset
// from the rotation's origin. Used to hand-place the rod without relying on
// the matrix stack once we're back in the caller's coordinate space.
function dirFromAngle(p, thetaDeg, len) {
  const r = p.radians(thetaDeg);
  return { x: -Math.sin(r) * len, y: Math.cos(r) * len };
}

function drawAngler(p, x, y, scale, character, opts = {}) {
  const { facing = 1, rodBendDeg = 0, castSwingDeg = 0, rodColor = "#c9a227", reelColor = "#8a8f99" } = opts;
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

  // back arm (the one NOT holding the rod) — a relaxed resting pose
  p.fill(character.skinTone);
  p.push();
  p.translate(-torsoW / 2 - 2 * s, 4 * s);
  p.rotate(p.radians(20));
  p.rect(-4 * s, 0, 8 * s, 22 * s, 4 * s);
  p.pop();

  // front arm — holds the rod, raised into a casting stance. As tension
  // climbs, the whole arm dips a little and the rod tip dips a lot, so the
  // rod visibly bows under load.
  const shoulder = { x: torsoW / 2 + 2 * s, y: 4 * s };
  const armAngle = -78 + rodBendDeg * 0.25 + castSwingDeg;
  const handLen = 18 * s;
  p.push();
  p.translate(shoulder.x, shoulder.y);
  p.rotate(p.radians(armAngle));
  p.rect(-4 * s, 0, 8 * s, handLen, 4 * s);
  p.pop();

  const handOffset = dirFromAngle(p, armAngle, handLen);
  const hand = { x: shoulder.x + handOffset.x, y: shoulder.y + handOffset.y };

  // rod: reel + grip at the hand, a bowed shaft running out to the tip
  const tipAngle = armAngle + rodBendDeg * 0.9;
  const rodLen = 58 * s;
  const tipOffset = dirFromAngle(p, tipAngle, rodLen);
  const tip = { x: hand.x + tipOffset.x, y: hand.y + tipOffset.y };
  const c1Offset = dirFromAngle(p, armAngle, rodLen * 0.35);
  const c2Offset = dirFromAngle(p, tipAngle, rodLen * 0.35);
  const c1 = { x: hand.x + c1Offset.x, y: hand.y + c1Offset.y };
  const c2 = { x: tip.x - c2Offset.x, y: tip.y - c2Offset.y };

  // rod shaft — the player's rod color, with a thin glossy highlight
  p.noFill();
  p.stroke(rodColor);
  p.strokeWeight(Math.max(1, 2.8 * s));
  p.bezier(hand.x, hand.y, c1.x, c1.y, c2.x, c2.y, tip.x, tip.y);
  p.stroke(255, 255, 255, 130);
  p.strokeWeight(Math.max(0.6, 0.9 * s));
  p.bezier(hand.x, hand.y, c1.x, c1.y, c2.x, c2.y, tip.x, tip.y);
  p.noStroke();

  // reel — a colored drum with a little crank, at the grip
  p.fill(reelColor);
  p.circle(hand.x, hand.y, 8.5 * s);
  p.fill(255, 255, 255, 90);
  p.circle(hand.x - s, hand.y - s, 3.4 * s);
  const crankOffset = dirFromAngle(p, armAngle + 130, 5 * s);
  const crankTip = { x: hand.x + crankOffset.x, y: hand.y + crankOffset.y };
  p.stroke(reelColor);
  p.strokeWeight(Math.max(1, 1.3 * s));
  p.line(hand.x, hand.y, crankTip.x, crankTip.y);
  p.noStroke();
  p.fill(255, 255, 255, 220);
  p.circle(crankTip.x, crankTip.y, 2.6 * s);

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

  return { x: x + tip.x * facing, y: y + tip.y };
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

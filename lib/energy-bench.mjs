import * as k from "./anatomy-kit.mjs";
// Figure concept: a tilting PV test panel and a meter share one cosine model.
// Parts: 1 bedplate, 8 foot/pad solids, 8 corner fasteners, 2 rails,
// 4 rail stops, 2 pedestals, 2 hinge housings, 1 panel frame, 24 PV cells,
// 2 meter housings, 1 display, 3 buttons, 6 vents, 3 conductive traces,
// 6 terminals, 1 ruler strip, 1 engraved nameplate. 74 purposeful parts.
const P = k.fitProjection(
  [
    [-145, -83, -20],
    [145, 83, -20],
    [-115, -50, 145],
    [145, 83, 48],
  ],
  620,
  390,
  { pad: 24, azimuth: 48, elevation: 32 },
);
const at = (p) => k.iso(p, P);
const path = (pts) => k.pathOf(pts.map(at), true);
const slab = (x, y, w, d, z, h, lit = false) =>
  k.solidSvg(k.slabOf({ x, y, w, d, r: 1.5 }, z, h, P, 3, 0.6), {
    tone: "mid",
    lit,
  });
export function solarModel(tilt) {
  const angle = Math.min(75, Math.max(0, Number(tilt) || 0));
  return {
    angle,
    relativePower: Math.max(0, Math.cos((angle * Math.PI) / 180)),
    percent: Math.round(Math.cos((angle * Math.PI) / 180) * 100),
  };
}
export function panelGeometry(tilt = 25) {
  const { angle } = solarModel(tilt);
  const r = (angle * Math.PI) / 180;
  const point = (x, v, z = 0) => [
    x,
    25 + v * Math.cos(r) + z * Math.sin(r),
    43 - v * Math.sin(r) + z * Math.cos(r),
  ];
  const poly = (pts, cls) => `<path class="${cls}" d="${path(pts)}"/>`;
  let svg = poly(
    [
      point(-119, -76, -3),
      point(-13, -76, -3),
      point(-13, 0, -3),
      point(-119, 0, -3),
    ],
    "panel-side",
  );
  svg += poly(
    [
      point(-13, -76, -3),
      point(-13, -76, 0),
      point(-13, 0, 0),
      point(-13, 0, -3),
    ],
    "panel-edge",
  );
  svg += poly(
    [
      point(-119, 0, -3),
      point(-13, 0, -3),
      point(-13, 0, 0),
      point(-119, 0, 0),
    ],
    "panel-edge",
  );
  svg += poly(
    [point(-119, -76), point(-13, -76), point(-13, 0), point(-119, 0)],
    "panel-frame",
  );
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 6; col++) {
      const x = -115 + col * 16.7,
        v = -72 + row * 17.4;
      svg += poly(
        [
          point(x, v, 0.4),
          point(x + 14.2, v, 0.4),
          point(x + 14.2, v + 14.8, 0.4),
          point(x, v + 14.8, 0.4),
        ],
        "pv-cell",
      );
      svg += `<path class="cell-bus" d="${k.pathOf([at(point(x + 4.7, v, 0.5)), at(point(x + 4.7, v + 14.8, 0.5))])}${k.pathOf([at(point(x + 9.4, v, 0.5)), at(point(x + 9.4, v + 14.8, 0.5))])}"/>`;
    }
  return svg;
}
export function meterGeometry(tilt = 25) {
  const model = solarModel(tilt);
  let svg = slab(61, -2, 62, 35, 34, 0.7);
  for (let i = 0; i < 7; i++) {
    const x = 65 + i * 7.5;
    svg += `<g class="meter-led" opacity="${i / 7 < model.relativePower ? 1 : 0.12}">${slab(x, 3, 4.8, 22, 35, 0.6, true)}</g>`;
  }
  return svg;
}
export function energyBench() {
  let svg = "";
  const base = { x: -145, y: -83, w: 290, d: 166, r: 9 };
  svg += `<path class="bench-shadow" d="${k.haloOf(base, -19, 10, P)}"/>`;
  for (const [x, y] of k
    .corners(base, 20)
    .sort(
      (a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P),
    )) {
    svg += slab(x - 7, y - 7, 14, 14, -19, 6);
    svg += slab(x - 8, y - 8, 16, 16, -13, 3);
  }
  svg += k.solidSvg(k.slabOf(base, -10, 10, P, 6, 1.5), { tone: "hi" });
  svg += k.lineSvg(k.planOutline(k.insetPlan(base, 5), 0.1, P), {
    tone: "faint",
  });
  for (const [x, y] of k.corners(base, 12)) {
    svg += slab(x - 2, y - 2, 4, 4, 0.2, 0.5);
    svg += k.lineSvg(k.lineOnTop([x - 1.5, y], [x + 1.5, y], 0.8, P), {
      tone: "hi",
    });
  }
  for (const y of [-55, 46]) {
    svg += slab(-130, y, 125, 5, 0, 3);
    for (const x of [-132, -7]) svg += slab(x, y - 2, 5, 9, 0, 6);
  }
  // Conductive tracks stay on the instrument's bedplate and terminate at contacts.
  for (const y of [28, 39, 50]) {
    svg += `<g class="bench-trace">${slab(-7, y, 53, 1.6, 0.1, 0.25, true)}${slab(44, y, 1.6, 58 - y, 0.1, 0.25, true)}${slab(44, 56, 13, 1.6, 0.1, 0.25, true)}</g>`;
    svg += slab(-10, y - 1, 4, 4, 0.4, 1.2);
    svg += slab(56, 54, 4, 4, 0.4, 1.2);
  }
  for (const x of [-109, -31]) {
    svg += slab(x, 15, 14, 21, 0, 4);
    svg += slab(x + 3, 20, 8, 10, 4, 33);
    svg += slab(x, 19, 14, 12, 37, 6);
  }
  svg += `<g id="lab-panel">${panelGeometry(25)}</g>`;
  svg += slab(50, -15, 85, 73, 0, 6);
  svg += slab(54, -11, 77, 65, 6, 27);
  svg += k.lineSvg(
    k.planOutline({ x: 58, y: -7, w: 69, d: 57, r: 2 }, 33.2, P),
    { tone: "faint" },
  );
  svg += `<g id="lab-meter">${meterGeometry(25)}</g>`;
  for (let i = 0; i < 3; i++)
    svg += slab(64 + i * 22, 40, 11, 7, 34, 2, i === 0);
  for (let i = 0; i < 6; i++) svg += slab(57 + i * 11, -8, 7, 2, 33.5, 0.5);
  const strip = { x: -128, y: 68, w: 250, d: 6, r: 0.6 };
  svg += slab(strip.x, strip.y, strip.w, strip.d, 0, 0.5);
  const ticks = k.topTicks(-124, 118, 5, 5, 68, 0.7, [2.5, 5], P);
  svg +=
    k.lineSvg(ticks.minor, { tone: "lo" }) +
    k.lineSvg(ticks.major, { tone: "hi" });
  svg += slab(-20, -71, 37, 13, 0.4, 0.7);
  const label = at([-1, -64, 1.2]);
  svg += `<text x="${label[0]}" y="${label[1]}" class="bench-engraving" text-anchor="middle">AK / LAB</text>`;
  return `<svg id="energy-bench" viewBox="0 0 620 390" role="img" aria-labelledby="bench-title bench-description"><title id="bench-title">Interactive solar energy test bench</title><desc id="bench-description">An isometric solar panel on a test stand connected to an output meter. Adjust the tilt below to explore the simplified relationship between panel angle and direct sunlight.</desc>${svg}</svg>`;
}

// Generates the "deploy log" terminal animation for the SBZ showcase.
// On-brand: aurora gradient over a near-black terminal window, a typed prompt,
// staggered green checkmark build steps, and a final "Deployed" highlight.
// Run: node script/generate.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = `${__dir}/../public/projects/main-project/scene-1/lottie.json`;
const CONTROLS = `${__dir}/../public/projects/main-project/scene-1/controls.json`;

// ---- canvas / timing -------------------------------------------------------
const W = 800, H = 500, FR = 60, OP = 300;

// ---- brand palette (sRGB 0..1, from app/globals.css) -----------------------
const C = {
  bg:        [0.0196, 0.0235, 0.0431, 1], // #05060b
  card:      [0.047,  0.059,  0.098,  1], // #0c0f19
  cardHi:    [0.086,  0.106,  0.161,  1], // #161b29
  line:      [0.153,  0.18,   0.263,  1], // #272e43
  barGrey:   [0.18,   0.212,  0.314,  1], // #2e3650-ish
  accent:    [0.302,  0.486,  1,      1], // #4d7cff
  accentGlow:[0.478,  0.635,  1,      1], // #7aa2ff
  violet:    [0.616,  0.482,  1,      1], // #9d7bff
  green:     [0.204,  0.827,  0.6,    1], // #34d399
  red:       [0.957,  0.451,  0.431,  1], // #f4736e
  amber:     [1,      0.706,  0.329,  1], // #ffb454
  ink3:      [0.412,  0.443,  0.541,  1], // #69718a
};

// ---- easing presets --------------------------------------------------------
const EO = { x: [0.16], y: [1] };   // ease-out (deceleration)
const EI = { x: [0.7],  y: [0] };   // ease-in
const EIO_I = { x: [0.4], y: [1] };
const EIO_O = { x: [0.4], y: [0] };

// keyframe builders ----------------------------------------------------------
const kf = (frames) => ({ a: 1, k: frames });
const stat = (k) => ({ a: 0, k });
// helper for an animated array property with smooth in/out beziers
function anim(stops) {
  // stops: [{t, s, i?, o?}]; auto-attach default smooth bezier when omitted
  const k = stops.map((s, idx) => {
    if (idx === stops.length - 1) return { t: s.t, s: s.s };
    return { t: s.t, s: s.s, i: s.i || EO, o: s.o || EI };
  });
  return kf(k);
}

// shape primitives -----------------------------------------------------------
const rect = (w, h, x = 0, y = 0, r = 0) => ({ ty: "rc", d: 1, s: stat([w, h]), p: stat([x, y]), r: stat(r), nm: "rc" });
const ellipse = (w, h, x = 0, y = 0) => ({ ty: "el", d: 1, s: stat([w, h]), p: stat([x, y]), nm: "el" });
const fill = (c) => ({ ty: "fl", c: typeof c === "string" ? { sid: c } : stat(c), o: stat(100), r: 1, nm: "fl" });
const stroke = (c, w, o = 100) => ({ ty: "st", c: typeof c === "string" ? { sid: c } : stat(c), o: stat(o), w: stat(w), lc: 2, lj: 2, ml: 4, nm: "st" });
const tr = (opts = {}) => ({
  ty: "tr",
  p: opts.p || stat([0, 0]),
  a: opts.a || stat([0, 0]),
  s: opts.s || stat([100, 100]),
  r: opts.r || stat(0),
  o: opts.o || stat(100),
  nm: "tr",
});
const group = (items, trOpts) => ({ ty: "gr", it: [...items, tr(trOpts)], nm: "gr" });

// radial gradient fill (center color -> transparent edge)
function radial(center, edge, rgb, alphaCenter) {
  return {
    ty: "gf", t: 2, nm: "gf",
    s: stat(center), e: stat(edge),
    g: { p: 2, k: stat([0, rgb[0], rgb[1], rgb[2], 1, rgb[0], rgb[1], rgb[2], 0, alphaCenter, 1, 0]) },
    o: stat(100), r: 1,
  };
}

// open-path shape (for the checkmark)
const path = (verts, closed = false) => ({
  ty: "sh", nm: "sh",
  ks: stat({ i: verts.map(() => [0, 0]), o: verts.map(() => [0, 0]), v: verts, c: closed }),
});

// layer factory --------------------------------------------------------------
let _ind = 0;
function layer(nm, shapes, ks, { ip = 0, op = OP } = {}) {
  return { ddd: 0, ind: ++_ind, ty: 4, nm, sr: 1, ip, op, st: 0, bm: 0, ao: 0,
    ks: { o: ks.o || stat(100), r: ks.r || stat(0), p: ks.p || stat([0, 0]), a: ks.a || stat([0, 0]), s: ks.s || stat([100, 100]) },
    shapes };
}

// fade a whole layer out near the loop end for a clean restart
const loopFadeOut = anim([{ t: 0, s: [100] }, { t: 276, s: [100] }, { t: 296, s: [0] }]);

// ===========================================================================
// LAYERS  (Lottie paints last-in-array first; we build top-most last)
// ===========================================================================
const layers = [];

// --- background solid (slotted bg color) -----------------------------------
layers.push(layer("background",
  [group([rect(W, H, 0, 0, 0), fill("bgColor")], { p: stat([W / 2, H / 2]) })],
  {}));

// --- aurora blobs (radial gradients drifting + climax pulse) ----------------
function blob(nm, rgb, cx, cy, rad, drift, baseOp, peakOp) {
  const center = [0, 0];
  const edge = [rad, 0];
  return layer(nm,
    [group([ellipse(rad * 2, rad * 2, 0, 0), radial(center, edge, rgb, 0.55)], { p: stat([0, 0]) })],
    {
      p: anim([
        { t: 0,   s: [cx - drift, cy] },
        { t: 150, s: [cx + drift, cy - drift * 0.5] },
        { t: 300, s: [cx - drift, cy] },
      ]),
      s: anim([
        { t: 0,   s: [100, 100] },
        { t: 210, s: [118, 118] },
        { t: 300, s: [100, 100] },
      ]),
      o: anim([
        { t: 0,   s: [baseOp] },
        { t: 200, s: [peakOp] },
        { t: 235, s: [peakOp] },
        { t: 300, s: [baseOp] },
      ]),
    });
}
layers.push(blob("aurora-cobalt", C.accent,    260, 180, 300, 60, 42, 70));
layers.push(blob("aurora-violet", C.violet,    560, 360, 280, 70, 34, 58));
layers.push(blob("aurora-glow",   C.accentGlow,520, 140, 200, 50, 24, 46));

// --- terminal window (chrome) ----------------------------------------------
// geometry
const TX = 130, TY = 96, TW = 540, TH = 308;          // outer box
const TCX = TX + TW / 2, TCY = TY + TH / 2;
const BARH = 38;                                       // title bar height
const win = [];
// body card
win.push(group([rect(TW, TH, 0, 0, 14), fill(C.card), stroke(C.line, 1.5)], { p: stat([TCX, TCY]) }));
// title bar strip
win.push(group([rect(TW, BARH, 0, 0, 14), fill(C.cardHi)], { p: stat([TCX, TY + BARH / 2]) }));
// divider under title bar
win.push(group([rect(TW, 1.5, 0, 0, 0), fill(C.line)], { p: stat([TCX, TY + BARH]) }));
// traffic lights
const dotY = TY + BARH / 2;
win.push(group([ellipse(11, 11, 0, 0), fill(C.red)],   { p: stat([TX + 22, dotY]) }));
win.push(group([ellipse(11, 11, 0, 0), fill(C.amber)], { p: stat([TX + 42, dotY]) }));
win.push(group([ellipse(11, 11, 0, 0), fill(C.green)], { p: stat([TX + 62, dotY]) }));
// window title pill (small bars suggesting "sbz-showcase")
win.push(group([rect(96, 8, 0, 0, 4), fill(C.barGrey)], { p: stat([TCX, dotY]) }));

win.reverse(); // shapes paint first-on-top; put body card at the back
layers.push(layer("terminal", win, {
  a: stat([TCX, TCY]),
  p: stat([TCX, TCY]),
  s: anim([{ t: 0, s: [86, 86] }, { t: 20, s: [100, 100] }]),
  o: anim([{ t: 0, s: [0] }, { t: 16, s: [100] }, { t: 282, s: [100] }, { t: 300, s: [0] }]),
}, { ip: 0 }));

// --- content geometry -------------------------------------------------------
const PADX = TX + 26;          // left text margin
const CONTENT_TOP = TY + BARH + 30;
const LH = 38;                 // line height
const lineY = (i) => CONTENT_TOP + i * LH;

// reveal helper: group that scales in horizontally from its left edge
function revealBarH(w, h, x, y, color, startF, dur = 16) {
  return {
    ...group([rect(w, h, w / 2, 0, h / 2), fill(color)], {
      a: stat([0, 0]),
      p: stat([x, y]),
      s: anim([{ t: startF, s: [0, 100], i: EO, o: EI }, { t: startF + dur, s: [100, 100] }]),
    }),
  };
}
// fade+slide-in bar
function fadeBar(w, h, x, y, color, startF) {
  return group([rect(w, h, 0, 0, h / 2), fill(color)], {
    p: anim([{ t: startF, s: [x - 10, y] }, { t: startF + 14, s: [x, y] }]),
    o: anim([{ t: startF, s: [0] }, { t: startF + 12, s: [100] }]),
  });
}

// --- prompt line ($ ship --all, typed) -------------------------------------
const promptStart = 22;
const promptItems = [];
// cobalt chevron ">"  (two strokes)
promptItems.push(group([
  path([[-4, -7], [4, 0], [-4, 7]]),
  stroke("accentColor", 3),
], { p: stat([PADX + 4, lineY(0)]) }));
// typed command bar (reveals left->right)
promptItems.push(revealBarH(150, 9, PADX + 18, lineY(0), "accentColor", promptStart + 4, 22));
// blinking block cursor
promptItems.push(group([rect(9, 16, 0, 0, 1), fill("accentColor")], {
  p: stat([PADX + 178, lineY(0)]),
  o: kf([
    { t: 0,   s: [100], h: 1 }, { t: 22, s: [0], h: 1 }, { t: 44, s: [100], h: 1 },
    { t: 66,  s: [0], h: 1 }, { t: 88, s: [100], h: 1 }, { t: 110, s: [0], h: 1 },
    { t: 132, s: [100], h: 1 }, { t: 154, s: [0], h: 1 }, { t: 176, s: [100], h: 1 },
    { t: 198, s: [0], h: 1 },
  ]),
}));
layers.push(layer("prompt", promptItems, { o: loopFadeOut }, { ip: promptStart }));

// --- build step lines -------------------------------------------------------
// each: checkmark (trim-draws on) + grey label bars + a colored status bar
function stepLine(idx, startF, barWidths, statusColor) {
  const y = lineY(1 + idx);
  const items = [];
  // checkmark, drawn via trim path
  items.push(group([
    path([[-6, 1], [-2, 6], [7, -7]]),
    { ty: "tm", nm: "tm", s: stat(0), e: anim([{ t: startF, s: [0] }, { t: startF + 12, s: [100] }]), o: stat(0), m: 1 },
    stroke("checkColor", 2.8),
  ], { p: stat([PADX + 6, y]) }));
  // label bars
  let cx = PADX + 26;
  barWidths.forEach((bw, i) => {
    items.push(fadeBar(bw, 8, cx, y, C.barGrey, startF + 4 + i * 3));
    cx += bw + 12;
  });
  // status bar (colored) at the right side of the line
  items.push(fadeBar(46, 8, PADX + 430, y, statusColor, startF + 10));
  return layer(`step-${idx + 1}`, items, { o: loopFadeOut }, { ip: startF });
}
layers.push(stepLine(0, 84,  [54, 90, 40], C.green));
layers.push(stepLine(1, 116, [72, 60, 84], C.green));
layers.push(stepLine(2, 148, [48, 110, 36], C.green));
layers.push(stepLine(3, 180, [64, 78, 52], C.accent));

// --- final "Deployed" highlight line ---------------------------------------
const finStart = 214;
const finY = lineY(5) + 6;
const finItems = [];
// highlight backdrop (subtle green wash) with a glow pulse
finItems.push(group([rect(360, 26, 0, 0, 8), fill(C.green)], {
  a: stat([0, 0]), p: stat([PADX + 174, finY]),
  o: anim([{ t: finStart, s: [0] }, { t: finStart + 14, s: [16] }, { t: finStart + 40, s: [10] }]),
  s: anim([{ t: finStart, s: [70, 70] }, { t: finStart + 16, s: [100, 100] }]),
}));
// big checkmark
finItems.push(group([
  path([[-7, 1], [-2, 7], [9, -8]]),
  { ty: "tm", nm: "tm", s: stat(0), e: anim([{ t: finStart + 4, s: [0] }, { t: finStart + 18, s: [100] }]), o: stat(0), m: 1 },
  stroke("checkColor", 3.4),
], { p: stat([PADX + 12, finY]) }));
// "Deployed to production" bars (green, emphasised)
finItems.push(fadeBar(120, 10, PADX + 30, finY, "checkColor", finStart + 12));
finItems.push(fadeBar(150, 10, PADX + 162, finY, C.accentGlow, finStart + 18));
finItems.reverse(); // keep the green highlight wash behind the bars/checkmark
layers.push(layer("deployed", finItems, { o: loopFadeOut }, { ip: finStart }));

// ===========================================================================
// Lottie paints layers[0] on TOP. We built them bottom-up (background first),
// so reverse to put the background at the back and content in front.
layers.reverse();

const doc = {
  v: "5.7.0", fr: FR, ip: 0, op: OP, w: W, h: H, nm: "SBZ — deploy log",
  ddd: 0, assets: [],
  slots: {
    bgColor:     { p: { a: 0, k: C.bg } },
    accentColor: { p: { a: 0, k: C.accent } },
    checkColor:  { p: { a: 0, k: C.green } },
  },
  layers,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(doc));
writeFileSync(CONTROLS, JSON.stringify({
  controls: [
    { sid: "bgColor", label: "Background color" },
    { sid: "accentColor", label: "Aurora / prompt accent" },
    { sid: "checkColor", label: "Build-step ✓ color" },
  ],
}, null, 2));
console.log(`Wrote ${layers.length} layers -> ${OUT}`);

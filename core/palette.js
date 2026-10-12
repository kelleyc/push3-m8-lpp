/*
 * core/palette.js
 * --------------------------------------------------------------------------
 * LPP palette index (what the M8 sends as velocity) -> Push script palette
 * index (what `send_value` on a grabbed Push control expects).
 *
 * The two palettes are different and the Push *script* palette is
 * undocumented. Push indices used here come only from an earlier
 * calibration in Controller mode (2026-07-06). Anything marked "guess" must be confirmed in S4 on
 * Standalone; use `lpp_color <lpp> <push>` live and bake the winners into
 * OVERRIDES below.
 *
 * LPP palette shape (Novation): 0 off, 1-3 greys -> white, then hue groups
 * of four from index 4 (light, full, dim, darker): red 4-7, orange 8-11,
 * yellow 12-15, lime 16-19, green 20-23, spring 24-27, teal 28-31,
 * cyan 32-35, sky 36-39, blue 40-43, indigo 44-47, purple 48-51,
 * magenta 52-55, pink 56-59. 60+ is irregular; it is mapped by the
 * explicit table and otherwise falls back to "white".
 *
 * Colours the M8 is known to send (from the Move emulator's LUT):
 *   1 dim grey, 3 white, 5 red, 7 dark red, 19 aqua-ish, 21 green,
 *   22 fern, 23 lime-ish, 39 blue, 43 azure, 57 red/pink, 71 pink,
 *   78 blue, 120 red.
 *
 * ES5 only.
 * --------------------------------------------------------------------------
 */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.M8Palette = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Push script palette — verified entries from an earlier on-hardware calibration.
  var PUSH = {
    off: 0,
    orange: 3,        // verified
    amber: 5,         // photo read
    green: 126,       // verified, saturated
    greenSoft: 11,    // verified
    greenPastel: 45,  // verified
    blue: 125,        // verified, saturated
    blueSoft: 21,     // verified
    red: 127,         // verified, saturated
    white: 120,       // verified, brightest
    whiteDim: 123,    // verified
    greyDark: 117,    // photo read, near-off
    paleBlue: 118,    // photo read
    orangeLight: 72,  // verified
    gold: 80          // photo read
  };

  // family -> [full, dim] Push indices, with confidence
  var FAMILY = {
    white:   { full: PUSH.white, dim: PUSH.whiteDim, confidence: "verified" },
    red:     { full: PUSH.red, dim: PUSH.orange, confidence: "verified/guess-dim" },
    orange:  { full: PUSH.orange, dim: PUSH.orangeLight, confidence: "verified" },
    yellow:  { full: PUSH.amber, dim: PUSH.gold, confidence: "guess" },
    lime:    { full: PUSH.greenSoft, dim: PUSH.greenPastel, confidence: "guess" },
    green:   { full: PUSH.green, dim: PUSH.greenSoft, confidence: "verified" },
    spring:  { full: PUSH.greenPastel, dim: PUSH.greenSoft, confidence: "guess" },
    teal:    { full: PUSH.paleBlue, dim: PUSH.blueSoft, confidence: "guess" },
    cyan:    { full: PUSH.paleBlue, dim: PUSH.blueSoft, confidence: "guess" },
    sky:     { full: PUSH.paleBlue, dim: PUSH.blueSoft, confidence: "guess" },
    blue:    { full: PUSH.blue, dim: PUSH.blueSoft, confidence: "verified" },
    indigo:  { full: PUSH.blue, dim: PUSH.blueSoft, confidence: "guess" },
    purple:  { full: PUSH.blueSoft, dim: PUSH.blueSoft, confidence: "guess — no purple calibrated" },
    magenta: { full: PUSH.red, dim: PUSH.orange, confidence: "guess — no magenta calibrated" },
    pink:    { full: PUSH.orangeLight, dim: PUSH.greyDark, confidence: "guess — no pink calibrated" }
  };

  var GROUPS = ["red", "orange", "yellow", "lime", "green", "spring", "teal",
    "cyan", "sky", "blue", "indigo", "purple", "magenta", "pink"];

  // Explicit LPP entries that matter for the M8 (and the irregular 60+ range).
  var EXPLICIT = {
    0: { push: PUSH.off, family: "off" },
    1: { push: PUSH.greyDark, family: "white", note: "M8 dim grey" },
    2: { push: PUSH.whiteDim, family: "white" },
    3: { push: PUSH.white, family: "white", note: "M8 white (non-empty phrase)" },
    71: { push: PUSH.orangeLight, family: "pink", note: "M8 pink (empty phrase) — guess" },
    78: { push: PUSH.blue, family: "blue", note: "M8 blue" },
    120: { push: PUSH.red, family: "red", note: "M8 red" }
  };

  // Bake S4 results here: lppIndex -> pushIndex.
  var OVERRIDES = {};

  function describe(lpp) {
    lpp = Math.max(0, Math.min(127, Math.floor(Number(lpp) || 0)));
    if (EXPLICIT.hasOwnProperty(lpp)) return EXPLICIT[lpp];
    if (lpp >= 4 && lpp <= 59) {
      var family = GROUPS[Math.floor((lpp - 4) / 4)];
      var shade = (lpp - 4) % 4; // 0 light, 1 full, 2 dim, 3 darker
      var f = FAMILY[family];
      return { push: shade >= 2 ? f.dim : f.full, family: family, shade: shade, confidence: f.confidence };
    }
    return { push: PUSH.white, family: "white", confidence: "fallback" };
  }

  function createPalette(overrides) {
    var table = {};
    var k;
    for (k in OVERRIDES) if (OVERRIDES.hasOwnProperty(k)) table[k] = OVERRIDES[k];
    if (overrides) for (k in overrides) if (overrides.hasOwnProperty(k)) table[k] = overrides[k];
    var seen = {};

    function clamp(v) { return Math.max(0, Math.min(127, Math.floor(Number(v) || 0))); }

    function toPush(lpp, dim) {
      lpp = clamp(lpp);
      seen[lpp] = (seen[lpp] || 0) + 1;
      if (lpp === 0) return 0;
      var d = describe(lpp);
      var base = table.hasOwnProperty(lpp) ? clamp(table[lpp]) : d.push;
      if (!dim) return base;
      var fam = FAMILY[d.family];
      if (fam && base !== fam.dim) return fam.dim;
      return PUSH.greyDark;
    }

    return {
      toPush: toPush,
      set: function (lpp, push) { table[clamp(lpp)] = clamp(push); },
      clearOverride: function (lpp) { delete table[clamp(lpp)]; },
      overrides: function () { var o = {}; for (var x in table) if (table.hasOwnProperty(x)) o[x] = table[x]; return o; },
      // LPP indices the M8 actually used this session, with their mapping.
      usage: function () {
        var out = [];
        for (var x in seen) if (seen.hasOwnProperty(x)) {
          var d = describe(x);
          out.push({ lpp: Number(x), count: seen[x], push: table.hasOwnProperty(x) ? table[x] : d.push, family: d.family, confidence: table.hasOwnProperty(x) ? "override" : (d.confidence || "explicit") });
        }
        out.sort(function (a, b) { return a.lpp - b.lpp; });
        return out;
      },
      resetUsage: function () { seen = {}; }
    };
  }

  return { createPalette: createPalette, describe: describe, PUSH: PUSH, FAMILY: FAMILY, OVERRIDES: OVERRIDES };
});

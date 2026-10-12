/*
 * Pure-core tests. No Max, no LiveAPI. Run: node tests/core.test.js
 */
const assert = require("assert");
const midi = require("../core/midi-stream.js");
const lpp = require("../core/lpp.js");
const leds = require("../core/led-state.js");
const paletteModule = require("../core/palette.js");
const map = require("../core/push-map.js");
const { createBridge, STATE } = require("../core/bridge.js");

let passed = 0;
function test(name, fn) {
  try { fn(); passed += 1; console.log("ok - " + name); }
  catch (e) { console.error("not ok - " + name); throw e; }
}

function fakeClock(start) {
  let t = start || 1000;
  const f = () => t;
  f.advance = (ms) => { t += ms; };
  return f;
}

// ---- midi-stream -----------------------------------------------------------

test("parser: channel messages with running status", () => {
  const got = [];
  const p = midi.createMidiParser({ onMessage: (m) => got.push(m) });
  p.feedList([0x90, 81, 21, 82, 5, 0x91, 11, 3]);
  assert.deepStrictEqual(got, [[0x90, 81, 21], [0x90, 82, 5], [0x91, 11, 3]]);
});

test("parser: realtime bytes inside SysEx do not corrupt it", () => {
  const sys = []; const rt = [];
  const p = midi.createMidiParser({ onSysex: (s) => sys.push(s), onRealtime: (b) => rt.push(b) });
  p.feedList([0xF0, 0x7E, 0xF8, 0x7F, 0x06, 0x01, 0xF7]);
  assert.deepStrictEqual(sys, [[0xF0, 0x7E, 0x7F, 0x06, 0x01, 0xF7]]);
  assert.deepStrictEqual(rt, [0xF8]);
});

test("parser: a status byte aborts an unterminated SysEx", () => {
  const sys = []; const msgs = [];
  const p = midi.createMidiParser({ onSysex: (s) => sys.push(s), onMessage: (m) => msgs.push(m) });
  p.feedList([0xF0, 0x7E, 0x90, 11, 5]);
  assert.strictEqual(sys.length, 0);
  assert.deepStrictEqual(msgs, [[0x90, 11, 5]]);
});

test("deduper drops only the cross-source second copy", () => {
  const clock = fakeClock();
  const dup = midi.createDeduper(50, clock);
  const s = [0xF0, 1, 0xF7];
  assert.strictEqual(dup(s, "midiin"), false);
  assert.strictEqual(dup(s, "sysexin"), true);
  assert.strictEqual(dup(s, "midiin"), false);
  assert.strictEqual(dup(s, "midiin"), false, "same-source repeat is real");
  clock.advance(100);
  assert.strictEqual(dup(s, "sysexin"), false);
});

// ---- lpp ------------------------------------------------------------------

test("identity reply is the 17-byte LPP MK3 Application reply", () => {
  assert.deepStrictEqual(lpp.identityReply("mk3"),
    [0xF0, 0x7E, 0x00, 0x06, 0x02, 0x00, 0x20, 0x29, 0x13, 0x01, 0x00, 0x00, 0, 1, 0, 0, 0xF7]);
  assert.deepStrictEqual(lpp.identityReply("generic").slice(8, 12), [0, 0, 0, 0]);
});

test("device inquiry matches any device id", () => {
  assert(lpp.isDeviceInquiry([0xF0, 0x7E, 0x7F, 0x06, 0x01, 0xF7]));
  assert(lpp.isDeviceInquiry([0xF0, 0x7E, 0x00, 0x06, 0x01, 0xF7]));
  assert(!lpp.isDeviceInquiry([0xF0, 0x7E, 0x7F, 0x06, 0x02, 0xF7]));
});

test("layout: 64 grid + 9 top + logo + 8 left + 8 right + 16 bottom", () => {
  const all = lpp.allPositions();
  assert.strictEqual(all.length, 64 + 10 + 8 + 8 + 16);
  assert(lpp.isGridNote(11) && lpp.isGridNote(88) && !lpp.isGridNote(19) && !lpp.isGridNote(90));
  assert.strictEqual(lpp.BORDER[89].name, "Scene 1");
  assert.strictEqual(lpp.BORDER[19].name, "Scene 8");
});

test("M8 LED messages: channel = mode, note-off = dark, CCs accepted", () => {
  assert.deepStrictEqual(lpp.parseM8Message([0x90, 81, 21]).mode, "static");
  assert.deepStrictEqual(lpp.parseM8Message([0x91, 81, 21]).mode, "flash");
  assert.deepStrictEqual(lpp.parseM8Message([0x92, 81, 21]).mode, "pulse");
  assert.strictEqual(lpp.parseM8Message([0x80, 81, 64]).color, 0);
  assert.strictEqual(lpp.parseM8Message([0xB0, 20, 21]).kind, "led");
  assert.strictEqual(lpp.parseM8Message([0x93, 81, 21]).kind, "other"); // ch4 is not LPP
});

test("Novation SysEx: programmer mode and LED lighting", () => {
  assert.deepStrictEqual(lpp.parseNovationSysex([0xF0, 0, 0x20, 0x29, 2, 0x0E, 0x0E, 1, 0xF7]), { kind: "programmer", on: true });
  const r = lpp.parseNovationSysex([0xF0, 0, 0x20, 0x29, 2, 0x0E, 0x03, 0, 11, 5, 1, 12, 3, 21, 2, 13, 9, 3, 14, 127, 0, 0, 0xF7]);
  assert.deepStrictEqual(r.leds.map((l) => l.mode), ["static", "flash", "pulse", "rgb"]);
  assert.strictEqual(r.leds[1].color, 21);
  assert.strictEqual(r.leds[1].base, 3);
});

test("press encoding: grid notes; borders as CC (default) or note", () => {
  assert.deepStrictEqual(lpp.encodePress(11, 100), [0x90, 11, 100]);
  assert.deepStrictEqual(lpp.encodePress(11, 0), [0x90, 11, 0]);
  assert.deepStrictEqual(lpp.encodePress(11, 0.4), [0x90, 11, 1]);
  assert.deepStrictEqual(lpp.encodePress(20, 127), [0xB0, 20, 127]);
  assert.deepStrictEqual(lpp.encodePress(20, 0), [0xB0, 20, 0]);
  assert.deepStrictEqual(lpp.encodePress(20, 127, { buttonMode: "note" }), [0x90, 20, 100]);
  assert.deepStrictEqual(lpp.encodePress(20, 0, { buttonMode: "note" }), [0x80, 20, 0]);
  assert.strictEqual(lpp.encodePress(99, 127), null); // logo is LED only
});

// ---- led-state --------------------------------------------------------------

test("flash keeps the static colour as its B side", () => {
  const s = leds.createLedState();
  s.set(81, 3, "static", 0);
  s.set(81, 21, "flash", 0);
  const a = leds.createAnimator({ bpm: 120 }); // beat 500 ms
  assert.strictEqual(a.display(s.get(81), 100).color, 21);
  assert.strictEqual(a.display(s.get(81), 300).color, 3);
});

test("static refresh does not cancel a flash that is re-armed within grace", () => {
  const s = leds.createLedState({ stopGraceMs: 60 });
  s.set(81, 21, "flash", 0);
  s.set(81, 3, "static", 1000);  // M8 full repaint...
  s.set(81, 21, "flash", 1005);  // ...then the overlay again
  s.settle(1100);
  assert.strictEqual(s.get(81).mode, "flash");
  s.set(81, 3, "static", 2000);  // no re-arm this time
  s.settle(2030);
  assert.strictEqual(s.get(81).mode, "flash");
  s.settle(2061);
  assert.strictEqual(s.get(81).mode, "static");
  assert.strictEqual(s.get(81).base, 3);
});

test("pulse alternates full and dim", () => {
  const a = leds.createAnimator({ bpm: 120 }); // pulse period 1000 ms
  const st = { mode: "pulse", color: 21, base: 0 };
  assert.strictEqual(a.display(st, 100).dim, false);
  assert.strictEqual(a.display(st, 600).dim, true);
});

// ---- palette ---------------------------------------------------------------

test("palette: verified anchors and overrides", () => {
  const p = paletteModule.createPalette();
  assert.strictEqual(p.toPush(0), 0);
  assert.strictEqual(p.toPush(3), 120);  // white
  assert.strictEqual(p.toPush(5), 127);  // red
  assert.strictEqual(p.toPush(21), 126); // green
  assert.strictEqual(p.toPush(41), 125); // blue
  assert.strictEqual(p.toPush(3, true), 123); // dim white
  p.set(71, 44);
  assert.strictEqual(p.toPush(71), 44);
  const u = p.usage();
  assert(u.some((r) => r.lpp === 71 && r.confidence === "override"));
});

// ---- push-map --------------------------------------------------------------

test("pad <-> LPP note corners", () => {
  assert.strictEqual(map.padToLpp(0, 0), 81);  // top-left
  assert.strictEqual(map.padToLpp(7, 0), 88);
  assert.strictEqual(map.padToLpp(0, 7), 11);  // bottom-left
  assert.strictEqual(map.padToLpp(7, 7), 18);
  for (let n = 11; n <= 88; n += 1) {
    if (!lpp.isGridNote(n)) continue;
    const p = map.lppToPad(n);
    assert.strictEqual(map.padToLpp(p.x, p.y), n);
  }
});

test("Push system buttons are never taken automatically", () => {
  const names = ["Setup_Button", "Add_Device_Button", "Browse_Mode_Button", "Fixed_Length_Button",
    "Quantization_Button", "Shift_Button", "Select_Button", "Clip_Mode_Button", "Sets_Button", "Layout",
    "Track_State_Button0", "Track_State_Button4"];
  const r = map.resolveBorderMap(names);
  const taken = Object.values(r.byLpp);
  ["Setup_Button", "Add_Device_Button", "Fixed_Length_Button", "Quantization_Button", "Shift_Button",
    "Clip_Mode_Button", "Sets_Button", "Track_State_Button0", "Track_State_Button4"]
    .forEach((n) => assert(!taken.includes(n), n + " must stay with Push"));
  assert.strictEqual(r.byLpp[98], "Browse_Mode_Button");
  assert.strictEqual(r.byLpp[97], "Layout", "Push 3 names its Layout button just 'Layout'");
  const o = map.resolveBorderMap(names, { 98: "Setup_Button" });
  assert.strictEqual(o.byLpp[98], "Setup_Button", "explicit override still allowed");
});

test("border resolver uses confirmed names and reports the rest", () => {
  const names = ["Select_Button", "Shift_Button", "Global_Mute_Button", "Global_Solo_Button",
    "Record_Button", "Play_Button", "Up_Arrow", "Down_Arrow", "Left_Arrow", "Right_Arrow",
    "Delete_Button", "Duplicate_Button", "Track_Select_Button0", "Track_Select_Button7",
    "Track_State_Button0", "Track_State_Button1", "Track_State_Button2", "Track_State_Button3"]
    .concat([0, 1, 2, 3, 4, 5, 6, 7].map((i) => "Scene_Launch_Button" + i));
  const r = map.resolveBorderMap(names);
  assert.strictEqual(r.byLpp[90], "Select_Button");
  assert.strictEqual(r.byLpp[2], "Global_Mute_Button");
  assert.strictEqual(r.byLpp[3], "Global_Solo_Button");
  assert.strictEqual(r.byLpp[89], "Scene_Launch_Button7"); // top scene = highest index
  assert.strictEqual(r.byLpp[19], "Scene_Launch_Button0");
  assert.strictEqual(r.byLpp[101], "Track_Select_Button0");
  assert.strictEqual(r.byLpp[1], undefined, "display-row buttons are left to Push");
  assert.strictEqual(r.byLpp[4], undefined);
  assert(!Object.values(r.byLpp).some((n) => /^Track_State_Button/.test(n)));
  assert(!Object.values(r.byLpp).includes("Shift_Button"));
  assert(r.missing.includes(102) && r.missing.includes(95));
  const o = map.resolveBorderMap(names, { 95: "Shift_Button", 90: "-" });
  assert.strictEqual(o.byLpp[95], "Shift_Button");
  assert.strictEqual(o.byLpp[90], undefined);
});

// ---- bridge ----------------------------------------------------------------

function makeBridge(extra) {
  const clock = fakeClock();
  const out = [];
  const logs = [];
  const b = createBridge(Object.assign({ now: clock, emitMidi: (x) => out.push(x), log: (t) => logs.push(t) }, extra || {}));
  return { b, clock, out, logs };
}

const INQUIRY = [0xF0, 0x7E, 0x7F, 0x06, 0x01, 0xF7];

test("S2 happy path: inquiry -> identity reply -> LED traffic -> PASS", () => {
  const { b, clock, out, logs } = makeBridge({ proactive: false });
  INQUIRY.forEach((x) => b.midiinByte(x));
  assert.strictEqual(out.length, 1);
  assert.deepStrictEqual(out[0], lpp.identityReply("pro3"));
  assert.strictEqual(b.stats().state, STATE.REPLIED);
  clock.advance(250);
  [0x90, 81, 1].forEach((x) => b.midiinByte(x));
  assert.strictEqual(b.stats().state, STATE.PASS);
  assert.strictEqual(b.stats().passAfterReplyMs, 250);
  assert(logs.some((l) => /^PASS/.test(l)));
  assert.strictEqual(out.length, 1, "nothing echoed back to the M8");
});

test("same inquiry via midiin and sysexin is answered once", () => {
  const { b, out } = makeBridge({ proactive: false });
  INQUIRY.forEach((x) => b.midiinByte(x));
  b.sysexinList(INQUIRY);
  assert.strictEqual(out.length, 1);
  assert.strictEqual(b.stats().inquiries, 1);
});

test("every repeated inquiry is answered", () => {
  const { b, clock, out } = makeBridge({ proactive: false });
  b.midiinList(INQUIRY); clock.advance(500); b.midiinList(INQUIRY);
  assert.strictEqual(out.length, 2);
});

test("proactive identity retries until the M8 speaks, then stops", () => {
  const { b, clock, out } = makeBridge({ proactiveIntervalMs: 1000, proactiveMax: 5 });
  b.tick(); clock.advance(500); b.tick(); clock.advance(600); b.tick();
  assert.strictEqual(out.length, 2);
  b.midiinList([0x90, 11, 3]);
  clock.advance(5000); b.tick();
  assert.strictEqual(out.length, 2);
  assert.strictEqual(b.stats().pass, 1);
  assert.strictEqual(b.stats().passAfterReplyMs, 0); // measured from the latest identity
});

test("proactive identity stops at the M8's first SysEx (no LED needed)", () => {
  const { b, clock, out } = makeBridge({ proactiveIntervalMs: 1000 });
  b.tick();
  b.midiinList([0xF0, 0x00, 0x20, 0x29, 0x02, 0x0E, 0x0E, 0x01, 0xF7]);
  for (let i = 0; i < 30; i += 1) { clock.advance(1000); b.tick(); }
  assert.strictEqual(out.length, 1);
});

test("an idle M8 is never re-introduced once LEDs have arrived", () => {
  const { b, clock, out } = makeBridge({ proactiveIntervalMs: 1000 });
  b.tick(); b.midiinList([0x90, 81, 5]);
  for (let i = 0; i < 60; i += 1) { clock.advance(1000); b.tick(); }
  assert.strictEqual(out.length, 1);
  assert.strictEqual(b.stats().state, STATE.PASS);
});

test("proactive identity respects its cap", () => {
  const { b, clock, out } = makeBridge({ proactiveIntervalMs: 10, proactiveMax: 3 });
  for (let i = 0; i < 20; i += 1) { b.tick(); clock.advance(20); }
  assert.strictEqual(out.length, 3);
});

test("presses: pads with velocity, buttons per mode", () => {
  const { b, out } = makeBridge({ proactive: false });
  b.pad(0, 7, 90);
  b.press(20, 127);
  b.config("buttonMode", "note");
  b.press(20, 127);
  assert.deepStrictEqual(out, [[0x90, 11, 90], [0xB0, 20, 127], [0x90, 20, 100]]);
});

test("fixed pad velocity: presses use it, releases stay 0", () => {
  const { b, out } = makeBridge({ proactive: false });
  b.config("padVelocity", 100);
  b.pad(0, 7, 23);
  b.pad(0, 7, 0);
  b.pad(7, 0, 127);
  assert.deepStrictEqual(out, [[0x90, 11, 100], [0x90, 11, 0], [0x90, 88, 100]]);
});

test("chord: Shift+Right pressed in order, released in reverse, no repeats", () => {
  const { b, out } = makeBridge({ proactive: false });
  b.chord([90, 92], 127);
  b.chord([90, 92], 127);
  b.chord([90, 92], 0);
  b.chord([90, 92], 0);
  assert.deepStrictEqual(out, [[0xB0, 90, 127], [0xB0, 92, 127], [0xB0, 92, 0], [0xB0, 90, 0]]);
});

test("frame diff, repaint and animation", () => {
  const { b, clock } = makeBridge({ proactive: false, bpm: 120 });
  let f = b.frame();
  assert.strictEqual(f.length, lpp.allPositions().length, "first frame paints everything");
  assert.strictEqual(b.frame().length, 0);
  b.midiinList([0x90, 81, 3]);
  f = b.frame();
  assert.deepStrictEqual(f, [[81, 120]]);
  b.midiinList([0x91, 81, 5]); // flash red over white
  clock.advance(10);
  assert.deepStrictEqual(b.frame(clock() - 990), [[81, 127]]);
  assert(b.isAnimating());
  b.repaint();
  assert.strictEqual(b.frame().length, lpp.allPositions().length);
});

test("capture mode records traffic for S3", () => {
  const { b } = makeBridge({ proactive: false, capture: true });
  b.midiinList([0x92, 101, 21]);
  assert.deepStrictEqual(b.captureLines(), ["ch3 note 101 21  [T1]"]);
});

console.log("\n" + passed + " core tests passed");

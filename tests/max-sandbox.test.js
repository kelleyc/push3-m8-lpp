/*
 * Loads the GENERATED Max js bundles in a Node vm with stand-ins for Max's
 * js globals (post, outlet, inlet, Task, arrayfromargs) and a fake Push
 * control surface behind LiveAPI. Catches load-order mistakes, typos in the
 * glue and wiring regressions without Max. It cannot prove Max/Live
 * behaviour — that is what docs/TEST-PLAN.md is for.
 *
 * Run: node tests/max-sandbox.test.js   (after node scripts/build.js)
 */
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const lpp = require("../core/lpp.js");

let passed = 0;
function test(name, fn) {
  try { fn(); passed += 1; console.log("ok - " + name); }
  catch (e) { console.error("not ok - " + name); throw e; }
}

const PUSH_NAMES = (() => {
  const n = ["Button_Matrix", "Select_Button", "Shift_Button", "Global_Mute_Button",
    "Global_Solo_Button", "Record_Button", "Play_Button", "Up_Arrow", "Down_Arrow",
    "Left_Arrow", "Right_Arrow", "Page_Left_Button", "Page_Right_Button", "Delete_Button", "Duplicate_Button"];
  for (let y = 0; y < 8; y += 1) for (let x = 0; x < 8; x += 1) n.push(x + "_Clip_" + y + "_Button");
  for (let i = 0; i < 8; i += 1) n.push("Scene_Launch_Button" + i);
  for (let i = 0; i < 8; i += 1) n.push("Track_Select_Button" + i);
  return n;
})();

function makeMax(opts) {
  opts = opts || {};
  const out = { midi: [], params: [], posts: [], grabs: [], releases: [], sends: [], bus: [] };
  const tasks = [];
  const observers = {}; // id -> callback
  const controlIds = {};
  PUSH_NAMES.forEach((name, i) => { controlIds[name] = -(i + 3); });
  const nameById = {};
  Object.keys(controlIds).forEach((k) => { nameById[controlIds[k]] = k; });
  let selectedTrack = opts.selectedTrack == null ? 7 : opts.selectedTrack;
  let selectionCallback = null;

  function LiveAPI(a, b) {
    let cb = null; let p = a;
    if (typeof a === "function") { cb = a; p = b; }
    this.path = p;
    this._cb = cb;
    const m = /^id (-?\d+)$/.exec(String(p));
    if (/^control_surfaces 0$/.test(p)) this.id = -1;
    else if (/^control_surfaces \d+$/.test(p)) this.id = 0;
    else if (m) this.id = Number(m[1]);
    else if (p === "this_device canonical_parent") this.id = 7;
    else if (p === "live_set view") { this.id = 2; }
    else if (p === "live_set") this.id = 1;
    else this.id = 0;
    const self = this;
    Object.defineProperty(this, "property", {
      set(v) {
        if (!v) return;
        if (self._cb && self.path === "live_set view") selectionCallback = self._cb;
        else if (self._cb) observers[self.id] = self._cb;
      },
      get() { return ""; }
    });
  }
  LiveAPI.prototype.call = function (method) {
    const args = Array.prototype.slice.call(arguments, 1);
    if (method === "get_control_names") {
      const r = []; PUSH_NAMES.forEach((n) => { r.push("control", n); }); return r;
    }
    if (method === "get_control") return controlIds[args[0]] ? ["id", controlIds[args[0]]] : ["id", 0];
    if (method === "grab_control") { out.grabs.push(nameById[args[1]]); return; }
    if (method === "release_control") { out.releases.push(nameById[args[1]]); return; }
    if (method === "send_value") { out.sends.push([nameById[this.id]].concat(args)); return; }
  };
  LiveAPI.prototype.get = function (prop) {
    if (prop === "selected_track") return ["id", selectedTrack];
    if (prop === "tempo") return [120];
    return [];
  };

  function Task(fn) { this.fn = fn; this.interval = 0; this.active = false; tasks.push(this); }
  Task.prototype.schedule = function () { this.active = "once"; };
  Task.prototype.repeat = function () { this.active = "repeat"; };
  Task.prototype.cancel = function () { this.active = false; };

  const ctx = {
    post: (t) => out.posts.push(String(t).trim()),
    outlet: (n) => {
      const args = Array.prototype.slice.call(arguments.length ? arguments : [], 1);
      void args;
    },
    arrayfromargs: (a) => Array.prototype.slice.call(a),
    messnamed: (name, v) => { out.bus.push([name, v]); },
    Task, LiveAPI: opts.noLive ? undefined : LiveAPI,
    inlet: 0, JSON, Math, Date, Number, String, isFinite, Object, Array
  };
  ctx.outlet = function (n) {
    const args = Array.prototype.slice.call(arguments, 1);
    if (n === 0) out.midi.push(args[0]);
    else out.params.push(args);
  };
  vm.createContext(ctx);

  return {
    ctx, out, tasks, observers, controlIds,
    load(file) { vm.runInContext(fs.readFileSync(file, "utf8"), ctx, { filename: file }); },
    send(name) { const a = Array.prototype.slice.call(arguments, 1); ctx.inlet = 0; return ctx[name].apply(null, a); },
    bytesIn(bytes, inletNo) { ctx.inlet = inletNo || 0; bytes.forEach((b) => ctx.msg_int(b)); ctx.inlet = 0; },
    runTasks(times) {
      for (let t = 0; t < (times || 1); t += 1) {
        tasks.slice().forEach((task) => {
          if (!task.active) return;
          if (task.active === "once") task.active = false;
          task.fn();
        });
      }
    },
    selectTrack(id) { selectedTrack = id; if (selectionCallback) selectionCallback(["selected_track", "id", id]); },
    press(name, value) { observers[controlIds[name]](["value", value]); },
    param(name) { const hits = out.params.filter((p) => p[0] === name); return hits.length ? hits[hits.length - 1][1] : undefined; }
  };
}

const HANDSHAKE = path.join(__dirname, "..", "devices", "m8-lpp-handshake", "m8-lpp-handshake.js");
const BRIDGE = path.join(__dirname, "..", "devices", "m8-lpp-bridge", "m8-lpp-bridge.js");
const INQUIRY = [0xF0, 0x7E, 0x7F, 0x06, 0x01, 0xF7];

test("bundles exist (run node scripts/build.js first)", () => {
  assert(fs.existsSync(HANDSHAKE) && fs.existsSync(BRIDGE));
});

test("bundles are ES5 (Max legacy js engine)", () => {
  let acorn;
  try { acorn = require("acorn"); } catch (e) { console.log("   (acorn not installed — `npm install` to enable this check; skipped)"); return; }
  [HANDSHAKE, BRIDGE].forEach((f) => acorn.parse(fs.readFileSync(f, "utf8"), { ecmaVersion: 5 }));
});

test("handshake: loads, replies to inquiry on midiin, reports PASS", () => {
  const m = makeMax({ noLive: true });
  m.load(HANDSHAKE);
  m.send("out_path", 0);
  m.send("start");
  const proactiveBytes = m.out.midi.length; // proactive identity on start
  assert.strictEqual(proactiveBytes, 17);
  m.bytesIn(INQUIRY, 0);
  assert.deepStrictEqual(m.out.midi.slice(17), lpp.identityReply("pro3"));
  m.bytesIn([0x90, 81, 3], 0);
  m.runTasks(1);
  assert.strictEqual(m.param("state"), 3);
  assert.strictEqual(m.param("led_msgs"), 1);
  assert.strictEqual(m.param("ch1"), 1);
  assert(m.out.posts.some((p) => /PASS/.test(p)));
});

test("handshake: inquiry arriving on sysexin as one list", () => {
  const m = makeMax({ noLive: true });
  m.load(HANDSHAKE);
  m.send("out_path", 0);
  m.send("proactive", 0);
  m.ctx.inlet = 1; m.ctx.list.apply(null, INQUIRY); m.ctx.inlet = 0;
  assert.deepStrictEqual(m.out.midi, lpp.identityReply("pro3"));
});

test("handshake: generic variant", () => {
  const m = makeMax({ noLive: true });
  m.load(HANDSHAKE);
  m.send("out_path", 0);
  m.send("proactive", 0);
  m.send("variant", 1);
  m.bytesIn(INQUIRY, 0);
  assert.deepStrictEqual(m.out.midi, lpp.identityReply("generic"));
});

test("handshake: default out path is this track; M8 OUT bus is opt-in", () => {
  const m = makeMax({ noLive: true });
  m.load(HANDSHAKE);
  m.send("proactive", 0);
  m.bytesIn(INQUIRY, 0);
  assert.deepStrictEqual(m.out.midi, lpp.identityReply("pro3"));
  assert.strictEqual(m.out.bus.length, 0);
  m.out.midi.length = 0;
  m.send("out_path", 1);
  m.bytesIn(INQUIRY, 0);
  assert.strictEqual(m.out.midi.length, 0);
  assert.deepStrictEqual(m.out.bus.map((b) => b[1]), lpp.identityReply("pro3"));
  assert(m.out.bus.every((b) => b[0] === "m8lpp.to_m8"));
});

test("patches default Out Path to this track", () => {
  const { buildHandshake, buildBridge } = require("../scripts/build.js");
  [buildHandshake(), buildBridge()].forEach((pj) => {
    const tab = pj.patcher.boxes.map((b) => b.box).find((b) => b.varname === "Out Path");
    assert.deepStrictEqual(tab.saved_attribute_attributes.valueof.parameter_initial, [0]);
  });
});

test("out device: bus -> midiout", () => {
  const { buildOut } = require("../scripts/build.js");
  const pj = buildOut();
  const boxes = pj.patcher.boxes.map((b) => b.box);
  const lines = pj.patcher.lines.map((l) => l.patchline);
  const id = (t) => boxes.find((b) => b.text === t).id;
  assert(lines.some((l) => l.source[0] === id("r m8lpp.to_m8") && l.destination[0] === id("t i b")));
  assert(lines.some((l) => l.source[0] === id("t i b") && l.source[1] === 0 && l.destination[0] === id("midiout")));
});

test("bridge: takeover on selection, LEDs to pads and buttons, presses to M8", () => {
  const m = makeMax({ selectedTrack: 7 });
  m.load(BRIDGE);
  m.send("out_path", 0);
  m.send("start");
  m.runTasks(1); // selection task -> graball
  assert(m.out.grabs.includes("Button_Matrix"), "matrix grabbed");
  assert(m.out.grabs.includes("Play_Button") && m.out.grabs.includes("Scene_Launch_Button7"));
  assert(!m.out.grabs.includes("Shift_Button"), "Push Shift is never taken");
  assert.strictEqual(m.param("takeover"), 1);
  const initialSends = m.out.sends.length;
  assert(initialSends >= 64, "full repaint on grab");

  m.out.midi.length = 0;
  m.bytesIn(INQUIRY);
  m.bytesIn([0x90, 81, 5, 0x90, 20, 21, 0x90, 89, 3]); // top-left pad red, Play green, Scene 1 white
  m.out.sends.length = 0;
  m.runTasks(1);
  assert(m.out.sends.some((s) => s[0] === "Button_Matrix" && s[1] === 0 && s[2] === 0 && s[3] === 127));
  assert(m.out.sends.some((s) => s[0] === "Play_Button" && s[1] === 126));
  assert(m.out.sends.some((s) => s[0] === "Scene_Launch_Button7" && s[1] === 120));

  m.out.midi.length = 0;
  m.press("0_Clip_7_Button", 99);   // bottom-left pad
  m.press("Play_Button", 127);
  m.press("Select_Button", 127);    // LPP Shift
  assert.deepStrictEqual(m.out.midi, [0x90, 11, 99, 0xB0, 20, 127, 0xB0, 90, 127]);
});

test("bridge: deselect releases, reselect repaints everything", () => {
  const m = makeMax({ selectedTrack: 7 });
  m.load(BRIDGE);
  m.send("out_path", 0);
  m.send("start");
  m.runTasks(1);
  m.selectTrack(9);
  m.runTasks(1);
  assert(m.out.releases.includes("Button_Matrix") && m.out.releases.includes("Play_Button"));
  assert.strictEqual(m.param("takeover"), 0);
  m.out.midi.length = 0;
  m.press("Play_Button", 127);
  assert.strictEqual(m.out.midi.length, 0, "no presses forwarded while released");
  m.out.sends.length = 0;
  m.selectTrack(7);
  m.runTasks(1);
  assert(m.out.sends.length >= 64, "repaint from buffer after re-grab");
});

test("bridge: fixed pad velocity", () => {
  const m = makeMax({ selectedTrack: 7 });
  m.load(BRIDGE);
  m.send("out_path", 0);
  m.send("start");
  m.runTasks(1);
  m.send("pad_vel", 1);
  m.out.midi.length = 0;
  m.press("0_Clip_7_Button", 23);
  m.press("0_Clip_7_Button", 0);
  assert.deepStrictEqual(m.out.midi, [0x90, 11, 100, 0x90, 11, 0]);
  m.send("pad_vel", 0);
  m.out.midi.length = 0;
  m.press("0_Clip_7_Button", 23);
  assert.deepStrictEqual(m.out.midi, [0x90, 11, 23]);
});

test("bridge: chord moves a control from its border job to Shift+Right", () => {
  const m = makeMax({ selectedTrack: 7 });
  m.load(BRIDGE);
  m.send("out_path", 0);
  m.send("start");
  m.runTasks(1);
  m.send("chord", "Select_Button", 90, 92);
  m.out.midi.length = 0;
  m.press("Select_Button", 127);
  m.press("Select_Button", 0);
  assert.deepStrictEqual(m.out.midi, [0xB0, 90, 127, 0xB0, 92, 127, 0xB0, 92, 0, 0xB0, 90, 0]);
  m.send("unchord");
  m.out.midi.length = 0;
  m.press("Select_Button", 127);
  assert.deepStrictEqual(m.out.midi, [0xB0, 90, 127], "Select is LPP Shift again");
});

test("bridge: default chords on the d-pad page buttons", () => {
  const m = makeMax({ selectedTrack: 7 });
  m.load(BRIDGE);
  m.send("out_path", 0);
  m.send("start");
  m.runTasks(1);
  m.out.midi.length = 0;
  m.press("Page_Right_Button", 127);
  m.press("Page_Right_Button", 0);
  m.press("Page_Left_Button", 127);
  m.press("Page_Left_Button", 0);
  assert.deepStrictEqual(m.out.midi, [0xB0, 90, 127, 0xB0, 92, 127, 0xB0, 92, 0, 0xB0, 90, 0,
    0xB0, 90, 127, 0xB0, 91, 127, 0xB0, 91, 0, 0xB0, 90, 0]);
});

test("bridge: track-select buttons pass through to Live by default, toggle to M8", () => {
  const m = makeMax({ selectedTrack: 7 });
  m.load(BRIDGE);
  m.send("out_path", 0);
  m.send("start");
  m.runTasks(1);
  assert(!m.out.grabs.some((g) => /^Track_Select_Button/.test(g)), "track buttons left to Live");
  m.send("track_btns", 0);
  m.out.midi.length = 0;
  assert(m.out.grabs.includes("Track_Select_Button0"), "grabbed once set to M8");
  m.press("Track_Select_Button0", 127);
  assert.deepStrictEqual(m.out.midi, [0xB0, 101, 127]);
});

test("bridge: Push switch off releases everything while selected; on takes it back", () => {
  const m = makeMax({ selectedTrack: 7 });
  m.load(BRIDGE);
  m.send("out_path", 0);
  m.send("start");
  m.runTasks(1);
  assert(m.out.grabs.includes("Button_Matrix"));
  const grabbed = m.out.grabs.slice();
  m.send("push_switch", 0);
  assert(m.out.releases.includes("Button_Matrix"), "matrix released");
  assert(m.out.releases.includes("Play_Button"), "border buttons released");
  assert(m.out.releases.includes("Page_Right_Button"), "chord buttons released");
  m.out.grabs.length = 0; m.out.midi.length = 0;
  m.press("Play_Button", 127);
  assert.deepStrictEqual(m.out.midi, [], "released buttons no longer reach the M8");
  m.send("push_switch", 1);
  assert(m.out.grabs.includes("Button_Matrix"), "taken back while selected");
  assert(grabbed.length > 0);
});

test("bridge: Push switch set off before start never grabs", () => {
  const m = makeMax({ selectedTrack: 7 });
  m.load(BRIDGE);
  m.send("push_switch", 0);
  m.send("out_path", 0);
  m.send("start");
  m.runTasks(1);
  assert.deepStrictEqual(m.out.grabs, []);
});

test("bridge: learn assigns the next pressed Push button to Shift+Left", () => {
  const m = makeMax({ selectedTrack: 7 });
  m.load(BRIDGE);
  m.send("out_path", 0);
  m.send("start");
  m.runTasks(1);
  m.send("learn", "sl");
  const t0 = Date.now(); while (Date.now() - t0 < 450) { /* clear the learn hold-off */ }
  m.press("Left_Arrow", 127);
  m.runTasks(1);
  assert(m.out.params.some((p) => p[0] === "learn" && p[1] === "Left_Arrow" && p[3] === "Shift+Left"));
  m.out.midi.length = 0;
  m.press("Left_Arrow", 127);
  m.press("Left_Arrow", 0);
  assert.deepStrictEqual(m.out.midi, [0xB0, 90, 127, 0xB0, 91, 127, 0xB0, 91, 0, 0xB0, 90, 0]);
});

test("bridge: button_mode note and report_mapping", () => {
  const m = makeMax({ selectedTrack: 7 });
  m.load(BRIDGE);
  m.send("out_path", 0);
  m.send("start");
  m.runTasks(1);
  m.send("button_mode", "note");
  m.out.midi.length = 0;
  m.press("Play_Button", 127);
  m.press("Play_Button", 0);
  assert.deepStrictEqual(m.out.midi, [0x90, 20, 100, 0x80, 20, 0]);
  m.send("report_mapping");
  assert(m.out.posts.some((p) => /20 Play -> Play_Button/.test(p)));
  assert(m.out.posts.some((p) => /95 Chord -> UNMAPPED/.test(p)));
});

test("bridge: loads without LiveAPI and still answers the M8", () => {
  const m = makeMax({ noLive: true });
  m.load(BRIDGE);
  m.send("out_path", 0);
  m.send("proactive", 0);
  m.send("start");
  m.bytesIn(INQUIRY);
  assert.deepStrictEqual(m.out.midi, lpp.identityReply("pro3"));
});

test("generated patches: midiin never wired to midiout; js wired both ways", () => {
  const { buildHandshake, buildBridge } = require("../scripts/build.js");
  [buildHandshake(), buildBridge()].forEach((pj) => {
    const boxes = pj.patcher.boxes.map((b) => b.box);
    const lines = pj.patcher.lines.map((l) => l.patchline);
    const id = (t) => { const b = boxes.find((x) => x.text === t || (x.text || "").startsWith(t)); assert(b, "missing " + t); return b.id; };
    const has = (a, b, inl) => lines.some((l) => l.source[0] === a && l.destination[0] === b && (inl == null || l.destination[1] === inl));
    assert(!has(id("midiin"), id("midiout")));
    assert(has(id("midiin"), id("js "), 0));
    assert(has(id("sysexin"), id("js "), 1));
    assert(has(id("js "), id("midiout")));
    assert.strictEqual(pj.patcher.project.amxdtype, 0x6d6d6d6d);
    const routes = boxes.filter((b) => /^route /.test(b.text || ""));
    // readouts route, plus the bridge's "route learn" for the chord-learn text
    assert(routes.length >= 1 && routes.length <= 2, "route objects: " + routes.length);
    const longnames = boxes.filter((b) => b.parameter_enable).map((b) => b.saved_attribute_attributes.valueof.parameter_longname);
    assert.strictEqual(new Set(longnames).size, longnames.length, "unique parameter names");
    Object.values(pj.patcher.parameters.parameterbanks).forEach((bank) =>
      bank.parameters.forEach((p) => assert(p === "-" || longnames.includes(p), "bank refers to unknown " + p)));
  });
});

test(".amxd header is a MIDI Effect wrapping the patch JSON", () => {
  const buf = fs.readFileSync(path.join(__dirname, "..", "devices", "m8-lpp-handshake", "m8-lpp-handshake.amxd"));
  assert.strictEqual(buf.toString("ascii", 0, 4), "ampf");
  assert.strictEqual(buf.toString("ascii", 8, 12), "mmmm");
  assert.strictEqual(buf.toString("ascii", 24, 28), "ptch");
  const len = buf.readUInt32LE(28);
  assert.strictEqual(buf.length, 32 + len);
  assert.strictEqual(buf[buf.length - 1], 0);
  const pj = JSON.parse(buf.toString("utf8", 32, buf.length - 1));
  assert(pj.patcher.boxes.some((b) => b.box.text === "js m8-lpp-handshake.js"));
});

console.log("\n" + passed + " sandbox tests passed");

// Max glue — m8-lpp-bridge (full emulator) --------------------------------
//
// Push 3 acts as a Launchpad Pro MK3 for a Dirtywave M8.
//
// Patch wiring (devices/m8-lpp-bridge/m8-lpp-bridge.maxpat):
//   midiin  -> inlet 0, sysexin -> inlet 1, messages -> inlet 0
//   outlet 0 -> midiout (bytes to the M8)
//   outlet 1 -> route ... -> live.numbox readouts on the Push display
//
// Surface layer (pattern proven on hardware in an earlier Push project): one grabbed Button_Matrix for the pads + LEDs, 64
// cached UNGRABBED per-pad observers for velocity/release, and individual
// grabs for the border buttons. Selection gated: the device owns the Push
// only while its own track ("M8 CTRL") is selected.
//
// Differences from multi-zone, on purpose:
//   - every (re)grab repaints ALL positions from the LED buffer
//     (bridge.repaint), the fix for the P5 "pads dark after re-grab" bug;
//   - LEDs are flushed on a 30 Hz Task, so M8 bursts are coalesced and the
//     software flash/pulse animation runs without per-message LiveAPI calls.

autowatch = 1; // eslint-disable-line no-undef
inlets = 2; // eslint-disable-line no-undef
outlets = 2; // eslint-disable-line no-undef

var MAXSURF = 16;
var FRAME_MS = 33;
var TICK_MS = 100;
var GRAB_RETRY_MS = 1000;
var GRAB_RETRY_MAX = 20;

var __dying = false;
var TARGET = -1;
var surfaceApi = null;
var controlNames = [];
var matrix = { id: 0, api: null, obs: null, grabbed: false, available: null };
var padObservers = {};      // "x_Clip_y_Button" -> { id, obs }
var borderControls = {};    // lpp -> { name, id, api, obs, grabbed }
var borderMap = null;       // resolveBorderMap result
var mapOverrides = {};
// control name -> [lpp, ...]: one Push button drives several LPP buttons.
// Defaults learned on hardware 2026-10-09: the d-pad's page buttons.
var chords = { Page_Right_Button: [90, 92], Page_Left_Button: [90, 91] };
var chordFreed = {};        // lpp numbers we un-mapped to free a control for a chord
var chordControls = {};     // control name -> { id, api, obs, grabbed }
var LEARN = null;           // { list, label, started } while waiting for a Push button
var learnObs = {};          // control name -> { id, obs } (only controls not otherwise grabbed)
var TAKEOVER_ACTIVE = false;
var OWNER_TRACK_ID = 0;
var SELECTED_TRACK_ID = 0;
var GATING = false;
var sweepOffset = -1;       // >= 0 while a palette sweep owns the pads
var _frameTask = null;
var _tickTask = null;
var _takeoverTask = null;
var _grabRetryTask = null;
var _grabRetries = 0;
var _trackObserver = null;
var _tempoObserver = null;
var _published = {};
var _lastTick = 0;

function P() {
  var parts = [];
  for (var i = 0; i < arguments.length; i += 1) parts.push(String(arguments[i]));
  post("[M8-LPP] " + parts.join(" ") + "\n"); // eslint-disable-line no-undef
}

// Ableton: "Sending and receiving [SysEx] on the same track isn't supported.
// If you require bi-directional SysEx flow, you need to use two separate Max
// for Live devices on different tracks." (help.ableton.com, "SysEx support")
// out_path 0 = this track's midiout, 1 = the m8-lpp-out device on another
// track (via the global bus below), 2 = both (diagnostics only).
var OUT_BUS = "m8lpp.to_m8";
// Default 0 (this track): over TRS one track works, with MIDI From and MIDI To
// both set to the Push External Port (verified on hardware 2026-10-09). The
// M8 OUT track (path 1) is only needed when the port can't be shared, e.g. USB.
var OUT_PATH = 0;

function sendBytes(bytes) {
  for (var i = 0; i < bytes.length; i += 1) {
    if (OUT_PATH !== 1) outlet(0, bytes[i]); // eslint-disable-line no-undef
    if (OUT_PATH !== 0) messnamed(OUT_BUS, bytes[i]); // eslint-disable-line no-undef
  }
}

function out_path(v) {
  v = Math.floor(Number(v));
  OUT_PATH = v === 1 || v === 2 ? v : 0;
  post("[M8-LPP] MIDI to M8 via " + ["this track", "M8 OUT track (m8-lpp-out)", "both"][OUT_PATH] + "\n"); // eslint-disable-line no-undef
}

var bridge = M8Bridge.createBridge({ // eslint-disable-line no-undef
  emitMidi: sendBytes,
  log: function (t) { P(t); },
  proactive: true,
  proactiveIntervalMs: 1000,
  proactiveMax: -1
});
var PushMap = M8PushMap; // eslint-disable-line no-undef
var Lpp = M8Lpp; // eslint-disable-line no-undef

// ---- echo guard (send_value can come back as a value event) ---------------

var _echo = {};
function echoSent(key, v) { _echo[key] = { v: Number(v) || 0, t: new Date().getTime() }; }
function echoIgnore(key, v) {
  var e = _echo[key];
  if (!e) return false;
  delete _echo[key];
  return e.v === (Number(v) || 0) && new Date().getTime() - e.t <= 150;
}

// ---- LiveAPI helpers --------------------------------------------------------

function haveLive() { return typeof LiveAPI !== "undefined"; } // eslint-disable-line no-undef
function surfaceAt(i) { return new LiveAPI("control_surfaces " + i); } // eslint-disable-line no-undef

function normId(ctl) {
  if (ctl == null) return 0;
  if (typeof ctl === "object" && ctl.length) ctl = ctl[ctl.length - 1];
  ctl = Number(ctl);
  return isFinite(ctl) && ctl !== 0 ? Math.round(ctl) : 0;
}

function parseNames(raw) {
  var out = [];
  if (!raw || raw.length == null) return out;
  for (var i = 0; i < raw.length; i += 1) {
    if (raw[i] === "control" && i + 1 < raw.length) { out.push(String(raw[i + 1])); i += 1; }
  }
  return out;
}

function cleanLiveId(value) {
  if (value && typeof value !== "string" && value.length != null) {
    for (var i = value.length - 1; i >= 0; i -= 1) {
      var item = Number(value[i]);
      if (isFinite(item) && item > 0) return Math.round(item);
    }
    return 0;
  }
  value = Number(value);
  return isFinite(value) && value > 0 ? Math.round(value) : 0;
}

function findSurface() {
  if (!haveLive()) { P("LiveAPI not available"); return false; }
  for (var i = 0; i < MAXSURF; i += 1) {
    var cs = surfaceAt(i);
    if (!cs || cs.id == 0) continue;
    var names = [];
    try { names = parseNames(cs.call("get_control_names")); } catch (e) {}
    for (var j = 0; j < names.length; j += 1) {
      if (names[j] === "Button_Matrix" || names[j] === "0_Clip_0_Button") {
        TARGET = i;
        surfaceApi = cs;
        controlNames = names;
        P("Push surface = control_surfaces", i, "(" + names.length + " controls)");
        return true;
      }
    }
  }
  P("no Push-like control surface found");
  return false;
}

// ---- pads ---------------------------------------------------------------------

function ensureMatrix() {
  if (matrix.available === false) return false;
  if (matrix.id && matrix.api && matrix.obs) return true;
  try {
    var id = normId(surfaceApi.call("get_control", "Button_Matrix"));
    if (!id) { matrix.available = false; P("Button_Matrix unavailable"); return false; }
    matrix.id = id;
    matrix.available = true;
    matrix.api = new LiveAPI("id " + id); // eslint-disable-line no-undef
    matrix.api.id = id;
    matrix.obs = new LiveAPI(function (args) { // eslint-disable-line no-undef
      // Matrix values are state codes, not velocity: only consume LED echoes.
      if (!args || args[0] === "bang" || args[0] === "id" || args.length < 3) return;
      var n = args.length;
      echoIgnore("m:" + args[n - 2] + "," + args[n - 1], args[n - 3]);
    }, "id " + id);
    matrix.obs.id = id;
    matrix.obs.property = "value";
    return true;
  } catch (e) {
    matrix.available = false;
    P("Button_Matrix setup failed", e.message);
    return false;
  }
}

function observePad(name) {
  if (padObservers[name]) return true;
  try {
    var ctl = normId(surfaceApi.call("get_control", name));
    if (!ctl) return false;
    var pad = PushMap.padFromName(name);
    var obs = new LiveAPI(function (args) { // eslint-disable-line no-undef
      if (__dying || !TAKEOVER_ACTIVE) return;
      if (!args || args[0] === "bang" || args[0] === "id") return;
      var v = Number(args[args.length - 1]) || 0;
      if (echoIgnore(name, v)) return;
      if (sweepOffset >= 0) { if (v > 0) P("sweep: pad", pad.x, pad.y, "= push index", sweepOffset + pad.y * 8 + pad.x); return; }
      bridge.pad(pad.x, pad.y, v);
    }, "id " + ctl);
    obs.id = ctl;
    obs.property = "value";
    padObservers[name] = { id: ctl, obs: obs };
    return true;
  } catch (e) {
    P("pad observer failed", name, e.message);
    return false;
  }
}

function ensurePads() {
  var names = PushMap.allPadNames();
  var n = 0;
  for (var i = 0; i < names.length; i += 1) if (observePad(names[i])) n += 1;
  return n;
}

// ---- border buttons -------------------------------------------------------------

function resolveBorders() {
  borderMap = PushMap.resolveBorderMap(controlNames, mapOverrides);
  var mapped = 0;
  for (var k in borderMap.byLpp) if (borderMap.byLpp.hasOwnProperty(k)) mapped += 1;
  outlet(1, "mapped", mapped); // eslint-disable-line no-undef
  outlet(1, "missing", borderMap.missing.length); // eslint-disable-line no-undef
  return mapped;
}

function grabBorder(lpp, name) {
  try {
    var ctl = normId(surfaceApi.call("get_control", name));
    if (!ctl) { P("border: no control", name); return false; }
    surfaceApi.call("grab_control", "id", ctl);
    var entry = borderControls[lpp];
    if (!entry || entry.id !== ctl) {
      var api = new LiveAPI("id " + ctl); // eslint-disable-line no-undef
      api.id = ctl;
      var obs = new LiveAPI(function (args) { // eslint-disable-line no-undef
        if (__dying || !TAKEOVER_ACTIVE) return;
        if (!args || args[0] === "bang" || args[0] === "id") return;
        var v = Number(args[args.length - 1]) || 0;
        if (echoIgnore("b:" + lpp, v)) return;
        if (LEARN) { if (v > 0) learnHit(name); return; }
        bridge.press(lpp, v);
      }, "id " + ctl);
      obs.id = ctl;
      obs.property = "value";
      entry = { name: name, id: ctl, api: api, obs: obs, grabbed: false };
      borderControls[lpp] = entry;
    }
    entry.grabbed = true;
    return true;
  } catch (e) {
    P("border grab failed", name, e.message);
    return false;
  }
}

function grabBorders() {
  if (!borderMap) resolveBorders();
  var n = 0;
  for (var k in borderMap.byLpp) {
    if (borderMap.byLpp.hasOwnProperty(k) && grabBorder(Number(k), borderMap.byLpp[k])) n += 1;
  }
  return n;
}

function releaseBorders() {
  for (var k in borderControls) {
    if (!borderControls.hasOwnProperty(k)) continue;
    var b = borderControls[k];
    if (!b.grabbed) continue;
    try { if (surfaceApi && surfaceApi.id != 0) surfaceApi.call("release_control", "id", b.id); } catch (e) {}
    b.grabbed = false;
  }
}

// ---- chords + learn ------------------------------------------------------------

function grabChord(name) {
  var list = chords[name];
  if (!list) return false;
  try {
    var ctl = normId(surfaceApi.call("get_control", name));
    if (!ctl) { P("chord: no control", name); return false; }
    surfaceApi.call("grab_control", "id", ctl);
    var entry = chordControls[name];
    if (!entry || entry.id !== ctl) {
      var obs = new LiveAPI(function (args) { // eslint-disable-line no-undef
        if (__dying || !TAKEOVER_ACTIVE) return;
        if (!args || args[0] === "bang" || args[0] === "id") return;
        var v = Number(args[args.length - 1]) || 0;
        if (LEARN) { if (v > 0) learnHit(name); return; }
        bridge.chord(chords[name] || [], v);
      }, "id " + ctl);
      obs.id = ctl;
      obs.property = "value";
      entry = { id: ctl, obs: obs, grabbed: false };
      chordControls[name] = entry;
    }
    entry.grabbed = true;
    return true;
  } catch (e) {
    P("chord grab failed", name, e.message);
    return false;
  }
}

function grabChords() {
  for (var n in chords) if (chords.hasOwnProperty(n)) grabChord(n);
}

function releaseChords() {
  for (var n in chordControls) {
    if (!chordControls.hasOwnProperty(n)) continue;
    var c = chordControls[n];
    if (!c.grabbed) continue;
    try { if (surfaceApi && surfaceApi.id != 0) surfaceApi.call("release_control", "id", c.id); } catch (e) {}
    c.grabbed = false;
  }
}

// Give `name` a chord, freeing the border job it had (a control does one job).
function assignChord(name, list) {
  if (!borderMap) resolveBorders();
  var owner = borderMap.byName[name];
  if (owner != null) {
    mapOverrides[owner] = "-";
    chordFreed[owner] = true;
    borderControls = {};
    resolveBorders();
    P("chord: " + name + " no longer drives LPP " + owner);
  }
  chords[name] = list;
}

// Track-select buttons (LPP T1..T8 = 101..108): pass them through to Live by
// default so Push can still switch tracks while M8 CTRL is selected.
var TRACK_LIVE = true;

function applyTrackOverrides() {
  for (var t = 101; t <= 108; t += 1) {
    if (TRACK_LIVE) mapOverrides[t] = "-"; else delete mapOverrides[t];
  }
}

function track_btns(v) {
  TRACK_LIVE = Number(v) > 0;
  applyTrackOverrides();
  P("track buttons:", TRACK_LIVE ? "Live (Push switches tracks)" : "M8 (LPP T1-T8)");
  if (!borderMap) return;
  if (TAKEOVER_ACTIVE) {
    releaseBorders();
    borderControls = {};
    resolveBorders();
    grabBorders();
    bridge.repaint();
  } else {
    borderControls = {};
    resolveBorders();
  }
}

function applyDefaultChords() {
  for (var n in chords) if (chords.hasOwnProperty(n)) assignChord(n, chords[n]);
}

// chord <ControlName> <lpp> <lpp> ...   e.g. chord Select_Button 90 92 (Shift+Right)
function chord(name) {
  var args = arrayfromargs(arguments); // eslint-disable-line no-undef
  name = String(args.shift());
  var list = [];
  for (var i = 0; i < args.length; i += 1) { var n = Math.floor(Number(args[i])); if (n > 0) list.push(n); }
  if (!list.length) { P("chord needs at least one LPP number"); return; }
  var was = TAKEOVER_ACTIVE;
  if (was) releaseall();
  assignChord(name, list);
  P("chord " + name + " -> LPP " + list.join("+"));
  if (was) graball();
}

function unchord() {
  var was = TAKEOVER_ACTIVE;
  if (was) releaseall();
  chords = {};
  for (var k in chordFreed) if (chordFreed.hasOwnProperty(k)) delete mapOverrides[k];
  chordFreed = {};
  borderControls = {};
  resolveBorders();
  outlet(1, "learn", "chords cleared"); // eslint-disable-line no-undef
  if (was) graball();
}

var LEARN_SKIP = /Encoder|Touch|Strip|Slider|Dial|Knob|Swing|Tempo|Volume|Sensitiv|Matrix|Clip_/i;

function stopLearn(silent) {
  var had = !!LEARN;
  LEARN = null;
  for (var n in learnObs) {
    if (!learnObs.hasOwnProperty(n)) continue;
    var o = learnObs[n];
    try { o.obs.property = ""; o.obs.id = 0; } catch (e) {}
    try { if (surfaceApi && surfaceApi.id != 0) surfaceApi.call("release_control", "id", o.id); } catch (e2) {}
  }
  learnObs = {};
  if (had && !silent) outlet(1, "learn", "learn cancelled"); // eslint-disable-line no-undef
}

function learnHit(name) {
  if (!LEARN) return;
  if (new Date().getTime() - LEARN.started < 400) return; // ignore the press that started learn
  var list = LEARN.list, label = LEARN.label;
  stopLearn(true);
  outlet(1, "learn", name, "=", label); // eslint-disable-line no-undef
  P("learned: " + name + " = " + label);
  var t = new Task(function () { chord.apply(null, [name].concat(list)); }); // eslint-disable-line no-undef
  t.schedule(0);
}

// learn sr | sl | 0: the next Push button you press becomes Shift+Right / Shift+Left.
function learn(kind) {
  kind = String(kind);
  if (kind === "0" || kind === "off") { stopLearn(false); return; }
  var def = kind === "sl" ? { list: [90, 91], label: "Shift+Left" } : { list: [90, 92], label: "Shift+Right" };
  if (!TAKEOVER_ACTIVE) { outlet(1, "learn", "select the M8 CTRL track first"); P("learn needs takeover"); return; } // eslint-disable-line no-undef
  stopLearn(true);
  LEARN = { list: def.list, label: def.label, started: new Date().getTime() };
  var count = 0;
  for (var i = 0; i < controlNames.length; i += 1) {
    var name = controlNames[i];
    if (LEARN_SKIP.test(name) || PushMap.padFromName(name)) continue;
    if (borderMap && borderMap.byName[name] != null) continue;   // border observers handle learn
    if (chordControls[name] && chordControls[name].grabbed) continue;
    try {
      var ctl = normId(surfaceApi.call("get_control", name));
      if (!ctl) continue;
      surfaceApi.call("grab_control", "id", ctl);
      var obs = new LiveAPI((function (nm) { // eslint-disable-line no-undef
        return function (args) {
          if (__dying || !LEARN) return;
          if (!args || args[0] === "bang" || args[0] === "id") return;
          if ((Number(args[args.length - 1]) || 0) > 0) learnHit(nm);
        };
      })(name), "id " + ctl);
      obs.id = ctl;
      obs.property = "value";
      learnObs[name] = { id: ctl, obs: obs };
      count += 1;
    } catch (e) { /* control not grabbable; skip */ }
  }
  outlet(1, "learn", "press a Push button for", def.label); // eslint-disable-line no-undef
  P("learn " + def.label + ": listening on " + count + " extra controls");
}

function pad_vel(v) {
  bridge.config("padVelocity", Number(v) > 0 ? 100 : 0);
  P("pad velocity", Number(v) > 0 ? "fixed 100" : "native");
}

// ---- takeover -------------------------------------------------------------------

function cancelTask(t) { if (t) { try { t.cancel(); } catch (e) {} } return null; }

function scheduleGrabRetry() {
  if (__dying) return;
  if (_grabRetries >= GRAB_RETRY_MAX) { P("graball gave up after", _grabRetries, "retries"); _grabRetries = 0; return; }
  _grabRetries += 1;
  _grabRetryTask = new Task(function () { _grabRetryTask = null; graball(); }); // eslint-disable-line no-undef
  _grabRetryTask.schedule(GRAB_RETRY_MS);
}

function graball() {
  _grabRetryTask = cancelTask(_grabRetryTask);
  if (__dying) return;
  if (GATING && OWNER_TRACK_ID !== SELECTED_TRACK_ID) return;
  if (TARGET < 0 && !findSurface()) { scheduleGrabRetry(); return; }
  if (!ensureMatrix() || ensurePads() < 64) { scheduleGrabRetry(); return; }
  try {
    surfaceApi.call("grab_control", "id", matrix.id);
    matrix.grabbed = true;
  } catch (e) {
    P("Button_Matrix grab failed", e.message);
    scheduleGrabRetry();
    return;
  }
  var borders = grabBorders();
  grabChords();
  _grabRetries = 0;
  TAKEOVER_ACTIVE = true;
  bridge.repaint();
  P("takeover: pads + " + borders + " border buttons grabbed");
  flushFrame();
  publish(true);
}

function releaseall() {
  TAKEOVER_ACTIVE = false;
  if (matrix.grabbed) {
    try { if (surfaceApi && surfaceApi.id != 0) surfaceApi.call("release_control", "id", matrix.id); } catch (e) {}
    matrix.grabbed = false;
  }
  releaseBorders();
  releaseChords();
  stopLearn(true);
  publish(false);
}

function applyTrackSelection() {
  _takeoverTask = null;
  if (__dying || !GATING) return;
  if (OWNER_TRACK_ID === SELECTED_TRACK_ID) {
    if (!TAKEOVER_ACTIVE) { P("M8 CTRL selected: taking over Push"); graball(); }
    return;
  }
  if (TAKEOVER_ACTIVE) {
    _grabRetryTask = cancelTask(_grabRetryTask);
    releaseall();
    P("another track selected: Push released");
  }
}

function scheduleTrackSelection() {
  _takeoverTask = cancelTask(_takeoverTask);
  _takeoverTask = new Task(applyTrackSelection); // eslint-disable-line no-undef
  _takeoverTask.schedule(0);
}

function startTrackWatch() {
  try {
    var owner = new LiveAPI("this_device canonical_parent"); // eslint-disable-line no-undef
    if (!owner || owner.id == 0) { P("could not resolve owner track; gating off"); return; }
    OWNER_TRACK_ID = cleanLiveId(owner.id);
    GATING = OWNER_TRACK_ID > 0;
    _trackObserver = new LiveAPI(function (args) { // eslint-disable-line no-undef
      if (__dying) return;
      SELECTED_TRACK_ID = cleanLiveId(args);
      scheduleTrackSelection();
    }, "live_set view");
    _trackObserver.property = "selected_track";
    try { SELECTED_TRACK_ID = cleanLiveId(_trackObserver.get("selected_track")); } catch (e) {}
    scheduleTrackSelection();
  } catch (e) {
    P("track watch failed", e.message);
  }
}

function startTempoWatch() {
  try {
    _tempoObserver = new LiveAPI(function (args) { // eslint-disable-line no-undef
      if (args && args[0] === "tempo") bridge.setTempo(args[1]);
    }, "live_set");
    _tempoObserver.property = "tempo";
    bridge.setTempo(_tempoObserver.get("tempo"));
  } catch (e) {
    P("tempo watch failed (flash runs at 120 BPM)", e.message);
  }
}

// ---- LEDs -------------------------------------------------------------------------

function sendLed(lpp, value) {
  if (Lpp.isGridNote(lpp)) {
    if (!matrix.grabbed || !matrix.api) return;
    var p = PushMap.lppToPad(lpp);
    echoSent("m:" + p.x + "," + p.y, value);
    echoSent(PushMap.padName(p.x, p.y), value);
    try { matrix.api.call("send_value", p.x, p.y, value); } catch (e) { P("pad LED failed", p.x, p.y, e.message); }
    return;
  }
  var b = borderControls[lpp];
  if (!b || !b.grabbed) return;
  echoSent("b:" + lpp, value);
  try { b.api.call("send_value", value); } catch (e2) { P("button LED failed", b.name, e2.message); }
}

function flushFrame() {
  if (!TAKEOVER_ACTIVE || sweepOffset >= 0) return;
  var changes = bridge.frame();
  for (var i = 0; i < changes.length; i += 1) sendLed(changes[i][0], changes[i][1]);
}

var PUBLISH_NAMES = ["state", "inquiries", "replies", "sysex_in", "led_msgs",
  "ch1", "ch2", "ch3", "other_in", "presses", "last_led", "last_color"];

function publish(force) {
  var values = bridge.statsList();
  for (var i = 0; i < PUBLISH_NAMES.length; i += 1) {
    var name = PUBLISH_NAMES[i];
    if (!force && _published[name] === values[i]) continue;
    _published[name] = values[i];
    outlet(1, name, values[i]); // eslint-disable-line no-undef
  }
  var t = TAKEOVER_ACTIVE ? 1 : 0;
  if (force || _published.takeover !== t) { _published.takeover = t; outlet(1, "takeover", t); } // eslint-disable-line no-undef
}

function frameLoop() {
  if (__dying) return;
  flushFrame();
  var now = new Date().getTime();
  if (now - _lastTick >= TICK_MS) {
    _lastTick = now;
    bridge.tick();
    publish(false);
  }
}

// ---- entry points -------------------------------------------------------------

function start() {
  _frameTask = cancelTask(_frameTask);
  _frameTask = new Task(frameLoop); // eslint-disable-line no-undef
  _frameTask.interval = FRAME_MS;
  _frameTask.repeat();
  publish(true);
  if (!haveLive()) { P("LiveAPI not available"); return; }
  findSurface();
  if (TARGET >= 0) { applyTrackOverrides(); resolveBorders(); applyDefaultChords(); }
  startTempoWatch();
  startTrackWatch();
  bridge.tick();
}

function msg_int(v) {
  if (inlet === 1) bridge.sysexinByte(v); // eslint-disable-line no-undef
  else bridge.midiinByte(v);
}

function list() {
  var bytes = arrayfromargs(arguments); // eslint-disable-line no-undef
  if (inlet === 1) bridge.sysexinList(bytes); // eslint-disable-line no-undef
  else bridge.midiinList(bytes);
}

// Diagnostics and live configuration ------------------------------------------

function enumerate() {
  if (TARGET < 0) findSurface();
  P("control names (" + controlNames.length + "):");
  for (var i = 0; i < controlNames.length; i += 1) P("  " + controlNames[i]);
}

function report_mapping() {
  if (!borderMap) resolveBorders();
  var keys = [];
  for (var k in Lpp.BORDER) if (Lpp.BORDER.hasOwnProperty(k)) keys.push(Number(k));
  keys.sort(function (a, b) { return a - b; });
  P("border mapping (LPP -> Push):");
  for (var i = 0; i < keys.length; i += 1) {
    var n = keys[i];
    var name = borderMap.byLpp[n];
    P("  " + n + " " + Lpp.BORDER[n].name + " -> " + (name || (Lpp.BORDER[n].ledOnly ? "(LED only)" : "UNMAPPED")));
  }
  P("overrides JSON: " + JSON.stringify(mapOverrides));
}

function map_button(lpp, name) {
  mapOverrides[Number(lpp)] = String(name);
  var was = TAKEOVER_ACTIVE;
  if (was) releaseall();
  borderControls = {};
  resolveBorders();
  if (was) graball();
  P("mapped LPP", lpp, "->", name);
}

function lpp_color(lppIndex, pushIndex) {
  bridge.palette.set(lppIndex, pushIndex);
  bridge.repaint();
  P("palette: LPP", lppIndex, "-> Push", pushIndex);
}

function report_palette() {
  var u = bridge.palette.usage();
  P("LPP colours the M8 used this session:");
  for (var i = 0; i < u.length; i += 1) {
    P("  lpp " + u[i].lpp + " x" + u[i].count + " -> push " + u[i].push + " (" + u[i].family + ", " + u[i].confidence + ")");
  }
  P("overrides JSON: " + JSON.stringify(bridge.palette.overrides()));
}

// palette_sweep <offset>: paint Push palette indices offset..offset+63 on the
// pads (row-major from top-left), pausing M8 rendering. Tap a pad to print
// its index. `palette_sweep -1` returns the pads to the M8.
function palette_sweep(offset) {
  offset = Math.floor(Number(offset));
  if (!(offset >= 0)) { sweepOffset = -1; bridge.repaint(); P("sweep off"); return; }
  sweepOffset = Math.min(127, offset);
  if (!matrix.grabbed) { P("sweep needs takeover (select the M8 CTRL track)"); return; }
  for (var y = 0; y < 8; y += 1) for (var x = 0; x < 8; x += 1) {
    var v = Math.min(127, sweepOffset + y * 8 + x);
    echoSent("m:" + x + "," + y, v);
    echoSent(PushMap.padName(x, y), v);
    try { matrix.api.call("send_value", x, y, v); } catch (e) {}
  }
  P("sweep: pads show push indices", sweepOffset, "..", Math.min(127, sweepOffset + 63));
}

function button_mode(v) {
  var m = (Number(v) === 1 || String(v) === "note") ? "note" : "cc";
  bridge.config("buttonMode", m);
  P("border buttons send", m === "note" ? "notes (Move-emulator style)" : "CCs (hardware style)");
}
function identity() { bridge.sendIdentity(); }
function proactive(v) { bridge.config("proactive", Number(v) > 0); }
function variant(v) { bridge.config("identityVariant", (Number(v) === 1 || String(v) === "generic") ? "generic" : "mk3"); }
function capture(v) { bridge.config("capture", Number(v) > 0); P("capture", Number(v) > 0 ? "on" : "off"); }
function repaint() { bridge.repaint(); flushFrame(); }
function report() {
  var s = bridge.summary();
  s.takeover = TAKEOVER_ACTIVE; s.target = TARGET; s.owner = OWNER_TRACK_ID; s.selected = SELECTED_TRACK_ID;
  s.borderGrabbed = 0;
  for (var k in borderControls) if (borderControls.hasOwnProperty(k) && borderControls[k].grabbed) s.borderGrabbed += 1;
  P("summary " + JSON.stringify(s));
}
function reset() { bridge.reset(); bridge.repaint(); publish(true); }
function takeover() { GATING = false; graball(); }   // manual, ignores selection
function release() { releaseall(); }

function notifydeleted() {
  __dying = true;
  _frameTask = cancelTask(_frameTask);
  _takeoverTask = cancelTask(_takeoverTask);
  _grabRetryTask = cancelTask(_grabRetryTask);
  releaseall();
  if (_trackObserver) { try { _trackObserver.property = ""; _trackObserver.id = 0; } catch (e) {} _trackObserver = null; }
  if (_tempoObserver) { try { _tempoObserver.property = ""; _tempoObserver.id = 0; } catch (e2) {} _tempoObserver = null; }
  for (var n in padObservers) if (padObservers.hasOwnProperty(n)) { try { padObservers[n].obs.property = ""; padObservers[n].obs.id = 0; } catch (e3) {} }
  for (var k in borderControls) if (borderControls.hasOwnProperty(k)) { try { borderControls[k].obs.property = ""; borderControls[k].obs.id = 0; } catch (e4) {} }
  stopLearn(true);
  for (var cn in chordControls) if (chordControls.hasOwnProperty(cn)) { try { chordControls[cn].obs.property = ""; chordControls[cn].obs.id = 0; } catch (e6) {} }
  if (matrix.obs) { try { matrix.obs.property = ""; matrix.obs.id = 0; } catch (e5) {} }
}

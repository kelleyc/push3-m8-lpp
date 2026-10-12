// Max glue — m8-lpp-handshake (S2 gate) ------------------------------------
//
// Patch wiring (see devices/m8-lpp-handshake/m8-lpp-handshake.maxpat):
//   midiin  -> inlet 0      (raw bytes from the M8; also takes messages)
//   sysexin -> inlet 1      (SysEx only; harmless if it never fires in M4L)
//   outlet 0 -> midiout     (identity reply, one byte per message)
//   outlet 1 -> route ...   (counters -> live.numbox parameters, readable
//                            on the Push display in Standalone)
//
// midiin is deliberately NOT connected to midiout: nothing the M8 says is
// ever echoed back to it.
//
// No LiveAPI is used here, so a failure in this device isolates the MIDI /
// SysEx path from everything to do with control-surface grabbing.

autowatch = 1; // eslint-disable-line no-undef
inlets = 2; // eslint-disable-line no-undef
outlets = 2; // eslint-disable-line no-undef

var __dying = false;
var _loop = null;
var _published = {};
var PUBLISH_NAMES = ["state", "inquiries", "replies", "sysex_in", "led_msgs",
  "ch1", "ch2", "ch3", "other_in", "presses", "last_led", "last_color"];

function P(text) { post("[M8-LPP S2] " + text + "\n"); } // eslint-disable-line no-undef

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
  post("[M8-LPP S2] MIDI to M8 via " + ["this track", "M8 OUT track (m8-lpp-out)", "both"][OUT_PATH] + "\n"); // eslint-disable-line no-undef
}

var bridge = M8Bridge.createBridge({ // eslint-disable-line no-undef
  emitMidi: sendBytes,
  log: P,
  proactive: true,
  proactiveIntervalMs: 1000,
  proactiveMax: 30
});

function publish(force) {
  var values = bridge.statsList();
  for (var i = 0; i < PUBLISH_NAMES.length; i += 1) {
    var name = PUBLISH_NAMES[i];
    if (!force && _published[name] === values[i]) continue;
    _published[name] = values[i];
    outlet(1, name, values[i]); // eslint-disable-line no-undef
  }
}

function loopTick() {
  if (__dying) return;
  bridge.tick();
  publish(false);
}

// Sent by live.thisdevice (via deferlow) once the device is ready.
function start() {
  if (_loop) { try { _loop.cancel(); } catch (e) {} }
  _loop = new Task(loopTick); // eslint-disable-line no-undef
  _loop.interval = 100;
  _loop.repeat();
  P("listening — M8 CTRL SURFACE must be Launchpad Pro; waiting for Device Inquiry");
  publish(true);
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

function identity() { bridge.sendIdentity(); publish(false); }
function proactive(v) { bridge.config("proactive", Number(v) > 0); P("proactive identity " + (Number(v) > 0 ? "on" : "off")); }
function variant(v) {
  var name = (Number(v) === 1 || String(v) === "generic") ? "generic" : "mk3";
  bridge.config("identityVariant", name);
  P("identity variant = " + name);
}
function capture(v) { bridge.config("capture", Number(v) > 0); P("capture " + (Number(v) > 0 ? "on" : "off")); }
function report() { P("summary " + JSON.stringify(bridge.summary())); }
function reset() { bridge.reset(); publish(true); P("counters reset"); }

function notifydeleted() {
  __dying = true;
  if (_loop) { try { _loop.cancel(); } catch (e) {} _loop = null; }
}

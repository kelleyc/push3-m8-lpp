/*
 * core/bridge.js
 * --------------------------------------------------------------------------
 * The emulator engine, with no Max or LiveAPI in it:
 *
 *   M8 MIDI bytes  --> handshake + LED state  --> Push LED changes
 *   Push presses   --> LPP note/CC bytes      --> M8
 *
 * Used by both devices:
 *   - m8-lpp-handshake (S2 gate): handshake + counters only.
 *   - m8-lpp-bridge (full device): everything.
 *
 * Nothing here ever forwards M8 input back to the M8 (the S2 "no echo"
 * rule): the only bytes emitted are identity replies and encoded presses.
 *
 * ES5 only.
 * --------------------------------------------------------------------------
 */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory({
      midi: require("./midi-stream.js"),
      lpp: require("./lpp.js"),
      leds: require("./led-state.js"),
      palette: require("./palette.js"),
      map: require("./push-map.js")
    });
  } else {
    root.M8Bridge = factory({
      midi: root.M8MidiStream,
      lpp: root.M8Lpp,
      leds: root.M8LedState,
      palette: root.M8Palette,
      map: root.M8PushMap
    });
  }
})(typeof self !== "undefined" ? self : this, function (deps) {
  "use strict";

  var midi = deps.midi;
  var lpp = deps.lpp;
  var leds = deps.leds;
  var paletteModule = deps.palette;
  var map = deps.map;

  var STATE = { WAITING: 0, ASKED: 1, REPLIED: 2, PASS: 3 };
  var STATE_NAMES = ["waiting", "asked", "replied", "PASS"];

  function createBridge(options) {
    options = options || {};
    var now = typeof options.now === "function" ? options.now : function () { return new Date().getTime(); };
    var emitMidi = typeof options.emitMidi === "function" ? options.emitMidi : function () {};
    var log = typeof options.log === "function" ? options.log : function () {};

    var cfg = {
      identityVariant: options.identityVariant || "pro3",
      appVersion: options.appVersion || [0, 1, 0, 0],
      buttonMode: options.buttonMode || "cc",
      proactive: options.proactive !== false,
      proactiveIntervalMs: Number(options.proactiveIntervalMs) || 1000,
      proactiveMax: options.proactiveMax != null ? Number(options.proactiveMax) : -1,
      capture: !!options.capture,
      sendPressure: !!options.sendPressure,
      // 0 = pass the Push pad velocity through; n > 0 = every pad press sends n.
      padVelocity: options.padVelocity != null ? Number(options.padVelocity) : 0
    };

    var stats;
    var connected;
    var replied;
    var lastHeardAt = 0;
    var proactiveSent;
    var nextProactiveAt;
    var firstLed;
    var lastReplyAt;
    var captureLines;

    var ledState = leds.createLedState(options.leds);
    var animator = leds.createAnimator({ bpm: options.bpm });
    var palette = paletteModule.createPalette(options.paletteOverrides);
    var positions = lpp.allPositions();
    var lastSent = {};
    var dedupe = midi.createDeduper(options.dedupeWindowMs || 80, now);

    function reset() {
      stats = {
        state: STATE.WAITING, inquiries: 0, replies: 0, sysexIn: 0, ledMsgs: 0,
        ch1: 0, ch2: 0, ch3: 0, otherIn: 0, presses: 0, clock: 0,
        lastLedNum: 0, lastLedColor: 0, pass: 0, passAfterReplyMs: -1
      };
      connected = false;
      replied = false;
      proactiveSent = 0;
      nextProactiveAt = 0;
      firstLed = null;
      lastReplyAt = 0;
      lastHeardAt = 0;
      captureLines = [];
    }
    reset();

    function capture(line) {
      if (!cfg.capture) return;
      captureLines.push(line);
      if (captureLines.length > 2000) captureLines.shift();
      log("cap " + line);
    }

    function sendIdentity(reason) {
      var reply = lpp.identityReply(cfg.identityVariant, cfg.appVersion);
      emitMidi(reply);
      stats.replies += 1;
      lastReplyAt = now();
      if (stats.state < STATE.REPLIED) stats.state = STATE.REPLIED;
      log("identity sent (" + reason + ", " + cfg.identityVariant + "): " + midi.toHex(reply));
    }

    function markConnected(why) {
      lastHeardAt = now();
      if (connected) return;
      connected = true;
      log("M8 is talking (" + why + ")");
    }

    function onSysex(bytes, source) {
      if (dedupe(bytes, source)) return;
      stats.sysexIn += 1;
      log("SysEx in via " + source + " (" + bytes.length + " bytes): " + midi.toHex(bytes));
      capture("sysex " + midi.toHex(bytes));
      if (lpp.isDeviceInquiry(bytes)) {
        stats.inquiries += 1;
        lastHeardAt = now();
        if (stats.state < STATE.ASKED) stats.state = STATE.ASKED;
        replied = true; // answered on request: stop introducing ourselves
        sendIdentity("device inquiry");
        return;
      }
      if (lpp.isMidiCiDiscovery(bytes)) {
        log("MIDI-CI Discovery (iOS M8 app?) — answering with the classic identity, not MIDI-CI");
        sendIdentity("midi-ci discovery");
        markConnected("midi-ci");
        return;
      }
      var nov = lpp.parseNovationSysex(bytes);
      markConnected("sysex");
      if (!nov) { log("SysEx not recognised (logged for S3)"); return; }
      if (nov.kind === "programmer") log("M8 selected programmer mode: " + (nov.on ? "on" : "off"));
      else if (nov.kind === "layout") log("M8 selected layout " + nov.layout + " page " + nov.page);
      else if (nov.kind === "leds") {
        for (var i = 0; i < nov.leds.length; i += 1) {
          var l = nov.leds[i];
          if (l.mode === "rgb") { log("RGB LED " + l.num + " " + l.rgb.join(",") + " (not rendered; logged for S3)"); continue; }
          if (l.mode === "flash" && l.base != null) ledState.set(l.num, l.base, "static", now());
          applyLed(l.num, l.color, l.mode, 0, "sysex");
        }
      } else log("Novation SysEx command " + nov.command + " (logged for S3)");
    }

    function applyLed(num, color, mode, channel, type) {
      stats.ledMsgs += 1;
      if (channel === 1) stats.ch1 += 1;
      if (channel === 2) stats.ch2 += 1;
      if (channel === 3) stats.ch3 += 1;
      stats.lastLedNum = num;
      stats.lastLedColor = color;
      ledState.set(num, color, mode, now());
      if (!firstLed) {
        firstLed = { num: num, color: color, mode: mode, channel: channel, at: now() };
        stats.pass = 1;
        stats.state = STATE.PASS;
        stats.passAfterReplyMs = lastReplyAt ? now() - lastReplyAt : -1;
        log("PASS — first LED message from M8: " + lpp.nameOf(num) + " colour " + color + " " + mode +
          (channel ? " (ch" + channel + " " + type + ")" : " (sysex)") +
          (lastReplyAt ? ", " + stats.passAfterReplyMs + " ms after identity" : ", before any identity was sent"));
      }
      markConnected("led");
    }

    function onMessage(bytes) {
      var m = lpp.parseM8Message(bytes);
      if (!m) return;
      if (m.kind === "led") {
        capture("ch" + m.channel + " " + m.type + " " + m.num + " " + m.color + "  [" + lpp.nameOf(m.num) + "]");
        applyLed(m.num, m.color, m.mode, m.channel, m.type);
        return;
      }
      stats.otherIn += 1;
      capture("other " + midi.toHex(bytes));
      markConnected("midi");
    }

    function onRealtime(b) {
      if (b === 0xF8) stats.clock += 1;
    }

    var midiinParser = midi.createMidiParser({
      onMessage: onMessage,
      onSysex: function (b) { onSysex(b, "midiin"); },
      onRealtime: onRealtime,
      onError: function (t) { log("midiin parse: " + t); }
    });
    var sysexinParser = midi.createMidiParser({
      onMessage: function () {},
      onSysex: function (b) { onSysex(b, "sysexin"); },
      onError: function (t) { log("sysexin parse: " + t); }
    });

    // Proactive introduction: the M8 may have asked before the device loaded.
    // Introduce ourselves once a second until the M8 says ANYTHING (SysEx, LED,
    // inquiry), then stop. Every identity makes the M8 re-accept the surface
    // ("LAUNCHPAD CONNECTED", browsers close) and restart its paint, so retrying
    // after it has answered keeps it from ever finishing (hardware 2026-10-11;
    // chaolue/schwung-m8 found the same with the iOS app). A rebooted M8 sends
    // its own inquiry, which is always answered.
    function tick() {
      if (!cfg.proactive || connected || replied) return;
      if (cfg.proactiveMax >= 0 && proactiveSent >= cfg.proactiveMax) return;
      var t = now();
      if (t < nextProactiveAt) return;
      nextProactiveAt = t + cfg.proactiveIntervalMs;
      proactiveSent += 1;
      sendIdentity("proactive #" + proactiveSent);
    }

    // ---- Push -> M8 --------------------------------------------------------

    function press(num, velocity) {
      var bytes = lpp.encodePress(num, velocity, { buttonMode: cfg.buttonMode });
      if (!bytes) return null;
      stats.presses += 1;
      emitMidi(bytes);
      return bytes;
    }

    function pad(x, y, velocity) {
      var n = map.padToLpp(x, y);
      if (n != null && Number(velocity) > 0 && cfg.padVelocity > 0) velocity = cfg.padVelocity;
      return n == null ? null : press(n, velocity);
    }

    // One Push control -> several LPP buttons (e.g. Shift + Right). Press
    // sends them in order, release sends them back in reverse order.
    var chordDown = {};
    function chord(list, velocity) {
      var key = list.join(",");
      var out = [];
      var i;
      if (Number(velocity) > 0) {
        if (chordDown[key]) return out;
        chordDown[key] = true;
        for (i = 0; i < list.length; i += 1) { var a = press(list[i], 127); if (a) out.push(a); }
      } else {
        if (!chordDown[key]) return out;
        delete chordDown[key];
        for (i = list.length - 1; i >= 0; i -= 1) { var b = press(list[i], 0); if (b) out.push(b); }
      }
      return out;
    }

    function pressure(x, y, value) {
      if (!cfg.sendPressure) return null;
      var bytes = lpp.encodePolyPressure(map.padToLpp(x, y), value);
      if (bytes) emitMidi(bytes);
      return bytes;
    }

    // ---- LEDs -> Push --------------------------------------------------------

    function displayValue(num, t) {
      var s = ledState.get(num);
      var d = animator.display(s, t);
      return palette.toPush(d.color, d.dim);
    }

    // Returns [[lppNum, pushValue], ...] for every position whose displayed
    // value differs from what was last sent.
    function frame(t) {
      t = t == null ? now() : t;
      ledState.settle(t);
      var changes = [];
      for (var i = 0; i < positions.length; i += 1) {
        var n = positions[i];
        var v = displayValue(n, t);
        if (lastSent[n] === v) continue;
        lastSent[n] = v;
        changes.push([n, v]);
      }
      return changes;
    }

    // Forget what Push shows so the next frame repaints every position.
    // Called on every (re)grab: fixes the "pads dark after re-grab" bug
    // seen in earlier Push work by never trusting the previous diff.
    function repaint() { lastSent = {}; }

    function isAnimating() { return ledState.animatedCount() > 0 || ledState.hasPendingStops(); }

    function statsList() {
      return [stats.state, stats.inquiries, stats.replies, stats.sysexIn, stats.ledMsgs,
        stats.ch1, stats.ch2, stats.ch3, stats.otherIn, stats.presses, stats.lastLedNum, stats.lastLedColor];
    }

    function summary() {
      return {
        state: STATE_NAMES[stats.state], stats: stats, connected: connected,
        firstLed: firstLed, config: cfg, proactiveSent: proactiveSent,
        animated: ledState.animatedCount(), tempo: animator.tempo()
      };
    }

    return {
      midiinByte: function (b) { midiinParser.feed(b); },
      midiinList: function (l) { midiinParser.feedList(l); },
      sysexinByte: function (b) { sysexinParser.feed(b); },
      sysexinList: function (l) { sysexinParser.feedList(l); },
      tick: tick,
      sendIdentity: function () { sendIdentity("manual"); },
      press: press,
      pad: pad,
      chord: chord,
      pressure: pressure,
      frame: frame,
      repaint: repaint,
      isAnimating: isAnimating,
      setTempo: animator.setTempo,
      palette: palette,
      ledState: ledState,
      config: function (key, value) {
        if (!cfg.hasOwnProperty(key)) return false;
        if (typeof cfg[key] === "boolean") cfg[key] = !!Number(value) || value === true || value === "on";
        else if (typeof cfg[key] === "number") cfg[key] = Number(value);
        else cfg[key] = String(value);
        return true;
      },
      getConfig: function () { return cfg; },
      stats: function () { return stats; },
      statsList: statsList,
      summary: summary,
      captureLines: function () { return captureLines.slice(); },
      reset: function () { reset(); ledState.clear(); lastSent = {}; },
      isConnected: function () { return connected; }
    };
  }

  return { createBridge: createBridge, STATE: STATE, STATE_NAMES: STATE_NAMES };
});

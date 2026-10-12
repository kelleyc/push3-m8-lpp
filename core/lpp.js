/*
 * core/lpp.js
 * --------------------------------------------------------------------------
 * Launchpad Pro [MK3] protocol facts used by the M8 control-surface mode.
 * Every constant here is cited in docs/LPP-PROTOCOL.md. Summary:
 *
 *  - The M8 asks "who are you?" with the Universal Device Inquiry
 *    F0 7E <id> 06 01 F7 (hardware M8 uses id 7F).
 *  - We answer as a Pro MK3 in Application mode (Novation programmer's ref,
 *    "Device Inquiry message"):
 *      F0 7E 00 06 02 00 20 29 13 01 00 00 <app version x4> F7
 *    The original Move emulator answered with family/model 00 00 and still
 *    worked; that variant is kept as a fallback ("generic").
 *  - M8 -> LPP LEDs: Note On on channel 1/2/3 = static/flashing/pulsing,
 *    velocity = LPP palette index. The note number addresses any position,
 *    border buttons included. CCs on the same channels are accepted too.
 *  - LPP -> M8 presses go out on channel 1. Grid pads are notes 11..88
 *    with velocity. Border buttons are CCs on real hardware (Grahack's
 *    M8_LPP_recap: "CC #1 to #98"); the Move emulator sends them as notes
 *    and also works, so both encodings are selectable.
 *
 * Numbering: programmer layout, 10 rows x 10 columns, bottom-left origin.
 *   grid      rc  (r = row 1..8 from bottom, c = col 1..8 from left)
 *   left col  10,20..80     right col 19,29..89
 *   top row   90..98 (99 = Novation logo LED only)
 *   bottom    101..108 (track select T1..T8) and 1..8 (function row)
 *
 * ES5 only.
 * --------------------------------------------------------------------------
 */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.M8Lpp = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var NOVATION = [0x00, 0x20, 0x29];
  var MK3_SYSEX_HEADER = [0xF0, 0x00, 0x20, 0x29, 0x02, 0x0E];

  var IDENTITY = {
    // Launchpad Pro MK3 application reply: 13 01 per Novation's Programmer's Reference
    // (p.6) and the schwung-m8 release notes. On real hardware (2026-10-09, TRS) the M8
    // accepted 13 01, 23 01 and 00 00 alike, so the exact family bytes don't matter to it.
    mk3: [0x13, 0x01, 0x00, 0x00],
    // Launchpad Pro MK3 family as the M8 build that lit the full grid saw it (2026-10-09).
    pro3: [0x23, 0x01, 0x00, 0x00],
    // What the original Move emulator sent: maker only, model unknown.
    generic: [0x00, 0x00, 0x00, 0x00]
  };

  var DEFAULT_APP_VERSION = [0, 1, 0, 0]; // one digit 0..9 per byte; cosmetic

  function isDeviceInquiry(bytes) {
    return !!bytes && bytes.length === 6 &&
      bytes[0] === 0xF0 && bytes[1] === 0x7E &&
      bytes[3] === 0x06 && bytes[4] === 0x01 && bytes[5] === 0xF7;
  }

  // MIDI-CI Discovery (iOS M8 app opens with this). A real LPP MK3 does not
  // answer MIDI-CI; the Move emulator found that sending the classic identity
  // in response is what gets the app to connect.
  function isMidiCiDiscovery(bytes) {
    return !!bytes && bytes.length >= 6 &&
      bytes[0] === 0xF0 && bytes[1] === 0x7E &&
      bytes[3] === 0x0D && bytes[4] === 0x70;
  }

  function identityReply(variant, version) {
    var fam = IDENTITY[variant] || IDENTITY.pro3;
    var ver = version && version.length === 4 ? version : DEFAULT_APP_VERSION;
    var out = [0xF0, 0x7E, 0x00, 0x06, 0x02].concat(NOVATION).concat(fam);
    for (var i = 0; i < 4; i += 1) out.push(Math.max(0, Math.min(9, Math.floor(Number(ver[i]) || 0))));
    out.push(0xF7);
    return out; // 17 bytes
  }

  // ---- layout ---------------------------------------------------------------

  var BORDER = {
    90: { name: "Shift", edge: "top" },
    91: { name: "Left", edge: "top" },
    92: { name: "Right", edge: "top" },
    93: { name: "Session", edge: "top" },
    94: { name: "Note", edge: "top" },
    95: { name: "Chord", edge: "top" },
    96: { name: "Custom", edge: "top" },
    97: { name: "Sequencer", edge: "top" },
    98: { name: "Projects", edge: "top" },
    99: { name: "Logo", edge: "top", ledOnly: true },
    80: { name: "Up", edge: "left" },
    70: { name: "Down", edge: "left" },
    60: { name: "Clear", edge: "left" },
    50: { name: "Duplicate", edge: "left" },
    40: { name: "Quantise", edge: "left" },
    30: { name: "Fixed Length", edge: "left" },
    20: { name: "Play", edge: "left" },
    10: { name: "Record", edge: "left" },
    1: { name: "Record Arm", edge: "bottom" },
    2: { name: "Mute", edge: "bottom" },
    3: { name: "Solo", edge: "bottom" },
    4: { name: "Volume", edge: "bottom" },
    5: { name: "Pan", edge: "bottom" },
    6: { name: "Sends", edge: "bottom" },
    7: { name: "Device", edge: "bottom" },
    8: { name: "Stop Clip", edge: "bottom" }
  };
  (function () {
    var r;
    for (r = 1; r <= 8; r += 1) BORDER[r * 10 + 9] = { name: "Scene " + (9 - r), edge: "right" };
    for (r = 1; r <= 8; r += 1) BORDER[100 + r] = { name: "T" + r, edge: "track" };
  })();

  function isGridNote(n) {
    n = Number(n);
    var r = Math.floor(n / 10);
    var c = n % 10;
    return n >= 11 && n <= 88 && r >= 1 && r <= 8 && c >= 1 && c <= 8;
  }

  function isBorder(n) { return BORDER.hasOwnProperty(String(n)); }

  function isAddressable(n) { return isGridNote(n) || isBorder(n); }

  function allPositions() {
    var out = [];
    for (var r = 1; r <= 8; r += 1) for (var c = 1; c <= 8; c += 1) out.push(r * 10 + c);
    for (var k in BORDER) if (BORDER.hasOwnProperty(k)) out.push(Number(k));
    out.sort(function (a, b) { return a - b; });
    return out;
  }

  function nameOf(n) {
    if (isGridNote(n)) return "pad r" + Math.floor(n / 10) + "c" + (n % 10);
    return BORDER[n] ? BORDER[n].name : "unknown " + n;
  }

  // ---- M8 -> LPP: LED messages --------------------------------------------

  var MODE_BY_CHANNEL = { 1: "static", 2: "flash", 3: "pulse" };

  /*
   * Interpret one channel-voice message from the M8.
   * Returns { kind: "led", num, color, mode, channel } or
   *         { kind: "other", ... } or null.
   */
  function parseM8Message(bytes) {
    if (!bytes || !bytes.length) return null;
    var status = bytes[0];
    var hi = status & 0xF0;
    var channel = (status & 0x0F) + 1;
    if ((hi === 0x90 || hi === 0x80 || hi === 0xB0) && bytes.length >= 3) {
      var mode = MODE_BY_CHANNEL[channel];
      if (mode && isAddressable(bytes[1])) {
        var color = hi === 0x80 ? 0 : bytes[2];
        return { kind: "led", num: bytes[1], color: color, mode: color ? mode : "static", channel: channel, type: hi === 0xB0 ? "cc" : "note" };
      }
    }
    return { kind: "other", status: status, channel: channel, bytes: bytes };
  }

  /*
   * Novation MK3 SysEx from the M8 (programmer-mode select, LED lighting).
   * Returns { kind: "programmer", on } | { kind: "leds", leds: [...] } |
   *         { kind: "novation", command } | null (not Novation MK3).
   */
  function parseNovationSysex(bytes) {
    if (!bytes || bytes.length < 8) return null;
    for (var i = 0; i < MK3_SYSEX_HEADER.length; i += 1) {
      if (bytes[i] !== MK3_SYSEX_HEADER[i]) return null;
    }
    var cmd = bytes[6];
    var body = bytes.slice(7, bytes.length - 1);
    if (cmd === 0x0E) return { kind: "programmer", on: body[0] === 1 };
    if (cmd === 0x00) return { kind: "layout", layout: body[0], page: body[1] };
    if (cmd === 0x03) {
      // LED lighting: repeated <type> <index> <data...>
      var leds = [];
      var p = 0;
      while (p < body.length) {
        var type = body[p];
        var idx = body[p + 1];
        if (type === 0) { leds.push({ num: idx, color: body[p + 2], mode: "static" }); p += 3; }
        else if (type === 1) { leds.push({ num: idx, color: body[p + 3], base: body[p + 2], mode: "flash" }); p += 4; }
        else if (type === 2) { leds.push({ num: idx, color: body[p + 2], mode: "pulse" }); p += 3; }
        else if (type === 3) { leds.push({ num: idx, rgb: [body[p + 2], body[p + 3], body[p + 4]], mode: "rgb" }); p += 5; }
        else break;
      }
      return { kind: "leds", leds: leds };
    }
    return { kind: "novation", command: cmd, body: body };
  }

  // ---- LPP -> M8: presses ---------------------------------------------------

  /*
   * opts.buttonMode  "cc" (hardware) | "note" (Move emulator style)
   * Grid pads always send notes: press = 90 n v, release = 90 n 0.
   */
  function encodePress(num, velocity, opts) {
    opts = opts || {};
    num = Math.floor(Number(num));
    var v = Math.max(0, Math.min(127, Math.floor(Number(velocity) || 0)));
    if (isGridNote(num)) {
      if (Number(velocity) > 0 && v === 0) v = 1; // a soft hit is still a press
      return [0x90, num, v];
    }
    if (!isBorder(num) || (BORDER[num] && BORDER[num].ledOnly)) return null;
    if (opts.buttonMode === "note") {
      return v > 0 ? [0x90, num, opts.noteVelocity || 100] : [0x80, num, 0];
    }
    return [0xB0, num, v > 0 ? 127 : 0];
  }

  function encodePolyPressure(num, pressure) {
    if (!isGridNote(num)) return null;
    return [0xA0, num, Math.max(0, Math.min(127, Math.floor(Number(pressure) || 0)))];
  }

  return {
    NOVATION: NOVATION,
    MK3_SYSEX_HEADER: MK3_SYSEX_HEADER,
    IDENTITY: IDENTITY,
    BORDER: BORDER,
    MODE_BY_CHANNEL: MODE_BY_CHANNEL,
    isDeviceInquiry: isDeviceInquiry,
    isMidiCiDiscovery: isMidiCiDiscovery,
    identityReply: identityReply,
    isGridNote: isGridNote,
    isBorder: isBorder,
    isAddressable: isAddressable,
    allPositions: allPositions,
    nameOf: nameOf,
    parseM8Message: parseM8Message,
    parseNovationSysex: parseNovationSysex,
    encodePress: encodePress,
    encodePolyPressure: encodePolyPressure
  };
});

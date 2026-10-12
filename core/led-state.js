/*
 * core/led-state.js
 * --------------------------------------------------------------------------
 * The emulated Launchpad's LED memory (every addressable LPP position) plus
 * the flash/pulse animator. Push cannot be told "flash this pad" through
 * grabbed controls, so animation is done here in software and the device
 * flushes the resulting frame on a timer.
 *
 * Launchpad semantics (MK3 programmer's reference, "LED lighting"):
 *   channel 1 static  : colour C                 -> base = C
 *   channel 2 flash   : flashes between the current static colour (B) and
 *                       the new colour (A)       -> base kept, color = A
 *   channel 3 pulse   : pulses colour C          -> color = C
 *
 * M8 quirk carried over from the Move emulator: the M8 repaints the whole
 * grid statically and then re-sends its flash overlays, on every refresh.
 * Ending an animation immediately on a static write therefore flickers.
 * A static write to an animated cell only *schedules* the stop; a re-arm
 * inside STOP_GRACE_MS cancels it.
 *
 * ES5 only.
 * --------------------------------------------------------------------------
 */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.M8LedState = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var STOP_GRACE_MS = 60;

  function createLedState(options) {
    options = options || {};
    var grace = options.stopGraceMs != null ? Number(options.stopGraceMs) : STOP_GRACE_MS;
    var cells = {};   // num -> { base, color, mode, stopAt }
    var dirty = {};

    function cell(num) {
      var key = String(num);
      if (!cells[key]) cells[key] = { base: 0, color: 0, mode: "static", stopAt: 0 };
      return cells[key];
    }

    // Returns true if anything visible may have changed.
    function set(num, color, mode, now) {
      color = Math.max(0, Math.min(127, Math.floor(Number(color) || 0)));
      var c = cell(num);
      var before = c.base + "|" + c.color + "|" + c.mode + "|" + (c.stopAt ? 1 : 0);
      if (mode === "flash" || mode === "pulse") {
        c.mode = mode;
        c.color = color;
        c.stopAt = 0;
      } else if (c.mode !== "static" && color !== 0) {
        c.base = color;
        if (!c.stopAt) c.stopAt = (Number(now) || 0) + grace;
      } else {
        c.mode = "static";
        c.base = color;
        c.color = color;
        c.stopAt = 0;
      }
      var after = c.base + "|" + c.color + "|" + c.mode + "|" + (c.stopAt ? 1 : 0);
      if (before !== after) dirty[String(num)] = true;
      return before !== after;
    }

    // Applies scheduled stops whose grace period has passed.
    function settle(now) {
      now = Number(now) || 0;
      for (var k in cells) {
        if (!cells.hasOwnProperty(k)) continue;
        var c = cells[k];
        if (c.stopAt && now >= c.stopAt) {
          c.mode = "static";
          c.color = c.base;
          c.stopAt = 0;
          dirty[k] = true;
        }
      }
    }

    function get(num) {
      var c = cells[String(num)];
      return c ? { base: c.base, color: c.color, mode: c.mode } : { base: 0, color: 0, mode: "static" };
    }

    function animatedCount() {
      var n = 0;
      for (var k in cells) if (cells.hasOwnProperty(k) && cells[k].mode !== "static") n += 1;
      return n;
    }

    function hasPendingStops() {
      for (var k in cells) if (cells.hasOwnProperty(k) && cells[k].stopAt) return true;
      return false;
    }

    function clear() { cells = {}; dirty = {}; }

    function numbers() {
      var out = [];
      for (var k in cells) if (cells.hasOwnProperty(k)) out.push(Number(k));
      return out;
    }

    function snapshot() {
      var out = {};
      for (var k in cells) if (cells.hasOwnProperty(k)) out[k] = get(k);
      return out;
    }

    return {
      set: set,
      settle: settle,
      get: get,
      clear: clear,
      numbers: numbers,
      snapshot: snapshot,
      animatedCount: animatedCount,
      hasPendingStops: hasPendingStops
    };
  }

  /*
   * Phase clock. Launchpads sync flash/pulse to incoming MIDI clock and
   * default to 120 BPM; here the device feeds Live's tempo.
   *   flash: colour A for the first half of each beat, B for the second.
   *   pulse: bright for the first half of every 2 beats, dim partner after.
   */
  function createAnimator(options) {
    options = options || {};
    var bpm = Number(options.bpm) || 120;
    function beatMs() { return 60000 / Math.max(20, Math.min(999, bpm)); }
    return {
      setTempo: function (value) { var v = Number(value); if (isFinite(v) && v > 0) bpm = v; },
      tempo: function () { return bpm; },
      flashOn: function (now) { var b = beatMs(); return (Number(now) % b) < b / 2; },
      pulseOn: function (now) { var p = beatMs() * 2; return (Number(now) % p) < p / 2; },
      // Displayed LPP colour + whether it is the dim half of a pulse.
      display: function (state, now) {
        if (state.mode === "flash") return { color: this.flashOn(now) ? state.color : state.base, dim: false };
        if (state.mode === "pulse") {
          var on = this.pulseOn(now);
          return { color: state.color, dim: !on };
        }
        return { color: state.base, dim: false };
      }
    };
  }

  return { createLedState: createLedState, createAnimator: createAnimator, STOP_GRACE_MS: STOP_GRACE_MS };
});

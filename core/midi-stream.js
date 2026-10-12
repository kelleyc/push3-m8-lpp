/*
 * core/midi-stream.js
 * --------------------------------------------------------------------------
 * Raw MIDI byte-stream parser for Max's `midiin` (one int per byte) and
 * `sysexin` (one int per byte or one list per message — both are handled).
 *
 *  - Channel voice messages, with running status.
 *  - SysEx assembled from F0 .. F7 (bounded), realtime bytes (F8..FF) may be
 *    interleaved anywhere, including inside SysEx, without corrupting it.
 *  - A short-window de-duplicator, because the same SysEx can arrive through
 *    both `midiin` and `sysexin` when both are wired.
 *
 * ES5 only: this file is bundled into Max `js` objects (legacy engine).
 * --------------------------------------------------------------------------
 */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.M8MidiStream = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var MAX_SYSEX = 4096;

  // Data-byte count for each channel-voice status nibble.
  function dataLength(status) {
    var hi = status & 0xF0;
    if (hi === 0xC0 || hi === 0xD0) return 1;
    if (hi >= 0x80 && hi <= 0xE0) return 2;
    return 0;
  }

  function systemCommonLength(status) {
    if (status === 0xF1 || status === 0xF3) return 1;
    if (status === 0xF2) return 2;
    return 0; // F6 tune request, F4/F5 undefined
  }

  /*
   * handlers.onMessage(bytes)  channel voice + system common
   * handlers.onSysex(bytes)    complete F0..F7
   * handlers.onRealtime(byte)  F8..FF
   * handlers.onError(text)
   */
  function createMidiParser(handlers) {
    handlers = handlers || {};
    var running = 0;      // running-status byte (channel voice only)
    var pending = [];     // message being assembled
    var need = 0;         // data bytes still needed for pending
    var sysex = null;     // array while inside F0..F7

    function emit(name, value) {
      if (typeof handlers[name] === "function") handlers[name](value);
    }

    function feed(b) {
      b = Number(b);
      if (!isFinite(b)) return;
      b = Math.floor(b) & 0xFF;

      if (b >= 0xF8) { emit("onRealtime", b); return; }

      if (b === 0xF0) {
        sysex = [0xF0];
        running = 0; pending = []; need = 0;
        return;
      }
      if (b === 0xF7) {
        if (sysex) {
          sysex.push(0xF7);
          var done = sysex;
          sysex = null;
          emit("onSysex", done);
        }
        return;
      }
      if (sysex) {
        if (b >= 0x80) {
          // A status byte other than realtime/F7 aborts the SysEx (MIDI spec).
          emit("onError", "sysex aborted by status " + b);
          sysex = null;
          // fall through and treat b as a new status
        } else {
          if (sysex.length >= MAX_SYSEX) {
            emit("onError", "sysex overflow");
            sysex = null;
            return;
          }
          sysex.push(b);
          return;
        }
      }

      if (b >= 0x80) {
        if (b >= 0xF0) {
          running = 0;
          need = systemCommonLength(b);
          pending = [b];
          if (!need) { emit("onMessage", pending); pending = []; }
          return;
        }
        running = b;
        pending = [b];
        need = dataLength(b);
        return;
      }

      // data byte
      if (!pending.length) {
        if (!running) return; // stray data byte
        pending = [running];
        need = dataLength(running);
      }
      pending.push(b);
      need -= 1;
      if (need <= 0) {
        var msg = pending;
        pending = [];
        need = 0;
        emit("onMessage", msg);
      }
    }

    function feedList(list) {
      for (var i = 0; i < list.length; i += 1) feed(list[i]);
    }

    function reset() { running = 0; pending = []; need = 0; sysex = null; }

    return { feed: feed, feedList: feedList, reset: reset };
  }

  function bytesEqual(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    for (var i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return false;
    return true;
  }

  // Returns true if the same byte sequence already arrived through a
  // DIFFERENT source (midiin vs sysexin) inside the window, i.e. this is the
  // second copy of one message. Repeats on the same source are real repeats.
  function createDeduper(windowMs, now) {
    windowMs = Number(windowMs) || 50;
    now = typeof now === "function" ? now : function () { return new Date().getTime(); };
    var last = null;
    var lastAt = 0;
    var lastSource = null;
    return function isDuplicate(bytes, source) {
      var t = now();
      if (last && source !== lastSource && bytesEqual(last, bytes) && t - lastAt <= windowMs) {
        last = null;
        return true;
      }
      last = bytes.slice();
      lastAt = t;
      lastSource = source;
      return false;
    };
  }

  function toHex(bytes) {
    var out = [];
    for (var i = 0; i < bytes.length; i += 1) {
      var h = (Number(bytes[i]) & 0xFF).toString(16).toUpperCase();
      out.push(h.length < 2 ? "0" + h : h);
    }
    return out.join(" ");
  }

  return {
    createMidiParser: createMidiParser,
    createDeduper: createDeduper,
    bytesEqual: bytesEqual,
    toHex: toHex,
    MAX_SYSEX: MAX_SYSEX
  };
});

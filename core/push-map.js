/*
 * core/push-map.js
 * --------------------------------------------------------------------------
 * Push 3 control surface <-> emulated Launchpad Pro positions.
 *
 * Pads: Push control "<x>_Clip_<y>_Button" with x = column 0..7 from the left
 * and y = row 0..7 from the TOP (confirmed on hardware). LPP grid is
 * bottom-left origin, so pad (x, y) <-> LPP note (8 - y) * 10 + (x + 1).
 *
 * Border buttons: Push 3 control names confirmed on hardware (Live 12.4,
 * 2026-10-11) include Setup_Button, Sets_Button, Layout, Session_Mode_Button,
 * Note_Mode_Button, Clip_Mode_Button and Track_State_Button0..7. Confirmed
 * by the 2026-06-01 probe: Select_Button, Shift_Button, Global_Mute_Button,
 * Global_Solo_Button, Record_Button, Scene_Launch_Button0..7 (numbered
 * bottom-to-top). Everything else is a candidate list; the device resolves
 * candidates against `get_control_names` at runtime and reports what it
 * could not find (S5). Overrides: `map_button <lpp> <ControlName>`.
 *
 * Design choices (change freely):
 *  - LPP Shift -> Push Select (Push's own Shift cannot be fully owned).
 *  - LPP Mute/Solo -> Push global Mute/Solo (confirmed grabbable).
 *  - LPP T1..T8 -> the button row directly above the pads (nearest the grid).
 *  - Only buttons the M8 uses are mapped; Push system buttons are never taken.
 *
 * ES5 only.
 * --------------------------------------------------------------------------
 */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.M8PushMap = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function padToLpp(x, y) {
    x = Math.floor(Number(x)); y = Math.floor(Number(y));
    if (!(x >= 0 && x <= 7 && y >= 0 && y <= 7)) return null;
    return (8 - y) * 10 + (x + 1);
  }

  function lppToPad(note) {
    note = Math.floor(Number(note));
    var r = Math.floor(note / 10);
    var c = note % 10;
    if (r < 1 || r > 8 || c < 1 || c > 8) return null;
    return { x: c - 1, y: 8 - r };
  }

  function padName(x, y) { return x + "_Clip_" + y + "_Button"; }

  function padFromName(name) {
    var m = /^(\d+)_Clip_(\d+)_Button$/.exec(String(name));
    if (!m) return null;
    var x = parseInt(m[1], 10);
    var y = parseInt(m[2], 10);
    if (x < 0 || x > 7 || y < 0 || y > 7) return null;
    return { x: x, y: y };
  }

  // Candidate control names per LPP border number, most likely first.
  function indexed(prefixes, i) {
    var out = [];
    for (var p = 0; p < prefixes.length; p += 1) {
      out.push(prefixes[p] + i);
      out.push(prefixes[p] + "_" + i);
    }
    return out;
  }

  // Only the Launchpad buttons the M8 actually uses are mapped, and only to
  // Push buttons that do the same kind of job. Push's own system buttons
  // (Setup, Add Device, Shift, the display rows, ...) are never taken
  // automatically. Unmapped LPP numbers: 1 (Rec Arm / snapshot), 4-8, 30,
  // 40, 95, 96 - the M8 either ignores them or Push has no spare button.
  var CANDIDATES = (function () {
    var c = {};
    // Top row
    c[90] = ["Select_Button"];
    c[91] = ["Left_Arrow", "Left_Button"];
    c[92] = ["Right_Arrow", "Right_Button"];
    c[93] = ["Session_Mode_Button", "Session_Button", "Session_View_Button"];
    c[94] = ["Note_Mode_Button", "Note_Button"];
    c[97] = ["Layout", "Layout_Button", "Sequencer_Button", "Step_Sequencer_Button"];
    c[98] = ["Browse_Mode_Button", "Browse_Button"];
    // Left column
    c[80] = ["Up_Arrow", "Up_Button"];
    c[70] = ["Down_Arrow", "Down_Button"];
    c[60] = ["Delete_Button", "Clear_Button"];
    c[50] = ["Duplicate_Button", "Double_Button"];
    c[20] = ["Play_Button"];
    c[10] = ["Record_Button"];
    // Bottom function row: only Mute and Solo
    c[2] = ["Global_Mute_Button"];
    c[3] = ["Global_Solo_Button"];
    // Track select T1..T8 (row directly above the pads)
    for (var t = 1; t <= 8; t += 1) {
      c[100 + t] = indexed(["Track_Select_Button", "Lower_Track_Button"], t - 1);
    }
    // Right column: LPP row r (1 = bottom) -> Scene_Launch_Button(r-1),
    // because Push numbers scene buttons bottom-to-top.
    for (var r = 1; r <= 8; r += 1) c[r * 10 + 9] = ["Scene_Launch_Button" + (r - 1), "Scene_Launch_Button_" + (r - 1)];
    return c;
  })();

  // Never taken automatically, whatever a candidate list says. An explicit
  // `map_button` override can still use them.
  var NEVER = { Shift_Button: 1, Setup_Button: 1, Add_Device_Button: 1, Add_Track_Button: 1,
    User_Button: 1, Undo_Button: 1, Master_Select_Button: 1, Mix_Button: 1, Clip_Mode_Button: 1,
    Device_Mode_Button: 1, Tap_Tempo_Button: 1, Metronome_Button: 1, Capture_Button: 1,
    Convert_Button: 1, New_Button: 1, Automation_Button: 1, Fixed_Length_Button: 1,
    Quantization_Button: 1, Quantize_Button: 1, Page_Left_Button: 1, Page_Right_Button: 1,
    Sets_Button: 1, Save_Button: 1, Lock_Button: 1, Swap_Button: 1, Add_Button: 1,
    Scale_Presets_Button: 1, Repeat_Button: 1, Accent_Button: 1, Octave_Up_Button: 1,
    Octave_Down_Button: 1, Single_Track_Mode_Button: 1, Session_Screen_button: 1,
    Track_Stop_Button: 1, Convert: 1, Nav_Select_Button: 1 };

  // Lower numbers resolve first; the important, confirmed ones come first so
  // a shared fallback name (e.g. Track_State_Button1) cannot steal them.
  var PRIORITY = [20, 10, 2, 3, 90, 80, 70, 91, 92, 93, 94, 97, 98, 60, 50, 40, 30,
    89, 79, 69, 59, 49, 39, 29, 19,
    101, 102, 103, 104, 105, 106, 107, 108,
    1, 4, 5, 6, 7, 8, 95, 96];

  /*
   * names: array of control names reported by get_control_names.
   * overrides: { lpp: "ControlName" }.
   * Returns { byLpp: {lpp: name}, byName: {name: lpp}, missing: [lpp...] }.
   */
  function resolveBorderMap(names, overrides) {
    var available = {};
    for (var i = 0; i < (names || []).length; i += 1) available[String(names[i])] = true;
    var byLpp = {};
    var byName = {};
    var missing = [];
    var lpp, k;

    function take(n, name, explicit) {
      if (!available[name] || byName.hasOwnProperty(name)) return false;
      if (!explicit && NEVER[name]) return false;
      byLpp[n] = name;
      byName[name] = n;
      return true;
    }

    if (overrides) {
      for (k in overrides) {
        if (!overrides.hasOwnProperty(k)) continue;
        if (!overrides[k] || overrides[k] === "-") { byLpp[k] = null; continue; }
        take(Number(k), String(overrides[k]), true);
      }
    }
    for (var p = 0; p < PRIORITY.length; p += 1) {
      lpp = PRIORITY[p];
      if (byLpp.hasOwnProperty(lpp)) continue;
      var list = CANDIDATES[lpp] || [];
      var ok = false;
      for (var j = 0; j < list.length && !ok; j += 1) ok = take(lpp, list[j]);
      if (!ok) missing.push(lpp);
    }
    for (k in byLpp) if (byLpp.hasOwnProperty(k) && byLpp[k] === null) delete byLpp[k];
    return { byLpp: byLpp, byName: byName, missing: missing };
  }

  function allPadNames() {
    var out = [];
    for (var y = 0; y < 8; y += 1) for (var x = 0; x < 8; x += 1) out.push(padName(x, y));
    return out;
  }

  return {
    padToLpp: padToLpp,
    lppToPad: lppToPad,
    padName: padName,
    padFromName: padFromName,
    allPadNames: allPadNames,
    CANDIDATES: CANDIDATES,
    PRIORITY: PRIORITY,
    resolveBorderMap: resolveBorderMap
  };
});

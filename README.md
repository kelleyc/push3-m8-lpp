# push3-m8-lpp

A Max for Live device that turns an **Ableton Push 3** into a **Novation Launchpad
Pro MK3** for the **Dirtywave M8**, using the M8's built-in Launchpad Pro
control-surface mode.

While its track is selected, the device takes over the Push's pads and buttons. The
M8 sees a Launchpad Pro: it lights the pads, and pad and button presses go back to
the M8. Select any other track and the Push goes back to being a Push.

**Status:** working over TRS MIDI with the Push in Control mode, tethered to a Mac.
The M8 connects, the LEDs light, and pads, row launch, arrows and transport all
work. A frozen build for Push 3 Standalone is included but hasn't been fully
tested there yet. Mute and Solo are mapped but haven't been confirmed on hardware.

## What you need

- Ableton Push 3 (Standalone, or in Control mode with Live 12 and Max for Live)
- Dirtywave M8 (hardware). The iOS/iPadOS app hasn't been tested.
- A TRS MIDI adapter for the M8 (Type A) and two 5-pin DIN MIDI cables. These go
  between the M8's TRS MIDI in/out and the Push 3's MIDI in/out.

**USB MIDI doesn't work for this.** Over USB, the M8 asks for a Launchpad but
ignores the reply. Use TRS for MIDI. USB is still fine for the M8's audio.

## Install

1. Download [`release/frozen/M8 LPP.amxd`](release/frozen/M8%20LPP.amxd). It's
   frozen, so it's self-contained.
2. In Live, create a MIDI track (e.g. "M8 CTRL") and set:
   - **MIDI From:** Ableton Push 3 (External Port), All Channels
   - **Monitor:** In
   - **MIDI To:** Ableton Push 3 (External Port)
3. Drop **M8 LPP** on that track.
4. On the M8, set **CTRL SURFACE** to **Launchpad Pro**.
5. Select the track. The device's **Launchpad** readout goes from *waiting* to
   *replied*, then to *connected* once the M8 starts sending LEDs. The M8's screen
   shows LAUNCHPAD CONNECTED.

### Push 3 Standalone

1. Copy the **frozen** device to the Push: drag it onto the Push in Live's browser.
   An unfrozen copy can't find its script on the Push, so it sits at *waiting*.
2. On the Push, create a MIDI track with the same settings: MIDI From and MIDI To
   = External Port, and **Monitor = In**. A new track on the Push defaults to
   Monitor *Auto*, which only listens while the track is armed, so the device
   would never hear the M8.
3. Drop the device on the track and select it.

Save that track or Set as your starting template so you don't have to repeat this.

## Using it

| Launchpad Pro | Push 3 |
| --- | --- |
| 8×8 grid | Pads |
| Row buttons (right column) | Scene launch buttons |
| Arrows | Arrows (Page Left / Right send Shift+Left / Shift+Right) |
| Shift | Select |
| Session, Note, Sequencer | Session, Note, Layout |
| Play, Record | Play, Record |
| Clear, Duplicate | Delete, Duplicate |
| Mute, Solo | Mute, Solo |
| T1–T8 track buttons | Track select buttons (see **Track Buttons** below) |

Only buttons the M8 uses are taken, and Push's own system buttons (Setup, Sets,
Save, Add, Undo, Fixed Length, Quantize, the display rows and so on) are never
touched. The Launchpad's Projects and Rec Arm buttons have no Push equivalent and
are left unmapped. The full map is in [`core/push-map.js`](core/push-map.js).

The M8 uses Mute and Solo with the T1–T8 track buttons. Press Mute or Solo, then a
track button to toggle that track. Press Mute or Solo again to make it momentary.

### Settings

- **Push goes to:** *M8* (default) takes over the Push while the device's track is
  selected. *Live* releases every pad and button straight away and leaves the Push
  alone, even with the track selected.
- **Pad Velocity:** *fixed* (default) sends a constant velocity on every pad press.
  *native* passes the Push's pad velocity through.
- **Track Buttons:** *Live* (default) leaves the Push's track select buttons to
  Live, so you can still switch tracks. *M8* sends them to the M8 as T1–T8, which
  you need for Mute and Solo.

Selecting any other track also releases the Push.

### Status

- **Launchpad:** *waiting* → *replied* (the device has introduced itself) →
  *connected* (LED data is arriving from the M8).

## Troubleshooting

- **Launchpad stays at *waiting*.** The device's script isn't running. On the
  Push, make sure you loaded the frozen build, not an older or unfrozen copy.
- **Pads stay dark but the controls work.** Check that the track's MIDI From is
  the Push's External Port and Monitor is In. The device keeps introducing itself
  until the M8 answers. If you turned on Launchpad mode on the M8 later, give it a
  second.
- **Some pads or rows stay dark or show stale colours.** The M8 only sends LEDs
  that changed, so any message lost along the way stays wrong. Live can drop some
  of these messages once its note tracking for the track gets confused, for
  example after adding and removing devices on the track many times. Reloading the
  Live Set clears it.
- **Other MIDI on the same port.** The M8 uses channels 1–3 for LED messages. Keep
  other gear that shares the Push's MIDI port (keyboards etc.) on channel 4 or
  higher, or it'll light random pads.
- **LAUNCHPAD CONNECTED keeps flashing on the M8.** Every identity reply makes the
  M8 re-accept the surface. The device only sends one per connection, so this
  means something else on the port is answering too. Check for a second copy of
  the device or another Launchpad emulator.

## Building from source

The device is generated from plain JavaScript. Nothing in the repo is hand-edited
in Max.

```sh
npm install   # optional: ES5 syntax check (acorn)
npm test      # rebuilds every device, then runs the core and Max-sandbox tests
```

To make a Standalone build, open `release/M8 LPP.amxd` in Max (Edit in Max), click
the snowflake (Freeze), save, and close.

| Path | What it is |
| --- | --- |
| `release/` | The device: `M8 LPP.amxd` (unfrozen, loads `m8-lpp.js`) and `frozen/M8 LPP.amxd` |
| `core/` | Engine, tested in Node: MIDI parser, LPP protocol, LED state and flash/pulse animation, LPP→Push palette, Push↔LPP control map, bridge. ES5, so it runs in Max's `js`. |
| `glue/` | Max-side code (LiveAPI, Tasks, inlets/outlets) |
| `scripts/build.js` | Generates each device's `.js` bundle, `.maxpat` and `.amxd` |
| `tests/` | `core.test.js` (protocol and engine) and `max-sandbox.test.js` (runs the generated bundles in a fake Max and a fake Push surface) |
| `devices/` | Development devices with diagnostics: a handshake-only tester, a full bridge with traffic capture and mapping tools, and an optional output-only device for a second track |
| `tools/m8_probe.py` | Talks to the M8 directly from a computer, without Live: answers its inquiry and prints its LED traffic. Needs `mido` and `python-rtmidi`. |
| `docs/` | Protocol notes with sources (`LPP-PROTOCOL.md`), hardware test plan, Live Set layout |

## How it works

- **Handshake:** the M8 sends a Universal Device Inquiry. The device answers as an
  LPP MK3 (`F0 7E 00 06 02 00 20 29 23 01 00 00 00 01 00 00 F7`). It also
  introduces itself once a second until the M8 says anything, so an M8 that asked
  before the device loaded still connects. It never introduces itself again after
  that, because each identity makes the M8 reconnect.
- **LEDs:** the M8 sends note-ons on channels 1–3 (static / flashing / pulsing),
  where the note is the position and the velocity is the palette colour. The
  device maps them to Push pads and buttons, and runs flash and pulse at Live's
  tempo.
- **Presses:** pads go to the M8 as notes 11–88 with velocity, and border buttons
  as CCs on channel 1, the same as a real LPP.
- **Takeover:** the device grabs the Push's controls only while its track is
  selected, and repaints the whole surface from its LED buffer on every grab.

## Prior art

Reference only; no code was copied.

- [charlesvestal/schwung-m8](https://github.com/charlesvestal/schwung-m8) and
  [chaolue/schwung-m8](https://github.com/chaolue/schwung-m8): an LPP emulator for
  Ableton Move. Read for protocol behaviour.
- [Grahack/M8_LPP_recap](https://github.com/Grahack/M8_LPP_recap): how the M8
  behaves with a real Launchpad Pro.
- Novation, *Launchpad Pro [MK3] Programmer's Reference Manual*.
- [The M8 Companion](https://cs.uwaterloo.ca/~plragde/flaneries/TM8C/), ch. 8.

## License

[CC0 1.0](LICENSE). Not affiliated with Ableton, Dirtywave or Novation.

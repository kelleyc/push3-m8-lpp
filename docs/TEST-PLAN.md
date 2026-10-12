# Hardware test plan — S0 to S7

Work top to bottom. S1 and S2 are go/no-go gates. Each step ends with a result
block. Paste the filled-in blocks into your notes.

Three rigs, cheapest first:

| Rig | M8 plugged into | Push | Console? | Use for |
| --- | --- | --- | --- | --- |
| **A. Mac bench** | Mac | not needed | yes | S2 logic: does Live let M4L see and send the SysEx? |
| **B. Tethered** | Mac | Push in Control mode, USB to the Mac | yes | Bridge: grabbing, LEDs, presses, S3/S4/S5 |
| **C. Standalone** | Push USB-A (powered hub) | Standalone | no, read the Push display | The real target, plus S1/S6/S7 audio |

---

## S0 — Prereqs

- [ ] M8 firmware ≥ 6.5. LPP mode needs ≥ 6.0; MULTICHANNEL needs 6.5.
- [ ] M8: **Project → MIDI Settings → CTRL SURFACE = Launchpad Pro**.
- [ ] M8: CONTROL MAP CHANNEL and any other M8 MIDI use set to **channel 4 or
      higher**. Channels 1–3 belong to the Launchpad conversation.
- [ ] M8: **System → USB AUDIO MODE = MULTICHANNEL**. Only needed for S1/S6/S7.
- [ ] For rig C: a powered USB hub between the M8 and Push's USB-A (500 mA limit).
- [ ] `npm test` passes in this folder.

## Preparing the devices

The `.amxd` files are generated and **not frozen**. Their `.js` must sit beside
them, which it does in `devices/<name>/`.

- **Rigs A/B:** drag `devices/m8-lpp-handshake/m8-lpp-handshake.amxd` (or the
  bridge) onto a MIDI track. If Live complains, open the matching `.maxpat` in
  Max, copy the whole graph into a new **Max MIDI Effect**, and save it as an
  `.amxd` in the same folder. That's the usual regeneration workflow for generated devices.
- **Rig C:** open the device in Max (the edit button on the device), click
  **Freeze** (snowflake) so the `.js` travels inside it, then save. Move the Set to
  Push (drag it onto the Push in Live's browser).

**Verified setup (TRS, 2026-10-09):** one MIDI track, **M8 CTRL**, with
**MIDI From = MIDI To = Ableton Push 3 (External Port)**, Monitor **In**, and the
device on it. Out Path = **this track** (the default). The M8's TRS (Type A) out
goes to the Push's MIDI In and the Push's MIDI Out goes to the M8's TRS in. Push is
in Control mode on the Mac, and Live's MIDI preferences have **Track** on for the
External Port's input **and** output. Leave **Remote** off.

**USB does not work** for the controller. The M8 inquires every 2 s over USB and
never reacts to any reply (tested with `tools/m8_probe.py`). Use USB for audio only.

Optional two-track layout (only if a port can't be shared): put
`devices/m8-lpp-out/m8-lpp-out.amxd` on a second track **M8 OUT** (MIDI From = No
Input, MIDI To = the port) and set the main device's **Out Path = M8 OUT**. Ableton's
*SysEx support* article says same-track SysEx in and out isn't supported, but the
single-track TRS setup above worked, including the identity reply after an M8
power-cycle.

- Don't use **Out Path = both**. It's only for diagnosis, and it doubles pad
  presses in the bridge.

---

## S2 — Handshake (GATE). Do this on rig A first.

1. Set up the track as above and load **m8-lpp-handshake**.
2. Power-cycle the M8, or toggle CTRL SURFACE off and back to Launchpad Pro, so it
   sends a fresh Device Inquiry.
3. Watch the Max Console (rig A) or the device's parameters (rig C).

Expected console output, in order:

```text
[M8-LPP S2] listening — M8 CTRL SURFACE must be Launchpad Pro; waiting for Device Inquiry
[M8-LPP S2] identity sent (proactive #1, mk3): F0 7E 00 06 02 00 20 29 13 01 00 00 00 01 00 00 F7
[M8-LPP S2] SysEx in via midiin (6 bytes): F0 7E 7F 06 01 F7
[M8-LPP S2] identity sent (device inquiry, mk3): F0 7E 00 06 02 00 20 29 13 01 00 00 00 01 00 00 F7
[M8-LPP S2] M8 is talking (led)
[M8-LPP S2] PASS — first LED message from M8: pad r8c1 colour 1 static (ch1 note), 40 ms after identity
```

**PASS** means **S2 State = PASS** (and the console PASS line), **LED Msgs** is
climbing, and the M8 itself behaves as if a Launchpad is attached.
Send `report` for a JSON summary.

### If it doesn't pass

| What you see | Meaning | Try |
| --- | --- | --- |
| Inquiries = 0, SysEx In = 0, LED Msgs = 0 | The device hears no SysEx from the M8. Live may not deliver SysEx into M4L on a track, or the M8 isn't asking. | Leave **Proactive ID** on, since an M8 that hears an identity may start anyway. Check that Track is on for the M8 input. Check that CTRL SURFACE = Launchpad Pro. Try the M8 OUT track as the input too: give it a second handshake device with MIDI From = M8 and compare its Inquiries. |
| Inquiries > 0, ID Replies > 0, LED Msgs = 0 | The reply isn't reaching the M8, or the M8 isn't accepting it. | Check that **Bytes Sent** on `m8-lpp-out` climbs. If it stays at 0, the bus isn't connecting, so make sure Out Path = M8 OUT and that both devices are loaded. Then try **ID Variant = generic** and press **Send ID**. Check that M8 OUT's MIDI To = M8 and that Track is on for the M8 output. If every combination fails, the fallback is a User Library control-surface script as the bridge. |
| LED Msgs > 0 but Inquiries = 0 | The M8 accepted a proactive identity, or never needed one. | That still counts as a **PASS** for the gate. Note it, because it means M4L may not see inbound SysEx. |
| Other In climbing on ch1–3 | Something else is talking on 1–3. | Move it to channel 4+. |

```text
S2 RESULT — rig: A / C        date:
Bytes Sent on m8-lpp-out:
State: PASS / replied / asked / waiting
Inquiries:   ID Replies:   SysEx In:   LED Msgs:   Ch1/2/3:   /   /
ID Variant used: mk3 / generic       Proactive needed? yes / no
M8 showed it was connected? yes / no  (what it showed:)
Console (rig A), first ~15 lines:

```

---

## S1 — Enumeration (GATE, rig C)

Plug the M8 into Push USB-A through the hub. Then:

- [ ] Push **Setup → Audio → Device**: is the M8 listed? Select it, at 44.1 kHz.
- [ ] Input/output channel counts shown. Can all 24 inputs be enabled?
- [ ] CPU and dropouts at buffer 128 and 256.
- [ ] Push **Setup → MIDI**: is the M8 listed as a MIDI port **while it is also the
      audio device**? Does S2 still pass in this state?

```text
S1 RESULT — date:
M8 as audio device: yes / no     inputs shown:     outputs shown:
All 24 inputs enabled: yes / no   sample rates offered:
Dropouts @128:     @256:
MIDI port present while audio device: yes / no     S2 passes too: yes / no
```

If the 24-channel audio fails: fall back to the M8's stereo analog out into Push's
own inputs (Open Question #3). The control surface work doesn't depend on it.

---

## Bridge bring-up (rig B, then C)

Replace the handshake device on **M8 CTRL** with **m8-lpp-bridge** and select M8 CTRL.

- [ ] Console: `Push surface = control_surfaces N`, then
      `takeover: pads + K border buttons grabbed`. The **Takeover** readout is 1.
- [ ] The pads show the M8's Session grid. Selecting another track gives Push
      back, with its normal LEDs and behaviour. Selecting M8 CTRL again repaints
      everything immediately, with no dark pads.
- [ ] Pads play/select on the M8, and velocity reaches it in Note mode.
- [ ] Play, the arrows, Select (= LPP Shift), Mute/Solo, and the scene and track
      rows all reach the M8.
- [ ] Flashing/pulsing pads animate, in time with Live's tempo.

Diagnostics, run from the message boxes in the device's patcher on rig B:
`report`, `enumerate`, `report_mapping`, `report_palette`,
`palette_sweep 0|64|-1`, `takeover`, `release`, `repaint`.

### S3 — Protocol capture

1. Turn **Capture** on.
2. Step through every LPP mode on the M8: Session, Note, Sequencer, Beat Repeat
   (Shift+Session), Mute/Solo, and Snapshot (Shift+Rec Arm).
3. Copy the `cap …` console lines into `docs/LPP-PROTOCOL.md` → *S3 capture*.

The capture shows exactly which numbers the M8 lights, on which channel, in
which colour.

### S4 — Palette on Standalone

1. Run `report_palette` after using each mode. It lists every LPP colour the M8
   sent and what it was mapped to. Anything marked `guess` needs checking.
2. Run `palette_sweep 0`, then `palette_sweep 64`. Tap a pad to print its Push
   index. Run `palette_sweep -1` to return the pads to the M8.
3. Try a candidate live with `lpp_color <lpp> <push>`. Once it looks right, add it
   to `OVERRIDES` in `core/palette.js` and run `npm test` to rebuild.
4. Re-check the calibrated anchors (0, 3, 11, 21, 120, 123, 125, 126, 127) in
   **Standalone**. They were calibrated in Controller mode.

Also note how fast a full Session repaint looks. If it's sluggish, change
`FRAME_MS` in `glue/bridge.glue.js` (now 33 ms).

### S5 — Border buttons

1. Run `enumerate`. It prints every Push control name. Paste the list here,
   because it's the missing ground truth for Push 3.
2. Run `report_mapping` and note every `UNMAPPED` entry.
3. Fix entries live with `map_button <lpp> <ControlName>`, then bake them into
   `CANDIDATES` in `core/push-map.js` and rebuild.
4. Check whether mono-LED buttons look right with palette values, or need on/off
   only.

```text
S3/S4/S5 RESULT — date:
Takeover works: yes / no      re-grab repaint OK: yes / no
Pads → M8 ok: yes / no         velocity ok: yes / no
Buttons mapped:     missing (numbers/names):
Button Mode that works: cc / note / both
Colours needing overrides (lpp → push):
Flash/pulse look right: yes / no
enumerate output: (attach)
```

---

## S6 — Audio channel semantics (rig C, after S1)

On Push audio tracks fed from M8 inputs 3/4 … 23/24:

- [ ] Set an M8 track's volume to 0. Does the Push input still carry signal? This tells you pre- or post-fader.
- [ ] Mute that M8 track. Same question.
- [ ] Are 19–24 dry sends or wet returns? The M8 Companion says dry sends.
- [ ] Latency against the M8's analog out.

## S7 — Monitoring path (rig C)

- [ ] Route Push Master → M8 USB in (out 1/2) → M8 headphone/line out.
- [ ] Is there double audio? Is there feedback? M8 inputs 1/2 (main) must stay
      disabled on Push.
- [ ] Record the M8 mixer settings that give a clean "Push is the mixer" monitor.

```text
S6/S7 RESULT — date:
3–18 are: pre-fader / post-fader / post-mute?
19–24 are: dry sends / wet returns
Latency vs analog out:
Clean monitor recipe:
```

# "M8 Surface" Live Set

Build this by hand on Push once S1 passes. A generated `.als` wasn't attempted,
because a hand-built Set is quicker to trust.

## Hardware

**MIDI:** M8 TRS (Type A) ↔ Push 3 MIDI DIN in/out (Launchpad conversation; USB MIDI doesn't work for it).
**Audio:** M8 USB-C → powered hub → Push 3 USB-A. Then Push **Setup → Audio → Device = M8**
at 44.1 kHz. Listen from the M8's headphone/line out, because Push's own analog
I/O is inactive while an external interface is selected.

## M8

- CTRL SURFACE = Launchpad Pro
- USB AUDIO MODE = MULTICHANNEL
- Track/FX volumes per S6/S7
- Clock: undecided (Open Question 1). One option is Push sending clock (M8 SYNC
  IN = CLOCK) with transport left to the M8 via LPP Play. The other is the M8 as
  master.

## Tracks

| Track | Type | Input | Notes |
| --- | --- | --- | --- |
| M8 CTRL | MIDI | Push 3 (External Port), all channels, Monitor In | **m8-lpp-bridge**; MIDI To = Push 3 (External Port); Out Path = this track |
| M8 T1 … T8 (group "M8") | Audio ×8 | 3/4, 5/6, 7/8, 9/10, 11/12, 13/14, 15/16, 17/18 | Monitor In; per-track Live FX |
| M8 MOD / DLY / REV | Audio ×3 | 19/20, 21/22, 23/24 | If these are dry sends (S6), put Live FX here and zero the M8's internal FX returns |
| Returns A/B | Return | — | Live-side send FX for T1–T8 |
| (M8 main 1/2) | — | not enabled | Leave it disabled to avoid doubling/feedback through the M8's USB in |
| Master | — | — | Out 1/2 → M8 USB in → M8 analog out |

## Control model

- **M8 CTRL selected:** the pads and borders are the Launchpad (Session, Note,
  Sequencer and Beat Repeat on the M8).
- **Any other track selected, or Mix mode:** Push is back to normal. The encoders
  become an 8-channel mixer for the M8 tracks.
- **Channels 1–3** on the M8 port are reserved for the Launchpad conversation.
  Keep other MIDI on 4+.

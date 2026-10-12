# LPP protocol as the M8 uses it

Only the facts this project depends on are listed here. Confidence:
**primary** (manufacturer spec or a working implementation's source),
**secondary** (user docs), and **assumed** (not yet checked, so S2/S3 must
confirm it).

## Handshake

| Fact | Confidence | Source |
| --- | --- | --- |
| The M8 sends the Universal Device Inquiry `F0 7E 7F 06 01 F7` to find an LPP. | primary | schwung-m8 `ui.js` (`m8InitSysex`); the virtual M8 tool |
| The LPP MK3 Application reply is `F0 7E 00 06 02 00 20 29 13 01 00 00 <ver×4> F7`. The version digits are cosmetic. On hardware (TRS, 2026-10-09) the M8 accepted `13 01`, `23 01` and `00 00` alike, so the family bytes don't matter to it. | primary + tested | Novation LPP MK3 Programmer's Reference, "Device Inquiry message"; chaolue/schwung-m8 v1.2.0 |
| A reply with family/model `00 00` (maker only) also worked for the M8. This is the **generic** variant. | primary | charlesvestal/schwung-m8 `sendLPPIdentity` |
| An emulator can introduce itself proactively, and the M8 accepts that. Re-sending it forces the M8 back to Session, so stop once the M8 talks. | primary | schwung-m8 `init`/`tick` and the comments on them |
| Over TRS (hardware, 2026-10-11) every identity makes the M8 re-accept the surface: the screen flashes LAUNCHPAD CONNECTED and open browsers close. Retrying until LED data arrives, or after a quiet spell, loops that banner. The device retries once a second with no time limit until the M8 sends anything, then never again; inquiries are always answered. A 30-try cap had left a later-booting M8 unintroduced, with the pads dark. Right after connecting the M8 may light only the mode buttons; grid LEDs follow as its state changes. | tested | Max console capture, release device |
| The iOS M8 app opens with MIDI-CI Discovery (`F0 7E 7F 0D 70 …`). A real LPP MK3 doesn't answer MIDI-CI, and replying with the classic identity is what works. | primary | chaolue/schwung-m8 `isMidiCiDiscovery` |
| The M8 may send Novation programmer-mode or LED SysEx (`F0 00 20 29 02 0E …`). | assumed | MK3 spec. The device parses it and logs anything unknown. |

## Transport (tested 2026-10-09)

| Fact | Confidence | Source |
| --- | --- | --- |
| Over **USB** (M8 on the Mac) the M8 sends an inquiry every 2 s but never reacts to any reply: pro3/mini3/x/generic and Schwung's exact bytes, replied and sent proactively, all got zero LED data in a Live-free Python test. | tested | tools/m8_probe.py |
| Over **TRS** (M8 TRS <-> Push DIN, Push in Control mode, Live's Push External Port) the M8 accepts the reply immediately and sends the mode-select SysEx `F0 00 20 29 02 0E 0E 01 F7` followed by ~100 LED notes. | tested | tools/m8_probe.py, Live handshake + bridge PASS |
| TRS cable must be Type A. | assumed | M8 manual |

## M8 → LPP (LEDs)

| Fact | Confidence | Source |
| --- | --- | --- |
| Note On on **ch1/2/3** means static/flashing/pulsing, and velocity is the LPP palette index. | primary | schwung-m8 (`LPP_PAD_ANIMATED` = 0x91/0x92); Grahack recap; M8 Companion 8.7 |
| **All** positions, borders included, are addressed by note number (the Move emulator only handles notes for LEDs). | primary | schwung-m8 `applyLppLed` |
| Flash alternates between the current static colour (B) and the ch2 colour (A). | primary | MK3 programmer's reference |
| The M8 repaints the grid statically and then re-sends flash overlays on every refresh, so ending a flash on a static write flickers. | primary | chaolue/schwung-m8 comments; handled by `STOP_GRACE_MS` |
| The logo (99) lights in "live mode", and Play (20) is green while playing. | primary | schwung-m8 |

## LPP → M8 (presses)

| Fact | Confidence | Source |
| --- | --- | --- |
| Grid pads are Note On ch1 11..88 with velocity. Release is velocity 0. | primary | MK3 spec; schwung-m8 |
| A real LPP sends border buttons as **CC 1–98 on ch1**. | secondary | Grahack M8_LPP_recap |
| Border buttons sent as **notes** (`90 n 100` / `80 n 0`) also work. | primary | schwung-m8 (the shipped emulator does this) |
| Aftertouch: the Move emulator drops it. Whether the M8 uses poly AT is unknown. | assumed | Disabled by default (`sendPressure`) |

## Layout (programmer numbering, bottom-left origin)

```text
 90 Shift  91 Left  92 Right  93 Session  94 Note  95 Chord  96 Custom  97 Seq  98 Projects  [99 logo]
 80 Up      81 .. 88                                                             89 Scene 1
 70 Down    71 .. 78                                                             79 Scene 2
 60 Clear   61 .. 68                                                             69
 50 Dup     51 .. 58                                                             59
 40 Quant   41 .. 48                                                             49
 30 FixLen  31 .. 38                                                             39
 20 Play    21 .. 28                                                             29
 10 Record  11 .. 18                                                             19 Scene 8
           101 .. 108  (T1..T8)
             1 Rec Arm  2 Mute  3 Solo  4 Vol  5 Pan  6 Sends  7 Device  8 Stop
```

What the M8 actually uses (M8 Companion 8.7, schwung-m8 button map): Session
93, Note 94, Sequencer 97, Projects 98, Shift 90, Left/Right 91/92 (track),
Up/Down 80/70 (octave/rows), Clear 60, Duplicate 50, Play 20, Record 10
(edit/capture), Rec Arm 1 (snapshot), Mute 2, Solo 3, scene column 19–89 (row
select), T1–T8 101–108 (track select, mute/solo targets). Beat Repeat is
Shift+Session.

## Audio (MULTICHANNEL, firmware 6.5)

ch 1–2 main, 3–18 tracks 1–8 (stereo pairs), 19–20 modfx, 21–22 delay, 23–24
reverb. 19–24 are dry sends according to the M8 Companion 8.2. Pre- or
post-fader for 3–18 is still unconfirmed (S6). M8 USB audio in is stereo.

## S3 capture

_Paste `cap …` lines here, one block per M8 mode._

```text
Session:

Note:

Sequencer:

Beat Repeat:

Mute/Solo:
```

## Sources

- Novation, *Launchpad Pro [MK3] Programmer's Reference Manual* (LPP3_prog_ref_guide_200415)
- https://github.com/charlesvestal/schwung-m8 — `src/ui.js`
- https://github.com/chaolue/schwung-m8 — `src/ui.js`, `docs/index.html` (v1.2.0+)
- https://github.com/Grahack/M8_LPP_recap
- https://cs.uwaterloo.ca/~plragde/flaneries/TM8C/Interacting_with_other_devices.html — The M8 Companion ch. 8
- https://github.com/Dirtywave/M8Firmware/blob/main/changelog.txt

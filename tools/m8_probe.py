#!/usr/bin/env python3
"""
m8_probe.py - talk to the M8 directly over USB MIDI, no Live involved.

Answers the M8's Device Inquiry as a Launchpad Pro MK3 and logs everything the
M8 sends back, so we can see whether it ever starts sending LED data.

SETUP (once):
    python3 -m pip install mido python-rtmidi

USAGE:
    1. QUIT Ableton Live first (it holds the M8 port open).
    2. python3 m8_probe.py              # pro3 identity, auto-find the M8 port
       python3 m8_probe.py --list       # just list MIDI ports
       python3 m8_probe.py --variant sweep --seconds 45   # tries each family in turn
       python3 m8_probe.py --port "M8"  # substring of the port name
       python3 m8_probe.py --seconds 60 # run time (default 45)
       python3 m8_probe.py --proactive  # also send the identity every 1 s, like the Move emulator
    Ctrl-C stops early. A summary prints at the end.

READING THE RESULT:
    LED messages > 0  -> the M8 accepts our reply; the bug is inside Live/routing.
    Inquiries seen, LED = 0 even though we replied -> the M8 rejects the reply
                         itself (identity bytes, port name, or USB-vs-TRS).
    No inquiries at all -> the M8 isn't asking over USB right now.
"""
import argparse, sys, time
import mido

def _id(fam):
    return [0x7E, 0x00, 0x06, 0x02, 0x00, 0x20, 0x29] + fam + [0x00, 0x00, 0, 1, 0, 0]

IDENT = {
    # Exact bytes used by the working Schwung/Move emulator: F0 7E 00 06 02 00 20 29 + 8 zeros + F7
    "ref":     [0x7E, 0x00, 0x06, 0x02, 0x00, 0x20, 0x29] + [0x00] * 8,
    # F0 7E 00 06 02 00 20 29 <family x2> 00 00 <ver x4> F7  (data excludes F0/F7)
    "pro3":    _id([0x23, 0x01]),   # 23 01 (the M8 accepted this over TRS)
    "mini3":   _id([0x13, 0x01]),   # 13 01 = what Novation's LPP MK3 reference documents
    "x":       _id([0x03, 0x01]),   # Launchpad X
    "generic": _id([0x00, 0x00]),
    "mk3":     _id([0x13, 0x01]),   # legacy alias
}
SWEEP = ["ref", "pro3", "generic", "mini3"]

def hexs(data):
    return " ".join(f"{b:02X}" for b in data)

def find(names, needle):
    for n in names:
        if needle.lower() in n.lower():
            return n
    return None

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--port", default="M8")
    ap.add_argument("--variant", default="ref", choices=list(IDENT)+["sweep"])
    ap.add_argument("--seconds", type=float, default=45)
    ap.add_argument("--proactive", action="store_true", default=True)
    ap.add_argument("--no-proactive", dest="proactive", action="store_false")
    a = ap.parse_args()

    ins, outs = mido.get_input_names(), mido.get_output_names()
    print("MIDI inputs: ", ins)
    print("MIDI outputs:", outs)
    if a.list:
        return
    pin, pout = find(ins, a.port), find(outs, a.port)
    if not pin or not pout:
        sys.exit(f"No port matching '{a.port}' (in={pin}, out={pout}). Is Live closed and the M8 on USB? Try --port.")
    print(f"\nUsing in='{pin}'  out='{pout}'  variant={a.variant}\n")

    cur = {"v": SWEEP[0] if a.variant == "sweep" else a.variant}
    replies = {k: mido.Message("sysex", data=v) for k, v in IDENT.items()}
    sweep_t = {"t": 0.0, "i": 0}
    t0 = time.time()
    n = dict(inquiry=0, replied=0, led=0, other=0, sysex_other=0)
    leds = {}
    last_pro = 0.0

    with mido.open_input(pin) as mi, mido.open_output(pout) as mo:
        try:
            while time.time() - t0 < a.seconds:
                for m in mi.iter_pending():
                    t = f"{time.time() - t0:6.2f}s"
                    if m.type == "sysex":
                        d = list(m.data)
                        if d[:4] == [0x7E, 0x7F, 0x06, 0x01]:
                            n["inquiry"] += 1
                            mo.send(replies[cur["v"]])
                            n["replied"] += 1
                            print(f"{t}  INQUIRY  -> replied with [{cur['v']}]")
                        else:
                            n["sysex_other"] += 1
                            print(f"{t}  SYSEX    F0 {hexs(d)} F7")
                    elif m.type in ("note_on", "note_off", "control_change"):
                        if m.type == "note_off" or (m.type == "note_on" and m.velocity == 0):
                            key = ("note", m.channel + 1, m.note)
                            val = 0
                        elif m.type == "note_on":
                            key = ("note", m.channel + 1, m.note); val = m.velocity
                        else:
                            key = ("cc", m.channel + 1, m.control); val = m.value
                        n["led"] += 1
                        leds[key] = val
                        print(f"{t}  LED      {m}   (reply variant: {cur['v']})")
                    else:
                        n["other"] += 1
                        print(f"{t}  OTHER    {m}")
                if a.variant == "sweep" and time.time() - sweep_t["t"] > 9:
                    sweep_t["t"] = time.time()
                    cur["v"] = SWEEP[sweep_t["i"] % len(SWEEP)]; sweep_t["i"] += 1
                    print(f"--- now answering with [{cur['v']}] ---")
                if a.proactive and time.time() - last_pro > 1:
                    mo.send(replies[cur["v"]]); last_pro = time.time()
                time.sleep(0.002)
        except KeyboardInterrupt:
            pass

    print("\n===== SUMMARY =====")
    print(f"Inquiries from M8: {n['inquiry']}   Replies sent: {n['replied']}")
    print(f"LED-type messages (notes/CC): {n['led']}   distinct pads/buttons lit: {len(leds)}")
    print(f"Other SysEx: {n['sysex_other']}   Other messages: {n['other']}")
    if n["led"]:
        print("RESULT: the M8 DOES send LED data after our reply -> problem is in Live routing.")
    elif n["inquiry"]:
        print("RESULT: M8 asks, we answer, M8 stays silent -> the M8 isn't accepting our reply/port.")
    else:
        print("RESULT: no inquiries seen at all over this port.")

if __name__ == "__main__":
    main()

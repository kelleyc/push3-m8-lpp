{
  "patcher": {
    "fileversion": 1,
    "appversion": {
      "major": 8,
      "minor": 6,
      "revision": 0,
      "architecture": "x64",
      "modernui": 1
    },
    "classnamespace": "box",
    "rect": [
      100,
      100,
      980,
      640
    ],
    "openrect": [
      0,
      0,
      470,
      169
    ],
    "openinpresentation": 1,
    "default_fontsize": 10,
    "default_fontface": 0,
    "default_fontname": "Arial Bold",
    "gridonopen": 1,
    "gridsize": [
      8,
      8
    ],
    "gridsnaponopen": 1,
    "objectsnaponopen": 1,
    "statusbarvisible": 2,
    "toolbarvisible": 1,
    "boxanimatetime": 500,
    "description": "Push 3 x M8 — S2 handshake test: replies to the M8's Device Inquiry as a Launchpad Pro MK3 and reports LED traffic.",
    "digest": "M8 LPP S2 handshake test",
    "tags": "push, m8, launchpad, lpp, liveapi, standalone",
    "parameters": {
      "parameterbanks": {
        "0": {
          "index": 0,
          "name": "S2",
          "parameters": [
            "S2 State",
            "Inquiries",
            "ID Replies",
            "LED Msgs",
            "Ch1 Static",
            "Ch2 Flash",
            "Ch3 Pulse",
            "Proactive ID"
          ]
        },
        "1": {
          "index": 1,
          "name": "More",
          "parameters": [
            "SysEx In",
            "Other In",
            "Last LED",
            "Last Colour",
            "ID Variant",
            "Send ID",
            "Out Path",
            "Presses Out"
          ]
        }
      },
      "inherited_shortname": 1
    },
    "latency": 0,
    "is_mpe": 0,
    "external_mpe_tuning_enabled": 0,
    "minimum_live_version": "",
    "minimum_max_version": "",
    "platform_compatibility": 0,
    "project": {
      "version": 1,
      "creationdate": 3590052493,
      "modificationdate": 3590052493,
      "viewrect": [
        0,
        0,
        300,
        500
      ],
      "autoorganize": 1,
      "hideprojectwindow": 1,
      "showdependencies": 1,
      "autolocalize": 0,
      "contents": {
        "patchers": {}
      },
      "layout": {},
      "searchpath": {},
      "detailsvisible": 0,
      "amxdtype": 1835887981,
      "readonly": 0,
      "devpathtype": 0,
      "devpath": ".",
      "sortmode": 0,
      "viewmode": 0,
      "includepackages": 0
    },
    "autosave": 0,
    "boxes": [
      {
        "box": {
          "maxclass": "comment",
          "text": "M8 LPP — S2 handshake test. Answers the M8's Device Inquiry as a Launchpad Pro MK3 and counts what comes back. PASS = LED traffic on ch1–3.",
          "patching_rect": [
            24,
            12,
            900,
            20
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "presentation": 1,
          "presentation_rect": [
            8,
            4,
            540,
            16
          ],
          "id": "obj-1"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Track 'M8 CTRL' (TRS): MIDI From = MIDI To = Push External Port, Monitor In. Replies go out this track. No LiveAPI, no Push grabbing.",
          "patching_rect": [
            24,
            32,
            900,
            20
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "id": "obj-2"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "live.thisdevice",
          "patching_rect": [
            24,
            70,
            121,
            22
          ],
          "numinlets": 1,
          "numoutlets": 3,
          "outlettype": [
            "bang",
            "int",
            "int"
          ],
          "id": "obj-3"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "deferlow",
          "patching_rect": [
            24,
            100,
            72,
            22
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-4"
        }
      },
      {
        "box": {
          "maxclass": "message",
          "text": "start",
          "patching_rect": [
            24,
            130,
            49,
            22
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-5"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "midiin",
          "patching_rect": [
            200,
            70,
            60,
            22
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            "int"
          ],
          "id": "obj-6"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "sysexin",
          "patching_rect": [
            280,
            70,
            65,
            22
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            "int"
          ],
          "id": "obj-7"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "js m8-lpp-handshake.js",
          "patching_rect": [
            200,
            180,
            200,
            22
          ],
          "numinlets": 2,
          "numoutlets": 2,
          "outlettype": [
            "",
            ""
          ],
          "id": "obj-js"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "midiout",
          "patching_rect": [
            200,
            230,
            65,
            22
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "outlettype": [],
          "id": "obj-8"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "midiin is NOT wired to midiout: the M8 must never hear its own traffic echoed.",
          "patching_rect": [
            420,
            232,
            420,
            20
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "id": "obj-9"
        }
      },
      {
        "box": {
          "maxclass": "message",
          "text": "report",
          "patching_rect": [
            420,
            130,
            56,
            22
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-10"
        }
      },
      {
        "box": {
          "maxclass": "message",
          "text": "identity",
          "patching_rect": [
            500,
            130,
            70,
            22
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-11"
        }
      },
      {
        "box": {
          "maxclass": "message",
          "text": "reset",
          "patching_rect": [
            580,
            130,
            49,
            22
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-12"
        }
      },
      {
        "box": {
          "maxclass": "message",
          "text": "capture 1",
          "patching_rect": [
            660,
            130,
            77,
            22
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-13"
        }
      },
      {
        "box": {
          "maxclass": "message",
          "text": "capture 0",
          "patching_rect": [
            740,
            130,
            77,
            22
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-14"
        }
      },
      {
        "box": {
          "maxclass": "live.toggle",
          "varname": "Proactive ID",
          "parameter_enable": 1,
          "patching_rect": [
            24,
            300,
            15,
            15
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_longname": "Proactive ID",
              "parameter_shortname": "Proact",
              "parameter_type": 2,
              "parameter_mmin": 0,
              "parameter_mmax": 1,
              "parameter_unitstyle": 0,
              "parameter_enum": [
                "off",
                "on"
              ],
              "parameter_initial_enable": 1,
              "parameter_initial": [
                1
              ]
            }
          },
          "presentation": 1,
          "presentation_rect": [
            8,
            118,
            15,
            15
          ],
          "id": "obj-15"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Proactive ID",
          "patching_rect": [
            44,
            300,
            90,
            20
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "presentation": 1,
          "presentation_rect": [
            26,
            117,
            80,
            16
          ],
          "id": "obj-16"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "prepend proactive",
          "patching_rect": [
            24,
            330,
            135,
            22
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-17"
        }
      },
      {
        "box": {
          "maxclass": "live.tab",
          "varname": "ID Variant",
          "parameter_enable": 1,
          "patching_rect": [
            160,
            300,
            100,
            18
          ],
          "numinlets": 1,
          "numoutlets": 3,
          "outlettype": [
            "",
            "",
            "float"
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_longname": "ID Variant",
              "parameter_shortname": "IDVar",
              "parameter_type": 2,
              "parameter_mmin": 0,
              "parameter_mmax": 1,
              "parameter_unitstyle": 0,
              "parameter_enum": [
                "mk3",
                "generic"
              ],
              "parameter_initial_enable": 1,
              "parameter_initial": [
                0
              ]
            }
          },
          "num_lines_patching": 1,
          "num_lines_presentation": 1,
          "presentation": 1,
          "presentation_rect": [
            110,
            116,
            100,
            18
          ],
          "id": "obj-18"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "prepend variant",
          "patching_rect": [
            160,
            330,
            121,
            22
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-19"
        }
      },
      {
        "box": {
          "maxclass": "live.button",
          "varname": "Send ID",
          "parameter_enable": 1,
          "patching_rect": [
            300,
            300,
            15,
            15
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_longname": "Send ID",
              "parameter_shortname": "SendID",
              "parameter_type": 2,
              "parameter_mmin": 0,
              "parameter_mmax": 1,
              "parameter_unitstyle": 0,
              "parameter_enum": [
                "off",
                "on"
              ]
            }
          },
          "presentation": 1,
          "presentation_rect": [
            220,
            118,
            15,
            15
          ],
          "id": "obj-20"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Send ID now",
          "patching_rect": [
            320,
            300,
            90,
            20
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "presentation": 1,
          "presentation_rect": [
            238,
            117,
            80,
            16
          ],
          "id": "obj-21"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "t b",
          "patching_rect": [
            300,
            330,
            60,
            22
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-22"
        }
      },
      {
        "box": {
          "maxclass": "message",
          "text": "identity",
          "patching_rect": [
            300,
            360,
            70,
            22
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-23"
        }
      },
      {
        "box": {
          "maxclass": "live.tab",
          "varname": "Out Path",
          "parameter_enable": 1,
          "patching_rect": [
            440,
            300,
            150,
            18
          ],
          "numinlets": 1,
          "numoutlets": 3,
          "outlettype": [
            "",
            "",
            "float"
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_longname": "Out Path",
              "parameter_shortname": "OutPath",
              "parameter_type": 2,
              "parameter_mmin": 0,
              "parameter_mmax": 2,
              "parameter_unitstyle": 0,
              "parameter_enum": [
                "this track",
                "M8 OUT",
                "both"
              ],
              "parameter_initial_enable": 1,
              "parameter_initial": [
                0
              ]
            }
          },
          "num_lines_patching": 1,
          "num_lines_presentation": 1,
          "presentation": 1,
          "presentation_rect": [
            322,
            116,
            140,
            18
          ],
          "id": "obj-24"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "prepend out_path",
          "patching_rect": [
            440,
            330,
            128,
            22
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-25"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "route state inquiries replies led_msgs ch1 ch2 ch3 sysex_in other_in presses last_led last_color",
          "patching_rect": [
            24,
            420,
            688,
            22
          ],
          "numinlets": 1,
          "numoutlets": 13,
          "outlettype": [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            ""
          ],
          "id": "obj-26"
        }
      },
      {
        "box": {
          "maxclass": "live.numbox",
          "varname": "S2 State",
          "parameter_enable": 1,
          "patching_rect": [
            24,
            480,
            60,
            15
          ],
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "",
            "float"
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_longname": "S2 State",
              "parameter_shortname": "State",
              "parameter_type": 2,
              "parameter_mmin": 0,
              "parameter_mmax": 3,
              "parameter_unitstyle": 0,
              "parameter_enum": [
                "waiting",
                "asked",
                "replied",
                "PASS"
              ]
            }
          },
          "presentation": 1,
          "presentation_rect": [
            8,
            38,
            60,
            15
          ],
          "id": "obj-27"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "S2 State",
          "patching_rect": [
            24,
            502,
            60,
            20
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "presentation": 1,
          "presentation_rect": [
            8,
            24,
            72,
            16
          ],
          "id": "obj-28"
        }
      },
      {
        "box": {
          "maxclass": "live.numbox",
          "varname": "Inquiries",
          "parameter_enable": 1,
          "patching_rect": [
            88,
            480,
            60,
            15
          ],
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "",
            "float"
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_longname": "Inquiries",
              "parameter_shortname": "Inquiry",
              "parameter_type": 1,
              "parameter_mmin": 0,
              "parameter_mmax": 999999,
              "parameter_unitstyle": 0
            }
          },
          "presentation": 1,
          "presentation_rect": [
            82,
            38,
            60,
            15
          ],
          "id": "obj-29"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Inquiries",
          "patching_rect": [
            88,
            502,
            60,
            20
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "presentation": 1,
          "presentation_rect": [
            82,
            24,
            72,
            16
          ],
          "id": "obj-30"
        }
      },
      {
        "box": {
          "maxclass": "live.numbox",
          "varname": "ID Replies",
          "parameter_enable": 1,
          "patching_rect": [
            152,
            480,
            60,
            15
          ],
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "",
            "float"
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_longname": "ID Replies",
              "parameter_shortname": "Replies",
              "parameter_type": 1,
              "parameter_mmin": 0,
              "parameter_mmax": 999999,
              "parameter_unitstyle": 0
            }
          },
          "presentation": 1,
          "presentation_rect": [
            156,
            38,
            60,
            15
          ],
          "id": "obj-31"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "ID Replies",
          "patching_rect": [
            152,
            502,
            60,
            20
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "presentation": 1,
          "presentation_rect": [
            156,
            24,
            72,
            16
          ],
          "id": "obj-32"
        }
      },
      {
        "box": {
          "maxclass": "live.numbox",
          "varname": "LED Msgs",
          "parameter_enable": 1,
          "patching_rect": [
            216,
            480,
            60,
            15
          ],
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "",
            "float"
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_longname": "LED Msgs",
              "parameter_shortname": "LEDs",
              "parameter_type": 1,
              "parameter_mmin": 0,
              "parameter_mmax": 999999,
              "parameter_unitstyle": 0
            }
          },
          "presentation": 1,
          "presentation_rect": [
            230,
            38,
            60,
            15
          ],
          "id": "obj-33"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "LED Msgs",
          "patching_rect": [
            216,
            502,
            60,
            20
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "presentation": 1,
          "presentation_rect": [
            230,
            24,
            72,
            16
          ],
          "id": "obj-34"
        }
      },
      {
        "box": {
          "maxclass": "live.numbox",
          "varname": "Ch1 Static",
          "parameter_enable": 1,
          "patching_rect": [
            280,
            480,
            60,
            15
          ],
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "",
            "float"
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_longname": "Ch1 Static",
              "parameter_shortname": "Ch1",
              "parameter_type": 1,
              "parameter_mmin": 0,
              "parameter_mmax": 999999,
              "parameter_unitstyle": 0
            }
          },
          "presentation": 1,
          "presentation_rect": [
            304,
            38,
            60,
            15
          ],
          "id": "obj-35"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Ch1 Static",
          "patching_rect": [
            280,
            502,
            60,
            20
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "presentation": 1,
          "presentation_rect": [
            304,
            24,
            72,
            16
          ],
          "id": "obj-36"
        }
      },
      {
        "box": {
          "maxclass": "live.numbox",
          "varname": "Ch2 Flash",
          "parameter_enable": 1,
          "patching_rect": [
            344,
            480,
            60,
            15
          ],
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "",
            "float"
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_longname": "Ch2 Flash",
              "parameter_shortname": "Ch2",
              "parameter_type": 1,
              "parameter_mmin": 0,
              "parameter_mmax": 999999,
              "parameter_unitstyle": 0
            }
          },
          "presentation": 1,
          "presentation_rect": [
            378,
            38,
            60,
            15
          ],
          "id": "obj-37"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Ch2 Flash",
          "patching_rect": [
            344,
            502,
            60,
            20
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "presentation": 1,
          "presentation_rect": [
            378,
            24,
            72,
            16
          ],
          "id": "obj-38"
        }
      },
      {
        "box": {
          "maxclass": "live.numbox",
          "varname": "Ch3 Pulse",
          "parameter_enable": 1,
          "patching_rect": [
            408,
            480,
            60,
            15
          ],
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "",
            "float"
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_longname": "Ch3 Pulse",
              "parameter_shortname": "Ch3",
              "parameter_type": 1,
              "parameter_mmin": 0,
              "parameter_mmax": 999999,
              "parameter_unitstyle": 0
            }
          },
          "presentation": 1,
          "presentation_rect": [
            8,
            78,
            60,
            15
          ],
          "id": "obj-39"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Ch3 Pulse",
          "patching_rect": [
            408,
            502,
            60,
            20
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "presentation": 1,
          "presentation_rect": [
            8,
            64,
            72,
            16
          ],
          "id": "obj-40"
        }
      },
      {
        "box": {
          "maxclass": "live.numbox",
          "varname": "SysEx In",
          "parameter_enable": 1,
          "patching_rect": [
            472,
            480,
            60,
            15
          ],
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "",
            "float"
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_longname": "SysEx In",
              "parameter_shortname": "SysEx",
              "parameter_type": 1,
              "parameter_mmin": 0,
              "parameter_mmax": 999999,
              "parameter_unitstyle": 0
            }
          },
          "presentation": 1,
          "presentation_rect": [
            82,
            78,
            60,
            15
          ],
          "id": "obj-41"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "SysEx In",
          "patching_rect": [
            472,
            502,
            60,
            20
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "presentation": 1,
          "presentation_rect": [
            82,
            64,
            72,
            16
          ],
          "id": "obj-42"
        }
      },
      {
        "box": {
          "maxclass": "live.numbox",
          "varname": "Other In",
          "parameter_enable": 1,
          "patching_rect": [
            536,
            480,
            60,
            15
          ],
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "",
            "float"
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_longname": "Other In",
              "parameter_shortname": "Other",
              "parameter_type": 1,
              "parameter_mmin": 0,
              "parameter_mmax": 999999,
              "parameter_unitstyle": 0
            }
          },
          "presentation": 1,
          "presentation_rect": [
            156,
            78,
            60,
            15
          ],
          "id": "obj-43"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Other In",
          "patching_rect": [
            536,
            502,
            60,
            20
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "presentation": 1,
          "presentation_rect": [
            156,
            64,
            72,
            16
          ],
          "id": "obj-44"
        }
      },
      {
        "box": {
          "maxclass": "live.numbox",
          "varname": "Presses Out",
          "parameter_enable": 1,
          "patching_rect": [
            600,
            480,
            60,
            15
          ],
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "",
            "float"
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_longname": "Presses Out",
              "parameter_shortname": "Presses",
              "parameter_type": 1,
              "parameter_mmin": 0,
              "parameter_mmax": 999999,
              "parameter_unitstyle": 0
            }
          },
          "presentation": 1,
          "presentation_rect": [
            230,
            78,
            60,
            15
          ],
          "id": "obj-45"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Presses Out",
          "patching_rect": [
            600,
            502,
            60,
            20
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "presentation": 1,
          "presentation_rect": [
            230,
            64,
            72,
            16
          ],
          "id": "obj-46"
        }
      },
      {
        "box": {
          "maxclass": "live.numbox",
          "varname": "Last LED",
          "parameter_enable": 1,
          "patching_rect": [
            664,
            480,
            60,
            15
          ],
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "",
            "float"
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_longname": "Last LED",
              "parameter_shortname": "LastLED",
              "parameter_type": 1,
              "parameter_mmin": 0,
              "parameter_mmax": 999999,
              "parameter_unitstyle": 0
            }
          },
          "presentation": 1,
          "presentation_rect": [
            304,
            78,
            60,
            15
          ],
          "id": "obj-47"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Last LED",
          "patching_rect": [
            664,
            502,
            60,
            20
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "presentation": 1,
          "presentation_rect": [
            304,
            64,
            72,
            16
          ],
          "id": "obj-48"
        }
      },
      {
        "box": {
          "maxclass": "live.numbox",
          "varname": "Last Colour",
          "parameter_enable": 1,
          "patching_rect": [
            728,
            480,
            60,
            15
          ],
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "",
            "float"
          ],
          "saved_attribute_attributes": {
            "valueof": {
              "parameter_longname": "Last Colour",
              "parameter_shortname": "LastCol",
              "parameter_type": 1,
              "parameter_mmin": 0,
              "parameter_mmax": 999999,
              "parameter_unitstyle": 0
            }
          },
          "presentation": 1,
          "presentation_rect": [
            378,
            78,
            60,
            15
          ],
          "id": "obj-49"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Last Colour",
          "patching_rect": [
            728,
            502,
            60,
            20
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "presentation": 1,
          "presentation_rect": [
            378,
            64,
            72,
            16
          ],
          "id": "obj-50"
        }
      }
    ],
    "lines": [
      {
        "patchline": {
          "source": [
            "obj-3",
            0
          ],
          "destination": [
            "obj-4",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-4",
            0
          ],
          "destination": [
            "obj-5",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-5",
            0
          ],
          "destination": [
            "obj-js",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-6",
            0
          ],
          "destination": [
            "obj-js",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-7",
            0
          ],
          "destination": [
            "obj-js",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-js",
            0
          ],
          "destination": [
            "obj-8",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-10",
            0
          ],
          "destination": [
            "obj-js",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-11",
            0
          ],
          "destination": [
            "obj-js",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-12",
            0
          ],
          "destination": [
            "obj-js",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-13",
            0
          ],
          "destination": [
            "obj-js",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-14",
            0
          ],
          "destination": [
            "obj-js",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-15",
            0
          ],
          "destination": [
            "obj-17",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-17",
            0
          ],
          "destination": [
            "obj-js",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-18",
            0
          ],
          "destination": [
            "obj-19",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-19",
            0
          ],
          "destination": [
            "obj-js",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-20",
            0
          ],
          "destination": [
            "obj-22",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-22",
            0
          ],
          "destination": [
            "obj-23",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-23",
            0
          ],
          "destination": [
            "obj-js",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-24",
            0
          ],
          "destination": [
            "obj-25",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-25",
            0
          ],
          "destination": [
            "obj-js",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-js",
            1
          ],
          "destination": [
            "obj-26",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-26",
            0
          ],
          "destination": [
            "obj-27",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-26",
            1
          ],
          "destination": [
            "obj-29",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-26",
            2
          ],
          "destination": [
            "obj-31",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-26",
            3
          ],
          "destination": [
            "obj-33",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-26",
            4
          ],
          "destination": [
            "obj-35",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-26",
            5
          ],
          "destination": [
            "obj-37",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-26",
            6
          ],
          "destination": [
            "obj-39",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-26",
            7
          ],
          "destination": [
            "obj-41",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-26",
            8
          ],
          "destination": [
            "obj-43",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-26",
            9
          ],
          "destination": [
            "obj-45",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-26",
            10
          ],
          "destination": [
            "obj-47",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-26",
            11
          ],
          "destination": [
            "obj-49",
            0
          ]
        }
      }
    ]
  }
}

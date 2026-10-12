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
    "description": "Push 3 x M8 — Launchpad Pro MK3 emulator: Push pads and border buttons drive the M8's LPP control-surface mode.",
    "digest": "M8 LPP Bridge",
    "tags": "push, m8, launchpad, lpp, liveapi, standalone",
    "parameters": {
      "parameterbanks": {
        "0": {
          "index": 0,
          "name": "M8",
          "parameters": [
            "S2 State",
            "LED Msgs",
            "Presses Out",
            "Takeover",
            "Buttons Mapped",
            "Buttons Missing",
            "Button Mode",
            "Capture"
          ]
        },
        "1": {
          "index": 1,
          "name": "Handshake",
          "parameters": [
            "Inquiries",
            "ID Replies",
            "Ch1 Static",
            "Ch2 Flash",
            "Ch3 Pulse",
            "SysEx In",
            "ID Variant",
            "Proactive ID"
          ]
        },
        "2": {
          "index": 2,
          "name": "Setup",
          "parameters": [
            "Out Path",
            "-",
            "-",
            "-",
            "-",
            "-",
            "-",
            "-"
          ]
        },
        "3": {
          "index": 3,
          "name": "Input",
          "parameters": [
            "Pad Vel",
            "Learn Shift+Right",
            "Learn Shift+Left",
            "Clear Chords",
            "-",
            "-",
            "-",
            "-"
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
          "text": "M8 LPP Bridge — Push 3 as a Launchpad Pro MK3 for the Dirtywave M8. Takes over pads + border buttons while this track is selected.",
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
            600,
            16
          ],
          "id": "obj-1"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Track 'M8 CTRL' (TRS): MIDI From = MIDI To = Push External Port, Monitor In. Select another track to give Push back.",
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
          "text": "js m8-lpp-bridge.js",
          "patching_rect": [
            200,
            200,
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
            250,
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
          "maxclass": "message",
          "text": "report",
          "patching_rect": [
            420,
            100,
            56,
            22
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-9"
        }
      },
      {
        "box": {
          "maxclass": "message",
          "text": "enumerate",
          "patching_rect": [
            540,
            100,
            77,
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
          "text": "report_mapping",
          "patching_rect": [
            660,
            100,
            112,
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
          "text": "report_palette",
          "patching_rect": [
            780,
            100,
            112,
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
          "text": "palette_sweep 0",
          "patching_rect": [
            420,
            130,
            119,
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
          "text": "palette_sweep 64",
          "patching_rect": [
            540,
            130,
            126,
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
          "maxclass": "message",
          "text": "palette_sweep -1",
          "patching_rect": [
            660,
            130,
            126,
            22
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-15"
        }
      },
      {
        "box": {
          "maxclass": "message",
          "text": "takeover",
          "patching_rect": [
            780,
            130,
            70,
            22
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-16"
        }
      },
      {
        "box": {
          "maxclass": "message",
          "text": "release",
          "patching_rect": [
            420,
            160,
            63,
            22
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-17"
        }
      },
      {
        "box": {
          "maxclass": "message",
          "text": "repaint",
          "patching_rect": [
            540,
            160,
            63,
            22
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-18"
        }
      },
      {
        "box": {
          "maxclass": "message",
          "text": "identity",
          "patching_rect": [
            660,
            160,
            70,
            22
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-19"
        }
      },
      {
        "box": {
          "maxclass": "message",
          "text": "reset",
          "patching_rect": [
            780,
            160,
            49,
            22
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-20"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Live tuning: map_button <lpp> <ControlName>   lpp_color <lpp> <push>   capture 1",
          "patching_rect": [
            420,
            196,
            520,
            20
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "id": "obj-21"
        }
      },
      {
        "box": {
          "maxclass": "message",
          "text": "map_button 95 Shift_Button",
          "patching_rect": [
            420,
            216,
            196,
            22
          ],
          "numinlets": 2,
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
          "text": "lpp_color 71 44",
          "patching_rect": [
            620,
            216,
            119,
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
          "maxclass": "message",
          "text": "capture 1",
          "patching_rect": [
            740,
            216,
            77,
            22
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-24"
        }
      },
      {
        "box": {
          "maxclass": "live.tab",
          "varname": "Button Mode",
          "parameter_enable": 1,
          "patching_rect": [
            24,
            300,
            90,
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
              "parameter_longname": "Button Mode",
              "parameter_shortname": "BtnMode",
              "parameter_type": 2,
              "parameter_mmin": 0,
              "parameter_mmax": 1,
              "parameter_unitstyle": 0,
              "parameter_enum": [
                "cc",
                "note"
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
            8,
            118,
            90,
            18
          ],
          "id": "obj-25"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "prepend button_mode",
          "patching_rect": [
            24,
            330,
            149,
            22
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-26"
        }
      },
      {
        "box": {
          "maxclass": "live.tab",
          "varname": "ID Variant",
          "parameter_enable": 1,
          "patching_rect": [
            140,
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
            104,
            118,
            100,
            18
          ],
          "id": "obj-27"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "prepend variant",
          "patching_rect": [
            140,
            330,
            121,
            22
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-28"
        }
      },
      {
        "box": {
          "maxclass": "live.toggle",
          "varname": "Proactive ID",
          "parameter_enable": 1,
          "patching_rect": [
            270,
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
            212,
            120,
            15,
            15
          ],
          "id": "obj-29"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Proactive ID",
          "patching_rect": [
            290,
            300,
            80,
            20
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "presentation": 1,
          "presentation_rect": [
            229,
            119,
            72,
            16
          ],
          "id": "obj-30"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "prepend proactive",
          "patching_rect": [
            270,
            330,
            135,
            22
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-31"
        }
      },
      {
        "box": {
          "maxclass": "live.toggle",
          "varname": "Capture",
          "parameter_enable": 1,
          "patching_rect": [
            390,
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
              "parameter_longname": "Capture",
              "parameter_shortname": "Capture",
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
                0
              ]
            }
          },
          "presentation": 1,
          "presentation_rect": [
            304,
            120,
            15,
            15
          ],
          "id": "obj-32"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Capture (S3)",
          "patching_rect": [
            410,
            300,
            80,
            20
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "presentation": 1,
          "presentation_rect": [
            321,
            119,
            80,
            16
          ],
          "id": "obj-33"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "prepend capture",
          "patching_rect": [
            390,
            330,
            121,
            22
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-34"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "route state led_msgs presses takeover mapped missing inquiries replies ch1 ch2 ch3 sysex_in",
          "patching_rect": [
            24,
            420,
            653,
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
          "id": "obj-35"
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
          "id": "obj-36"
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
          "id": "obj-37"
        }
      },
      {
        "box": {
          "maxclass": "live.numbox",
          "varname": "LED Msgs",
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
            82,
            38,
            60,
            15
          ],
          "id": "obj-38"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "LED Msgs",
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
          "id": "obj-39"
        }
      },
      {
        "box": {
          "maxclass": "live.numbox",
          "varname": "Presses Out",
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
            156,
            38,
            60,
            15
          ],
          "id": "obj-40"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Presses Out",
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
          "id": "obj-41"
        }
      },
      {
        "box": {
          "maxclass": "live.numbox",
          "varname": "Takeover",
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
              "parameter_longname": "Takeover",
              "parameter_shortname": "Takeover",
              "parameter_type": 2,
              "parameter_mmin": 0,
              "parameter_mmax": 1,
              "parameter_unitstyle": 0,
              "parameter_enum": [
                "no",
                "yes"
              ]
            }
          },
          "presentation": 1,
          "presentation_rect": [
            230,
            38,
            60,
            15
          ],
          "id": "obj-42"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Takeover",
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
          "id": "obj-43"
        }
      },
      {
        "box": {
          "maxclass": "live.numbox",
          "varname": "Buttons Mapped",
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
              "parameter_longname": "Buttons Mapped",
              "parameter_shortname": "Mapped",
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
          "id": "obj-44"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Buttons Mapped",
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
          "id": "obj-45"
        }
      },
      {
        "box": {
          "maxclass": "live.numbox",
          "varname": "Buttons Missing",
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
              "parameter_longname": "Buttons Missing",
              "parameter_shortname": "Missing",
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
          "id": "obj-46"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Buttons Missing",
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
          "id": "obj-47"
        }
      },
      {
        "box": {
          "maxclass": "live.numbox",
          "varname": "Inquiries",
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
            8,
            78,
            60,
            15
          ],
          "id": "obj-48"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Inquiries",
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
          "id": "obj-49"
        }
      },
      {
        "box": {
          "maxclass": "live.numbox",
          "varname": "ID Replies",
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
            82,
            78,
            60,
            15
          ],
          "id": "obj-50"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "ID Replies",
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
          "id": "obj-51"
        }
      },
      {
        "box": {
          "maxclass": "live.numbox",
          "varname": "Ch1 Static",
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
            156,
            78,
            60,
            15
          ],
          "id": "obj-52"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Ch1 Static",
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
          "id": "obj-53"
        }
      },
      {
        "box": {
          "maxclass": "live.numbox",
          "varname": "Ch2 Flash",
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
            230,
            78,
            60,
            15
          ],
          "id": "obj-54"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Ch2 Flash",
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
          "id": "obj-55"
        }
      },
      {
        "box": {
          "maxclass": "live.numbox",
          "varname": "Ch3 Pulse",
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
            304,
            78,
            60,
            15
          ],
          "id": "obj-56"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Ch3 Pulse",
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
          "id": "obj-57"
        }
      },
      {
        "box": {
          "maxclass": "live.numbox",
          "varname": "SysEx In",
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
            378,
            78,
            60,
            15
          ],
          "id": "obj-58"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "SysEx In",
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
          "id": "obj-59"
        }
      },
      {
        "box": {
          "maxclass": "live.tab",
          "varname": "Out Path",
          "parameter_enable": 1,
          "patching_rect": [
            510,
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
            404,
            118,
            150,
            18
          ],
          "id": "obj-60"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "prepend out_path",
          "patching_rect": [
            510,
            330,
            128,
            22
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-61"
        }
      },
      {
        "box": {
          "maxclass": "live.tab",
          "varname": "Pad Vel",
          "parameter_enable": 1,
          "patching_rect": [
            24,
            360,
            104,
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
              "parameter_longname": "Pad Vel",
              "parameter_shortname": "PadVel",
              "parameter_type": 2,
              "parameter_mmin": 0,
              "parameter_mmax": 1,
              "parameter_unitstyle": 0,
              "parameter_enum": [
                "native",
                "fixed"
              ],
              "parameter_initial_enable": 1,
              "parameter_initial": [
                1
              ]
            }
          },
          "num_lines_patching": 1,
          "num_lines_presentation": 1,
          "presentation": 1,
          "presentation_rect": [
            8,
            143,
            104,
            18
          ],
          "id": "obj-62"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "prepend pad_vel",
          "patching_rect": [
            24,
            390,
            121,
            22
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-63"
        }
      },
      {
        "box": {
          "maxclass": "live.button",
          "varname": "Learn Shift+Right",
          "parameter_enable": 1,
          "patching_rect": [
            160,
            360,
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
              "parameter_longname": "Learn Shift+Right",
              "parameter_shortname": "LearnSR",
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
            120,
            145,
            15,
            15
          ],
          "id": "obj-64"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Learn Shift+Right",
          "patching_rect": [
            180,
            360,
            100,
            20
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "presentation": 1,
          "presentation_rect": [
            137,
            144,
            100,
            16
          ],
          "id": "obj-65"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "t b",
          "patching_rect": [
            160,
            390,
            60,
            22
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-66"
        }
      },
      {
        "box": {
          "maxclass": "message",
          "text": "learn sr",
          "patching_rect": [
            160,
            420,
            70,
            22
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-67"
        }
      },
      {
        "box": {
          "maxclass": "live.button",
          "varname": "Learn Shift+Left",
          "parameter_enable": 1,
          "patching_rect": [
            300,
            360,
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
              "parameter_longname": "Learn Shift+Left",
              "parameter_shortname": "LearnSL",
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
            236,
            145,
            15,
            15
          ],
          "id": "obj-68"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Learn Shift+Left",
          "patching_rect": [
            320,
            360,
            100,
            20
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "presentation": 1,
          "presentation_rect": [
            253,
            144,
            100,
            16
          ],
          "id": "obj-69"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "t b",
          "patching_rect": [
            300,
            390,
            60,
            22
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-70"
        }
      },
      {
        "box": {
          "maxclass": "message",
          "text": "learn sl",
          "patching_rect": [
            300,
            420,
            70,
            22
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-71"
        }
      },
      {
        "box": {
          "maxclass": "live.button",
          "varname": "Clear Chords",
          "parameter_enable": 1,
          "patching_rect": [
            440,
            360,
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
              "parameter_longname": "Clear Chords",
              "parameter_shortname": "ClearCh",
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
            350,
            145,
            15,
            15
          ],
          "id": "obj-72"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Clear Chords",
          "patching_rect": [
            460,
            360,
            100,
            20
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "presentation": 1,
          "presentation_rect": [
            367,
            144,
            100,
            16
          ],
          "id": "obj-73"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "t b",
          "patching_rect": [
            440,
            390,
            60,
            22
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-74"
        }
      },
      {
        "box": {
          "maxclass": "message",
          "text": "unchord",
          "patching_rect": [
            440,
            420,
            63,
            22
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-75"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Chords: press Learn, then a Push button",
          "patching_rect": [
            560,
            360,
            400,
            20
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "presentation": 1,
          "presentation_rect": [
            8,
            100,
            456,
            16
          ],
          "id": "obj-76"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "route learn",
          "patching_rect": [
            560,
            390,
            93,
            22
          ],
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "",
            ""
          ],
          "id": "obj-77"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "prepend set",
          "patching_rect": [
            560,
            420,
            93,
            22
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-78"
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
            "obj-9",
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
            "obj-js",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-16",
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
            "obj-js",
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
            "obj-js",
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
            "obj-js",
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
            "obj-js",
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
            "obj-js",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-27",
            0
          ],
          "destination": [
            "obj-28",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-28",
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
            "obj-29",
            0
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
            "obj-31",
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
            "obj-32",
            0
          ],
          "destination": [
            "obj-34",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-34",
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
            "obj-35",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-35",
            0
          ],
          "destination": [
            "obj-36",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-35",
            1
          ],
          "destination": [
            "obj-38",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-35",
            2
          ],
          "destination": [
            "obj-40",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-35",
            3
          ],
          "destination": [
            "obj-42",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-35",
            4
          ],
          "destination": [
            "obj-44",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-35",
            5
          ],
          "destination": [
            "obj-46",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-35",
            6
          ],
          "destination": [
            "obj-48",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-35",
            7
          ],
          "destination": [
            "obj-50",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-35",
            8
          ],
          "destination": [
            "obj-52",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-35",
            9
          ],
          "destination": [
            "obj-54",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-35",
            10
          ],
          "destination": [
            "obj-56",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-35",
            11
          ],
          "destination": [
            "obj-58",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-60",
            0
          ],
          "destination": [
            "obj-61",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-61",
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
            "obj-62",
            0
          ],
          "destination": [
            "obj-63",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-63",
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
            "obj-64",
            0
          ],
          "destination": [
            "obj-66",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-66",
            0
          ],
          "destination": [
            "obj-67",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-67",
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
            "obj-68",
            0
          ],
          "destination": [
            "obj-70",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-70",
            0
          ],
          "destination": [
            "obj-71",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-71",
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
            "obj-72",
            0
          ],
          "destination": [
            "obj-74",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-74",
            0
          ],
          "destination": [
            "obj-75",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-75",
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
            "obj-77",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-77",
            0
          ],
          "destination": [
            "obj-78",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-78",
            0
          ],
          "destination": [
            "obj-76",
            0
          ]
        }
      }
    ]
  }
}

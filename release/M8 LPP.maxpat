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
      276,
      88
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
    "description": "Push 3 as a Novation Launchpad Pro MK3 for the Dirtywave M8 (set the M8's CTRL SURFACE to Launchpad Pro). Put it on a MIDI track whose MIDI From and MIDI To are the Push's External Port, Monitor In.",
    "digest": "M8 LPP",
    "tags": "push, m8, launchpad, lpp, liveapi, standalone",
    "parameters": {
      "parameterbanks": {
        "0": {
          "index": 0,
          "name": "M8",
          "parameters": [
            "Launchpad",
            "Push",
            "Pad Velocity",
            "Track Buttons",
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
          "id": "obj-1"
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
          "id": "obj-2"
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
          "id": "obj-3"
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
          "id": "obj-4"
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
          "id": "obj-5"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "js m8-lpp.js",
          "patching_rect": [
            200,
            200,
            140,
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
          "id": "obj-6"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "route state",
          "patching_rect": [
            24,
            420,
            93,
            22
          ],
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "",
            ""
          ],
          "id": "obj-7"
        }
      },
      {
        "box": {
          "maxclass": "live.numbox",
          "varname": "Launchpad",
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
              "parameter_longname": "Launchpad",
              "parameter_shortname": "Launchpad",
              "parameter_type": 2,
              "parameter_mmin": 0,
              "parameter_mmax": 3,
              "parameter_unitstyle": 0,
              "parameter_enum": [
                "waiting",
                "asked",
                "replied",
                "connected"
              ]
            }
          },
          "presentation": 1,
          "presentation_rect": [
            8,
            18,
            60,
            15
          ],
          "ignoreclick": 1,
          "id": "obj-8"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Launchpad",
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
            4,
            72,
            16
          ],
          "id": "obj-9"
        }
      },
      {
        "box": {
          "maxclass": "live.tab",
          "varname": "Push",
          "parameter_enable": 1,
          "patching_rect": [
            120,
            300,
            120,
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
              "parameter_longname": "Push",
              "parameter_shortname": "Push",
              "parameter_type": 2,
              "parameter_mmin": 0,
              "parameter_mmax": 1,
              "parameter_unitstyle": 0,
              "parameter_enum": [
                "M8",
                "Live"
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
            82,
            18,
            120,
            18
          ],
          "id": "obj-10"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Push goes to",
          "patching_rect": [
            120,
            280,
            120,
            20
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "presentation": 1,
          "presentation_rect": [
            82,
            4,
            120,
            14
          ],
          "id": "obj-11"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "!- 1",
          "patching_rect": [
            120,
            330,
            60,
            22
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-12"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "prepend push_switch",
          "patching_rect": [
            120,
            360,
            149,
            22
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-13"
        }
      },
      {
        "box": {
          "maxclass": "live.tab",
          "varname": "Pad Velocity",
          "parameter_enable": 1,
          "patching_rect": [
            24,
            360,
            120,
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
              "parameter_longname": "Pad Velocity",
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
            60,
            120,
            18
          ],
          "id": "obj-14"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Pad velocity",
          "patching_rect": [
            24,
            340,
            120,
            20
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "presentation": 1,
          "presentation_rect": [
            8,
            46,
            120,
            14
          ],
          "id": "obj-15"
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
          "id": "obj-16"
        }
      },
      {
        "box": {
          "maxclass": "live.tab",
          "varname": "Track Buttons",
          "parameter_enable": 1,
          "patching_rect": [
            200,
            360,
            120,
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
              "parameter_longname": "Track Buttons",
              "parameter_shortname": "TrackBtns",
              "parameter_type": 2,
              "parameter_mmin": 0,
              "parameter_mmax": 1,
              "parameter_unitstyle": 0,
              "parameter_enum": [
                "M8",
                "Live"
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
            140,
            60,
            120,
            18
          ],
          "id": "obj-17"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Track buttons go to",
          "patching_rect": [
            200,
            340,
            130,
            20
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "presentation": 1,
          "presentation_rect": [
            140,
            46,
            130,
            14
          ],
          "id": "obj-18"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "prepend track_btns",
          "patching_rect": [
            200,
            390,
            142,
            22
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "id": "obj-19"
        }
      }
    ],
    "lines": [
      {
        "patchline": {
          "source": [
            "obj-1",
            0
          ],
          "destination": [
            "obj-2",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-2",
            0
          ],
          "destination": [
            "obj-3",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-3",
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
            "obj-4",
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
            "obj-5",
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
            "obj-6",
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
            "obj-7",
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
            "obj-12",
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
            "obj-13",
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
            "obj-16",
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
      }
    ]
  }
}

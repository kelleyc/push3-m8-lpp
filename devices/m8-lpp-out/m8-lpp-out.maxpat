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
      180,
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
    "description": "Push 3 x M8 — sender half of the two-track SysEx layout.",
    "digest": "M8 LPP Out",
    "tags": "push, m8, launchpad, lpp, liveapi, standalone",
    "parameters": {
      "parameterbanks": {
        "0": {
          "index": 0,
          "name": "Out",
          "parameters": [
            "Bytes Sent",
            "-",
            "-",
            "-",
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
          "text": "M8 LPP Out — OPTIONAL (USB only). Put on a separate MIDI track 'M8 OUT' (MIDI To = M8, MIDI From = none) and set the main device's Out Path = M8 OUT. Not needed over TRS.",
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
            300,
            48
          ],
          "id": "obj-1"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "r m8lpp.to_m8",
          "patching_rect": [
            24,
            70,
            107,
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
          "maxclass": "newobj",
          "text": "t i b",
          "patching_rect": [
            24,
            100,
            60,
            22
          ],
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "",
            ""
          ],
          "id": "obj-3"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "midiout",
          "patching_rect": [
            24,
            140,
            65,
            22
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "outlettype": [],
          "id": "obj-4"
        }
      },
      {
        "box": {
          "maxclass": "newobj",
          "text": "counter 0 16383",
          "patching_rect": [
            120,
            140,
            121,
            22
          ],
          "numinlets": 3,
          "numoutlets": 4,
          "outlettype": [
            "",
            "",
            "",
            ""
          ],
          "id": "obj-5"
        }
      },
      {
        "box": {
          "maxclass": "live.numbox",
          "varname": "Bytes Sent",
          "parameter_enable": 1,
          "patching_rect": [
            120,
            180,
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
              "parameter_longname": "Bytes Sent",
              "parameter_shortname": "Bytes",
              "parameter_type": 0,
              "parameter_mmin": 0,
              "parameter_mmax": 999999,
              "parameter_unitstyle": 1
            }
          },
          "presentation": 1,
          "presentation_rect": [
            8,
            60,
            60,
            15
          ],
          "id": "obj-6"
        }
      },
      {
        "box": {
          "maxclass": "comment",
          "text": "Bytes Sent",
          "patching_rect": [
            190,
            180,
            80,
            20
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "presentation": 1,
          "presentation_rect": [
            72,
            59,
            80,
            16
          ],
          "id": "obj-7"
        }
      }
    ],
    "lines": [
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
            "obj-4",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-3",
            1
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
            "obj-6",
            0
          ]
        }
      }
    ]
  }
}

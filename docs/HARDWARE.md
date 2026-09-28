# Hardware and calibration

[Back to Memento](../README.md)

## Components and wiring

- Arduino Uno R4 Minima or Uno R4 WiFi
- Force-sensitive resistor (FSR)
- 10 kΩ resistor, jumper wires, and breadboard
- USB data cable

```text
5V ── FSR ──┬── A0
            │
           10 kΩ
            │
           GND
```

Disconnect USB before changing the wiring. Support the sensor on a firm surface and avoid pinching or sharply bending its flexible tail. Keep the bag in a consistent position during calibration and the demonstration.

## Choose the correct sketch

| File | Purpose | Serial output |
| --- | --- | --- |
| [memento_pack.ino](../arduino/memento_pack/memento_pack.ino) | Live presentation | `STATE:EMPTY`, `STATE:POCKETS`, `STATE:SMALL`, `STATE:HEAVY` |
| [memento_inner_demo.ino](../memento_inner_demo/memento_inner_demo.ino) | Sensor diagnosis and calibration | Raw A0 numbers every 200 ms |

Both use **115200 baud** and 10-bit analog readings (0–1023). The browser expects state messages, so the diagnostic sketch does not drive its state changes. Upload the live sketch again after measuring raw values.

## Upload

Open the chosen `.ino` file in Arduino IDE. Install the Arduino UNO R4 board package if needed, select the matching R4 board and USB port, and upload. Serial Monitor and the browser cannot use the port at the same time.

## Detection settings

The live sketch takes one sample every **30 ms**, averages **20 samples** (about 600 ms), and requires a candidate state to persist for **800 ms**. A normal transition therefore takes roughly one to two seconds to settle.

| Boundary | Move upward at | Move downward at |
| --- | ---: | ---: |
| Empty ↔ pockets | ≥ 8 | ≤ 5 |
| Pockets ↔ small notebook | ≥ 30 | ≤ 27 |
| Small ↔ heavy notebooks | ≥ 65 | ≤ 60 |

Values between an upward and downward threshold retain the current state. The sketch advances one adjacent state at a time: skipping directly from empty to a heavy load, or removing everything at once, walks through intermediate states and takes longer.

These settings reflect tested bands of **0–1**, **10–25**, **35–45**, and **80–90**. Averaging helps with short fluctuations; sustained readings crossing a boundary can still change state. Weight alone cannot identify which object is present.

To recalibrate, use the raw diagnostic sketch and record each loadout after it settles. Adjust `UP_*`, `DOWN_*`, `SMOOTHING_SAMPLES`, and `SETTLE_MS` near the top of the live sketch. Rehearse both additions and removals afterward.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Raw readings stay at zero | Reseat the FSR, 5V, A0, and ground connections; check breadboard rows and sensor-tail damage. |
| Serial Monitor prints no new lines | The live sketch emits only state changes. Use the diagnostic sketch for continuous readings. |
| Browser does not change although numbers print | Raw numeric output is not the browser protocol. Upload the live sketch. |
| Port cannot open | Close Serial Monitor/Plotter and other tabs using the port; check the USB cable and selected port. |
| Page reconnects but shows an old/default state | The sketch has no periodic state heartbeat. Start empty; if needed reset the board after connecting and restage the loadout. |
| USB drops out | Reload the page and reconnect. The current connection UI has no automatic reconnection. Use keyboard rehearsal if needed. |
| State flickers or sticks | Check placement and raw readings, then recalibrate; do not assume the original thresholds suit a changed setup. |

## Serial contract

Messages are newline-delimited ASCII at 115200 baud:

```text
STATE:EMPTY
STATE:POCKETS
STATE:SMALL
STATE:HEAVY
```

The browser accepts these exact state names. It derives the three adjacent removal messages from the previous state.

# Memento Pack

A minimal Wizard-of-Oz demo for a backpack whose digital view responds to the load inside it. An Arduino Uno R4 reads an FSR; the browser visualizes four load states.

## Repository layout

```
arduino/memento_pack/memento_pack.ino  Arduino sketch
public/                                  Static p5.js browser experience
  assets/                                Replaceable state illustrations
scripts/check.mjs                        Lightweight local checks
```

## Hardware wiring

Use a 10 kOhm resistor as a voltage divider:

```
5V --- FSR ---+--- A0
              |
            10 kOhm
              |
             GND
```

Connect the Arduino by USB. This sketch targets an **Arduino Uno R4** and communicates at **115200 baud**.

## Upload and calibrate

1. Open `arduino/memento_pack/memento_pack.ino` in Arduino IDE.
2. Select **Arduino Uno R4 Minima** (or your Uno R4 board) and its port, then upload.
3. Open Serial Monitor at 115200 baud to confirm state lines such as `STATE:EMPTY`.
4. Close Serial Monitor before connecting the browser.
5. Test each real backpack configuration while it rests in its presentation position.

The tested ranges are encoded in the sketch:

| Load | Typical reading |
| --- | ---: |
| Empty | 0–1 |
| Dual sleeve / pockets | 10–25 |
| Small notebook | 35–45 |
| Large / multiple notebooks | 80–90 |

The thresholds intentionally leave gaps and use hysteresis: a state needs to remain plausible for 800 ms before it changes. If the physical setup changes, adjust the `UP_*` and `DOWN_*` constants near the top of the sketch. Keep each pair of adjacent states separated by a gap wider than the ordinary noise, then test additions and removals.

## Run locally

Install Node.js 18+ and run:

```bash
npm install
npm run dev
```

Open the shown `http://localhost:8080` address in desktop Chrome or Edge. Run `npm test` for static/syntax checks.

## Connect live hardware

Click the subtle `connect` link only during setup (it is hidden when the page is in presentation mode). Choose the Arduino serial port, then use the bag normally. Web Serial works in Chromium desktop browsers over `localhost` or HTTPS. It does not work in Firefox or Safari. If connection fails, close Arduino Serial Monitor/Plotter since only one application can hold the serial port.

The sketch sends only concise lines: `STATE:EMPTY`, `STATE:POCKETS`, `STATE:SMALL`, or `STATE:HEAVY`. The interface derives removal messages and records every change in the history log.

## Rehearsal fallback

No Arduino is required to rehearse. Keyboard shortcuts also work in presentation mode, except while a form field such as the country selector has focus:

| Key | State |
| --- | --- |
| `0` | Empty |
| `1` | Dual sleeve |
| `2` | Small notebook |
| `3` | Multiple notebooks |
| `h` | Toggle the setup links |

For the presentation, add `?present=1` to the URL (for example `http://localhost:8080/?present=1`). That hides connection/setup controls. The minimal view switch remains available; Interior shows its headline, backpack, and history, while Outer shows the closed backpack and location filters. Press `h` if you need to restore setup controls.

## Outer view / travel memories

Use **Outer / Interior** at the top left to switch views. Interior remains the initial view. Each entry into Outer starts with all 18 marks across all 12 places layered on the closed backpack. Select a country to narrow the location list, then a city to isolate its marks. **All places** shows all marks in the selected country; **All countries** resets the collective view.

Hover over or tap a mark to see its city, country, and story. Marks are also keyboard-focusable; use Tab to explore and Escape to dismiss the story. These are fictional presentation memories, not tracked trips. Interior sensor updates and history continue while Outer is visible. The Outer / Interior switch and travel filters remain visible in presentation mode.

Edit the locations, muted colors, mark types, coordinates, length, width, angle, optional curve `bend` / `sway`, optional pigment `strength` (default 1), and stories in `public/travel-data.js`. Four visual types are supported: `rub`, `stain`, `scratch`, and `dent`. Locations have one to three gestures of uneven scale and intensity. A softened Great Wall diagonal and a continuous L-shaped Busan scuff around the bottom-right corner provide gentle hierarchy, with medium scuffs and faint traces spaced asymmetrically around them. Other edge wear stays interrupted rather than forming a full frame. The Busan mark uses `shape: 'corner'` with its custom tapered outline defined in `public/outer.js`. Brush entry pressure and taper vary between marks, while selective partial overlaps suggest accumulated use. City filtering isolates each original gesture in place; it does not generate a new pattern.

The closed placeholder is `public/assets/backpack-closed.svg` (800 × 700). Its marks are a separate interactive SVG layer in `public/index.html`, clipped to a 280 × 370 front panel and placed with `matrix(1 .2 0 1 250 140)`. When replacing the placeholder with the final image, adjust that transform and clip to align the marks to the pictured front panel. You can change the SVG image `href` to a PNG or JPEG without changing the mark data.

## Interior illustrations

Replace these files while retaining their filenames and SVG format (or update `public/sketch.js` if you switch formats):

- `public/assets/backpack-empty.svg`
- `public/assets/backpack-pockets.svg`
- `public/assets/backpack-small-notebook.svg`
- `public/assets/backpack-heavy-notebooks.svg`

They are deliberately obvious placeholders, not final artwork.

## Deploy to Vercel

This is a zero-build static site. Import the repository into Vercel, or run `vercel` from this folder. `vercel.json` sends the `public` folder as the site output. The deployed site can use Web Serial when served over HTTPS in Chrome or Edge; a USB-connected Arduino still must be selected by the presenter.

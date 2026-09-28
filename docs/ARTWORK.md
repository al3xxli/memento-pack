# Artwork and the approved front panel

[Back to Memento](../README.md)

## Exterior: preserve the approved composition

The current arrangement is approved, including the continuous L-shaped lower-right scuff and removal of the larger warm-toned lower-left mark. The reference is [approved-front-panel-layout.json](../design/approved-front-panel-layout.json); [design notes](../design/README.md) explain its preservation rules.

All 18 marks remain in the approved **280 × 370** front-panel coordinate space. The supplied `public/assets/Photos/Exterior.png` uses a **1254 × 1254** viewBox. A single perspective transform on `#panel-projection` aligns the whole composition to the front face; individual marks, colors, stories, seeds, and overlaps are unchanged.

The panel corners in drawing pixels are **(302, 159), (674, 137), (670, 1181), (351, 1030)**, clockwise from the top left. The clip has a radius of 3 to suit the new drawing's angular seams. The nested SVG lives in an HTML wrapper inside `foreignObject` so Chromium applies the perspective divide correctly. Filters and pointer/keyboard interaction remain live.

The saved design snapshot retains the original placeholder mapping as historical reference. The active mapping lives in `public/style.css` and is verified by `npm test`.

For future drawing replacements:

1. Replace the closed-backpack image in `public/assets/`, or update the SVG image reference in `public/index.html` for a PNG/JPEG.
2. Align the complete mark overlay to the new front panel. Update the overall transform and clip as needed.
3. Preserve the relative mark locations, colors, dimensions, overlaps, and stories. Do not regenerate the composition.
4. Compare the collective view and a filtered city against the approved reference, including the lower-right corner.

If the final drawing's geometry needs a substantial layout change, review that change before moving individual marks.

## Editable data

`public/travel-data.js` contains the city/country labels, colors, stories, and mark geometry. Supported types are `rub`, `stain`, `scratch`, and `dent`; `length`, `width`, `angle`, `bend`, `sway`, and `strength` control the gesture. The Busan mark uses `shape: 'corner'` and a custom outline in `public/outer.js`.

The brush seed depends on location and mark order. Preserve those arrays' order when swapping images. Every filter isolates the same fixed artwork; it does not regenerate a pattern.

## Interior assets

| File | Configuration |
| --- | --- |
| `public/assets/Photos/Interior_fully_empty.png` | Empty |
| `public/assets/Photos/Interior_pockets.png` | Dual sleeves |
| `public/assets/Photos/Interior_front_notebook_only.png` | Small notebook in the front sleeve |
| `public/assets/Photos/Interior_Both Notebooks.png` | Both notebooks |
| `public/assets/Photos/Interior_spiral_notebook_only.png` | Retained alternate; not used in the four-state sequence |

The six supplied PNGs are preserved unmodified with their original filenames. The front notebook is treated as the small notebook; the larger spiral notebook is the second item added. The sensor cannot distinguish two different single-notebook configurations, so the spiral-only alternate does not introduce an unsupported fifth state. Sequential removal from both notebooks returns to the front-notebook drawing.

Change the image paths in `public/sketch.js` for future replacements and update the asset assertions in `scripts/check.mjs`. Keep the camera angle, scale, and margins consistent across states to avoid a visual jump. Legacy placeholder SVGs remain available but are no longer referenced by the live interface.

The interface retains its white background, minimal typography, centered backpack, and history or location filters. The desktop and phone-preview layouts both use the supplied drawings.

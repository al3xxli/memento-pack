# Artwork and the approved front panel

[Back to Memento](../README.md)

## Exterior: preserve the approved composition

The current arrangement is approved, including the continuous L-shaped lower-right scuff and removal of the larger warm-toned lower-left mark. The reference is [approved-front-panel-layout.json](../design/approved-front-panel-layout.json); [design notes](../design/README.md) explain its preservation rules.

All 18 marks are mapped to a **280 × 370** front-panel coordinate space. The placeholder uses an **800 × 700** viewBox. The overlay is placed with `matrix(1 .2 0 1 250 140)` and clipped to a rounded rectangle with a radius of 39.

When the final drawing arrives:

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
| `public/assets/backpack-empty.svg` | Empty |
| `public/assets/backpack-pockets.svg` | Dual sleeves |
| `public/assets/backpack-small-notebook.svg` | Small notebook |
| `public/assets/backpack-heavy-notebooks.svg` | Multiple notebooks |

Replace the placeholder files with matching SVGs, or change the image paths in `public/sketch.js` for another format. Keep the camera angle, scale, and margins consistent across states to avoid a visual jump during the demo.

The approved interface uses a white background, minimal typography, a centered backpack, and a left-side history or filter list. The final illustrations should fit that composition without adding labels inside the image.

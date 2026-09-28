# Approved front-panel layout

The user approved the layout with continuous L-shaped wear around the bottom-right corner and the large warm-toned lower-left stroke removed. Preserve this composition when their final backpack drawing arrives.

`approved-front-panel-layout.json` captures all 18 marks across 12 locations, including positions, dimensions, angles, curve settings, opacity strengths, colors, stories, and the special corner outline. Locations and mark order also determine the stable brush seeds; preserve their ordering.

When replacing `public/assets/backpack-closed.svg`, align the complete overlay to the front panel in the new drawing. Update the image reference, overall panel mapping, and clipping geometry as needed. Do not independently reposition, resize, recolor, redistribute, or regenerate the approved marks. Preserve the country/city filters and hover stories. If the drawing's geometry would require a substantial composition change, show the alignment issue before changing individual marks.

The live layout remains in `public/travel-data.js` and `public/outer.js`. This snapshot is the approved reference, not a second runtime data source.

The supplied drawings are now integrated. The snapshot's placeholder transform remains historical; the current whole-panel perspective transform is in `public/style.css`. See `docs/ARTWORK.md` for its four anchor corners. No individual mark data or brush geometry was changed.

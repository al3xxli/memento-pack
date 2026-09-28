# Presentation runbook

[Back to Memento](../README.md)

## Before the audience arrives

1. Run `npm ci` once while online, then `npm run dev`. Open `http://localhost:8080/?present=1` in desktop Chrome or Edge. p5.js is bundled into the local build; no separate CDN connection is needed to run it.
2. Upload the live Arduino sketch, close Serial Monitor, and start with an empty bag.
3. Press **H**, select **connect**, and choose the Arduino. Press **H** again to hide setup controls.
4. Rehearse empty → sleeves → small notebook → heavy notebook, then reverse. Pause roughly one to two seconds between placements.
5. Check the projector at audience distance and keep the physical model's sensor placement consistent.

## Interior sequence

Start on Interior. Install the sleeves, add the small notebook, then add the heavy notebook. Let the headline and history respond after each settled change. Remove one item at a time to show the reverse sequence.

For rehearsal or a hardware interruption:

| Key | Result |
| --- | --- |
| `0` | Empty |
| `1` | Dual sleeves |
| `2` | Small notebook |
| `3` | Heavy / multiple notebooks |
| `H` | Show or hide setup controls |

The three removal headlines follow `3 → 2 → 1 → 0`. A keyboard jump across several states shows the destination headline rather than inventing all intermediate removals. Shortcuts are ignored while a form field such as the country selector has focus; click a view button first.

If live serial input is still arriving, it can override a keyboard selection. For a fully manual run, disconnect the USB cable, reload the page, and leave the serial connection unopened. Reloading also clears the session history.

## Outer sequence

Select **Outer** to reveal the complete composition. Every entry into Outer resets the filters to all places. Use the country dropdown, then a city, to isolate a memory. Hover, tap, or tab to a mark to show its place and story; Escape dismisses the tooltip.

Suggested moments:

- **Beijing, China:** the diagonal Great Wall scrape.
- **Busan, Korea:** the continuous L-shaped lower-right scuff.
- **Toronto, Canada:** an almost invisible pressure mark.

The contrast between substantial and nearly absent traces helps explain how different encounters leave different memories. These are authored demo stories. Returning to Interior restores the current interior state and its history; serial updates continue while Outer is open.

## Phone preview

Use the top-right phone icon to put the current demo inside a Galaxy S26 Ultra–inspired frame. Click it again to return to the desktop view. This is the same running page, not a screenshot or iframe: view selection, filters, history, keyboard rehearsal, and any active desktop serial connection are preserved.

The layout responds to the screen container's width. On the phone, country selection sits above a horizontally scrollable city list, the illustration is centered below it, and interior history scrolls within the lower part of the screen. Story labels stay within the screen bounds. Actual narrow browser windows use this compact layout without requiring the mockup frame.

The frame references Samsung's published 163.6 × 78.1 mm proportions, with rounded corners and a small centered camera opening; it is an illustrative front-view mockup, not an exact hardware rendering. [Samsung S26 specifications](https://www.samsung.com/ie/support/mobile-devices/what-are-the-differences-between-the-galaxy-s26-ultra-s26-plus-and-s26/).

Phone preview does not emulate Android or change browser USB support. Live serial remains dependent on the desktop browser and its permissions.

## Browser and hosting

Web Serial requires desktop Chromium and a secure context: `localhost` or HTTPS. Visiting the page does not grant USB access; the presenter must select a port. Do not open the HTML directly with `file://`.

The deployed page runs on the presenter's computer and talks to its locally attached Arduino. Vercel does not connect to the board itself. The setup controls can stay hidden in presentation mode; the Outer / Interior switch and travel filters remain available.

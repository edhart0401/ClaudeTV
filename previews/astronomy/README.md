# Astronomy background comparisons

Local-only studies, pending Ed's choice. Production launcher source and TV are untouched.
All three backgrounds use existing ESO/NASA/ESA imagery, not generated artwork.
Credits and exact download sources are in sources.json and the comparison page.

```sh
npm run build:legacy
node previews/astronomy/prepare.mjs
npm run preview:legacy
```

Open http://127.0.0.1:8766/astronomy.html. Buttons switch backgrounds; normal
launcher arrow/Enter navigation remains available. `?background=deep-field` or
`?background=nebula` opens an option directly. Add `&clean=1` for screenshots
without comparison controls. Rebuilding removes this generated comparison page;
run prepare.mjs again to restore it. These studies are not included in the normal
TV build or its packaging.

Night sky: 1.2px softening, .72 opacity. Deep field: .6px, .8 opacity.
Nebula: 6px, .65 opacity. Each has the same lower-edge shade and .26 active
service ambience; the original logos, plate and strip remain unchanged.
These browser studies have not been performance-tested on the TV.

Checked all three 1920×1080 renders, image decoding, switch controls and launcher
navigation with Playwright. Original compatibility suite: 19 passed.

# Partridgeworks on webOS 3

This compatibility build retains the upstream Preact interface and remote navigation.
It installs as `dev.ed.partridge.launcher` (Ed’s Launcher), an ordinary Developer Mode
web app. It does not modify the stock launcher, remap Home, add a startup service,
root the TV, or invoke the Homebrew Channel. Press Home for LG’s interface. The More row’s Exit launcher tile closes this app;
webOS 3 does not provide the modern LG Home app ID used upstream.

## Build and test

Requires Node 22.18+ (native TypeScript stripping is used to read upstream design tokens).

```sh
npm ci --ignore-scripts
npm run build:legacy
npm run test:legacy
mkdir -p build
npx ares-package dist-legacy --no-minify -o build
```

The original `npm run build` remains available.
Compatibility adapters live in `compat/`; upstream TypeScript is unchanged.
The legacy build uses Babel for ES5 syntax, a separate preceding script for missing
runtime APIs, fixed CSS token values, a wrapping flex settings grid, and system fonts.
Polyfills must run first: esbuild captures Object.getOwnPropertyDescriptors in its
helper preamble, before regular imported module initialization.

Edit `compat/shortcuts.json` to change explicit app IDs, names, icons, and order, then
rebuild and reinstall. Defaults are YouTube, Netflix, Prime Video, BBC iPlayer, Browser.
Their availability is not probed. An unavailable app produces a launch error.
Existing app selections persist locally; add newly configured shortcuts in Settings.
Input labels and app IDs come from the TV’s EIM response. webOS 3 uses `activate`
rather than `connected`; both forms are handled. Automatic app discovery is deferred.

## Install, open, remove

Set up a device and its key using LG’s official Developer Mode instructions. Then:

```sh
npx ares-install -d DEVICE build/dev.ed.partridge.launcher_0.1.0_all.ipk
npx ares-launch -d DEVICE dev.ed.partridge.launcher
npx ares-install -d DEVICE --remove dev.ed.partridge.launcher
```

The app can also be deleted using LG Home’s normal app management. Developer Mode
must remain enabled and its session renewed; LG removes sideloaded apps after it expires
and Developer Mode is disabled. No credentials belong in the repository.

If Node cannot reach the TV but nc can, run `node scripts/tv-transport.mjs TV_IP`
and configure a separate CLI device at `127.0.0.1:19922`, user `prisoner`, using the
same Developer Mode key and passphrase. The relay listens only on localhost.

## Test app

`probe/` is a separate ES5 app (`dev.ed.launcherprobe`) with read-input, browser-launch,
and HDMI 1 buttons. Package/install it using the same CLI. It is removable independently.

## Verified on the LG 49UH610V, webOS 3.4.3-580512

- Probe executes inside Chrome 38 and reads input metadata through PalmServiceBridge.
- Legacy launcher renders its app, input, and More rows; screenshot visually checked.
- Settings uses flex layout and displays the configured shortcuts.
- Browser shortcut opens `com.webos.app.browser`, confirmed through the paired remote API.
- HDMI 2 shortcut switches to `com.webos.app.hdmi2`, independently confirmed.
- Local tests parse emitted JavaScript as ES5, reject unresolved CSS variables/Grid,
  exercise explicit shortcuts and old input payloads, and reproduce startup without
  Object.getOwnPropertyDescriptors.
- Exit launcher closes the app and returns to HDMI 2, confirmed through the paired remote API.
- Other streaming shortcuts are configured, not individually launch-tested.
- Physical remote/Home-button behavior needs user confirmation; no code intercepts Home.

## Sources

- https://github.com/partridgeworks/webos-launcher
- https://webostv.developer.lge.com/develop/getting-started/developer-mode-app
- https://webostv.developer.lge.com/develop/references/application-manager

## Living-room redesign (0.2.0)

The legacy build now uses `compat/home.jsx` as its entry, retaining upstream
TypeScript unchanged. Six explicit service cards are Netflix, Prime Video
(actual installed ID `lovefilm`), BBC iPlayer, YouTube, Disney+ and Nuvio Legacy.
A larger controller card opens `com.webos.app.hdmi2` and is labelled PlayStation 4;
no HDMI settings or console power commands are changed. The TV input list is not
shown. Settings (top left) opens LG's `com.palm.app.settings`; Exit (top right)
closes the launcher. The physical Home key stays with LG. Previous reorder/input
menus have been replaced by this fixed curated layout.

The screen uses a 1920×1080 canvas, two rows of three service cards and a tall PS4
card. Branding graphics are local vector/text artwork. The background, focus
highlights and transitions use Chrome-38-compatible CSS without network artwork,
CSS grid, variable fonts or backdrop filters. Clock formatting uses older string
operations because the TV does not provide String.padStart.

Remote navigation is explicit in `compat/navigation.js`; all nine buttons are
reachable by arrows. Enter activates the focused control, Back closes the app,
and the pointer supports hover/click. Initial focus is Netflix. Runtime errors
opening an app appear on screen without exposing service response details.

Verification: 15 automated tests pass, including ES5 parsing, old browser runtime
compatibility, exact curated service IDs and full remote-navigation reachability.
A 1080p browser preview was visually checked. The installed TV rendered all nine
buttons within its 1920×1080 viewport, focus began on Netflix, Right moved focus
to Prime Video, and clicking the PS4 card brought HDMI 2 to the foreground.
The Nuvio card was also exercised live and opened `space.nuvio.native.legacy`;
the redesigned launcher was reopened afterwards.

## Art Deco logo edition (0.3.0)

The next iteration removes the greeting, clock, header branding, section titles,
footer, separators, tile indices, descriptions and launch arrows. Settings and
Exit remain in their opposite top corners as labelled accessible icon buttons.
The same six streaming cards use enlarged centred marks. The PS4 tile contains
only a vector PS4 mark and still opens HDMI 2. Background artwork is the local
`public/backgrounds/art-deco.svg`: a repeating gold-line fan pattern on deep teal.
Gold focus rings complement the pattern. There are no remote image requests.

The packaged background URL has an automated path-resolution check. All fifteen
tests pass. A fresh 1080p preview was visually inspected; live TV inspection
confirmed nine buttons, Netflix focus, only service wordmarks in visible text,
and the correct app-local background URL. Navigation and app IDs are unchanged.

## Reference wallpaper and carousel (0.4.0)

The supplied Art Deco WebP is copied byte-for-byte into
`public/backgrounds/art-deco-reference.webp`. CSS uses a centred cover crop to
fill 16:9 without stretching; a translucent shade keeps logos legible.

All seven services now sit on a revolving 3D ring. Left/right rotate one slot
with a 420 ms transform transition and wrap continuously. The ring's angle is
accumulated, so crossing PS4/Netflix takes one step rather than spinning back
six. Up reaches a corner control; Down returns to the last app. Pointer click
opens the chosen tile and brings it forward; hover does not rotate the ring.
There is no idle auto-rotation. No extra labels or pagination were added.

Sixteen tests pass, including full keyboard reachability, wrap direction,
remembered app focus, and byte-identical packaged wallpaper. The preview was
visually checked, and the TV reported nine buttons, the correct wallpaper URL,
and changing intermediate matrix3d transforms during navigation. Animation
smoothness still depends on the TV GPU and should be judged on the actual TV.

## Four visible positions (0.5.0)

All seven services remain in the carousel, with exactly four shown at rest:
front (selected), right (next), rear (next after that), and left (previous).
The oval is viewed from above, using smaller side/rear cards for depth. Every
logo faces the viewer, including the rear card. Hidden services enter as the
selection advances. CSS translates/scales each card with 420 ms transitions;
no back faces or mirrored logos are shown. Corner controls and wrap navigation
remain available. Seventeen tests pass, including all seven active selections
having exactly one card in each of the four visible positions. The preview was
visually inspected and live TV inspection confirmed seven services with four
visible positions.

## Original carousel with supplied logos (0.6.0)

The four-position orbit is reverted to the original seven-slot 3D ring, showing
the selected card and its angled left/right neighbours. All seven services and
continuous wrap navigation remain. The supplied Netflix, Prime, BBC, YouTube,
Disney, Nuvio and PS4 files are copied unchanged into `public/logos/` and displayed
with object-fit contain. Hand-drawn/text logo substitutes are removed. The user's
Art Deco wallpaper is retained. Seventeen tests pass, including byte-identical
packaged logo assets; the browser preview was visually inspected and the TV's
image decode status checked for all seven files.

## Restored tiles and YouTube background (0.7.0)

Restored six streaming tiles in two rows, with the larger PS4 tile on the right
and the original grid arrow navigation. Supplied logos and reference wallpaper
are retained. Images use width 100%, height auto and vertical centring, preserving
native proportions without relying on old-browser object-fit support. YouTube
has a white tile background. A CSS contrast filter maps the supplied artwork's
pale checkerboard to white while retaining the red/black logo; source files are
unchanged. Sixteen tests pass. A fresh preview was visually inspected; live TV
inspection confirmed the six tiles plus PS4, all seven images loaded, a white
YouTube background and the expected filter and square image dimensions.

## Spotlight preview (0.8.0, local only)

A large selected-app plate sits above a strip showing all seven supplied logos.
Midnight blue, bronze focus marks and service-colour ambience replace the dominant
wallpaper; the supplied Deco image remains as faint texture. Settings and Exit
retain their upper corners. No greetings, captions, numbered tiles or arrows.

Run `npm run build:legacy`, then `npm run preview:legacy`; open
http://127.0.0.1:8766. Left/right selects and wraps; Enter opens the selected app.
Down reaches its strip tab; Up returns to the plate, then the corner controls.
Pointer selection uses the strip, followed by the large Open action. Browser
actions display a local simulation message without contacting the TV.

Navigation state lives in `compat/home-model.js`. Keyboard changes are immediate;
pointer artwork/ambient opacity transitions last 160 ms and respect reduced motion.
The fixed 1920×1080 TV canvas scales intact for laptop/phone previews; it is not
a separate mobile interface. DESIGN.md records the actual visual system and
`.impeccable/asset-provenance.json` records the supplied raster sources.

Validation: 19 automated tests pass, including ES5 output and exact app IDs.
Playwright checked all seven selections, wrapping, rapid input, corner/strip
focus, Tab order, decoded artwork and reduced motion. A mocked PalmServiceBridge
checked loading, duplicate suppression, launch failure and retry without TV access.
1920×1080 and 1440×810 previews were visually reviewed; a scaled phone preview
was checked for intact framing. Independent finish review: ship, no material fixes.
This version has not been installed or performance-tested on the actual TV.

## Selected Deep Field background (0.8.1, local only)

Ed selected the Hubble Ultra Deep Field from the three astronomy previews.
The downloaded JPEG is unchanged; CSS applies .6px static blur, .8 opacity,
lower-edge shading and .26 app-colour ambience. Original artwork credit:
NASA, ESA, S. Beckwith (STScI) and the HUDF Team;
https://esahubble.org/images/heic0406a/. No TV deployment in this iteration.

## App artwork background (0.9.0, local only)

The selected app's original local artwork becomes a full-screen softened
background. CSS transitions only opacity over 280ms, including remote selection;
focus and the main card still respond immediately. Interrupted transitions
retarget naturally, and reduced motion disables them. Static 12px blur is
applied to a quarter-resolution surface enlarged fourfold. A dark overlay
keeps controls visible with bright artwork. No new assets or network calls.
Browser checks covered intermediate opacity, seven distinct artwork sources,
rapid input and reduced motion. TV GPU smoothness remains unverified.

## Seamless artwork and unified fade (0.9.1, local only)

Removed the large plate border, radius, shadow and opaque button fill. Artwork
uses a prefixed/unprefixed radial alpha mask plus screen blending to merge its
edges with the backdrop. Foreground artwork now crossfades for keyboard as well
as pointer selection, synchronised with the background at 420ms. This fixes the
previous keyboard foreground snap. Reduced motion disables both fades.
YouTube's hero uses CSS contrast/inversion/hue correction to remove its baked
white field; strip artwork remains white and source images remain unchanged.
Browser regression checks cover the absent frame and keyboard foreground fade.
The test slows transitions to sample intermediate opacity reliably under load;
this checks behaviour, not real-device frame rate. Actual TV rendering is pending.

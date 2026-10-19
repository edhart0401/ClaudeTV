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

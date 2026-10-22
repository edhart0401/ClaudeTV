# ClaudeTV

A personal launcher for an LG TV, adapted from
[Partridgeworks’ webOS Launcher](https://github.com/partridgeworks/webos-launcher)
for **webOS 3 / Chrome 38**. Built and tested on an **LG 49UH610V running
webOS 3.4.3-580512**.

Seven everyday destinations sit along the bottom of the screen. Selecting one
crossfades to its artwork, with the logo kept compact above the buttons and its
background extended across the screen. Settings and Exit sit in the top corners.

The launcher is an ordinary, removable **Developer Mode app**. It requires no
root access and leaves LG’s physical Home button available. An optional helper
on the Mac opens the launcher when the TV comes online.

## Current version

**0.10.2**, installed and opened successfully on the TV. The repository tag is
[`v0.10.2`](https://github.com/edhart0401/ClaudeTV/tree/v0.10.2).
The installed app is still named **Ed’s Launcher**, with ID
`dev.ed.partridge.launcher`; renaming the repository does not change that ID.

This is a household setup for one tested TV, not a universal replacement launcher.
Other firmware, regional app IDs and devices have not been verified.

## Apps and controls

| Destination | App ID |
| --- | --- |
| Netflix | `netflix` |
| Prime Video | `lovefilm` |
| BBC iPlayer | `bbc.iplayer.3.0` |
| YouTube | `youtube.leanback.v4` |
| Disney+ | `com.disney.disneyplus-prod` |
| Nuvio Legacy | `space.nuvio.native.legacy` |
| PlayStation 4 / HDMI 2 | `com.webos.app.hdmi2` |

The apps must already be installed; this launcher opens them rather than installing
or providing their content. PS4 selects HDMI 2.

| Control | Action |
| --- | --- |
| Left / Right | Select an app; wrap at either end |
| OK / Enter | Open the selected app |
| Up | Move from the apps to Settings |
| Left / Right in the top corners | Switch between Settings and Exit |
| Down from a corner | Return to the selected app |
| Pointer click | Select and open an app, or activate a corner control |
| Back / Exit | Close the launcher |
| Physical Home | Open LG’s normal interface |

Initial selection is Netflix. Background transitions respect reduced motion in
browsers that support that preference.

## Build and preview locally

Requires **Node 22.18+**, npm, and Python 3 for the preview server.

```sh
git clone git@github.com:edhart0401/ClaudeTV.git
cd ClaudeTV
npm ci --ignore-scripts
npm run build:legacy
npm run test:legacy
npm run preview:legacy
```

Open **http://127.0.0.1:8766**. Browser launch actions show a simulation message;
they do not contact the TV. The fixed 1920×1080 TV canvas scales to fit the browser.

The compatibility build writes `dist-legacy/`, using ES5 JavaScript, a classic
script entry, older-browser polyfills and compatible CSS. The current test suite
has **19 tests** covering compatibility, artwork packaging, navigation and the
Mac helper. A separate browser check lives in
[tests/browser/artwork-background.js](tests/browser/artwork-background.js) and can
be run through Playwright MCP’s `browser_run_code_unsafe` file option.

## Package and install on the TV

Install and enable LG’s Developer Mode app, enable its key server, and configure
a device and key using the webOS CLI. The Mac and TV must be reachable on the
same local network. Replace `YOUR_TV` below with your configured device name.

After building and testing:

```sh
mkdir -p build
npx ares-package dist-legacy --no-minify -o build
npx ares-install -d YOUR_TV build/dev.ed.partridge.launcher_0.10.2_all.ipk
npx ares-launch -d YOUR_TV dev.ed.partridge.launcher
```

Keep the Developer Mode session valid. To remove the launcher, delete it through
LG’s app management or run:

```sh
npx ares-install -d YOUR_TV --remove dev.ed.partridge.launcher
```

The version and compatibility app ID are set in
[compat/build.mjs](compat/build.mjs). See [the webOS 3 notes](docs/WEBOS3.md) for
the tested setup, inspector tools and localhost relay workaround.

**Use the `:legacy` build above for ClaudeTV.** The retained upstream commands
`npm run build`, `npm run package` and `npm run deploy`, plus the existing GitHub
build/release workflows, still target the original webOS 6 app. They do not
produce the ClaudeTV package described here.

## Open automatically when the TV turns on

The optional Mac helper watches the paired TV’s connection and power state, then
opens the launcher after a detected power cycle. It runs while the Mac is awake,
Ed is logged in, and the TV is reachable. It uses the paired remote-control API;
an ongoing SSH connection is not required.

The helper establishes a baseline when it starts so it does not interrupt a TV
already in use. A prolonged network outage can still resemble a power cycle.
Setup details, installed LaunchAgent paths, logs and enable/disable commands are
in [docs/MAC-AUTOSTART.md](docs/MAC-AUTOSTART.md).

Pairing keys, Developer Mode keys and local device configuration are private;
they do not belong in this repository.

## Changing the launcher

- Streaming destinations and order: [compat/shortcuts.json](compat/shortcuts.json).
- PS4 shortcut, navigation and logo sizing: [compat/home-model.js](compat/home-model.js).
- Interface and launch handling: [compat/home.jsx](compat/home.jsx).
- Styling and transitions: [compat/legacy.css](compat/legacy.css).
- Original supplied artwork: [public/logos/](public/logos/).
- Current design notes: [DESIGN.md](DESIGN.md).

App IDs are explicit; there is no automatic installed-app discovery in this build.
Artwork sizing is configured for the supplied files, so replacing a logo can also
require updating its scene dimensions. Upstream TypeScript remains under `src/`;
ClaudeTV’s interface is implemented in the JavaScript compatibility layer.

Earlier astronomy background studies are retained under
[previews/astronomy/](previews/astronomy/). They are optional local comparisons,
not the installed launcher’s active design.

## Credits and licence

ClaudeTV builds on **Partridgeworks’ webOS Launcher**. The original implementation
is retained in this repository and its Git history; this fork adds the webOS 3
compatibility layer, household interface and Mac startup helper.

Code is licensed under [MIT](LICENSE). Dependency and upstream asset notices are
in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). App logos belong to their
respective owners and are not covered by the code licence. Artwork source records
are in [.impeccable/asset-provenance.json](.impeccable/asset-provenance.json) and,
for the astronomy studies, [previews/astronomy/sources.json](previews/astronomy/sources.json).

ClaudeTV is not affiliated with LG, Partridgeworks or the featured app publishers.

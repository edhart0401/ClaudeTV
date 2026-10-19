# Mac launcher autostart

The Mac login agent `local.ed.tv-launcher` polls the paired TV power-state API
through a localhost-only macOS nc relay. It opens `dev.ed.partridge.launcher`
after two consecutive inactive/unreachable samples followed by Active. Online power checks are 500 ms apart over a persistent paired connection.
When disconnected, connection attempts have a one-second TCP timeout and a
250 ms pause between attempts (two-second overall pairing deadline). After
confirmed disconnection, successful pairing immediately sends the launch request
before querying power state. SSH is not used.
It does not change TV startup settings, root access, or the Home button.

The first observation establishes a baseline, avoiding an unwanted app switch
when logging in while the TV is already in use. A gap over 60 seconds resets this
baseline on Mac wake. Up to three launch attempts, one second apart after rejection, accommodate startup delays. A prolonged
network outage can resemble TV power-off and cause a launch on reconnection.

Installed files:
- `~/Library/Application Support/Ed TV Launcher/mac-autostart.mjs`
- `~/Library/Application Support/Ed TV Launcher/pairing.json` (private, mode 600)
- `~/Library/LaunchAgents/local.ed.tv-launcher.plist`
- `~/Library/Logs/Ed TV Launcher/helper.log` and `error.log` (no pairing keys logged)

The login agent runs `/opt/homebrew/bin/node` with the script and pairing path,
using RunAtLoad and KeepAlive. It runs while Ed is logged in and the Mac is awake
on the TV network. TV IP changes or revoked pairing require updating pairing.json.
The launcher still requires a valid TV Developer Mode session.

Disable (does not uninstall the TV launcher):

```sh
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/local.ed.tv-launcher.plist
```

Re-enable:

```sh
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/local.ed.tv-launcher.plist
```

Verification: eleven automated tests pass, including startup baseline, one launch
per power cycle, transient failure suppression and Mac-wake behavior. The live TV
returned Active, an explicit launch succeeded, and the foreground app changed to
the launcher. launchctl reports the agent running. Actual standby/on transition
remains to be confirmed with the physical remote; the helper does not power-cycle
the TV itself during installation.

## Startup timing capture

`scripts/tv-startup-monitor.mjs PRIVATE_PAIRING_PATH` passively logs JSON lines
for remote socket readiness, pairing completion, power-state changes and foreground
app changes. It polls over one persistent connection every 250 ms, reconnecting
when the TV disconnects. The helper separately logs power observations, request
duration, launch send and launch acknowledgement timestamps. Pairing secrets are
never logged. The baseline trace used the original five-second interval; the fast helper
now records its own foreground transitions at 500 ms intervals.
LG's Home menu can be an overlay without a foreground-app change, so its visual
appearance may need a user observation or a video to establish an exact timestamp.
Stop the temporary monitor after the experiment to end its frequent polling.

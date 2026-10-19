# SlopBro compatibility and recovery review

Reviewed 2026-10-20, without executing the exploit, serving its payloads, removing
Developer Mode, installing Homebrew Channel, or changing TV settings.

## Scope and pinned source

TV: LG 49UH610V-ZB, firmware 05.70.50, webOS TV 3.4.3-580512.
LG's system API reports sdkVersion 3.4.0 and board K2L_DVB_EU.
The TV's Node interpreter reports v0.12.2 (read-only version check).

Source: throwaway96/slopbro commit 21023d56ca424607bb03d2939609cc658c655fc7.
Local checkout: /Users/ed/test/slopbro-review.
Dependent installer: webosbrew/webos-homebrew-channel v0.7.3.
This is a source review, not a safety certification or verified rooting procedure.

## Compatibility

The author describes possible support back to webOS 3.4.2, while confirmed README
successes cover 4–11. No 49UH610V/webOS 3.4.3 success report was found in the reviewed
SlopBro issue list. The dashboard project records a rooted 43UH610V-ZB on webOS
3.4.3/05.70.50, but does not identify its rooting method. A report for a sibling
model is not an exact-device exploit confirmation.

Compared the pinned TARGET_APPS table to our saved 94-app inventory without
launching any target:

| Candidate for major version 3 | Installed |
|---|---|
| com.webos.app.adoverlayex | No |
| com.webos.app.adoverlay | No |
| com.webos.app.acroverlay | Yes |
| com.webos.app.tinybrowser | No |
| com.webos.app.dangbei-overlay | No |

This clears only app presence. It does not prove that this app accepts a supplied
URL, that it has the required Luna privileges, that jsserver is vulnerable, or
that persistence will work. The selector filters on major version, not exact
firmware. Automatic webOS version detection is disabled in this revision.

## Rooting is also installation

The chain loads a page in a privileged TV app, downloads a fake service package and
a shell script, and asks jsserver to execute it. The supplied main.js invokes
/bin/sh through execFileSync. The shell script then automatically:

- Changes /var/luna/preferences/devmode_enabled into a directory.
- Restarts the app installer and installs Homebrew Channel 0.7.3.
- Elevates Homebrew Channel by changing service/role permission definitions.
- Examines Developer Mode startup script signing and can rename an invalid script
  to .backup to prevent deletion of developer apps.
- Warns that LG's Developer Mode app must be removed before rebooting.

There is no documented supported mode that proves temporary root and stops before
perform_root. The --test-server simple mode checks HTTP reachability only; it is
not an exploit dry run. The payload test-server mode serves the actual exploit
files and must not be mistaken for a harmless preview.

The desktop program's success message only means all tracked files were requested;
it does not independently verify uid=0, Homebrew installation, or reboot persistence.
An execution timeout/desktop interruption likewise does not prove TV-side work stopped.

## Persistent Homebrew behavior

The v0.7.3 startup script can start passwordless root telnet by default unless its
disable flag exists. SSH is optional and defaults to a shared password unless keys
have been provisioned. It also bind-mounts shadow/passwd/motd as needed, blocks some
diagnostic upload paths, and runs user startup hooks. Update-host blocking is
conditional on a flag. These are broader effects than simply granting a shell.
The elevation code explicitly handles legacy Luna service/role layouts, but this
alone does not validate the entire chain on our firmware.

## Recovery limits

- Homebrew's startup failsafe detects some interrupted boot customizations and
  exposes an emergency telnet shell while skipping normal startup customizations.
  It depends on boot reaching that hook and the network/access path functioning.
- No --unroot/transactional rollback routine was found in this SlopBro revision.
  EXIT traps remove a lock file; they do not undo installation or permission changes.
- An open issue requests clean reversal and describes trouble removing persistence.
  Its author's claim that factory reset fully restores stock is a user report,
  not a verified guarantee for this TV.
- RootMyTV's security notice explicitly warns that factory reset can fail to undo
  certain filesystem modifications, and that damage to signed system partitions
  can require storage-chip reprogramming or a mainboard replacement.
- The current developer snapshots contain inventory, not full partition images.
  They cannot recover a TV that no longer boots or accepts network connections.
- LG Developer Mode is installed and is our working access method. Removing it to
  accommodate root changes that access arrangement and risks sideloaded-app cleanup;
  preserve local app packages before any approved migration.

## Recommendation

Do not run the stock root-and-install command as a routine debloat step. Compatibility
is plausible, but exact-device success and reliable recovery are unverified.
The next bounded, non-exploit experiment would be a separately authored inert page
served through the candidate app to check URL loading and bridge availability. It
would prove only the entry-app stage, and must not serve SlopBro's index/payload files.
A supported temporary-root/stop boundary or exact-hardware maintainer guidance and a
model-specific recovery route remain desirable before an actual rooting decision.
No arbitrary cleanup commands, factory reset, firmware downgrade, hardware work,
or removal of Developer Mode is authorized by this review.

## Sources

- https://github.com/throwaway96/slopbro/tree/21023d56ca424607bb03d2939609cc658c655fc7
- https://github.com/throwaway96/slopbro/issues/14
- https://github.com/webosbrew/webos-homebrew-channel/blob/v0.7.3/services/startup.sh
- https://github.com/webosbrew/webos-homebrew-channel/blob/v0.7.3/services/elevate-service.ts
- https://rootmy.tv/warning
- https://github.com/gnacho/lg-webos-dashboard#tested-tvs

# LG 49UH610V debloat feasibility assessment

Read-only assessment, 2026-10-20 (Europe/London). Firmware reported previously:
webOS 3.4.3-580512. No packages, settings, services, launchers, or update policies
were changed during this assessment. Local snapshots are in `/Users/ed/test/tv-debloat/`.
They are not a restorable firmware image or complete settings backup.

## Conclusion

Inventory and baseline measurement work. Android-style package disabling is not
available through the tested Developer Mode account. Existing community webOS ports
of the Android projects explicitly omit the debloat step for this reason. This is
not proof that no undocumented firmware-specific method exists; no supported,
verified reversible system-package disable method has been established here.
Root/exploit investigation and system changes are outside this assessment.

## Evidence from this TV

- Developer SSH identity: `prisoner`, UID 6091; `CapEff` and `CapPrm` both zero.
- `pm`, `systemctl`, `initctl`, and `ls-control` were absent from the developer PATH.
- System application directories and hosts/init locations are not exposed in the
  developer filesystem view. The current developer app directory is accessible.
- Full process metadata is visible with `ps -eo ...`; the default plain `ps` only
  showed the developer user's processes. Visibility does not imply control.
- The separately paired remote API returned 94 app records: 82 marked system and
  non-removable, 12 marked removable and non-system. These flags are inventory
  metadata, not a promise that the developer account can uninstall every such app.
- Names include Advertisement, Brand Shop, Store Demo, and multiple LivePlus
  components. Presence alone establishes neither active work nor expendability.
- Netflix was the largest resident process in the snapshot (~128 MiB RSS). Other
  large entries were the web engine, compositor, and renderer. An ACR-named process
  was also present (~7.7 MiB RSS). Identity/dependencies were not independently
  verified. RSS includes shared pages; these numbers cannot simply be added or
  treated as memory recoverable by removing packages.

## Read-only settings observations

The TV returned `on` for all of:

| Category | Key | Candidate next step |
|---|---|---|
| option | livePlus | Review the TV's Live Plus/privacy setting |
| option | webOSPromotionVideo | Review promotion setting |
| general | homePromotion | Review Home promotion setting |
| general | homeAutoLaunch | Leave alone unless startup behavior is being changed |

The keys were readable through PalmServiceBridge in the installed developer app.
Read access does not establish write permission, prove that a feature is currently
running, or prove the exact menu behavior on this firmware. No setting writes were
attempted. LG's public Settings Service documentation documents retrieval; a direct
write workflow has not been validated here.

## Practical next step

Review Live Plus and advertising/promotion controls in the TV's normal menus first,
record their exact original values, and verify changes by reading the settings back.
Check sound, physical Home/Inputs buttons, HDMI, and streaming apps afterward.
Measure under the same foreground app and comparable warm-up conditions. Do not
promise an Android-like speedup or RAM gain from merely hiding launcher tiles.
Optional removal of unused user apps is a separate decision; preserve Developer Mode
and the custom launcher if they are still wanted. Do not disable root-owned processes,
edit startup files, or apply Android package lists.

An incidental inventory finding: this TV's Prime Video app ID is `lovefilm`, while
the initial explicit launcher shortcut uses `amazon`. Correcting that shortcut is
separate from debloating; no launcher change was made during this audit.

## Limits and collection errors

The directory probe produced no listings for hidden system locations. `df` returned
useful mount information but exited nonzero due to an inaccessible Netflix jail
path; its nonzero result is retained in the snapshot. This is not evidence of a full
or corrupt system partition. Some mounted system images report 100% usage by design.
The first app-list export failed and was rerun successfully with reduced metadata.
Memory snapshots lack `MemAvailable`; low MemFree alone is not evidence of a leak.
Swap allocation alone does not measure active swapping or interactive latency.

## Sources

- https://github.com/OmkarK97/webos-vibehack (explicitly no ADB-style debloat step)
- https://www.webosbrew.org/develop/guides/vocabulary/ (jail versus elevation)
- https://webostv.developer.lge.com/develop/references/settings-service

## Memory snapshot (MiB)

- MemTotal: 1075.9
- MemFree: 31.8
- Buffers: 67.8
- Cached: 137.1
- SwapTotal: 600.0
- SwapFree: 339.1

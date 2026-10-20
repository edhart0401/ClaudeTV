---
name: Projection Room Launcher
description: Quiet TV controls around recognisable service artwork.
colors:
  bronze: "#c9ac79"
  midnight: "#101722"
  ivory: "#f7f4ed"
  plate: "#080b12"
  muted-control: "#c3c8cf"
  preview-label: "#a8b3c5"
  focused-control: "#293649"
  pressed-control: "#364459"
  hovered-control: "#202d40"
  notice: "#273449"
typography:
  label:
    fontFamily: "'Helvetica Neue', Arial, sans-serif"
    fontSize: "16px"
    letterSpacing: "0.04em"
  body:
    fontFamily: "'Helvetica Neue', Arial, sans-serif"
    fontSize: "21px"
  status:
    fontFamily: "'Helvetica Neue', Arial, sans-serif"
    fontSize: "22px"
rounded:
  plate: "16px"
  choice: "12px"
  marker: "2px"
  utility: "50%"
spacing:
  strip-margin: "16px 14px 0"
  notice-padding: "18px 24px"
  status-padding: "20px"
components:
  selected-service:
    backgroundColor: "{colors.plate}"
    rounded: "{rounded.plate}"
    width: "736px"
    height: "414px"
    padding: "0"
  app-choice:
    backgroundColor: "{colors.midnight}"
    rounded: "{rounded.choice}"
    width: "160px"
    height: "100px"
    padding: "0"
  corner-action:
    textColor: "{colors.muted-control}"
    rounded: "{rounded.utility}"
    width: "68px"
    height: "68px"
    padding: "0"
  home-notice:
    backgroundColor: "{colors.notice}"
    textColor: "{colors.ivory}"
    typography: "{typography.body}"
    rounded: "{rounded.choice}"
    padding: "{spacing.notice-padding}"
---

# Design System: Projection Room Launcher

## Overview

**Creative North Star: "Projection Room"**

A modern, dynamic and clean launcher built around supplied service artwork. Midnight surfaces and soft brand-colour light keep the controls quiet while the selected destination remains recognisable. The metaphor describes the implemented palette and depth, rather than an independently approved visual comp.

The user confirmed a large selected app and a small strip showing all seven. That home composition belongs to the surface contract in `.impeccable/surfaces/compat-home-jsx.md`; this document records its implemented visual vocabulary. Evidence is `compat/legacy.css`, `compat/home.jsx` and `compat/home-model.js`.

**Key Characteristics:**
- Recognisable raster service identities with preserved proportions.
- Warm selection markers against dark blue surroundings.
- Immediate remote focus, with brief pointer-only crossfades.
- Operational text only; the logos carry the visual identity.

## Colors

A restrained midnight-and-bronze interface surrounds the services' own colours.

### Primary
- **Bronze:** the selected plate keyline, selected strip underline and focused utility border.

### Neutral
- **Midnight:** page and canvas ground.
- **Ivory:** status text and the focused strip outline.
- **Plate:** fallback behind supplied service artwork.
- **Muted Control / Preview Label:** quiet utilities and local-preview identification.
- **Focused / Pressed / Hovered Control:** utility interaction surfaces.
- **Notice:** feedback surface.

Service-specific backgrounds remain owned by the supplied identities: black Netflix, navy Prime, near-black iPlayer, deep blue Disney+, dark Nuvio, blue PS4 and white YouTube. `home-model.js` supplies the seven radial ambient colours. These are per-service data, not additional general-purpose accents.

**The Selection Key Rule.** Bronze denotes selection; ivory around a strip item denotes focus. Preserve this distinction when focus moves away from the selected plate.

## Typography

**Body and Label Font:** Helvetica Neue, with Arial and sans-serif fallbacks.

There is no display type role. The system stack serves the local-preview label and transient operational feedback. Service lettering is supplied raster artwork, not recreated with text.

### Hierarchy
- **Label:** local-preview identification; normal case and modest tracking.
- **Body:** transient notices, centred within a compact feedback surface.
- **Status:** the opening message over the selected artwork.

**The Artwork Identity Rule.** Keep service names in their supplied artwork; do not typeset substitute logos.

## Layout

The home uses a fixed TV canvas (1920×1080). The preview scales the entire canvas uniformly by the smaller viewport-to-canvas ratio and centres it on both axes. There are no viewport reflow breakpoints. Narrow-screen previews are proportionally reduced TV compositions, not a separately designed mobile interface.

Utilities sit at opposite upper corners, inset horizontally (88px) and vertically (58px). The selected plate is centred horizontally at top (205px). The strip begins at (292px, 764px), spans (1336px), and centres all seven choices in one row. Choice spacing comes from the recorded strip margins. Feedback sits above the lower edge (46px), with horizontal insets (460px).

## Elevation & Depth

Diffuse shadows lift the selected plate above the dark canvas. The selected app's supplied artwork fills a blurred background layer. Seven local layers stay mounted; CSS crossfades their opacity over (280ms), with no queued animation or delayed selection. Artwork is painted on a (528×318) surface, blurred (12px) and enlarged fourfold. A dark gradient preserves utility/strip contrast even for YouTube's white artwork. No blur or layout property animates. Reduced motion removes the crossfade. Deep Field remains a retained alternative asset, not the active background.

### Shadow Vocabulary
- **Selected plate:** `0 30px 70px rgba(0,0,0,.36)`.
- **Projected floor:** `0 24px 65px 24px rgba(0,0,0,.24)` on a shallow ellipse below the plate.

Pointer interaction crossfades artwork and ambient opacity over (160ms ease-out). Remote navigation changes immediately. Reduced-motion preference removes the transitions.

## Shapes

Service plates are gently rounded rectangles; small choices use the tighter choice radius. Focused strip outlines extend (5px) outside each item and use the plate radius. Utility controls are circles with simple stroked SVG icons (28px, stroke 1.5). Selection underlines are short rounded bars (3px high). Artwork uses centred containment without changing its aspect ratio.

## Components

### Selected service

A large image-led launch button. Its bronze inset outline is visible while the large action has focus. An opening overlay uses the darkest plate colour at (.92) opacity. All service images remain mounted; the active artwork layer becomes visible. The supplied YouTube raster receives the implemented CSS contrast treatment (`contrast(2)`), while its original asset file stays unchanged.

### App navigation

A compact row of seven tab buttons. Default opacity is (.84); selected, hovered and focused choices reach full opacity. The selected choice keeps its bronze underline. Focus adds a separate ivory outline. Arrow navigation wraps; moving focus into the strip selects that item. Pointer clicking an item selects it; the large button opens the selected app. Accessible names identify the otherwise image-only controls.

### Utility buttons

Circular, transparent controls for Settings and Exit. Focus adds the focused-control surface and bronze border; press uses the pressed-control surface. Fine-pointer hover uses the hovered-control surface and white icon. The control shape and icon remain stable across states.

### Feedback

A rounded, centred live-status notice appears for local-preview actions or launch failure. Opening feedback overlays the large plate. Neither introduces permanent descriptive copy into the launcher.

## Do's and Don'ts

### Do:
- **Do** preserve supplied logo proportions and the white YouTube background.
- **Do** maintain separate selection and focus signals.
- **Do** keep keyboard response immediate and honour reduced motion.
- **Do** verify this TV composition at its native canvas and proportionally scaled previews.

### Don't:
- **Don't** add greetings, promotional text, tile numbers or decorative arrows to this launcher.
- **Don't** substitute invented logos or introduce a display font for operational labels.
- **Don't** infer mobile reflow or hardware performance guarantees from local scaled screenshots.

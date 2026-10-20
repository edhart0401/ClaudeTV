# Launcher design

The selected app’s original image is the scene. Seven app buttons remain in one
strip near the bottom; Settings and Exit remain at the top corners. There is
no central card, separate hero image, mask, blend mode, shadow or blur.

The fixed 1920×1080 canvas scales uniformly for local previews. Each background
uses its original supplied logo image, centred with `background-size: contain`
and no repetition. Its brand background fills any remaining area, preserving
image proportions and the complete wordmark. YouTube retains the contrast
treatment that maps its supplied checkerboard to white.

Background opacity crossfades over 420ms cubic-bezier(.4,0,.2,1). Selection and
launch targets update immediately. Reduced motion disables the fade.

Seven buttons: 160×100, radius12, margins16px14px, strip position292px764px.
Selected underline: bronze #c9ac79, 3px high. Focus: ivory #f7f4ed, 2px outline
5px outside the button. YouTube’s white scene uses dark #343943 utilities and
focus markers. Utilities:68px circular targets,28px stroked icons.

Remote Left/Right wraps through seven apps, Up reaches Settings, Left/Right
switches utilities, Down returns to the remembered app. Enter launches; pointer
click launches the tile. Focus begins on Netflix. The main scene is decorative.

Existing logo files stay unchanged. Local browser launch actions are simulated.
Actual TV rendering/performance of this iteration remains unverified.

# DualSense Explorer — Anatomy L2 v2

New additive release: `../anatomy-l2-v2.html` and `../anatomy-l2-v2-light.html`. Earlier root pages are untouched.

## Original Anatomy kit and arcade starting point

`kit/iso-kit.mjs`, `kit/lathe.mjs`, `kit/tube.mjs`, `kit/audit.mjs` and `scripts/` are copied unchanged from the installed wheresryan22/anatomy skill. The original MIT license is retained as `ANATOMY-LICENSE`.

The starting reference is `examples/arcade-cabinet/`: its arbitrary-axis panel/prism renderer is adapted as `concavePaths` in `scene.mjs`. Its shared build/runtime geometry pattern, recorder/settle/audit pipeline, kit plate/page framing, and moving geometry in settled slots are retained. This is new trigger geometry; the arcade cabinet itself is not included.

`model.mjs` drives all angles, motor turns, captions and the 24-second tour. `scene.mjs` builds the exact same solids in Node and in the browser. The build embeds the unmodified original kit source in one standalone HTML; it needs no network requests, dependencies, WebGL or controller connection when opened.

## Build and checks

Node >=20.10:

```
node build.mjs --audit
node build.mjs --light --audit
node verify.mjs
node scripts/capture.mjs ../anatomy-l2-v2.html --out desktop.png
node scripts/capture.mjs ../anatomy-l2-v2.html --width 390 --out phone.png
node scripts/lines.mjs ../anatomy-l2-v2.html --out lines.png
node scripts/lines.mjs ../anatomy-l2-v2-light.html --out lines-light.png
```

`verify.mjs` audits the actual scene at 49 time samples (0–24 s, 0.5 s spacing), using the same fixed settled painter order as the page. It also verifies inlined kit execution, coordinated kinematics, periodicity, and the full-pull contact point. Sampled poses are not a continuous swept-volume proof. `AUDIT.txt` and `VALIDATION.txt` record results and limitations. No exploded mode or shader is implemented, so their checks do not apply.

## iPad/Safari design

Classic inline script, SVG, Pointer-compatible native buttons/range inputs, responsive layout, 44-pixel controls, no CDNs or ES-module fetches. Keyboard: Space pauses, arrows scrub, Home returns to rest. Reduced motion disables initial autoplay. Animation time stops when the drawing is offscreen or the document is hidden. Both themes are available in either HTML.

The code targets modern Safari on iPad; physical Safari/iPad verification was unavailable. The original Chromium capture/line-end tools were attempted but could not start because Chrome is absent; an official Playwright download failed with a truncated archive. Do not interpret those checks as passed.

## Mechanical truth and limits

PlayStation verifies programmable resistance for L2/R2. iFixit's original teardown directly shows motor → worm → circular wheel → opposing lever, plus passive trigger pivot/spring. Its detailed photographed mechanism is R2; this page explains the principle for L2 without asserting a verified mirror geometry or all hardware revisions.

All displayed dimensions, tooth profiles, axial arrangement, support frame, winding, 14-degree travel, 20:1 worm reduction and 1:1 gear pair are conceptual. Gears have explicit display clearance. The helical flight is faceted. The return is represented symbolically by a ring at the pivot. There is no torque/current/friction/compliance calibration, real-time controller command, or claim of a Sony CAD model. The quasistatic moment equation describes the principle, not measured DualSense forces.

Sources:
- https://blog.playstation.com/2020/11/09/ps5-the-ultimate-faq/
- https://www.ifixit.com/Teardown/PlayStation+5+Teardown/138280 (steps 16–17)
- https://www.ifixit.com/Guide/Sony+DualSense+Controller+Trigger+Assembly+Replacement/142071

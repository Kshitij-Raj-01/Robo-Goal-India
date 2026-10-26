# Asset provenance

- `images/stadium-source.png`: original image generated for this project using the built-in imagegen tool. Photorealistic robotic sports stadium concept, not documentary event photography.
- `images/stadium.webp`: optimized derivative of the original concept image.
- `images/robo-goal-event.webp`: genuine event photograph, optimized without generative edits from `C:/Users/hs/Desktop/Robotic-Sir-Community/tmp/rgi-tour-proposal/assets/rgi-action-2.jpg`. Shows student-built soccer robots on the event's green pitch. Used on the homepage, About page, soccer card and social preview; replaces the generated stadium in these placements.
- `src/app/icon.svg` and CSS wordmarks: original code-native Robo Goal India identity concept.
- `images/robotic-sir-logo.webp`: official Robotic Sir transparent wordmark downloaded unchanged from `https://roboticsir.com/Main%20logo-transparent.webp` on 26 October 2026. Displayed on a white plate for clear contrast on the dark website.
- `images/intro-poster.webp`: a frame captured from this repository's own procedural WebGL scene, compressed to WebP as the first-paint cover while the 3D renderer prepares. It contains no external model or video footage.
- Intro: procedural Three.js model authored in `src/lib/intro-scene.ts`; no third-party 3D model.
- India map: stylized schematic authored for the tour visualization; not an authoritative boundary map.
- Interface icons: Lucide, ISC licensed.
- Barlow / Barlow Condensed fonts: SIL Open Font License, bundled locally through Fontsource. No external font request is required.

The event photograph was located in the organizer's related Robotic Sir repository. Other unpublished galleries, sponsor/partner collections, portraits and team records remain empty rather than fabricated.

## Organizer-supplied India map
`maps/india-organizer.png` is the exact image supplied by the organizer on 24 October 2026. The SVG display removes its white background with a color filter; it does not redraw or generate boundaries. Fixture coordinates remain in the 600 × 590 map viewport. Image placement is x=-160, y=-20, width=900, height=643; calibrate new fixture markers against this supplied map.

## Cinematic engineering model
The opening uses locally authored Three.js geometry inspired by `rgi-action-2.jpg` and `rgi-action-6.jpg` in the related repository: low sheet-metal chassis, metal scoops, perforated orange rubber wheels, pale nylon hubs, DC motors, taped battery, exposed Arduino-style controller, MOSFET driver and wiring. It is an illustrative engineering model, not a photogrammetric scan or exact replica. Scratched metal, silkscreen labels and tape textures are local canvas work. Materials use environment reflections, ACES tone mapping and stadium shadows. The football uses spherical pentagon/hexagon panels. After the goal and confetti, hardware separates into close-ups. Code-native folded velvet curtains descend; a gold Robo Goal India title animates in their center, then the curtains part over the homepage. No video asset is used. A synchronous head gate and critical inline CSS prevent the homepage flashing before the animation. A local WebP still covers preparation. No controls or audio are displayed. Reduced-motion and no-JavaScript fallbacks preserve access. Preparation is capped at 6.5 seconds, playback at 9 seconds, with a separate 15-second bootstrap escape. Meshes are merged per material, confetti is instanced, and foreground clones share geometry.

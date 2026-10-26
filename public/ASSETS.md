# Asset provenance

- `images/stadium-source.png`: original image generated for this project using the built-in imagegen tool. Photorealistic robotic sports stadium concept, not documentary event photography.
- `images/stadium.webp`: optimized derivative of the original concept image.
- `src/app/icon.svg` and CSS wordmarks: original code-native Robo Goal India identity concept.
- `images/robotic-sir-logo.webp`: official Robotic Sir transparent wordmark downloaded unchanged from `https://roboticsir.com/Main%20logo-transparent.webp` on 26 October 2026. Displayed on a white plate for clear contrast on the dark website.
- `images/intro-poster.webp`: a frame captured from this repository's own procedural WebGL scene, compressed to WebP as the first-paint cover while the 3D renderer prepares. It contains no external model or video footage.
- Intro: procedural Three.js model authored in `src/lib/intro-scene.ts`; no third-party 3D model.
- India map: stylized schematic authored for the tour visualization; not an authoritative boundary map.
- Interface icons: Lucide, ISC licensed.
- Barlow / Barlow Condensed fonts: SIL Open Font License, bundled locally through Fontsource. No external font request is required.

Real event photographs, sponsor logos, partner logos, judge portraits and team photographs have not been supplied and are not fabricated.

## Organizer-supplied India map
`maps/india-organizer.png` is the exact image supplied by the organizer on 24 October 2026. The SVG display removes its white background with a color filter; it does not redraw or generate boundaries. Fixture coordinates remain in the 600 × 590 map viewport. Image placement is x=-160, y=-20, width=900, height=643; calibrate new fixture markers against this supplied map.

## Cinematic engineering model
The opening uses locally generated Three.js geometry: machined chassis, treaded wheel assemblies, motors, controller, battery, driver, cables, ultrasonic sensor and kicker. It is an illustrative engineering model. Materials use environment reflections, ACES tone mapping and stadium shadows. The football uses spherical pentagon/hexagon panels. A three-second approach/collision scatters the bot's independent components along ballistic paths with gravity and floor contact, sparks and a dust ring. The server-rendered opening covers the homepage before hydration; a locally rendered WebP poster holds the first frame while the WebGL module loads. There are no playback controls, captions, audio or replay button. Reduced-motion users go directly to the page. Preparation is capped at 6.5 seconds, with a separate 3.8-second playback failsafe. Small hardware meshes are merged per material within detachable assemblies to limit draw calls.

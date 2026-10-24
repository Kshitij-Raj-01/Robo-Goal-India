# Asset provenance

- `images/stadium-source.png`: original image generated for this project using the built-in imagegen tool. Photorealistic robotic sports stadium concept, not documentary event photography.
- `images/stadium.webp`: optimized derivative of the original concept image.
- `src/app/icon.svg` and CSS wordmarks: original code-native Robo Goal India identity concept. Robotic Sir RS mark is a temporary wordmark concept pending the official logo file.
- Intro: procedural Three.js model authored in `src/lib/intro-scene.ts`; no third-party 3D model.
- India map: stylized schematic authored for the tour visualization; not an authoritative boundary map.
- Interface icons: Lucide, ISC licensed.
- Barlow / Barlow Condensed fonts: SIL Open Font License, bundled locally through Fontsource. No external font request is required.

Real event photographs, sponsor logos, partner logos, judge portraits and team photographs have not been supplied and are not fabricated.

## Organizer-supplied India map
`maps/india-organizer.png` is the exact image supplied by the organizer on 24 October 2026. The SVG display removes its white background with a color filter; it does not redraw or generate boundaries. Fixture coordinates remain in the 600 × 590 map viewport. Image placement is x=-160, y=-20, width=900, height=643; calibrate new fixture markers against this supplied map.

## Cinematic engineering model
The opening uses locally generated Three.js geometry: machined chassis, treaded wheel assemblies, motors, controller, battery, driver, cables, ultrasonic sensor and deployable kicker. It is an illustrative engineering model, not a representation of an actual competition robot. Materials use environment reflections, ACES tone mapping and shadowed stadium lighting. The football uses spherical pentagon/hexagon panels. No external 3D assets are downloaded. The sequence has a six-second escape timer, optional user-enabled sound and a homepage replay control; reduced-motion users skip it and constrained devices use the lightweight stadium fallback.

/** Runs in the document head, before the navbar or homepage can be painted. */
export const INTRO_BOOT_SCRIPT = `(function(){try{if(location.pathname!=="/"||matchMedia("(prefers-reduced-motion: reduce)").matches)return;document.documentElement.dataset.intro="pending";setTimeout(function(){if(document.documentElement.dataset.intro==="pending")delete document.documentElement.dataset.intro},22000)}catch(e){}})();`;

export const INTRO_CRITICAL_CSS = `html[data-intro="pending"] body{background:#030910}html[data-intro="pending"] .navbar,html[data-intro="pending"] .skip-link,html[data-intro="pending"] footer,html[data-intro="pending"] #main>:not(.intro){visibility:hidden}html[data-intro] body{overflow:hidden}.intro{position:fixed;inset:0;z-index:2147483000;background:#030910;overflow:hidden}.intro-revealing{background:transparent}`;

export const INTRO_PREPARATION_TIMEOUT_MS = 8000;
export const INTRO_PLAYBACK_TIMEOUT_MS = 16000;
/** Football in the existing transparent 1440 × 271 dark-theme wordmark. */
export const INTRO_LOGO_BALL = {
  x: 757 / 1440,
  y: 140 / 271,
  radiusX: 60 / 1440,
  radiusY: 60 / 271,
} as const;
/** Contiguous artwork slices, not newly drawn or generated letterforms. */
export const INTRO_LOGO_PIECES = [
  { id: "r", left: 0, right: 8, x: -0.35, y: -0.12, rotate: -20 },
  { id: "o-left", left: 8, right: 17.5, x: -0.24, y: 0.2, rotate: 24 },
  { id: "b", left: 17.5, right: 25, x: -0.18, y: -0.22, rotate: -18 },
  { id: "o-right", left: 25, right: 35, x: -0.1, y: 0.24, rotate: 28 },
  { id: "g", left: 35, right: 47, x: 0.08, y: -0.24, rotate: -22 },
  { id: "goal-o", left: 47, right: 58.5, x: 0, y: 0, rotate: 0 },
  { id: "a", left: 58.5, right: 66.5, x: 0.18, y: 0.2, rotate: 24 },
  { id: "l", left: 66.5, right: 74, x: 0.27, y: -0.2, rotate: -22 },
  { id: "india", left: 74, right: 100, x: 0.35, y: 0.12, rotate: 16 },
] as const;
export const INTRO_TIMING = {
  goal: 2,
  parts: 2.7,
  ballFlight: 5.2,
  curtainDown: 5.6,
  football: 7.8,
  logo: 7.9,
  assembled: 9.25,
  scatter: 10,
  curtainOpen: 11,
  end: 12.3,
} as const;

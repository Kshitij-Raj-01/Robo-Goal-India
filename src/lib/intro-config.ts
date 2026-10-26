/** Runs in the document head, before the navbar or homepage can be painted. */
export const INTRO_BOOT_SCRIPT = `(function(){try{if(location.pathname!=="/"||matchMedia("(prefers-reduced-motion: reduce)").matches)return;document.documentElement.dataset.intro="pending";setTimeout(function(){if(document.documentElement.dataset.intro==="pending")delete document.documentElement.dataset.intro},15000)}catch(e){}})();`;

export const INTRO_CRITICAL_CSS = `html[data-intro="pending"] body{background:#030910}html[data-intro="pending"] .navbar,html[data-intro="pending"] .skip-link,html[data-intro="pending"] footer,html[data-intro="pending"] #main>:not(.intro){visibility:hidden}html[data-intro] body{overflow:hidden}.intro{position:fixed;inset:0;z-index:2147483000;background:#030910;overflow:hidden}.intro-revealing{background:transparent}`;

export const INTRO_PLAYBACK_TIMEOUT_MS = 11000;
/** Football O in the exact 716 × 111 organizer-supplied logo. */
export const INTRO_LOGO_PORTAL = {
  x: 405 / 716,
  y: 59 / 111,
  radius: 24 / 716,
} as const;
export const INTRO_TIMING = {
  goal: 1.65,
  scatter: 2.25,
  closeups: 3.2,
  curtainDown: 4.15,
  logo: 4.95,
  portal: 5.75,
  botEmerge: 5.95,
  logoOut: 7.1,
  curtainOpen: 7.65,
  end: 8.6,
} as const;

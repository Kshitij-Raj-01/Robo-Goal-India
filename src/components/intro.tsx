"use client";

import { useEffect, useRef, useState } from "react";
import { INTRO_PLAYBACK_TIMEOUT_MS } from "@/lib/intro-config";

/** Server-rendered cover prevents the homepage appearing before hydration. */
export function Intro() {
  const [visible, setVisible] = useState(true);
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let stop: (() => void) | undefined;
    const finish = () => {
      if (!disposed) {
        delete document.documentElement.dataset.intro;
        setVisible(false);
      }
    };
    if (motion.matches) {
      finish();
      return;
    }
    document.documentElement.dataset.intro = "pending";

    const covered = [
      ...document.querySelectorAll<HTMLElement>(
        ".navbar, .skip-link, footer, #main > :not(.intro)",
      ),
    ];
    const previous = covered.map((element) => element.inert);
    covered.forEach((element) => {
      element.inert = true;
    });
    // Covers module loading too: WebGL failure must never block the website.
    let timeout = window.setTimeout(finish, 6500);
    const onMotionChange = () => {
      if (motion.matches) finish();
    };
    motion.addEventListener("change", onMotionChange);

    import("@/lib/intro-scene")
      .then(({ startScene }) => {
        if (disposed || !host.current) return;
        try {
          stop = startScene(host.current, finish);
          // Shader preparation may be slow on a first visit. Let the full short
          // goal and celebration finish before releasing the homepage.
          clearTimeout(timeout);
          timeout = window.setTimeout(finish, INTRO_PLAYBACK_TIMEOUT_MS);
          host.current.parentElement?.classList.add("intro-ready");
        } catch {
          finish();
        }
      })
      .catch(finish);

    return () => {
      disposed = true;
      clearTimeout(timeout);
      motion.removeEventListener("change", onMotionChange);
      stop?.();
      delete document.documentElement.dataset.intro;
      covered.forEach((element, index) => {
        element.inert = previous[index];
      });
    };
  }, [visible]);

  if (!visible) return null;
  return (
    <div className="intro" aria-hidden="true">
      <link
        rel="preload"
        as="image"
        href="/images/intro-poster.webp"
        fetchPriority="high"
      />
      <div className="intro-standby" />
      <div className="intro-canvas" ref={host} />
      <div className="intro-curtain">
        <div className="curtain-panel curtain-panel-left" />
        <div className="curtain-panel curtain-panel-right" />
        <div className="curtain-title">
          {["ROBO GOAL", "INDIA"].map((line) => (
            <div className="curtain-title-line" key={line}>
              {[...line].map((letter, index) => (
                <span className="curtain-letter" key={index}>
                  {letter === " " ? "\u00a0" : letter}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <noscript>
        <style>{`.intro { display: none !important; } body:has(.intro) { overflow: auto !important; } body:has(.intro) .navbar, body:has(.intro) footer, body:has(.intro) #main > :not(.intro) { visibility: visible !important; }`}</style>
      </noscript>
    </div>
  );
}

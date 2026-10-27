"use client";

import { useEffect, useRef, useState } from "react";
import {
  INTRO_PLAYBACK_TIMEOUT_MS,
  INTRO_PREPARATION_TIMEOUT_MS,
  INTRO_LOGO_PIECES,
} from "@/lib/intro-config";

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
    let timeout = window.setTimeout(finish, INTRO_PREPARATION_TIMEOUT_MS);
    const onMotionChange = () => {
      if (motion.matches) finish();
    };
    motion.addEventListener("change", onMotionChange);

    const logo = host.current?.parentElement?.querySelector<HTMLImageElement>(
      ".curtain-logo-source",
    );
    Promise.all([
      import("@/lib/intro-scene"),
      logo?.decode().catch(() => undefined),
    ])
      .then(([{ startScene }]) => {
        if (disposed || !host.current) return;
        try {
          stop = startScene(host.current, finish, () => {
            if (disposed) return;
            clearTimeout(timeout);
            timeout = window.setTimeout(finish, INTRO_PLAYBACK_TIMEOUT_MS);
            host.current?.parentElement?.classList.add("intro-ready");
          });
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
        href="/images/robo-goal-india-logo-dark.webp"
        fetchPriority="high"
      />
      <div className="intro-canvas" ref={host} />
      <div className="intro-ball-flight" />
      <div className="intro-curtain">
        <div className="curtain-panel curtain-panel-left" />
        <div className="curtain-panel curtain-panel-right" />
        <div className="curtain-brand">
          <div className="curtain-logo-stage">
            {/* Reuse the existing wordmark; animate clipped artwork, not substitute text. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="curtain-logo-source"
              src="/images/robo-goal-india-logo-dark.webp"
              alt="Robo Goal India"
              width={1440}
              height={271}
            />
            {INTRO_LOGO_PIECES.map((piece) => (
              <div
                className="curtain-logo-piece"
                data-logo-piece={piece.id}
                key={piece.id}
                style={{
                  clipPath: `inset(0 ${100 - piece.right}% 0 ${piece.left}%)`,
                  transformOrigin: `${(piece.left + piece.right) / 2}% 50%`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <noscript>
        <style>{`.intro { display: none !important; } body:has(.intro) { overflow: auto !important; } body:has(.intro) .navbar, body:has(.intro) footer, body:has(.intro) #main > :not(.intro) { visibility: visible !important; }`}</style>
      </noscript>
    </div>
  );
}

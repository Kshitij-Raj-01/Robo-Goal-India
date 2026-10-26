"use client";

import { useEffect, useRef, useState } from "react";

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
      if (!disposed) setVisible(false);
    };
    if (motion.matches) {
      finish();
      return;
    }

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
          // collision finish rather than cutting it off midway through impact.
          clearTimeout(timeout);
          timeout = window.setTimeout(finish, 3800);
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
      <noscript>
        <style>{`.intro { display: none !important; } body:has(.intro) { overflow: auto !important; } body:has(.intro) .navbar, body:has(.intro) footer, body:has(.intro) #main > :not(.intro) { visibility: visible !important; }`}</style>
      </noscript>
    </div>
  );
}

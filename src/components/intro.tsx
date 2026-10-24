"use client";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, ArrowRight, Play } from "lucide-react";
export function Intro() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState("01 / RACE ENGINE ONLINE");
  const [rendered, setRendered] = useState(false);
  const [sound, setSound] = useState(false);
  const canvas = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const audio = useRef<AudioContext | null>(null);
  const close = () => {
    setVisible(false);
    setSound(false);
    setRendered(false);
    audio.current?.close().catch(() => {});
    audio.current = null;
  };
  useEffect(() => {
    try {
      if (sessionStorage.getItem("rgi-intro-v2-seen")) return;
      sessionStorage.setItem("rgi-intro-v2-seen", "1");
    } catch {
      return;
    }
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setVisible(true);
  }, []);
  useEffect(() => {
    const replay = () => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      setPhase("01 / RACE ENGINE ONLINE");
      setVisible(true);
    };
    window.addEventListener("rgi:replay-intro", replay);
    return () => window.removeEventListener("rgi:replay-intro", replay);
  }, []);
  useEffect(() => {
    if (!visible) return;
    dialog.current?.showModal();
    const timeout = setTimeout(close, 6000);
    let stop: undefined | (() => void);
    let disposed = false;
    const conn = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    const lite =
      innerWidth < 768 ||
      navigator.hardwareConcurrency < 4 ||
      conn?.saveData ||
      conn?.effectiveType === "2g";
    if (!lite)
      import("@/lib/intro-scene")
        .then(({ startScene }) => {
          if (disposed || !canvas.current) return;
          try {
            stop = startScene(canvas.current, setPhase, close);
            setRendered(true);
          } catch {
            close();
          }
        })
        .catch(close);
    return () => {
      disposed = true;
      clearTimeout(timeout);
      stop?.();
      dialog.current?.close();
      audio.current?.close().catch(() => {});
      audio.current = null;
    };
  }, [visible]);
  function toggleSound() {
    if (sound) {
      audio.current?.suspend();
      setSound(false);
      return;
    }
    try {
      const ctx = audio.current || new AudioContext();
      audio.current = ctx;
      ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(65, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 1.5);
      gain.gain.setValueAtTime(0.025, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.6);
      setSound(true);
    } catch {
      setSound(false);
    }
  }
  if (!visible) return null;
  return (
    <dialog
      ref={dialog}
      className={`intro ${rendered ? "intro-rendered" : ""}`}
      aria-label="Robo Goal India cinematic introduction"
      onCancel={close}
    >
      <div className="intro-backdrop" />
      <div className="intro-canvas" ref={canvas} />
      <div className="intro-lens" aria-hidden="true" />
      <div className="intro-letterbox" aria-hidden="true" />
      <div className="intro-copy">
        <span className="micro">{phase}</span>
        <h2>
          BUILT FOR
          <br />
          <em>THE ARENA.</em>
        </h2>
        <div className="intro-progress" />
        <p className="micro">BUILD → TRANSFORM → COMPETE</p>
      </div>
      <div className="intro-controls">
        <button
          className="icon-button"
          aria-label={
            sound ? "Mute intro sound" : "Enable optional intro sound"
          }
          onClick={toggleSound}
        >
          {sound ? <Volume2 /> : <VolumeX />}
        </button>
        <button className="button secondary" autoFocus onClick={close}>
          Skip Intro <ArrowRight size={16} />
        </button>
      </div>
    </dialog>
  );
}

export function IntroReplay() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  if (reduced) return null;
  return (
    <button
      className="intro-replay"
      onClick={() => window.dispatchEvent(new Event("rgi:replay-intro"))}
    >
      <Play size={14} /> WATCH THE INTRO
    </button>
  );
}

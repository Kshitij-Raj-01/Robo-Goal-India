"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X, ArrowUp } from "lucide-react";
import { navigation, site } from "@/lib/content";
import { Brand } from "./ui";
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 30);
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    return () => window.removeEventListener("scroll", scroll);
  }, []);
  useEffect(() => {
    setOpen(false);
  }, [path]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const links = panel.current?.querySelectorAll<HTMLElement>("a,button");
    links?.[0]?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
      if (e.key === "Tab" && links?.length) {
        const first = links[0],
          last = links[links.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", key);
    };
  }, [open]);
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className={`navbar ${scrolled || path !== "/" ? "solid" : ""}`}>
        <div className="nav-top">
          <Brand />
          <nav aria-label="Main navigation" className="desktop-nav">
            {navigation.slice(0, 7).map(([label, href]) => (
              <Link
                aria-current={path === href ? "page" : undefined}
                href={href}
                key={href}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/collaborate"
              aria-current={path === "/collaborate" ? "page" : undefined}
            >
              Collaborate <ArrowUpRight size={12} />
            </Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <a
            href={site.parentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="organizer"
          >
            <span className="organizer-symbol">
              RS<span>↗</span>
            </span>
            <span>
              <b>ROBOTIC SIR</b>
              <small>
                Organized by
                <br />
                Robotic Sir AI India Pvt. Ltd.
              </small>
            </span>
          </a>
          <button
            ref={toggle}
            className="menu-toggle icon-button"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
          >
            <Menu />
          </button>
        </div>
      </header>
      {open && (
        <div
          id="mobile-navigation"
          className="mobile-menu"
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <button
            className="icon-button menu-close"
            aria-label="Close menu"
            onClick={() => {
              setOpen(false);
              toggle.current?.focus();
            }}
          >
            <X />
          </button>
          <span className="micro">WELCOME TO THE ARENA</span>
          {navigation.map(([label, href], i) => (
            <Link key={href} href={href}>
              <span>0{i + 1}</span>
              {label}
              <ArrowUpRight size={20} />
            </Link>
          ))}
          <Link
            className="button"
            href="/collaborate?type=Competition+Sponsorship"
          >
            Become a Sponsor <ArrowUpRight size={18} />
          </Link>
        </div>
      )}
    </>
  );
}
export function Footer() {
  return (
    <footer>
      <div className="container footer-top">
        <div>
          <Brand />
          <p>
            Built by students.
            <br />
            Powered by possibility.
          </p>
          <span className="micro">Organized by {site.organizer}</span>
        </div>
        <div>
          <h4>THE LEAGUE</h4>
          {[
            ["About", "/about"],
            ["Tour Format", "/tour"],
            ["Events & Results", "/events"],
            ["Fixtures", "/fixtures"],
            ["Leaderboard", "/leaderboard"],
          ].map(([l, h]) => (
            <Link href={h} key={h}>
              {l}
            </Link>
          ))}
        </div>
        <div>
          <h4>JOIN THE MOVEMENT</h4>
          {[
            ["Host a Campus Round", "/collaborate?type=Host+a+Campus+Round"],
            ["Become a Sponsor", "/collaborate?type=Competition+Sponsorship"],
            ["Learning Partners", "/partners"],
            ["Teams & Robots", "/teams"],
            ["Contact Us", "/contact"],
          ].map(([l, h]) => (
            <Link href={h} key={h}>
              {l}
            </Link>
          ))}
        </div>
        <div>
          <h4>STAY CONNECTED</h4>
          <p>
            India’s next sporting chapter
            <br />
            starts with an idea. Yours.
          </p>
          {site.socials.map((s) => (
            <a
              href={s.url}
              key={s.name}
              target="_blank"
              rel="noopener noreferrer"
            >
              {s.name} ↗
            </a>
          ))}
          <Link className="text-link" href="/collaborate">
            Let’s build it together <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} Robo Goal India. All rights reserved.
        </span>
        <div>
          {[
            ["Competition Rules", "rules"],
            ["Privacy Policy", "privacy"],
            ["Terms", "terms"],
            ["Refund Policy", "refund"],
          ].map(([l, h]) => (
            <Link key={h} href={`/documents/${h}`}>
              {l}
            </Link>
          ))}
        </div>
        <a href="#main" aria-label="Back to top">
          <ArrowUp size={18} />
        </a>
      </div>
    </footer>
  );
}
export function Analytics() {
  useEffect(() => {
    const click = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (a)
        window.dispatchEvent(
          new CustomEvent("rgi:interaction", {
            detail: { event: "navigation", href: a.getAttribute("href") },
          }),
        );
    };
    document.addEventListener("click", click);
    return () => document.removeEventListener("click", click);
  }, []);
  return null;
}

"use client";

/**
 * Site design-language primitives — 2026-09 dark-premium redesign.
 *
 * Shared by all public marketing pages (home, products, about, case-studies,
 * use-cases, pricing, contact). Admin/account UI does NOT use these.
 *
 * Visual language: near-black canvas, electric blue→purple gradient accent,
 * huge display typography, eyebrow labels with a glowing dot, scroll-triggered
 * reveals, marquee testimonials.
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useScroll, useTransform } from "framer-motion";
import { ArrowUp } from "lucide-react";
import Lenis from "lenis";

/**
 * Lenis smooth scrolling for the marketing pages (the benchmark's motion-first
 * feel). Mounted by PublicLayout only, so admin/account/auth scroll natively.
 * Skipped entirely under prefers-reduced-motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.12 });
    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);
  return null;
}

/**
 * Magnetic hover: the child is gently pulled toward the cursor and springs
 * back on leave. Wrap primary CTAs only — it loses its charm when overused.
 */
export function Magnetic({ children, strength = 0.3 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.2 });
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.2 });

  const onMove = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div ref={ref} style={{ x: sx, y: sy }} onPointerMove={onMove} onPointerLeave={onLeave} className="inline-block">
      {children}
    </motion.div>
  );
}

/** Small-caps section label with a glowing accent dot: `● SELECTED WORK`. */
export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      className={`flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300/90 ${className}`}
    >
      <span className="relative inline-flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
      </span>
      {children}
    </motion.div>
  );
}

/**
 * Split a line into per-character motion spans (the benchmark reveals titles
 * character by character). Words stay unbroken so wrapping still works; the
 * caller supplies aria-label, and the spans are aria-hidden.
 */
function splitChars(line: string) {
  const words = line.split(" ");
  return words.map((word, wi) => (
    <span key={wi} className="inline-block whitespace-nowrap">
      {word.split("").map((ch, ci) => (
        <motion.span
          key={ci}
          variants={{
            hidden: { opacity: 0, y: "0.35em" },
            show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
          }}
          className="inline-block"
        >
          {ch}
        </motion.span>
      ))}
      {wi < words.length - 1 ? <span>&nbsp;</span> : null}
    </span>
  ));
}

/**
 * Big display section title. Pass `lines` to stagger-reveal each line
 * separately (the razvanmares "Projects / that / move" treatment); the last
 * line gets the gradient unless `gradientLine` overrides which one.
 */
export function SectionTitle({
  lines,
  gradientLine,
  className = "",
  as: Tag = "h2",
}: {
  lines: string[];
  gradientLine?: number;
  className?: string;
  as?: "h1" | "h2";
}) {
  const gi = gradientLine ?? lines.length - 1;
  const MotionTag = Tag === "h1" ? motion.h1 : motion.h2;
  return (
    <MotionTag
      aria-label={lines.join(" ")}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ staggerChildren: 0.02 }}
      className={`text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl ${className}`}
    >
      {lines.map((line, i) => (
        <span key={i} aria-hidden className={`block pb-1 ${i === gi ? "kb-gradient-text" : ""}`}>
          {splitChars(line)}
        </span>
      ))}
    </MotionTag>
  );
}

/** Generic scroll-triggered reveal wrapper (fade + rise). */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Blurred color blobs + dot grid backdrop for dark sections. The hero variant
 * drifts its blobs at different rates as the page scrolls (subtle parallax).
 */
export function GlowBackdrop({ variant = "hero" }: { variant?: "hero" | "section" }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const drift1 = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const drift2 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const drift3 = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {variant === "hero" ? (
        <>
          <motion.div style={{ y: drift1 }} className="absolute -top-48 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[140px]" />
          <motion.div style={{ y: drift2 }} className="absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px]" />
          <motion.div style={{ y: drift3 }} className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-purple-600/15 blur-[120px]" />
        </>
      ) : (
        <>
          <div className="absolute -left-48 top-0 h-80 w-80 rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute -right-48 bottom-0 h-80 w-80 rounded-full bg-purple-600/10 blur-[120px]" />
        </>
      )}
    </div>
  );
}

/**
 * Infinite horizontal marquee; children are rendered twice for the loop, so
 * the second copy is hidden from assistive tech. Pauses on hover; static
 * under prefers-reduced-motion (see kb-marquee rules in globals.css).
 */
export function Marquee({
  children,
  durationSec = 45,
  className = "",
}: {
  children: React.ReactNode;
  durationSec?: number;
  className?: string;
}) {
  return (
    <div className={`kb-marquee overflow-hidden ${className}`}>
      <div
        className="kb-marquee-track flex w-max gap-4"
        style={{ "--kb-marquee-duration": `${durationSec}s` } as React.CSSProperties}
      >
        <div className="flex gap-4">{children}</div>
        <div className="flex gap-4" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

/** Numbered case-study/product card number: `01`, `02`… */
export function CardIndex({ index }: { index: number }) {
  return (
    <span className="text-sm font-semibold tabular-nums text-indigo-400/70">
      {String(index + 1).padStart(2, "0")}
    </span>
  );
}

/**
 * Cursor-following 3D tilt. The child rotates toward the pointer and springs
 * back on leave (the benchmark's service-card feel). Pointer-driven only, so
 * touch devices get the plain card; opted out under reduced motion.
 */
export function Tilt({
  children,
  max = 7,
  className = "",
}: {
  children: React.ReactNode;
  max?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 180, damping: 18, mass: 0.3 });
  const sry = useSpring(ry, { stiffness: 180, damping: 18, mass: 0.3 });

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * max * 2);
    rx.set(-py * max * 2);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 900, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Floating back-to-top button; appears once the visitor is past one screen. */
export function BackToTop({ label }: { label: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label={label}
          title={label}
          className="fixed bottom-6 right-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-105"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/**
 * Fine film grain over the dark canvas — breaks up the flat gradients the way
 * the benchmark's noise layer does. Pure CSS, fixed, never intercepts input.
 */
export function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] opacity-[0.035] mix-blend-overlay"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}

/**
 * Soft cursor follower with a trailing ring (benchmark's CursorFollower).
 * Mouse-only and skipped under reduced motion, so touch users and
 * motion-sensitive visitors are unaffected; never intercepts clicks.
 */
export function CursorFollower() {
  const [enabled, setEnabled] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const dotX = useSpring(x, { stiffness: 900, damping: 40, mass: 0.2 });
  const dotY = useSpring(y, { stiffness: 900, damping: 40, mass: 0.2 });
  const ringX = useSpring(x, { stiffness: 130, damping: 18, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 130, damping: 18, mass: 0.5 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || calm) return;
    setEnabled(true);
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  if (!enabled) return null;
  return (
    <>
      <motion.div
        aria-hidden
        style={{ x: dotX, y: dotY }}
        className="pointer-events-none fixed left-0 top-0 z-[10000] -ml-1 -mt-1 h-2 w-2 rounded-full bg-indigo-300/90"
      />
      <motion.div
        aria-hidden
        style={{ x: ringX, y: ringY }}
        className="pointer-events-none fixed left-0 top-0 z-[10000] -ml-4 -mt-4 h-8 w-8 rounded-full border border-indigo-400/40"
      />
    </>
  );
}

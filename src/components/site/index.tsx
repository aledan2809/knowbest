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

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useScroll, useTransform } from "framer-motion";
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
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ staggerChildren: 0.12 }}
      className={`text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl ${className}`}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-1">
          <motion.span
            variants={{
              hidden: { y: "100%", opacity: 0 },
              show: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
            }}
            className={`block ${i === gi ? "kb-gradient-text" : ""}`}
          >
            {line}
          </motion.span>
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

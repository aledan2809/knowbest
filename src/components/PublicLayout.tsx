"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SmoothScroll, GrainOverlay, BackToTop, CursorFollower } from "@/components/site";

/**
 * PublicLayout — consolidates Navbar + Footer for public marketing pages.
 *
 * Use by wrapping the page content:
 * ```tsx
 * export default function MyPage() {
 *   return (
 *     <PublicLayout>
 *       <main>...content...</main>
 *     </PublicLayout>
 *   );
 * }
 * ```
 *
 * Introduced by AUDIT-010 fix — removes Navbar/Footer duplication across
 * about, case-studies, contact, pricing, products, use-cases, home.
 *
 * Admin and auth pages should NOT use this wrapper.
 */
export function PublicLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  // The document canvas stays light for admin/account pages, so on macOS/iOS
  // rubber-band overscroll a white band would flash around the dark pages.
  // Paint the <html> element dark only while a public page is mounted.
  useEffect(() => {
    const el = document.documentElement;
    const prev = el.style.backgroundColor;
    el.style.backgroundColor = "#0a0a12";
    return () => {
      el.style.backgroundColor = prev;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a12] text-slate-100">
      <SmoothScroll />
      <GrainOverlay />
      <CursorFollower />
      <Navbar />
      {children}
      <Footer />
      <BackToTop label={t("common.backToTop")} />
    </div>
  );
}

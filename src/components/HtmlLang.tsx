"use client";
import { useEffect } from "react";

/**
 * Keeps <html lang> in step with the language after switching it in the menu (2026-10-16). The root layout
 * sets it on the first load, but switching language inside the site does not render the root layout again,
 * so screen readers kept reading Romanian pages with English pronunciation.
 */
export function HtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}

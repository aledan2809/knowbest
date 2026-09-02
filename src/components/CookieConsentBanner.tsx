"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";
import { loadGA4 } from "@aledan/analytics";
import { Button } from "@/components/ui/button";

const KEY = "kb_cookie_consent_v1";

// GA4 loads ONLY after the visitor grants the analytics category (Umami is
// cookieless and mounts unconditionally in the root layout). Inert until the
// Measurement ID is provided via env.
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
function loadGA4IfGranted(categories: { analytics: boolean }) {
  if (GA4_ID && categories.analytics) loadGA4(GA4_ID);
}

type Categories = { necessary: true; analytics: boolean; marketing: boolean };
type Choice = "accepted" | "rejected" | "custom";

/**
 * GDPR cookie consent banner with granular categories (necessary / analytics /
 * marketing). Records the visitor's granular choice locally and notifies the
 * Legal Hub (legal.knowbest.ro) via /api/v1/consent/record (best-effort,
 * never blocks the UI). Links to the versioned Cookies + Privacy policies
 * pulled from Legal.
 */
export function CookieConsentBanner() {
  const t = useTranslations("cookies");
  const locale = useLocale();
  const pathname = usePathname();
  // The marketing site is dark; admin/account/auth kept their light theme, so
  // the banner follows the page it floats over.
  const dark = !/^\/(ro|en)\/(admin|account|auth)(\/|$)/.test(pathname);
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (!stored) {
        setShow(true);
      } else {
        // Returning visitor: honor the saved analytics grant on every load.
        const parsed = JSON.parse(stored) as { categories?: { analytics?: boolean } };
        loadGA4IfGranted({ analytics: parsed?.categories?.analytics === true });
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persist = (choice: Choice, categories: Categories) => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ choice, categories, at: new Date().toISOString() }));
    } catch {
      /* ignore */
    }
    // Best-effort granular consent record to Legal Hub — never block the UI on it.
    fetch("/api/v1/consent/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "COOKIES", choice, locale, categories }),
    }).catch(() => {});
    loadGA4IfGranted(categories);
    setShow(false);
  };

  const acceptAll = () => persist("accepted", { necessary: true, analytics: true, marketing: true });
  const rejectNonEssential = () =>
    persist("rejected", { necessary: true, analytics: false, marketing: false });
  const savePreferences = () => persist("custom", { necessary: true, analytics, marketing });

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed inset-x-0 bottom-0 z-[9999] p-4 sm:p-5"
          role="dialog"
          aria-label={t("title")}
        >
          <div className={`mx-auto max-w-3xl rounded-2xl border backdrop-blur shadow-2xl p-5 ${dark ? "border-white/10 bg-[#111120]/95 shadow-black/40" : "border-slate-200 bg-white/95 shadow-slate-300/40"}`}>
            <div className="sm:flex sm:items-start sm:gap-5">
              <div className="flex items-start gap-3 flex-1">
                <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  <Cookie className="h-5 w-5" />
                </span>
                <p className={`text-sm ${dark ? "text-slate-300" : "text-slate-600"}`}>
                  {t("message")}{" "}
                  <Link href={`/${locale}/cookies`} className={dark ? "text-indigo-300 underline hover:text-indigo-200" : "text-indigo-600 underline hover:text-indigo-500"}>
                    {t("cookiesLink")}
                  </Link>{" "}·{" "}
                  <Link href={`/${locale}/privacy`} className={dark ? "text-indigo-300 underline hover:text-indigo-200" : "text-indigo-600 underline hover:text-indigo-500"}>
                    {t("privacyLink")}
                  </Link>
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 sm:mt-0 sm:flex-shrink-0">
                {!expanded && (
                  <Button size="sm" variant="ghost" onClick={() => setExpanded(true)} className={dark ? "text-slate-300 hover:bg-white/5 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}>
                    {t("manage")}
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={rejectNonEssential} className={`rounded-full bg-transparent ${dark ? "border-white/15 text-slate-200 hover:border-indigo-300 hover:bg-white/5 hover:text-white" : "border-slate-300 text-slate-700 hover:border-indigo-400 hover:bg-slate-50 hover:text-slate-900"}`}>
                  {t("rejectNonEssential")}
                </Button>
                <Button size="sm" onClick={acceptAll} className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-400 hover:to-purple-400">
                  {t("acceptAll")}
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className={`mt-5 space-y-3 border-t pt-4 ${dark ? "border-white/10" : "border-slate-200"}`}>
                    <CategoryRow
                      dark={dark}
                      name={t("necessaryName")}
                      desc={t("necessaryDesc")}
                      checked
                      locked
                      lockedLabel={t("alwaysOn")}
                    />
                    <CategoryRow
                      dark={dark}
                      name={t("analyticsName")}
                      desc={t("analyticsDesc")}
                      checked={analytics}
                      onChange={() => setAnalytics((v) => !v)}
                    />
                    <CategoryRow
                      dark={dark}
                      name={t("marketingName")}
                      desc={t("marketingDesc")}
                      checked={marketing}
                      onChange={() => setMarketing((v) => !v)}
                    />
                    <div className="flex justify-end pt-1">
                      <Button size="sm" onClick={savePreferences}>
                        {t("save")}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CategoryRow({
  dark,
  name,
  desc,
  checked,
  locked,
  lockedLabel,
  onChange,
}: {
  dark: boolean;
  name: string;
  desc: string;
  checked: boolean;
  locked?: boolean;
  lockedLabel?: string;
  onChange?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-900"}`}>{name}</p>
        <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{desc}</p>
      </div>
      {locked ? (
        <span className={`mt-0.5 flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${dark ? "bg-white/10 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
          {lockedLabel}
        </span>
      ) : (
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={name}
          onClick={onChange}
          className={`relative mt-0.5 inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
            checked ? "bg-indigo-500" : dark ? "bg-white/20" : "bg-slate-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              checked ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      )}
    </div>
  );
}

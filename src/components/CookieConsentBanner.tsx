"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

const KEY = "kb_cookie_consent_v1";

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
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
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
          <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white/95 backdrop-blur shadow-2xl p-5">
            <div className="sm:flex sm:items-start sm:gap-5">
              <div className="flex items-start gap-3 flex-1">
                <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                  <Cookie className="h-5 w-5" />
                </span>
                <p className="text-sm text-slate-600">
                  {t("message")}{" "}
                  <Link href={`/${locale}/cookies`} className="text-blue-600 underline hover:text-blue-700">
                    {t("cookiesLink")}
                  </Link>{" "}·{" "}
                  <Link href={`/${locale}/privacy`} className="text-blue-600 underline hover:text-blue-700">
                    {t("privacyLink")}
                  </Link>
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 sm:mt-0 sm:flex-shrink-0">
                {!expanded && (
                  <Button size="sm" variant="ghost" onClick={() => setExpanded(true)}>
                    {t("manage")}
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={rejectNonEssential}>
                  {t("rejectNonEssential")}
                </Button>
                <Button size="sm" onClick={acceptAll}>
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
                  <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                    <CategoryRow
                      name={t("necessaryName")}
                      desc={t("necessaryDesc")}
                      checked
                      locked
                      lockedLabel={t("alwaysOn")}
                    />
                    <CategoryRow
                      name={t("analyticsName")}
                      desc={t("analyticsDesc")}
                      checked={analytics}
                      onChange={() => setAnalytics((v) => !v)}
                    />
                    <CategoryRow
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
  name,
  desc,
  checked,
  locked,
  lockedLabel,
  onChange,
}: {
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
        <p className="text-sm font-semibold text-slate-900">{name}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      {locked ? (
        <span className="mt-0.5 flex-shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
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
            checked ? "bg-blue-600" : "bg-slate-300"
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

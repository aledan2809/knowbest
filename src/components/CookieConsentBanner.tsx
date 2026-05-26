"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

const KEY = "kb_cookie_consent_v1";

/**
 * GDPR cookie consent banner. Records the visitor's choice locally and notifies
 * the Legal Hub (legal.knowbest.ro) via /api/v1/consent/record (best-effort).
 * Links to the versioned Cookies + Privacy policies pulled from Legal.
 */
export function CookieConsentBanner() {
  const t = useTranslations("cookies");
  const locale = useLocale();
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* ignore */
    }
  }, []);

  const decide = (choice: "accepted" | "rejected") => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ choice, at: new Date().toISOString() }));
    } catch {
      /* ignore */
    }
    // Best-effort consent record to Legal Hub — never block the UI on it.
    fetch("/api/v1/consent/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "COOKIES", choice, locale }),
    }).catch(() => {});
    setShow(false);
  };

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
          <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white/95 backdrop-blur shadow-2xl p-5 sm:flex sm:items-center sm:gap-5">
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
            <div className="mt-4 flex gap-2 sm:mt-0 sm:flex-shrink-0">
              <Button size="sm" variant="outline" onClick={() => decide("rejected")}>
                {t("reject")}
              </Button>
              <Button size="sm" onClick={() => decide("accepted")}>
                {t("accept")}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

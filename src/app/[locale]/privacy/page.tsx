"use client";
import { useTranslations } from "next-intl";
import { LegalDocPage } from "@/components/LegalDocPage";

export default function PrivacyPage() {
  const t = useTranslations();
  return <LegalDocPage type="privacy" title={t("footer.privacy")} />;
}

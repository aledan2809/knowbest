"use client";
import { useTranslations } from "next-intl";
import { LegalDocPage } from "@/components/LegalDocPage";

export default function TermsPage() {
  const t = useTranslations();
  return <LegalDocPage type="tos" title={t("footer.terms")} />;
}

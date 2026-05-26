"use client";
import { useTranslations } from "next-intl";
import { LegalDocPage } from "@/components/LegalDocPage";

export default function CookiesPage() {
  const t = useTranslations();
  return <LegalDocPage type="cookies" title={t("cookies.title")} />;
}

import { getTranslations } from "next-intl/server";
import { PublicLayout } from "@/components/PublicLayout";
import { LegalDocBody } from "@/components/LegalDocBody";
import { getLegalDocument } from "@/lib/legal-doc";

export const revalidate = 3600;

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const doc = await getLegalDocument("tos");
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PublicLayout>
        <LegalDocBody title={t("footer.terms")} doc={doc} />
      </PublicLayout>
    </div>
  );
}

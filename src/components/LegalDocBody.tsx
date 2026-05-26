import { FileText } from "lucide-react";
import type { LegalDoc } from "@/lib/legal-doc";

// Server component — renders a legal document fetched server-side (content is in
// the initial HTML, no client skeleton). Used by /privacy /terms /cookies.
export function LegalDocBody({ title, doc }: { title: string; doc: LegalDoc }) {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="mb-8">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white mb-4">
          <FileText className="h-5 w-5" />
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{title}</h1>
        {doc.version && (
          <p className="mt-2 text-sm text-slate-500">
            {doc.entityName ? `${doc.entityName} · ` : ""}v{doc.version}
            {doc.effectiveFrom
              ? ` · în vigoare din ${new Intl.DateTimeFormat("ro-RO", { dateStyle: "long" }).format(new Date(doc.effectiveFrom))}`
              : ""}
          </p>
        )}
      </div>
      {doc.ok ? (
        <article
          className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h2:mt-8 prose-a:text-blue-600 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-2 [&_p]:my-3 [&_p]:text-slate-700 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_li]:my-1 [&_a]:text-blue-600 [&_a]:underline [&_strong]:font-semibold [&_hr]:my-6"
          dangerouslySetInnerHTML={{ __html: doc.html }}
        />
      ) : (
        <p className="text-slate-600">
          Documentul nu este disponibil momentan. Scrie-ne la{" "}
          <a className="text-blue-600 underline" href="mailto:contact@knowbest.ro">contact@knowbest.ro</a>.
        </p>
      )}
    </section>
  );
}

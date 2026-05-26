"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";

type DocType = "privacy" | "tos" | "cookies";

/**
 * Renders a versioned legal document (Privacy / Terms / Cookies) pulled from the
 * Legal Hub (legal.knowbest.ro) via /api/v1/consent/document. Content is our own
 * (trusted) markdown rendered with a minimal converter.
 */
export function LegalDocPage({ type, title }: { type: DocType; title: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ version?: string; effectiveFrom?: string; entityName?: string }>({});
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/consent/document?type=${type}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setHtml(mdToHtml(d.contentMarkdown || ""));
        setMeta({ version: d.version, effectiveFrom: d.effectiveFrom, entityName: d.entityName });
      })
      .catch(() => setError(true));
  }, [type]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PublicLayout>
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white mb-4">
              <FileText className="h-5 w-5" />
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{title}</h1>
            {meta.version && (
              <p className="mt-2 text-sm text-slate-500">
                {meta.entityName ? `${meta.entityName} · ` : ""}v{meta.version}
                {meta.effectiveFrom
                  ? ` · în vigoare din ${new Intl.DateTimeFormat("ro-RO", { dateStyle: "long" }).format(new Date(meta.effectiveFrom))}`
                  : ""}
              </p>
            )}
          </motion.div>

          {error && (
            <p className="text-slate-600">
              Documentul nu este disponibil momentan. Scrie-ne la{" "}
              <a className="text-blue-600 underline" href="mailto:contact@knowbest.ro">contact@knowbest.ro</a>.
            </p>
          )}
          {!error && html === null && <div className="h-64 animate-pulse rounded-xl bg-slate-200/60" />}
          {!error && html !== null && (
            <article
              className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h2:mt-8 prose-a:text-blue-600"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </section>
      </PublicLayout>
    </div>
  );
}

// Minimal, safe markdown → HTML (content originates from our own Legal Hub).
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function inline(s: string): string {
  return escapeHtml(s)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener">$1</a>');
}
function mdToHtml(md: string): string {
  const lines = md.replace(/\r/g, "").split("\n");
  const out: string[] = [];
  let inList = false;
  const closeList = () => { if (inList) { out.push("</ul>"); inList = false; } };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^---+$/.test(line.trim())) { closeList(); out.push("<hr/>"); continue; }
    let m;
    if ((m = line.match(/^(#{1,4})\s+(.*)$/))) {
      closeList();
      const lvl = m[1].length;
      out.push(`<h${lvl}>${inline(m[2])}</h${lvl}>`);
    } else if ((m = line.match(/^[-*]\s+(.*)$/))) {
      if (!inList) { out.push("<ul>"); inList = true; }
      out.push(`<li>${inline(m[1])}</li>`);
    } else if (line.trim() === "") {
      closeList();
    } else {
      closeList();
      out.push(`<p>${inline(line)}</p>`);
    }
  }
  closeList();
  return out.join("\n");
}

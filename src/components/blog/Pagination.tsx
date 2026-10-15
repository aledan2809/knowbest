import Link from "next/link";

/** Page links for the blog list: first, last, the current one and its neighbours, "…" between. */
export function Pagination({
  base,
  current,
  pages,
  labels,
}: {
  base: string;
  current: number;
  pages: number;
  labels: { previous: string; next: string; page: (n: number) => string };
}) {
  if (pages <= 1) return null;
  const href = (n: number) => (n === 1 ? base : `${base}?page=${n}`);
  const shown = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - current) <= 1,
  );
  const cell = "min-w-10 h-10 px-3 inline-flex items-center justify-center rounded-lg text-sm";
  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {current > 1 && (
        <Link href={href(current - 1)} rel="prev" className={`${cell} text-slate-300 hover:bg-white/5`}>
          ← {labels.previous}
        </Link>
      )}
      {shown.map((n, i) => (
        <span key={n} className="inline-flex items-center gap-2">
          {i > 0 && n - shown[i - 1] > 1 && <span className="text-slate-500">…</span>}
          {n === current ? (
            <span aria-current="page" aria-label={labels.page(n)} className={`${cell} bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium`}>
              {n}
            </span>
          ) : (
            <Link href={href(n)} aria-label={labels.page(n)} className={`${cell} text-slate-300 hover:bg-white/5`}>
              {n}
            </Link>
          )}
        </span>
      ))}
      {current < pages && (
        <Link href={href(current + 1)} rel="next" className={`${cell} text-slate-300 hover:bg-white/5`}>
          {labels.next} →
        </Link>
      )}
    </nav>
  );
}

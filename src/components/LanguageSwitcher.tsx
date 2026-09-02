"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const pathWithoutLocale = pathname.replace(/^\/(ro|en)/, "") || "/";
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <div className="flex items-center gap-1 bg-white/[0.06] rounded-lg p-0.5">
      <button
        onClick={() => switchLocale("ro")}
        className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
          locale === "ro"
            ? "bg-white/15 text-white shadow-sm"
            : "text-slate-400 hover:text-white"
        }`}
      >
        RO
      </button>
      <button
        onClick={() => switchLocale("en")}
        className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
          locale === "en"
            ? "bg-white/15 text-white shadow-sm"
            : "text-slate-400 hover:text-white"
        }`}
      >
        EN
      </button>
    </div>
  );
}

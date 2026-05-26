"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";

export function Footer() {
  const t = useTranslations();
  const locale = useLocale();

  const productLinks = [
    { href: `/${locale}/products`, label: t("nav.products") },
    { href: `/${locale}/use-cases`, label: t("nav.useCases") },
    { href: `/${locale}/case-studies`, label: t("nav.caseStudies") },
  ];

  const companyLinks = [
    { href: `/${locale}/about`, label: t("nav.about") },
    { href: `/${locale}/contact`, label: t("nav.contact") },
  ];

  const socialLinks = [
    { href: "https://github.com/knowbest", icon: Github, label: "GitHub" },
    { href: "https://linkedin.com/company/knowbest", icon: Linkedin, label: "LinkedIn" },
    { href: "https://twitter.com/knowbest", icon: Twitter, label: "Twitter" },
    { href: "mailto:contact@knowbest.ro", icon: Mail, label: "Email" },
  ];

  return (
    <footer className="relative bg-slate-900 text-slate-300">
      {/* Gradient separator line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50 blur-sm" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{t("common.brand")}</h2>
                <p className="text-xs text-slate-400">{t("common.subtitle")}</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-md">
              {t("footer.description")}
            </p>
            <div className="flex gap-4 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t("footer.products")}</h3>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t("footer.company")}</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href={`/${locale}/privacy`} className="hover:text-slate-300">
              {t("footer.privacy")}
            </Link>
            <Link href={`/${locale}/terms`} className="hover:text-slate-300">
              {t("footer.terms")}
            </Link>
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-600 text-center md:text-left">
          {t("footer.legalEntity")}
        </p>
      </div>
    </footer>
  );
}

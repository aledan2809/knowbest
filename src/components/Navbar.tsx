"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function Navbar() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: `/${locale}`, label: t("nav.home") },
    { href: `/${locale}/products`, label: t("nav.products") },
    { href: `/${locale}/use-cases`, label: t("nav.useCases") },
    { href: `/${locale}/case-studies`, label: t("nav.caseStudies") },
    { href: `/${locale}/about`, label: t("nav.about") },
    { href: `/${locale}/contact`, label: t("nav.contact") },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}`) {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b border-white/[0.06] transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0a12]/90 backdrop-blur-md shadow-lg shadow-black/20"
          : "bg-[#0a0a12]/70 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <div>
              <span className="block text-xl font-bold text-white">{t("common.brand")}</span>
              <p className="text-xs text-slate-400">{t("common.subtitle")}</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-3 py-2 text-sm transition-colors rounded-md"
              >
                <span className={isActive(link.href) ? "text-white font-medium" : "text-slate-400 hover:text-white"}>
                  {link.label}
                </span>
                {isActive(link.href) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-x-1 -bottom-[21px] h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            ))}
            <div className="ml-4 flex items-center gap-3">
              <LanguageSwitcher />
              <Button
                size="sm"
                asChild
                className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:from-blue-400 hover:to-purple-400"
              >
                <Link href={`/${locale}/contact`}>{t("nav.getInTouch")}</Link>
              </Button>
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-white/5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pb-4 border-t border-white/[0.06] pt-4"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm py-2 px-3 rounded-lg transition-colors ${
                      isActive(link.href)
                        ? "text-white font-medium bg-white/5"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] mt-2">
                  <LanguageSwitcher />
                  <Button
                    size="sm"
                    asChild
                    className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-400 hover:to-purple-400"
                  >
                    <Link href={`/${locale}/contact`}>{t("nav.getInTouch")}</Link>
                  </Button>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

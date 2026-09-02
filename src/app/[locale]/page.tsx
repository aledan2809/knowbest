"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Globe,
  Building2,
  Stethoscope,
  Dumbbell,
  Plane,
  ShoppingCart,
  Landmark,
  CheckCircle2,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/PublicLayout";
import { CountUp } from "@/components/CountUp";
import { Eyebrow, SectionTitle, Reveal, GlowBackdrop, CardIndex, Marquee } from "@/components/site";

interface Partner {
  id: string;
  name: string;
  logo: string;
  website?: string;
}

const stats = [
  { key: "projects", value: 20, suffix: "+" },
  { key: "clients", value: 50, suffix: "+" },
  { key: "industries", value: 8, suffix: "" },
  { key: "uptime", value: 99.9, suffix: "%" },
];

const industries = [
  { key: "medical", Icon: Stethoscope },
  { key: "hoa", Icon: Building2 },
  { key: "service", Icon: Dumbbell },
  { key: "horeca", Icon: Plane },
  { key: "supply", Icon: ShoppingCart },
  { key: "public", Icon: Landmark },
  { key: "itweb", Icon: Globe },
];

// Marquee band under the testimonial: real outcomes pulled from the existing
// case-studies i18n content (caseStudies.caseN.title/metric1) — no invented
// quotes; a marquee with the single real testimonial repeated would read fake.
const proofCases = ["case1", "case2", "case3", "case4", "case5", "case6", "case7", "case8", "case9", "case10"];

const flagship = [
  { key: "procuchain", label: "ProcuChain", abbr: "Pc" },
  { key: "ecabinet", label: "eCabinet", abbr: "eC" },
  { key: "blochub", label: "BlocHub", abbr: "BH" },
  { key: "pro", label: "PRO", abbr: "PR" },
  { key: "travelagency", label: "TravelAgency", abbr: "TA" },
  { key: "seap", label: "SEAP Assistant", abbr: "SE" },
  { key: "ave", label: "AVE", abbr: "AV" },
  { key: "marketing", label: "Marketing Automation", abbr: "MA" },
];

// Hero product carousel. Screenshots have the product's UI language baked in,
// so the set is curated per locale: each product is shown only on the page
// whose language matches its real UI. ProcuChain's dashboard + AVE are
// English-only; eat + UtilajHub are Romanian-only. With >1 slide it
// auto-rotates with dots. See knowbest TODO for adding more per-locale slides.
const SLIDE_PROCUCHAIN = {
  key: "procuchain",
  kind: "desktop" as const,
  name: "ProcuChain",
  img: "/dashboard-hero.png",
  w: 1200,
  h: 841,
  url: "https://procuchain.com",
  altKey: "home.heroImageAlt",
  captionKey: "home.heroImageCaption",
};
const SLIDE_AVE = {
  key: "ave",
  kind: "mobile" as const,
  name: "AVE",
  img: "/ave-hero.png",
  w: 353,
  h: 720,
  url: "https://app.techbiz.ae",
  altKey: "home.aveImageAlt",
  captionKey: "home.aveImageCaption",
};
const SLIDE_EAT = {
  key: "eat",
  kind: "mobile" as const,
  name: "eat",
  img: "/eat-hero.png",
  w: 292,
  h: 720,
  url: "https://eat.4pro.io",
  altKey: "home.eatImageAlt",
  captionKey: "home.eatImageCaption",
};
const SLIDE_UTILAJHUB = {
  key: "utilajhub",
  kind: "desktop" as const,
  name: "UtilajHub",
  img: "/utilajhub-hero.png",
  w: 1440,
  h: 900,
  url: "https://utilajhub.ro",
  altKey: "home.utilajhubImageAlt",
  captionKey: "home.utilajhubImageCaption",
};

// Romanian visitors see Romanian-UI products; English visitors see English-UI
// products. Falls back to the English set for any other locale.
const heroSlidesByLocale: Record<string, (typeof SLIDE_PROCUCHAIN | typeof SLIDE_AVE)[]> = {
  ro: [SLIDE_EAT, SLIDE_UTILAJHUB],
  en: [SLIDE_PROCUCHAIN, SLIDE_AVE],
};

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [activeIndustry, setActiveIndustry] = useState("medical");
  const [slide, setSlide] = useState(0);

  const heroSlides = heroSlidesByLocale[locale] ?? heroSlidesByLocale.en;

  useEffect(() => {
    fetch("/api/partners")
      .then((r) => r.json())
      .then((d) => setPartners(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  // Reset to the first slide whenever the locale (and thus the slide set) changes.
  useEffect(() => {
    setSlide(0);
  }, [locale]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % heroSlides.length), 5000);
    return () => clearInterval(id);
  }, [heroSlides.length]);

  const heroSlide = heroSlides[slide] ?? heroSlides[0];

  const active = industries.find((i) => i.key === activeIndustry) || industries[0];
  const ActiveIcon = active.Icon;

  return (
    <PublicLayout>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <GlowBackdrop variant="hero" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex justify-center lg:justify-start"
              >
                <span className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300/90">
                  <span className="relative inline-flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
                  </span>
                  {t("home.badge")}
                </span>
              </motion.div>

              <motion.h1
                initial="hidden"
                animate="show"
                transition={{ staggerChildren: 0.12, delayChildren: 0.1 }}
                className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold mb-6 leading-[1.05] tracking-tight text-white"
              >
                {[t("home.heroTitle"), t("home.heroHighlight")].map((line, i) => (
                  <span key={i} className="block overflow-hidden pb-1.5">
                    <motion.span
                      variants={{
                        hidden: { y: "100%", opacity: 0 },
                        show: { y: 0, opacity: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                      }}
                      className={`block ${i === 1 ? "kb-gradient-text" : ""}`}
                    >
                      {line}
                    </motion.span>
                  </span>
                ))}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-lg md:text-xl text-slate-400 mb-9 max-w-2xl lg:max-w-none"
              >
                {t("home.heroDescription")}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10"
              >
                <Button
                  size="lg"
                  asChild
                  className="gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-7 text-white shadow-lg shadow-indigo-500/30 hover:from-blue-400 hover:to-purple-400"
                >
                  <Link href={`/${locale}/products`}>
                    {t("home.exploreProducts")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="rounded-full border-indigo-400/40 bg-transparent px-7 text-indigo-200 hover:border-indigo-300 hover:bg-indigo-500/10 hover:text-white"
                >
                  <Link href={`/${locale}/contact`}>{t("home.getInTouch")}</Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-white/[0.06] pt-8"
              >
                {stats.map((s) => (
                  <div key={s.key} className="text-center lg:text-left">
                    <div className="text-2xl md:text-3xl font-bold text-white">
                      <CountUp end={s.value} suffix={s.suffix} />
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{t(`home.stats.${s.key}`)}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: product carousel */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="relative"
            >
              <div className="flex h-[360px] items-center justify-center sm:h-[380px] lg:h-[400px]">
                <motion.div
                  key={heroSlide.key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex w-full items-center justify-center"
                >
                  <a
                    href={heroSlide.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={heroSlide.name}
                    className="group block w-full"
                  >
                    {heroSlide.kind === "desktop" ? (
                      <div className="mx-auto w-full max-w-[460px] overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-indigo-950/40 transition-transform duration-300 group-hover:scale-[1.015]">
                        <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.05] px-4 py-2.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                          <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                        </div>
                        <Image
                          src={heroSlide.img}
                          alt={t(heroSlide.altKey)}
                          width={heroSlide.w}
                          height={heroSlide.h}
                          priority
                          className="h-auto w-full"
                        />
                      </div>
                    ) : (
                      <div className="mx-auto aspect-[9/19] h-[360px] overflow-hidden rounded-[2rem] border-4 border-white/15 bg-[#0a0a12] shadow-2xl shadow-indigo-950/40 transition-transform duration-300 group-hover:scale-[1.015]">
                        <Image
                          src={heroSlide.img}
                          alt={t(heroSlide.altKey)}
                          width={heroSlide.w}
                          height={heroSlide.h}
                          priority
                          className="h-full w-full object-cover object-top"
                        />
                      </div>
                    )}
                  </a>
                </motion.div>
              </div>
              <a
                href={heroSlide.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                <span className="font-medium text-indigo-300">{heroSlide.name}</span>
                <span>— {t(heroSlide.captionKey)}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              {heroSlides.length > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  {heroSlides.map((s, i) => (
                    <button
                      key={s.key}
                      onClick={() => setSlide(i)}
                      aria-label={s.name}
                      className={`h-2 rounded-full transition-all ${
                        i === slide
                          ? "w-6 bg-gradient-to-r from-blue-400 to-purple-400"
                          : "w-2 bg-white/15 hover:bg-white/30"
                      }`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-14 hidden items-center justify-center gap-3 text-[11px] font-medium uppercase tracking-[0.3em] text-slate-400 lg:flex"
          >
            <span className="flex h-8 w-5 items-start justify-center rounded-full border border-white/15 p-1">
              <motion.span
                animate={{ y: [0, 8, 0], opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="h-1.5 w-1 rounded-full bg-indigo-300"
              />
            </span>
            {t("home.scrollHint")}
          </motion.div>
        </div>
      </section>

      {/* Industry selector */}
      <section className="relative py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <Eyebrow className="justify-center">{t("home.eyebrow.industries")}</Eyebrow>
            <SectionTitle lines={[t("home.selector.title")]} gradientLine={-1} className="mt-4" />
            <Reveal delay={0.15}>
              <p className="mt-4 text-lg text-slate-400">{t("home.selector.subtitle")}</p>
            </Reveal>
          </div>

          <div className="mb-10 flex flex-wrap justify-center gap-3">
            {industries.map((ind) => {
              const on = ind.key === activeIndustry;
              const ChipIcon = ind.Icon;
              return (
                <button
                  key={ind.key}
                  onClick={() => setActiveIndustry(ind.key)}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                    on
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                      : "border border-white/10 bg-white/[0.03] text-slate-300 hover:border-indigo-400/40 hover:text-white"
                  }`}
                >
                  <ChipIcon className="w-4 h-4" />
                  {t(`home.industries.${ind.key}.chip`)}
                </button>
              );
            })}
          </div>

          <motion.div
            key={activeIndustry}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto flex max-w-3xl flex-col items-start gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm sm:flex-row"
          >
            <div className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25">
              <ActiveIcon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="mb-1 text-xl font-bold text-white md:text-2xl">
                {t("home.selector.prefix")}{" "}
                <span className="kb-gradient-text">{t(`home.industries.${activeIndustry}.name`)}</span>.
              </h3>
              <p className="text-slate-400">{t(`home.industries.${activeIndustry}.line`)}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured products — numbered case-study cards */}
      <section className="relative py-24">
        <GlowBackdrop variant="section" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <Eyebrow className="justify-center">{t("home.eyebrow.products")}</Eyebrow>
            <SectionTitle lines={[t("home.featuredTitle")]} className="mt-4" />
            <Reveal delay={0.15}>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">{t("home.featuredDescription")}</p>
            </Reveal>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {flagship.map((p, i) => (
              <motion.div
                key={p.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-colors duration-300 hover:border-indigo-400/40 hover:bg-white/[0.05]"
              >
                <Link href={`/${locale}/products`} className="block">
                  <div className="mb-5 flex items-start justify-between">
                    <CardIndex index={i} />
                    <ArrowUpRight className="h-4 w-4 text-slate-600 transition-colors group-hover:text-indigo-300" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white transition-colors group-hover:kb-gradient-text">
                    {p.label}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-400">{t(`home.products.${p.key}`)}</p>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button
              variant="outline"
              size="lg"
              asChild
              className="gap-2 rounded-full border-indigo-400/40 bg-transparent px-7 text-indigo-200 hover:border-indigo-300 hover:bg-indigo-500/10 hover:text-white"
            >
              <Link href={`/${locale}/products`}>
                {t("home.viewAllProducts")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Partners */}
      {partners.length > 0 && (
        <section className="py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              {t("home.clientsTitle")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
              {partners.map((partner) => (
                <div key={partner.id} className="rounded-xl bg-white/90 px-5 py-3">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={140}
                    height={50}
                    className="h-9 w-auto object-contain opacity-80 transition-opacity hover:opacity-100"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonial */}
      <section className="relative py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <Eyebrow className="justify-center">{t("home.eyebrow.proof")}</Eyebrow>
          </div>
          <Reveal>
            <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm md:p-10">
              <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />
              <Quote className="mb-4 h-8 w-8 text-indigo-400/50" />
              <p className="mb-6 text-xl leading-relaxed text-slate-200 md:text-2xl">
                {t("home.testimonial.quote")}
              </p>
              <div className="text-sm font-medium text-slate-500">{t("home.testimonial.author")}</div>
            </div>
          </Reveal>
        </div>

        {/* Results marquee — real metrics from the case studies */}
        <Reveal className="mt-12">
          <div
            style={{
              maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
              WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            }}
          >
            <Marquee durationSec={60}>
              {proofCases.map((c) => (
                <Link
                  key={c}
                  href={`/${locale}/case-studies`}
                  className="flex flex-none items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 transition-colors hover:border-indigo-400/40 hover:bg-white/[0.06]"
                >
                  <CheckCircle2 className="h-4 w-4 flex-none text-emerald-400" />
                  <span className="text-sm font-medium text-white">{t(`caseStudies.${c}.metric1`)}</span>
                  <span className="text-sm text-slate-500">· {t(`caseStudies.${c}.title`)}</span>
                </Link>
              ))}
            </Marquee>
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 p-10 text-center text-white md:p-16">
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }}
              />
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

              <div className="relative">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                  <Globe className="h-8 w-8 opacity-90" />
                </div>
                <h2 className="mb-4 text-3xl font-bold md:text-4xl">{t("home.ctaTitle")}</h2>
                <p className="mx-auto mb-8 max-w-xl text-lg opacity-90">{t("home.ctaDescription")}</p>
                <Button size="lg" variant="secondary" asChild className="gap-2 rounded-full px-7">
                  <Link href={`/${locale}/contact`}>
                    {t("home.ctaButton")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <div className="mt-6 flex items-center justify-center gap-2 text-sm opacity-80">
                  <CheckCircle2 className="w-4 h-4" />
                  {t("home.ctaRisk")}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </PublicLayout>
  );
}

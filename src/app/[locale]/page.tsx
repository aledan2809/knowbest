"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Zap,
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

// Hero product carousel. Add a slide per product as a chart-rich, anonymized
// screenshot becomes available (see knowbest TODO). With one slide it renders
// as a single framed image; with >1 it auto-rotates with dots.
const heroSlides = [
  {
    key: "procuchain",
    kind: "desktop" as const,
    name: "ProcuChain",
    img: "/dashboard-hero.png",
    w: 1200,
    h: 841,
    url: "https://procuchain.com",
    altKey: "home.heroImageAlt",
    captionKey: "home.heroImageCaption",
  },
  {
    key: "eat",
    kind: "mobile" as const,
    name: "eat",
    img: "/eat-hero.png",
    w: 292,
    h: 720,
    url: "https://eat.4pro.io",
    altKey: "home.eatImageAlt",
    captionKey: "home.eatImageCaption",
  },
  {
    key: "ave",
    kind: "mobile" as const,
    name: "AVE",
    img: "/ave-hero.png",
    w: 353,
    h: 720,
    url: "https://app.techbiz.ae",
    altKey: "home.aveImageAlt",
    captionKey: "home.aveImageCaption",
  },
];

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [activeIndustry, setActiveIndustry] = useState("medical");
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    fetch("/api/partners")
      .then((r) => r.json())
      .then((d) => setPartners(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % heroSlides.length), 5000);
    return () => clearInterval(id);
  }, []);

  const heroSlide = heroSlides[slide];

  const active = industries.find((i) => i.key === activeIndustry) || industries[0];
  const ActiveIcon = active.Icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PublicLayout>

      {/* Hero — dark */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "26px 26px" }}
        />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 text-blue-300 px-4 py-1.5 text-sm font-medium">
                  <Zap className="w-4 h-4" />
                  {t("home.badge")}
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
              >
                {t("home.heroTitle")}
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {t("home.heroHighlight")}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl lg:max-w-none"
              >
                {t("home.heroDescription")}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10"
              >
                <Button size="lg" asChild className="gap-2 bg-blue-600 hover:bg-blue-500">
                  <Link href={`/${locale}/products`}>
                    {t("home.exploreProducts")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-slate-600 bg-transparent text-slate-200 hover:bg-slate-800 hover:text-white">
                  <Link href={`/${locale}/contact`}>{t("home.getInTouch")}</Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-slate-800 pt-8"
              >
                {stats.map((s) => (
                  <div key={s.key} className="text-center lg:text-left">
                    <div className="text-2xl md:text-3xl font-bold">
                      <CountUp end={s.value} suffix={s.suffix} />
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{t(`home.stats.${s.key}`)}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: product dashboard */}
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
                      <div className="mx-auto w-full max-w-[460px] overflow-hidden rounded-xl border border-slate-700/70 bg-slate-800/40 shadow-2xl transition-transform duration-300 group-hover:scale-[1.015]">
                        <div className="flex items-center gap-1.5 border-b border-slate-700/70 bg-slate-800/60 px-4 py-2.5">
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
                      <div className="mx-auto aspect-[9/19] h-[360px] overflow-hidden rounded-[2rem] border-4 border-slate-700 bg-slate-900 shadow-2xl transition-transform duration-300 group-hover:scale-[1.015]">
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
                className="mt-7 flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                <span className="font-medium text-blue-300">{heroSlide.name}</span>
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
                        i === slide ? "w-6 bg-blue-400" : "w-2 bg-slate-600 hover:bg-slate-500"
                      }`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Industry selector */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-slate-900 mb-3"
            >
              {t("home.selector.title")}
            </motion.h2>
            <p className="text-lg text-slate-600">{t("home.selector.subtitle")}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {industries.map((ind) => {
              const on = ind.key === activeIndustry;
              const ChipIcon = ind.Icon;
              return (
                <button
                  key={ind.key}
                  onClick={() => setActiveIndustry(ind.key)}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                    on
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "bg-white text-slate-700 border border-slate-200 hover:border-blue-300 hover:text-blue-700"
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
            className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col sm:flex-row items-start gap-5 max-w-3xl mx-auto"
          >
            <div className="flex-none w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center">
              <ActiveIcon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-1">
                {t("home.selector.prefix")}{" "}
                <span className="text-blue-600">{t(`home.industries.${activeIndustry}.name`)}</span>.
              </h3>
              <p className="text-slate-600">{t(`home.industries.${activeIndustry}.line`)}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured products */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
            >
              {t("home.featuredTitle")}
            </motion.h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">{t("home.featuredDescription")}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {flagship.map((p, i) => (
              <motion.div
                key={p.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300"
              >
                <Link href={`/${locale}/products`} className="block">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 text-blue-700 font-semibold flex items-center justify-center mb-4">
                    {p.abbr}
                  </div>
                  <h3 className="font-semibold text-lg text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                    {p.label}
                  </h3>
                  <p className="text-sm text-slate-600">{t(`home.products.${p.key}`)}</p>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button variant="outline" size="lg" asChild className="gap-2">
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
            <p className="text-center text-sm font-medium text-slate-400 uppercase tracking-wider mb-8">
              {t("home.clientsTitle")}
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
              {partners.map((partner) => (
                <Image
                  key={partner.id}
                  src={partner.logo}
                  alt={partner.name}
                  width={140}
                  height={50}
                  className="h-10 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonial */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl border border-slate-200 p-8 md:p-10"
          >
            <Quote className="w-8 h-8 text-blue-200 mb-4" />
            <p className="text-xl md:text-2xl text-slate-800 leading-relaxed mb-6">
              {t("home.testimonial.quote")}
            </p>
            <div className="text-sm font-medium text-slate-500">{t("home.testimonial.author")}</div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-10 md:p-16 text-center text-white overflow-hidden"
          >
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }}
            />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm mb-6">
                <Globe className="w-8 h-8 opacity-90" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("home.ctaTitle")}</h2>
              <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">{t("home.ctaDescription")}</p>
              <Button size="lg" variant="secondary" asChild className="gap-2">
                <Link href={`/${locale}/contact`}>
                  {t("home.ctaButton")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <div className="flex items-center justify-center gap-2 text-sm opacity-80 mt-6">
                <CheckCircle2 className="w-4 h-4" />
                {t("home.ctaRisk")}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      </PublicLayout>
    </div>
  );
}

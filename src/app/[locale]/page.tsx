"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Code,
  Users,
  Building2,
  Stethoscope,
  Home as HomeIcon,
  Dumbbell,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/PublicLayout";
import { CountUp } from "@/components/CountUp";

interface Project {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  description: string;
  descriptionEn: string | null;
  category: string;
  status: string;
  icon: string | null;
  featured: boolean;
}

const stats = [
  { key: "projects", value: 28, suffix: "+", icon: Code },
  { key: "clients", value: 50, suffix: "+", icon: Users },
  { key: "industries", value: 8, suffix: "", icon: Building2 },
  { key: "uptime", value: 99.9, suffix: "%", icon: Shield },
];

const useCaseIcons: Record<string, React.ReactNode> = {
  healthcare: <Stethoscope className="w-6 h-6" />,
  hoa: <HomeIcon className="w-6 h-6" />,
  fitness: <Dumbbell className="w-6 h-6" />,
  realestate: <Building2 className="w-6 h-6" />,
  marketing: <TrendingUp className="w-6 h-6" />,
};

interface Partner {
  id: string;
  name: string;
  logo: string;
  website?: string;
}

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch featured projects and partners in parallel
    Promise.all([
      fetch("/api/projects").then(r => r.json()),
      fetch("/api/partners").then(r => r.json())
    ])
      .then(([projectsData, partnersData]) => {
        const projects = Array.isArray(projectsData?.projects) ? projectsData.projects : [];
        setFeaturedProjects(projects.filter((p: Project) => p.featured).slice(0, 4));
        setPartners(Array.isArray(partnersData) ? partnersData : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const useCases = [
    { key: "healthcare", slug: "stt" },
    { key: "hoa", slug: "blochub" },
    { key: "fitness", slug: "4pro" },
    { key: "marketing", slug: "marketing-automation" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PublicLayout>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Dot grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #1e293b 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-transparent" />
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-purple-400/10 to-blue-400/10 blur-3xl"
          animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Badge variant="secondary" className="px-4 py-1.5 text-sm">
                  <Zap className="w-4 h-4 mr-2" />
                  {t("home.badge")}
                </Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight"
              >
                {t("home.heroTitle")}{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {t("home.heroHighlight")}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl lg:max-w-none"
              >
                {t("home.heroDescription")}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Button size="lg" asChild className="gap-2">
                  <Link href={`/${locale}/products`}>
                    {t("home.exploreProducts")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href={`/${locale}/contact`}>
                    {t("home.getInTouch")}
                  </Link>
                </Button>
              </motion.div>
            </div>

            {/* Right: Hero illustration */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="hidden lg:block relative"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-3xl blur-2xl scale-95" />
                <Image
                  src="/hero-illustration.svg"
                  alt="Hero illustration"
                  width={560}
                  height={420}
                  className="relative w-full h-auto drop-shadow-xl"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof / Trusted By */}
      <section className="py-12 border-y border-slate-200/60 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-6">
              {t("home.trustedBy")}
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4">
              {["healthcare", "hoa", "fitness", "marketing"].map((key, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-2 text-slate-400"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    {useCaseIcons[key]}
                  </div>
                  <span className="text-sm font-medium">
                    {t(`home.useCases.${key}.title`)}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Partners Logos Section — Marquee */}
      <section className="py-14 bg-white/40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-sm font-medium text-slate-400 uppercase tracking-wider mb-10"
          >
            {t("home.clientsTitle")}
          </motion.p>
        </div>
        {/* Infinite marquee — right to left */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white/80 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white/80 to-transparent z-10" />
          <div className="flex animate-marquee gap-16 items-center">
            {[...partners, ...partners].map((partner, i) => (
              <div
                key={`${partner.name}-${i}`}
                className="flex-shrink-0 hover:scale-110 transition-transform duration-300"
              >
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={140}
                  height={50}
                  className="h-10 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-600/25 transition-all duration-300">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                  <CountUp end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-slate-500">
                  {t(`home.stats.${stat.key}`)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20">
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
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-600 max-w-2xl mx-auto"
            >
              {t("home.featuredDescription")}
            </motion.p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">{t("common.loading")}</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer"
                >
                  <Link href={`/${locale}/products`} className="block">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center mb-4 group-hover:from-blue-100 group-hover:to-purple-100 transition-colors duration-300">
                      <span className="text-4xl drop-shadow-sm">{project.icon || "📦"}</span>
                    </div>
                    <h3 className="font-semibold text-lg text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                      {locale === "en" && project.nameEn ? project.nameEn : project.name}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                      {locale === "en" && project.descriptionEn ? project.descriptionEn : project.description}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {t(`categories.${project.category}`)}
                    </Badge>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Button variant="outline" size="lg" asChild className="gap-2">
              <Link href={`/${locale}/products`}>
                {t("home.viewAllProducts")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Use Cases Preview */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              {t("home.useCasesTitle")}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-400 max-w-2xl mx-auto"
            >
              {t("home.useCasesDescription")}
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all duration-300 cursor-pointer"
                whileHover={{ y: -4 }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-600/25 transition-all duration-300">
                  {useCaseIcons[useCase.key]}
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-300 transition-colors">
                  {t(`home.useCases.${useCase.key}.title`)}
                </h3>
                <p className="text-sm text-slate-400">
                  {t(`home.useCases.${useCase.key}.description`)}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Button variant="secondary" size="lg" asChild className="gap-2">
              <Link href={`/${locale}/use-cases`}>
                {t("home.exploreUseCases")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-10 md:p-16 text-center text-white overflow-hidden"
          >
            {/* Subtle pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            {/* Glow effects */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm mb-6">
                <Globe className="w-8 h-8 opacity-90" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("home.ctaTitle")}
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                {t("home.ctaDescription")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild className="gap-2">
                  <Link href={`/${locale}/contact`}>
                    {t("home.ctaButton")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
                  <Link href={`/${locale}/about`}>
                    {t("home.learnMore")}
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      </PublicLayout>
    </div>
  );
}

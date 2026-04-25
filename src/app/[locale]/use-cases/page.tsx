"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import {
  Stethoscope,
  Home as HomeIcon,
  Dumbbell,
  Building2,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/PublicLayout";

interface Project {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  description: string;
  descriptionEn: string | null;
  icon: string | null;
  prodUrl: string | null;
  demoUrl: string | null;
}

const useCaseIcons: Record<string, React.ReactNode> = {
  healthcare: <Stethoscope className="w-8 h-8" />,
  hoa: <HomeIcon className="w-8 h-8" />,
  fitness: <Dumbbell className="w-8 h-8" />,
  realestate: <Building2 className="w-8 h-8" />,
  marketing: <TrendingUp className="w-8 h-8" />,
};

const useCaseSlugs: Record<string, string[]> = {
  healthcare: ["stt", "ecabinet", "ocr"],
  hoa: ["blochub"],
  fitness: ["4pro", "4pro-biz"],
  realestate: ["seap"],
  marketing: ["marketing-automation", "email-guru", "feedback-hub"],
};

// Subtle background gradients per section
const sectionGradients = [
  "from-blue-50/50 to-transparent",
  "from-purple-50/50 to-transparent",
  "from-indigo-50/50 to-transparent",
  "from-sky-50/50 to-transparent",
  "from-violet-50/50 to-transparent",
];

export default function UseCasesPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        setProjects(data.projects || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const useCases = ["healthcare", "hoa", "fitness", "realestate", "marketing"];

  const getProjectsForUseCase = (useCaseKey: string): Project[] => {
    const slugs = useCaseSlugs[useCaseKey] || [];
    return projects.filter((p) => slugs.includes(p.slug));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PublicLayout>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Badge variant="secondary" className="px-4 py-1.5 text-sm">
                <Briefcase className="w-4 h-4 mr-2" />
                {t("useCases.badge")}
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6"
            >
              {t("useCases.heroTitle")}{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t("useCases.heroHighlight")}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto"
            >
              {t("useCases.heroDescription")}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Use Cases List */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-20 text-slate-400">{t("common.loading")}</div>
          ) : (
            <div className="space-y-0">
              {useCases.map((useCaseKey, index) => {
                const relatedProjects = getProjectsForUseCase(useCaseKey);
                const isReversed = index % 2 === 1;

                return (
                  <div key={useCaseKey} className="relative">
                    {/* Subtle background gradient per section */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${sectionGradients[index % sectionGradients.length]} rounded-3xl`} />

                    {/* Divider between sections */}
                    {index > 0 && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                    )}

                    <motion.div
                      initial={{ opacity: 0, x: isReversed ? 40 : -40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="relative grid lg:grid-cols-2 gap-12 items-center py-16"
                    >
                      <div className={isReversed ? "lg:order-2" : ""}>
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white mb-6 shadow-lg shadow-blue-600/20">
                          {useCaseIcons[useCaseKey]}
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">
                          {t(`useCases.cases.${useCaseKey}.title`)}
                        </h2>
                        <p className="text-lg text-slate-600 mb-6">
                          {t(`useCases.cases.${useCaseKey}.description`)}
                        </p>

                        <div className="space-y-3 mb-8">
                          {[1, 2, 3].map((i) => (
                            <motion.div
                              key={`${useCaseKey}-benefit-${i}`}
                              initial={{ opacity: 0, x: -10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.2 + i * 0.1 }}
                              className="flex items-start gap-3"
                            >
                              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-slate-600">
                                {t(`useCases.cases.${useCaseKey}.benefit${i}`)}
                              </span>
                            </motion.div>
                          ))}
                        </div>

                        <Button asChild className="gap-2">
                          <Link href={`/${locale}/contact`}>
                            {t("useCases.getStarted")}
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>

                      <div className={isReversed ? "lg:order-1" : ""}>
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                            {t("useCases.relatedProducts")}
                          </h3>
                          <div className="space-y-3">
                            {relatedProjects.map((project, pi) => (
                              <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 + pi * 0.1 }}
                                className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 border border-transparent hover:border-slate-200 transition-all duration-200"
                              >
                                <div className="text-3xl flex-shrink-0">
                                  {project.icon || "📦"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-slate-900">
                                    {locale === "en" && project.nameEn ? project.nameEn : project.name}
                                  </h4>
                                  <p className="text-sm text-slate-600 line-clamp-1">
                                    {locale === "en" && project.descriptionEn
                                      ? project.descriptionEn
                                      : project.description}
                                  </p>
                                </div>
                                {(project.prodUrl || project.demoUrl) && (
                                  <Button size="sm" variant="outline" asChild>
                                    <a
                                      href={project.prodUrl || project.demoUrl || "#"}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {t("useCases.viewProduct")}
                                    </a>
                                  </Button>
                                )}
                              </motion.div>
                            ))}
                            {relatedProjects.length === 0 && (
                              <p className="text-slate-400 text-center py-4">
                                {t("useCases.noProducts")}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          )}
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
            {/* Glow effects */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("useCases.ctaTitle")}
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                {t("useCases.ctaDescription")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild className="gap-2">
                  <Link href={`/${locale}/contact`}>
                    {t("useCases.ctaButton")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
                >
                  <Link href={`/${locale}/products`}>{t("useCases.browseProducts")}</Link>
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

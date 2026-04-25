"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Stethoscope,
  Calculator,
  ShoppingCart,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/PublicLayout";

interface CaseStudy {
  key: string;
  icon: React.ReactNode;
}

const industries: { key: string; icon: React.ReactNode; gradient: string; cases: string[] }[] = [
  {
    key: "healthcare",
    icon: <Stethoscope className="w-6 h-6" />,
    gradient: "from-emerald-500/10 to-teal-500/10",
    cases: ["case1", "case2", "case3", "case4"],
  },
  {
    key: "finance",
    icon: <Calculator className="w-6 h-6" />,
    gradient: "from-blue-500/10 to-indigo-500/10",
    cases: ["case5", "case6", "case7"],
  },
  {
    key: "retail",
    icon: <ShoppingCart className="w-6 h-6" />,
    gradient: "from-orange-500/10 to-amber-500/10",
    cases: ["case8", "case9"],
  },
  {
    key: "consulting",
    icon: <Briefcase className="w-6 h-6" />,
    gradient: "from-purple-500/10 to-pink-500/10",
    cases: ["case10"],
  },
];

const iconColors: Record<string, string> = {
  healthcare: "from-emerald-600 to-teal-600",
  finance: "from-blue-600 to-indigo-600",
  retail: "from-orange-600 to-amber-600",
  consulting: "from-purple-600 to-pink-600",
};

export default function CaseStudiesPage() {
  const t = useTranslations("caseStudies");
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PublicLayout>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #1e293b 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Badge variant="secondary" className="px-4 py-1.5 text-sm">
                {t("badge")}
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight"
            >
              {t("heroTitle")}{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t("heroHighlight")}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-600"
            >
              {t("heroDescription")}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Case Studies by Industry */}
      {industries.map((industry, sectionIndex) => (
        <section
          key={industry.key}
          className={`py-16 ${sectionIndex % 2 === 0 ? "bg-white/50" : "bg-slate-50/80"}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Industry Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-10"
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${iconColors[industry.key]} text-white`}
              >
                {industry.icon}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                {t(industry.key)}
              </h2>
            </motion.div>

            {/* Case Study Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {industry.cases.map((caseKey, cardIndex) => (
                <motion.div
                  key={caseKey}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: cardIndex * 0.1 }}
                  className={`group bg-gradient-to-br ${industry.gradient} rounded-2xl border border-slate-200/60 p-6 md:p-8 hover:shadow-lg hover:border-slate-300 transition-all duration-300`}
                >
                  <div className="bg-white/80 rounded-xl p-6">
                    <h3 className="font-semibold text-lg text-slate-900 mb-3">
                      {t(`${caseKey}.title`)}
                    </h3>
                    <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                      {t(`${caseKey}.description`)}
                    </p>

                    {/* Metrics */}
                    <div className="space-y-2.5 mb-5">
                      {["metric1", "metric2", "metric3"].map((metric) => (
                        <div key={metric} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                          <span className="text-sm text-slate-700">
                            {t(`${caseKey}.${metric}`)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {["tag1", "tag2", "tag3"].map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs font-normal"
                        >
                          {t(`${caseKey}.${tag}`)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
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
              style={{
                backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("ctaTitle")}
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                {t("ctaDescription")}
              </p>
              <Button size="lg" variant="secondary" asChild className="gap-2">
                <Link href={`/${locale}/contact`}>
                  {t("ctaButton")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      </PublicLayout>
    </div>
  );
}

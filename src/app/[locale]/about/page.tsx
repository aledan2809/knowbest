"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import {
  Target,
  Lightbulb,
  Users,
  Globe,
  Shield,
  Heart
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/PublicLayout";

const values = [
  { key: "innovation", icon: Lightbulb },
  { key: "quality", icon: Target },
  { key: "collaboration", icon: Users },
  { key: "reliability", icon: Shield },
];

const techStack = [
  { name: "Next.js", category: "Frontend" },
  { name: "React", category: "Frontend" },
  { name: "TypeScript", category: "Language" },
  { name: "Node.js", category: "Backend" },
  { name: "Fastify", category: "Backend" },
  { name: "PostgreSQL", category: "Database" },
  { name: "Neon", category: "Database" },
  { name: "Prisma", category: "ORM" },
  { name: "Python", category: "Backend" },
  { name: "FastAPI", category: "Backend" },
  { name: "OpenAI", category: "AI" },
  { name: "Deepgram", category: "AI" },
  { name: "Tailwind CSS", category: "Styling" },
  { name: "Stripe", category: "Payments" },
  { name: "Docker", category: "DevOps" },
  { name: "Vercel", category: "Hosting" },
];

const milestones = [
  { year: "2020", key: "founded" },
  { year: "2021", key: "firstProduct" },
  { year: "2022", key: "expansion" },
  { year: "2023", key: "aiIntegration" },
  { year: "2024", key: "scale" },
];

export default function AboutPage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <PublicLayout>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-transparent" />
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 blur-3xl"
          animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Badge variant="secondary" className="px-4 py-1.5 text-sm">
                <Heart className="w-4 h-4 mr-2" />
                {t("about.badge")}
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6"
            >
              {t("about.heroTitle")}{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t("about.heroHighlight")}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto"
            >
              {t("about.heroDescription")}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
                  {t("about.storyTitle")}
                </span>
              </h2>
              <div className="space-y-4 text-slate-600">
                <p>{t("about.storyP1")}</p>
                <p>{t("about.storyP2")}</p>
                <p>{t("about.storyP3")}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden h-[400px] relative bg-gradient-to-br from-blue-50 to-purple-50">
                <Image
                  src="/about-illustration.svg"
                  alt="About KnowBest"
                  width={800}
                  height={600}
                  className="w-full h-full object-contain p-8"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/90 via-purple-600/60 to-transparent flex flex-col justify-end p-8 text-white">
                  <Globe className="w-12 h-12 mb-4 opacity-90" />
                  <h3 className="text-2xl font-bold mb-3">{t("about.missionTitle")}</h3>
                  <p className="text-white/95">{t("about.missionDescription")}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                {t("about.valuesTitle")}
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-600 max-w-2xl mx-auto"
            >
              {t("about.valuesDescription")}
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-2xl border border-slate-200 p-6 text-center hover:shadow-xl hover:border-blue-200 transition-all duration-300"
                whileHover={{ y: -4 }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-600/25 transition-all duration-300">
                  <value.icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">
                  {t(`about.values.${value.key}.title`)}
                </h3>
                <p className="text-sm text-slate-600">
                  {t(`about.values.${value.key}.description`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                {t("about.techTitle")}
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-400 max-w-2xl mx-auto"
            >
              {t("about.techDescription")}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3"
          >
            {techStack.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
              >
                <Badge
                  variant="secondary"
                  className="px-4 py-2 text-sm bg-slate-800 text-slate-200 border-slate-700 hover:bg-blue-600 hover:border-blue-500 hover:text-white hover:scale-105 transition-all duration-200 cursor-default"
                >
                  {tech.name}
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t("about.timelineTitle")}
              </span>
            </motion.h2>
          </div>

          <div className="relative">
            {/* Gradient timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 md:left-1/2 md:-translate-x-1/2 bg-gradient-to-b from-blue-600 via-purple-500 to-blue-600" />

            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex items-center gap-8 mb-8 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"} pl-20 md:pl-0`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300"
                  >
                    <span className="inline-block text-sm font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text mb-1">
                      {milestone.year}
                    </span>
                    <h3 className="font-semibold text-slate-900 mb-2">
                      {t(`about.milestones.${milestone.key}.title`)}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {t(`about.milestones.${milestone.key}.description`)}
                    </p>
                  </motion.div>
                </div>

                {/* Timeline dot with ring */}
                <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 border-4 border-white shadow-md ring-2 ring-blue-100" />

                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
    </PublicLayout>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Search, ExternalLink, Lock, Sparkles, Code, Globe, Cpu, Play, Rocket, PackageOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/PublicLayout";

interface Project {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  description: string;
  descriptionEn: string | null;
  category: string;
  status: string;
  demoUrl: string | null;
  prodUrl: string | null;
  standalone: boolean;
  icon: string | null;
  coverImage: string | null;
  tags: string[];
  techStack: string[];
  featured: boolean;
  accessType: string;
  pricingType: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  WEB_APP: <Globe className="w-4 h-4" />,
  API_SERVICE: <Code className="w-4 h-4" />,
  MODULE: <Cpu className="w-4 h-4" />,
  UTILITY: <Sparkles className="w-4 h-4" />,
  MOBILE_APP: <Globe className="w-4 h-4" />,
};

const statusColors: Record<string, string> = {
  LIVE: "bg-green-500",
  BETA: "bg-yellow-500",
  DEVELOPMENT: "bg-blue-500",
  COMING_SOON: "bg-purple-500",
  DEPRECATED: "bg-gray-500",
};

export default function ProductsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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

  const categories = [...new Set(projects.map((p) => p.category))];

  const filtered = projects.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featured = filtered.filter((p) => p.featured);
  const regular = filtered.filter((p) => !p.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PublicLayout>

      {/* Hero with gradient mesh background */}
      <section className="relative overflow-hidden">
        {/* Gradient mesh */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/8 rounded-full blur-3xl" />
          <div className="absolute top-10 right-1/4 w-80 h-80 bg-purple-400/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-indigo-400/6 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center relative">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
          >
            {t("products.title")}{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t("products.titleHighlight")}
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto mb-8"
          >
            {t("products.subtitle")}
          </motion.p>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto space-y-4"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder={t("common.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12 text-base bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm"
              />
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                size="sm"
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
              >
                {t("common.all")}
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  size="sm"
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat)}
                  className="gap-1"
                >
                  {categoryIcons[cat]}
                  {t(`categories.${cat}`)}
                </Button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Projects Grid */}
      <section id="portfolio" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {loading ? (
          <div className="text-center py-20 text-slate-400">{t("common.loading")}</div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-100 mb-6">
              <PackageOpen className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-lg text-slate-500 font-medium mb-2">
              {projects.length === 0 ? t("portfolio.noProjects") : t("portfolio.noResults")}
            </p>
            {search && (
              <Button variant="ghost" size="sm" onClick={() => setSearch("")} className="text-slate-400">
                {t("common.clearSearch")}
              </Button>
            )}
          </motion.div>
        ) : (
          <>
            {featured.length > 0 && (
              <div className="mb-12">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">
                  {t("portfolio.featured")}
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {featured.map((project, i) => (
                    <ProjectCard key={project.id} project={project} index={i} featured t={t} locale={locale} />
                  ))}
                </div>
              </div>
            )}

            <div>
              {featured.length > 0 && (
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">
                  {t("portfolio.allProjects")}
                </h3>
              )}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {regular.map((project, i) => (
                  <ProjectCard key={project.id} project={project} index={i} t={t} locale={locale} />
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      </PublicLayout>
    </div>
  );
}

function ProjectCard({
  project,
  index,
  featured = false,
  t,
  locale,
}: {
  project: Project;
  index: number;
  featured?: boolean;
  t: (key: string) => string;
  locale: string;
}) {
  const name = locale === "en" && project.nameEn ? project.nameEn : project.name;
  const description = locale === "en" && project.descriptionEn ? project.descriptionEn : project.description;
  // Only expose a clickable production link for stable, LIVE products — never send
  // a visitor into a BETA/in-progress or module-without-UI surface.
  const showProd = !!project.prodUrl && project.status === "LIVE";
  const showDemo = !!project.demoUrl;
  const hasLinks = showProd || showDemo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ delay: index * 0.05 }}
      className={`group relative bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl ${
        featured ? "md:flex" : ""
      }`}
      style={{ isolation: "isolate" }}
    >
      {/* Gradient border on hover */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
      <div className="absolute inset-0 rounded-2xl bg-white -z-[5]" />

      <div
        className={`bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 group-hover:from-blue-100/80 group-hover:to-purple-100/80 flex items-center justify-center transition-colors duration-500 ${
          featured ? "md:w-2/5 h-48 md:h-auto" : "h-40"
        }`}
      >
        {project.coverImage ? (
          <img src={project.coverImage} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="relative flex items-center justify-center">
            <motion.div
              aria-hidden
              className="absolute h-24 w-24 rounded-full bg-gradient-to-br from-blue-400/40 to-purple-400/40 blur-2xl"
              animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              className="relative text-6xl drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              {project.icon || "📦"}
            </motion.span>
          </div>
        )}
      </div>

      <div className={`p-5 ${featured ? "md:w-3/5" : ""}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 text-lg group-hover:text-blue-700 transition-colors">{name}</h3>
            {project.standalone && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Rocket className="w-3 h-3" />
                {t("portfolio.standalone")}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${statusColors[project.status]}`} />
            <span className="text-xs text-slate-500">{t(`status.${project.status}`)}</span>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{description}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.techStack.slice(0, 4).map((tech) => (
            <Badge key={tech} variant="secondary" className="text-xs">{tech}</Badge>
          ))}
          {project.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {hasLinks ? (
            <>
              {showDemo && (
                <Button size="sm" variant={showProd ? "outline" : "default"} asChild className="gap-1.5">
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                    {project.accessType === "PASSWORD" ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                    {project.accessType === "PASSWORD" ? t("portfolio.passwordAccess") : t("portfolio.viewDemo")}
                  </a>
                </Button>
              )}
              {showProd && (
                <Button size="sm" asChild className="gap-1.5">
                  <a href={project.prodUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5" />
                    {t("portfolio.viewProduction")}
                  </a>
                </Button>
              )}
            </>
          ) : (
            <Button size="sm" variant="secondary" disabled className="cursor-default">
              {project.status === "BETA" ? t("portfolio.comingSoon") : t("portfolio.onRequest")}
            </Button>
          )}
          <Badge variant="outline" className="gap-1 text-xs">
            {categoryIcons[project.category]}
            {t(`categories.${project.category}`)}
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Search, ExternalLink, Lock, Sparkles, Code, Globe, Cpu, Play, Rocket, PackageOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/PublicLayout";
import { GlowBackdrop, CardIndex, Tilt } from "@/components/site";

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
  tagsEn: string[];
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
  LIVE: "bg-green-400",
  BETA: "bg-yellow-400",
  DEVELOPMENT: "bg-blue-400",
  COMING_SOON: "bg-purple-400",
  DEPRECATED: "bg-gray-500",
};

export default function ProductsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
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
  // Technology axis (the benchmark filters by category AND tech). Ordered by
  // how many products use it, capped so the chip row stays scannable.
  const techCounts = projects.reduce<Record<string, number>>((acc, p) => {
    (p.techStack || []).forEach((tech) => {
      acc[tech] = (acc[tech] || 0) + 1;
    });
    return acc;
  }, {});
  const technologies = Object.entries(techCounts)
    .filter(([, n]) => n > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tech]) => tech);

  const filtered = projects.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())) ||
      (p.tagsEn || []).some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    const matchesTech = !selectedTech || (p.techStack || []).includes(selectedTech);
    return matchesSearch && matchesCategory && matchesTech;
  });

  const featured = filtered.filter((p) => p.featured);
  const regular = filtered.filter((p) => !p.featured);

  const chipClass = (on: boolean) =>
    on
      ? "rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:from-blue-400 hover:to-purple-400 hover:text-white"
      : "rounded-full border border-white/10 bg-white/[0.03] text-slate-300 hover:border-indigo-400/40 hover:bg-white/[0.06] hover:text-white";

  return (
    <PublicLayout>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <GlowBackdrop variant="hero" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center relative">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4"
          >
            {t("products.title")}{" "}
            <span className="kb-gradient-text">{t("products.titleHighlight")}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto mb-8"
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input
                placeholder={t("common.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12 text-base rounded-full border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 backdrop-blur-sm focus-visible:border-indigo-400/60 focus-visible:ring-indigo-400/20"
              />
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedCategory(null)}
                className={chipClass(selectedCategory === null)}
              >
                {t("common.all")}
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedCategory(cat)}
                  className={`gap-1 ${chipClass(selectedCategory === cat)}`}
                >
                  {categoryIcons[cat]}
                  {t(`categories.${cat}`)}
                </Button>
              ))}
            </div>

            {technologies.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                <span className="w-full text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                  {t("portfolio.byTechnology")}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedTech(null)}
                  className={chipClass(selectedTech === null)}
                >
                  {t("common.all")}
                </Button>
                {technologies.map((tech) => (
                  <Button
                    key={tech}
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedTech(tech)}
                    className={chipClass(selectedTech === tech)}
                  >
                    {tech}
                  </Button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Projects Grid */}
      <section id="portfolio" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {loading ? (
          <div className="text-center py-20 text-slate-500">{t("common.loading")}</div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/10 mb-6">
              <PackageOpen className="w-10 h-10 text-slate-500" />
            </div>
            <p className="text-lg text-slate-400 font-medium mb-2">
              {projects.length === 0 ? t("portfolio.noProjects") : t("portfolio.noResults")}
            </p>
            {search && (
              <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setSelectedTech(null); setSelectedCategory(null); }} className="text-slate-500 hover:text-white hover:bg-white/5">
                {t("common.clearSearch")}
              </Button>
            )}
          </motion.div>
        ) : (
          <>
            {featured.length > 0 && (
              <div className="mb-12">
                <h3 className="mb-6 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300/90">
                  <span className="inline-flex h-2 w-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
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
                <h3 className="mb-6 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300/90">
                  <span className="inline-flex h-2 w-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
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
  const tags = locale === "en" && project.tagsEn?.length ? project.tagsEn : project.tags;
  // Only expose a clickable production link for stable, LIVE products — never send
  // a visitor into a BETA/in-progress or module-without-UI surface.
  const showProd = !!project.prodUrl && project.status === "LIVE";
  const showDemo = !!project.demoUrl;
  const hasLinks = showProd || showDemo;

  return (
    <Tilt max={5} className={featured ? "" : "h-full"}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ delay: index * 0.05 }}
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm transition-colors duration-300 hover:border-indigo-400/40 hover:bg-white/[0.05] ${
        featured ? "md:flex" : "h-full"
      }`}
    >
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 transition-colors duration-500 group-hover:from-blue-500/20 group-hover:to-purple-500/20 ${
          featured ? "md:w-2/5 h-48 md:h-auto" : "h-40"
        }`}
      >
        {project.coverImage ? (
          <img src={project.coverImage} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="relative flex items-center justify-center">
            <motion.div
              aria-hidden
              className="absolute h-24 w-24 rounded-full bg-gradient-to-br from-blue-400/30 to-purple-400/30 blur-2xl"
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
            <CardIndex index={index} />
            <h3 className="font-semibold text-white text-lg transition-colors group-hover:kb-gradient-text">{name}</h3>
            {project.standalone && (
              <Badge variant="secondary" className="text-xs gap-1 border-white/10 bg-white/[0.06] text-slate-300">
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

        <p className="text-sm text-slate-400 mb-3 line-clamp-2">{description}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.techStack.slice(0, 4).map((tech) => (
            <Badge key={tech} variant="secondary" className="text-xs border-white/10 bg-white/[0.06] text-slate-300">
              {tech}
            </Badge>
          ))}
          {tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs border-white/15 text-slate-400">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {hasLinks ? (
            <>
              {showDemo && (
                <Button
                  size="sm"
                  variant="ghost"
                  asChild
                  className={`gap-1.5 rounded-full ${
                    showProd
                      ? "border border-indigo-400/40 bg-transparent text-indigo-200 hover:border-indigo-300 hover:bg-indigo-500/10 hover:text-white"
                      : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-400 hover:to-purple-400 hover:text-white"
                  }`}
                >
                  <a href={project.demoUrl!} target="_blank" rel="noopener noreferrer">
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
                <Button
                  size="sm"
                  variant="ghost"
                  asChild
                  className="gap-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20 hover:from-blue-400 hover:to-purple-400 hover:text-white"
                >
                  <a href={project.prodUrl!} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5" />
                    {t("portfolio.viewProduction")}
                  </a>
                </Button>
              )}
            </>
          ) : (
            <Button size="sm" variant="secondary" disabled className="cursor-default rounded-full border-white/10 bg-white/[0.06] text-slate-400">
              {project.status === "BETA" ? t("portfolio.comingSoon") : t("portfolio.onRequest")}
            </Button>
          )}
          <Badge variant="outline" className="gap-1 text-xs border-white/15 text-slate-400">
            {categoryIcons[project.category]}
            {t(`categories.${project.category}`)}
          </Badge>
        </div>
      </div>
    </motion.div>
    </Tilt>
  );
}

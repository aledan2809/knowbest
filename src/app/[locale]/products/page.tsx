import { prisma } from "@/lib/db";
import { ProductsBrowser, type Project } from "@/components/products/ProductsBrowser";

// The products come ready from the server (2026-10-17): the page used to load them in the browser, so
// search engines and assistants saw only "Se incarca…". Only the fields the page shows leave the server.
export default async function ProductsPage() {
  const rows = await prisma.project.findMany({
    where: { visible: true },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true, name: true, nameEn: true, slug: true, description: true, descriptionEn: true, category: true, status: true,
      demoUrl: true, prodUrl: true, standalone: true, icon: true, coverImage: true, tags: true, tagsEn: true, highlights: true,
      highlightsEn: true, tagline: true, taglineEn: true, techStack: true, featured: true, accessType: true, pricingType: true,
    },
  });
  const list = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
  const projects: Project[] = rows.map((p) => ({
    ...p,
    description: p.description ?? "",
    tags: list(p.tags),
    tagsEn: list(p.tagsEn),
    highlights: list(p.highlights),
    highlightsEn: list(p.highlightsEn),
    techStack: list(p.techStack),
  }));
  return <ProductsBrowser projects={projects} />;
}

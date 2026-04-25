"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Loader2,
  LayoutGrid,
  X,
  FileEdit,
  Lock,
  LogOut,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PageEditor } from "@/components/admin/PageEditor";
import { PartnersManagement } from "@/components/admin/PartnersManagement";

interface Project {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  description: string | null;
  descriptionEn: string | null;
  longDescription: string | null;
  longDescriptionEn: string | null;
  category: string;
  status: string;
  demoUrl: string | null;
  prodUrl: string | null;
  repoUrl: string | null;
  standalone: boolean;
  icon: string | null;
  coverImage: string | null;
  screenshots: string[];
  videoUrl: string | null;
  tags: string[];
  techStack: string[];
  sortOrder: number;
  visible: boolean;
  featured: boolean;
  accessType: string;
  accessCode: string | null;
  pricingType: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
}

const emptyProject: Partial<Project> = {
  name: "",
  nameEn: "",
  slug: "",
  description: "",
  descriptionEn: "",
  longDescription: "",
  longDescriptionEn: "",
  category: "WEB_APP",
  status: "DEVELOPMENT",
  demoUrl: "",
  prodUrl: "",
  repoUrl: "",
  standalone: false,
  icon: "",
  coverImage: "",
  screenshots: [],
  videoUrl: "",
  tags: [],
  techStack: [],
  visible: true,
  featured: false,
  accessType: "PUBLIC",
  accessCode: "",
  pricingType: "FREE",
  monthlyPrice: null,
  yearlyPrice: null,
};

const PRICING_TYPES = ["FREE", "FREEMIUM", "PAID", "CONTACT"];

const CATEGORIES = ["WEB_APP", "API_SERVICE", "MODULE", "UTILITY", "MOBILE_APP"];
const STATUSES = ["LIVE", "BETA", "DEVELOPMENT", "COMING_SOON", "DEPRECATED"];
const ACCESS_TYPES = ["PUBLIC", "PASSWORD", "AUTHENTICATED", "SUBSCRIBERS"];

export default function AdminPage() {
  const t = useTranslations();
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"portfolio" | "pages" | "partners">("portfolio");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [saving, setSaving] = useState(false);
  const [tagsInput, setTagsInput] = useState("");

  // Check auth on mount
  useEffect(() => {
    fetch("/api/admin/auth")
      .then((r) => r.json())
      .then((data) => {
        setAuthenticated(data.authenticated);
        setAuthChecking(false);
      })
      .catch(() => setAuthChecking(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: loginPassword }),
      });
      if (!res.ok) {
        setLoginError("Invalid password");
      } else {
        setAuthenticated(true);
        setLoginPassword("");
      }
    } catch {
      setLoginError("Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthenticated(false);
  };
  const [techInput, setTechInput] = useState("");
  const [screenshotInput, setScreenshotInput] = useState("");

  const fetchProjects = useCallback(async () => {
    const res = await fetch("/api/admin/projects");
    const data = await res.json();
    setProjects(data.projects || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const openCreate = () => {
    setEditingProject({ ...emptyProject });
    setTagsInput("");
    setTechInput("");
    setScreenshotInput("");
    setDialogOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditingProject({ ...project });
    setTagsInput(project.tags.join(", "));
    setTechInput(project.techStack.join(", "));
    setScreenshotInput("");
    setDialogOpen(true);
  };

  const addScreenshot = () => {
    if (!screenshotInput.trim()) return;
    setEditingProject((p) => ({
      ...p,
      screenshots: [...(p?.screenshots || []), screenshotInput.trim()],
    }));
    setScreenshotInput("");
  };

  const removeScreenshot = (index: number) => {
    setEditingProject((p) => ({
      ...p,
      screenshots: (p?.screenshots || []).filter((_, i) => i !== index),
    }));
  };

  const addTag = (value: string) => {
    if (!value.trim()) return;
    const newTags = value.split(",").map((s) => s.trim()).filter(Boolean);
    setEditingProject((p) => ({
      ...p,
      tags: [...new Set([...(p?.tags || []), ...newTags])],
    }));
    setTagsInput("");
  };

  const removeTag = (tag: string) => {
    setEditingProject((p) => ({
      ...p,
      tags: (p?.tags || []).filter((t) => t !== tag),
    }));
  };

  const addTech = (value: string) => {
    if (!value.trim()) return;
    const newTech = value.split(",").map((s) => s.trim()).filter(Boolean);
    setEditingProject((p) => ({
      ...p,
      techStack: [...new Set([...(p?.techStack || []), ...newTech])],
    }));
    setTechInput("");
  };

  const removeTech = (tech: string) => {
    setEditingProject((p) => ({
      ...p,
      techStack: (p?.techStack || []).filter((t) => t !== tech),
    }));
  };

  const handleSave = async () => {
    if (!editingProject?.name || !editingProject?.slug) return;
    setSaving(true);

    const payload = {
      ...editingProject,
      tags: editingProject.tags || [],
      techStack: editingProject.techStack || [],
      screenshots: editingProject.screenshots || [],
      nameEn: editingProject.nameEn || null,
      descriptionEn: editingProject.descriptionEn || null,
      longDescription: editingProject.longDescription || null,
      longDescriptionEn: editingProject.longDescriptionEn || null,
      demoUrl: editingProject.demoUrl || null,
      prodUrl: editingProject.prodUrl || null,
      repoUrl: editingProject.repoUrl || null,
      standalone: editingProject.standalone ?? false,
      accessCode: editingProject.accessType === "PASSWORD" ? (editingProject.accessCode || null) : null,
      icon: editingProject.icon || null,
      coverImage: editingProject.coverImage || null,
      videoUrl: editingProject.videoUrl || null,
      pricingType: editingProject.pricingType || "FREE",
      monthlyPrice: editingProject.pricingType === "PAID" ? (editingProject.monthlyPrice ?? null) : null,
      yearlyPrice: editingProject.pricingType === "PAID" ? (editingProject.yearlyPrice ?? null) : null,
    };

    const isNew = !editingProject.id;
    const res = await fetch("/api/admin/projects", {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setDialogOpen(false);
      setEditingProject(null);
      await fetchProjects();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t("admin.confirmDelete", { name }))) return;
    await fetch(`/api/admin/projects?id=${id}`, { method: "DELETE" });
    await fetchProjects();
  };

  const toggleField = async (id: string, field: "visible" | "featured", value: boolean) => {
    await fetch("/api/admin/projects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [field]: value }),
    });
    await fetchProjects();
  };

  const moveProject = async (id: string, direction: "up" | "down") => {
    const idx = projects.findIndex((p) => p.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= projects.length) return;

    await Promise.all([
      fetch("/api/admin/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: projects[idx].id, sortOrder: projects[swapIdx].sortOrder }),
      }),
      fetch("/api/admin/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: projects[swapIdx].id, sortOrder: projects[idx].sortOrder }),
      }),
    ]);
    await fetchProjects();
  };

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white mb-4">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
              <p className="text-sm text-slate-500 mt-1">KnowBest Dashboard</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoFocus
                />
              </div>
              {loginError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {loginError}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {loginLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutGrid className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold">{t("admin.title")}</h1>
            <div className="flex gap-2">
              <Badge
                variant={activeTab === "portfolio" ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setActiveTab("portfolio")}
              >
                {t("admin.portfolioLabel")}
              </Badge>
              <Badge
                variant={activeTab === "pages" ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setActiveTab("pages")}
              >
                <FileEdit className="w-3 h-3 mr-1" />
                Page Editor
              </Badge>
              <Badge
                variant={activeTab === "partners" ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setActiveTab("partners")}
              >
                Partners
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button size="sm" variant="outline" asChild>
              <a href="/" target="_blank">
                <ExternalLink className="w-4 h-4 mr-1" />
                {t("nav.viewSite")}
              </a>
            </Button>
            <Button size="sm" variant="ghost" onClick={handleLogout} className="text-slate-500">
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
            {activeTab === "portfolio" && (
              <Button size="sm" onClick={openCreate} className="gap-1">
                <Plus className="w-4 h-4" />
                {t("nav.addProject")}
              </Button>
            )}
            {/* AUDIT-009: Add Partner button lives inside PartnersManagement component */}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === "pages" ? (
          <PageEditor />
        ) : activeTab === "partners" ? (
          <PartnersManagement />
        ) : loading ? (
          <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 mb-4">{t("admin.noProjects")}</p>
            <Button onClick={openCreate} className="gap-1">
              <Plus className="w-4 h-4" /> {t("nav.addProject")}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map((project, idx) => (
              <div
                key={project.id}
                className={`flex items-center gap-4 p-4 bg-white rounded-xl border ${!project.visible ? "opacity-50" : ""}`}
              >
                <span className="text-2xl w-10 text-center">{project.icon || "📦"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 truncate">{project.name}</h3>
                    <Badge variant="outline" className="text-xs">{t(`categories.${project.category}`)}</Badge>
                    <Badge className={`text-xs ${
                      project.status === "LIVE" ? "bg-green-500" :
                      project.status === "BETA" ? "bg-yellow-500" :
                      project.status === "DEVELOPMENT" ? "bg-blue-500" : "bg-gray-500"
                    }`}>
                      {t(`status.${project.status}`)}
                    </Badge>
                    {project.featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                  </div>
                  <p className="text-sm text-slate-500 truncate">{project.description}</p>
                  <div className="flex gap-2 mt-1">
                    {project.demoUrl && (
                      <a href={project.demoUrl} target="_blank" className="text-xs text-blue-600 hover:underline">
                        {t("admin.demo")}: {project.demoUrl}
                      </a>
                    )}
                    {project.prodUrl && (
                      <a href={project.prodUrl} target="_blank" className="text-xs text-green-600 hover:underline">
                        {t("admin.prod")}: {project.prodUrl}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => moveProject(project.id, "up")} disabled={idx === 0}><ArrowUp className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => moveProject(project.id, "down")} disabled={idx === projects.length - 1}><ArrowDown className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => toggleField(project.id, "visible", !project.visible)}>{project.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</Button>
                  <Button size="sm" variant="ghost" onClick={() => toggleField(project.id, "featured", !project.featured)}>{project.featured ? <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> : <StarOff className="w-4 h-4" />}</Button>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(project)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(project.id, project.name)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProject?.id ? t("admin.editProject") : t("admin.newProject")}</DialogTitle>
            <DialogDescription>{t("admin.formDescription")}</DialogDescription>
          </DialogHeader>

          {editingProject && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">{t("form.tabBasic")}</TabsTrigger>
                <TabsTrigger value="media">{t("form.tabMedia")}</TabsTrigger>
                <TabsTrigger value="technical">{t("form.tabTechnical")}</TabsTrigger>
                <TabsTrigger value="pricing">{t("form.tabPricing")}</TabsTrigger>
              </TabsList>

              {/* BASIC INFO TAB */}
              <TabsContent value="basic" className="space-y-4 pt-4">
                <div>
                  <Label>{t("form.slug")} *</Label>
                  <Input value={editingProject.slug || ""} onChange={(e) => setEditingProject((p) => ({ ...p, slug: e.target.value }))} />
                </div>

                <Tabs defaultValue="ro" className="w-full">
                  <TabsList>
                    <TabsTrigger value="ro">RO</TabsTrigger>
                    <TabsTrigger value="en">EN</TabsTrigger>
                  </TabsList>
                  <TabsContent value="ro" className="space-y-4 pt-3">
                    <div>
                      <Label>{t("form.name")} (RO) *</Label>
                      <Input value={editingProject.name || ""} onChange={(e) => { const name = e.target.value; setEditingProject((p) => ({ ...p, name, slug: p?.id ? p.slug : autoSlug(name) })); }} />
                    </div>
                    <div>
                      <Label>{t("form.description")} (RO)</Label>
                      <Textarea value={editingProject.description || ""} onChange={(e) => setEditingProject((p) => ({ ...p, description: e.target.value }))} rows={2} />
                    </div>
                    <div>
                      <Label>{t("form.longDescription")} (RO)</Label>
                      <Textarea value={editingProject.longDescription || ""} onChange={(e) => setEditingProject((p) => ({ ...p, longDescription: e.target.value }))} rows={4} placeholder={t("form.longDescriptionPlaceholder")} />
                    </div>
                  </TabsContent>
                  <TabsContent value="en" className="space-y-4 pt-3">
                    <div>
                      <Label>{t("form.name")} (EN)</Label>
                      <Input value={editingProject.nameEn || ""} onChange={(e) => setEditingProject((p) => ({ ...p, nameEn: e.target.value }))} placeholder={t("form.nameEnPlaceholder")} />
                    </div>
                    <div>
                      <Label>{t("form.description")} (EN)</Label>
                      <Textarea value={editingProject.descriptionEn || ""} onChange={(e) => setEditingProject((p) => ({ ...p, descriptionEn: e.target.value }))} rows={2} placeholder={t("form.descriptionEnPlaceholder")} />
                    </div>
                    <div>
                      <Label>{t("form.longDescription")} (EN)</Label>
                      <Textarea value={editingProject.longDescriptionEn || ""} onChange={(e) => setEditingProject((p) => ({ ...p, longDescriptionEn: e.target.value }))} rows={4} placeholder={t("form.longDescriptionEnPlaceholder")} />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>{t("form.category")}</Label>
                    <Select value={editingProject.category} onValueChange={(v) => v && setEditingProject((p) => ({ ...p, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((k) => (<SelectItem key={k} value={k}>{t(`categories.${k}`)}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t("form.statusLabel")}</Label>
                    <Select value={editingProject.status} onValueChange={(v) => v && setEditingProject((p) => ({ ...p, status: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((k) => (<SelectItem key={k} value={k}>{t(`status.${k}`)}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t("form.accessLabel")}</Label>
                    <Select value={editingProject.accessType} onValueChange={(v) => v && setEditingProject((p) => ({ ...p, accessType: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ACCESS_TYPES.map((k) => (<SelectItem key={k} value={k}>{t(`access.${k}`)}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {editingProject.accessType === "PASSWORD" && (
                  <div>
                    <Label>{t("form.accessPassword")}</Label>
                    <Input value={editingProject.accessCode || ""} onChange={(e) => setEditingProject((p) => ({ ...p, accessCode: e.target.value }))} placeholder={t("form.accessPasswordPlaceholder")} />
                  </div>
                )}

                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Switch checked={editingProject.visible ?? true} onCheckedChange={(v) => setEditingProject((p) => ({ ...p, visible: v }))} />
                    <Label>{t("form.visible")}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={editingProject.featured ?? false} onCheckedChange={(v) => setEditingProject((p) => ({ ...p, featured: v }))} />
                    <Label>{t("form.featured")}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={editingProject.standalone ?? false} onCheckedChange={(v) => setEditingProject((p) => ({ ...p, standalone: v }))} />
                    <Label>{t("form.standalone")}</Label>
                  </div>
                </div>
              </TabsContent>

              {/* MEDIA TAB */}
              <TabsContent value="media" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t("form.icon")}</Label>
                    <Input placeholder="🎯" value={editingProject.icon || ""} onChange={(e) => setEditingProject((p) => ({ ...p, icon: e.target.value }))} />
                    <p className="text-xs text-slate-500 mt-1">{t("form.iconHint")}</p>
                  </div>
                  <div>
                    <Label>{t("form.coverImage")}</Label>
                    <Input placeholder="https://..." value={editingProject.coverImage || ""} onChange={(e) => setEditingProject((p) => ({ ...p, coverImage: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <Label>{t("form.videoUrl")}</Label>
                  <Input placeholder="https://youtube.com/watch?v=..." value={editingProject.videoUrl || ""} onChange={(e) => setEditingProject((p) => ({ ...p, videoUrl: e.target.value }))} />
                </div>

                <div>
                  <Label>{t("form.screenshots")}</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="https://..."
                      value={screenshotInput}
                      onChange={(e) => setScreenshotInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addScreenshot())}
                    />
                    <Button type="button" variant="outline" onClick={addScreenshot}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {(editingProject.screenshots?.length ?? 0) > 0 && (
                    <div className="space-y-2">
                      {editingProject.screenshots?.map((url, idx) => (
                        <div key={`screenshot-${url}`} className="flex items-center gap-2 p-2 bg-slate-100 rounded text-sm">
                          <span className="flex-1 truncate">{url}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeScreenshot(idx)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* TECHNICAL TAB */}
              <TabsContent value="technical" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t("form.demoUrl")}</Label>
                    <Input placeholder="https://app.knowbest.ro" value={editingProject.demoUrl || ""} onChange={(e) => setEditingProject((p) => ({ ...p, demoUrl: e.target.value }))} />
                  </div>
                  <div>
                    <Label>{t("form.prodUrl")}</Label>
                    <Input placeholder="https://app-name.com" value={editingProject.prodUrl || ""} onChange={(e) => setEditingProject((p) => ({ ...p, prodUrl: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <Label>{t("form.repoUrl")}</Label>
                  <Input placeholder="https://github.com/..." value={editingProject.repoUrl || ""} onChange={(e) => setEditingProject((p) => ({ ...p, repoUrl: e.target.value }))} />
                </div>

                <div>
                  <Label>{t("form.techStack")}</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Next.js, PostgreSQL, Tailwind"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech(techInput))}
                    />
                    <Button type="button" variant="outline" onClick={() => addTech(techInput)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {(editingProject.techStack?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {editingProject.techStack?.map((tech) => (
                        <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                          {tech}
                          <button type="button" onClick={() => removeTech(tech)} className="ml-1 hover:text-red-500">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label>{t("form.tags")}</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="SaaS, AI, Medical"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag(tagsInput))}
                    />
                    <Button type="button" variant="outline" onClick={() => addTag(tagsInput)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {(editingProject.tags?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {editingProject.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="flex items-center gap-1">
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* PRICING TAB */}
              <TabsContent value="pricing" className="space-y-4 pt-4">
                <div>
                  <Label>{t("form.pricingType")}</Label>
                  <Select value={editingProject.pricingType} onValueChange={(v) => v && setEditingProject((p) => ({ ...p, pricingType: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PRICING_TYPES.map((k) => (<SelectItem key={k} value={k}>{t(`pricing.${k}`)}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>

                {editingProject.pricingType === "PAID" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t("form.monthlyPrice")}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="9.99"
                        value={editingProject.monthlyPrice ?? ""}
                        onChange={(e) => setEditingProject((p) => ({ ...p, monthlyPrice: e.target.value ? parseFloat(e.target.value) : null }))}
                      />
                    </div>
                    <div>
                      <Label>{t("form.yearlyPrice")}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="99.99"
                        value={editingProject.yearlyPrice ?? ""}
                        onChange={(e) => setEditingProject((p) => ({ ...p, yearlyPrice: e.target.value ? parseFloat(e.target.value) : null }))}
                      />
                    </div>
                  </div>
                )}

                <p className="text-sm text-slate-500">{t("form.pricingHint")}</p>
              </TabsContent>

              <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
                <Button onClick={handleSave} disabled={saving || !editingProject.name || !editingProject.slug}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  {editingProject.id ? t("common.save") : t("common.create")}
                </Button>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

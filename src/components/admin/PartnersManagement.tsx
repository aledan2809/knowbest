"use client";

/**
 * PartnersManagement — admin CRUD panel for Partner model.
 *
 * Introduced by AUDIT-009 fix. Wires to /api/admin/partners endpoints.
 * Used by: src/app/[locale]/admin/page.tsx
 */

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ExternalLink, Loader2 } from "lucide-react";

interface Partner {
  id: string;
  name: string;
  logo: string;
  website: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface PartnerFormData {
  name: string;
  logo: string;
  website: string;
  active: boolean;
  sortOrder: number;
}

const EMPTY_FORM: PartnerFormData = {
  name: "",
  logo: "",
  website: "",
  active: true,
  sortOrder: 0,
};

export function PartnersManagement() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PartnerFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadPartners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/partners");
      if (!res.ok) throw new Error("Failed to fetch partners");
      const data = (await res.json()) as Partner[];
      setPartners(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load partners");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPartners();
  }, [loadPartners]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(p: Partner) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      logo: p.logo,
      website: p.website ?? "",
      active: p.active,
      sortOrder: p.sortOrder,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.logo.trim()) {
      alert("Name and Logo URL are required");
      return;
    }

    setSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId
        ? { id: editingId, ...form, website: form.website || null }
        : { ...form, website: form.website || null };

      const res = await fetch("/api/admin/partners", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Save failed");
      }

      await loadPartners();
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete partner "${name}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/partners?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      await loadPartners();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Partners Management</h2>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Partner
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
        </div>
      ) : partners.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No partners yet. Click &ldquo;Add Partner&rdquo; to create the first one.
        </div>
      ) : (
        <div className="grid gap-4">
          {partners.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-4 p-4 border rounded-lg bg-white"
            >
              <div className="w-16 h-16 flex items-center justify-center bg-slate-50 rounded overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.logo}
                  alt={p.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{p.name}</h3>
                  {!p.active && (
                    <span className="text-xs px-2 py-0.5 bg-slate-200 rounded">
                      inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 truncate">
                  Order: {p.sortOrder} · {p.website || "no website"}
                </p>
              </div>
              {p.website && (
                <a
                  href={p.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-slate-100 rounded"
                  aria-label="Open website"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <Button variant="secondary" size="sm" onClick={() => openEdit(p)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(p.id, p.name)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Partner" : "Add Partner"}</DialogTitle>
            <DialogDescription>
              Fill in the logo URL and display metadata.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="p-name">Name *</Label>
              <Input
                id="p-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Acme Corp"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-logo">Logo URL *</Label>
              <Input
                id="p-logo"
                value={form.logo}
                onChange={(e) => setForm({ ...form, logo: e.target.value })}
                placeholder="https://example.com/logo.svg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-website">Website URL</Label>
              <Input
                id="p-website"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="space-y-2 flex-1">
                <Label htmlFor="p-order">Sort Order</Label>
                <Input
                  id="p-order"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="p-active">Active</Label>
                <div className="h-10 flex items-center">
                  <Switch
                    id="p-active"
                    checked={form.active}
                    onCheckedChange={(checked) =>
                      setForm({ ...form, active: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingId ? "Save changes" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

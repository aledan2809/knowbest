"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Save, FileEdit } from "lucide-react";

interface PageContent {
  id: string;
  page: string;
  section: string;
  key: string;
  valueRo: string;
  valueEn: string | null;
  type: string;
  sortOrder: number;
}

interface PageEditorProps {
  initialPage?: string;
}

const PAGES = ["home", "about", "useCases", "contact"];

export function PageEditor({ initialPage = "home" }: PageEditorProps) {
  const t = useTranslations();
  const [selectedPage, setSelectedPage] = useState(initialPage);
  const [content, setContent] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, { valueRo: string; valueEn: string | null }>>({});

  useEffect(() => {
    fetchContent();
  }, [selectedPage]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/page-content?page=${selectedPage}`);
      const data = await res.json();
      setContent(data.content || []);
      setEditedValues({});
    } catch (error) {
      console.error("Failed to fetch content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string, field: "valueRo" | "valueEn", value: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSave = async (item: PageContent) => {
    const edited = editedValues[item.id];
    if (!edited) return;

    setSaving(item.id);
    try {
      const res = await fetch("/api/admin/page-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          valueRo: edited.valueRo ?? item.valueRo,
          valueEn: edited.valueEn ?? item.valueEn,
        }),
      });

      if (res.ok) {
        // Update local state
        setContent((prev) =>
          prev.map((c) =>
            c.id === item.id
              ? { ...c, valueRo: edited.valueRo ?? item.valueRo, valueEn: edited.valueEn ?? item.valueEn }
              : c
          )
        );
        // Clear edited values for this item
        setEditedValues((prev) => {
          const { [item.id]: _, ...rest } = prev;
          return rest;
        });
      }
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(null);
    }
  };

  // Group content by section
  const groupedContent = content.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, PageContent[]>);

  const getValue = (item: PageContent, field: "valueRo" | "valueEn") => {
    return editedValues[item.id]?.[field] ?? item[field] ?? "";
  };

  const hasChanges = (id: string) => {
    return !!editedValues[id];
  };

  return (
    <div className="flex flex-col h-full">
      {/* Page Selector */}
      <div className="flex gap-2 mb-6 pb-4 border-b">
        {PAGES.map((page) => (
          <Button
            key={page}
            variant={selectedPage === page ? "default" : "outline"}
            onClick={() => setSelectedPage(page)}
            className="capitalize"
          >
            {page}
          </Button>
        ))}
      </div>

      {/* Content Editor */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedContent).map(([section, items]) => (
            <Card key={section} className="p-6">
              <h3 className="text-lg font-semibold mb-4 capitalize text-slate-900 flex items-center gap-2">
                <FileEdit className="w-5 h-5" />
                {section}
              </h3>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="space-y-3 p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-slate-700">{item.key}</Label>
                      {hasChanges(item.id) && (
                        <Button
                          size="sm"
                          onClick={() => handleSave(item)}
                          disabled={saving === item.id}
                          className="gap-1"
                        >
                          {saving === item.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Save className="w-3 h-3" />
                          )}
                          Save
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-slate-500 mb-1">RO</Label>
                        {item.type === "textarea" ? (
                          <Textarea
                            value={getValue(item, "valueRo")}
                            onChange={(e) => handleEdit(item.id, "valueRo", e.target.value)}
                            rows={3}
                            className="text-sm"
                          />
                        ) : (
                          <Input
                            value={getValue(item, "valueRo")}
                            onChange={(e) => handleEdit(item.id, "valueRo", e.target.value)}
                            className="text-sm"
                          />
                        )}
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500 mb-1">EN</Label>
                        {item.type === "textarea" ? (
                          <Textarea
                            value={getValue(item, "valueEn")}
                            onChange={(e) => handleEdit(item.id, "valueEn", e.target.value)}
                            rows={3}
                            className="text-sm"
                          />
                        ) : (
                          <Input
                            value={getValue(item, "valueEn")}
                            onChange={(e) => handleEdit(item.id, "valueEn", e.target.value)}
                            className="text-sm"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

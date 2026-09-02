"use client";

/**
 * User API Keys management page.
 *
 * AUDIT-011 fix. Lets authenticated users create / list / revoke their API keys.
 * The raw token is shown ONCE at creation (cannot be retrieved later).
 */

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, Loader2, Copy, Check } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

interface NewKeyResponse extends ApiKey {
  token: string;
  notice: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [newToken, setNewToken] = useState<NewKeyResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/api-keys");
      if (res.status === 401) {
        window.location.href = "/auth/signin";
        return;
      }
      if (!res.ok) throw new Error("Failed to load");
      setKeys(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/user/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error("Create failed");
      const data = (await res.json()) as NewKeyResponse;
      setNewToken(data);
      setName("");
      setCreateOpen(false);
      await load();
    } catch (err) {
      console.error(err);
      alert("Failed to create API key");
    } finally {
      setSaving(false);
    }
  }

  async function handleRevoke(id: string, keyName: string) {
    if (!confirm(`Revoke key "${keyName}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/user/api-keys?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Revoke failed");
      await load();
    } catch (err) {
      console.error(err);
      alert("Revoke failed");
    }
  }

  function copyToken() {
    if (!newToken) return;
    navigator.clipboard.writeText(newToken.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <PublicLayout>
      <main className="min-h-screen bg-slate-50 py-12 px-4 text-slate-900">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">API Keys</h1>
              <p className="text-slate-600 mt-1">
                Generate personal API tokens for programmatic access.
              </p>
            </div>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Key
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            </div>
          ) : keys.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg border">
              <p className="text-slate-500">
                No API keys yet. Create your first one to get started.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border divide-y">
              {keys.map((k) => (
                <div key={k.id} className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{k.name}</span>
                      {k.revokedAt && (
                        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                          revoked
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 font-mono mt-1">
                      {k.keyPrefix}…
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Created {new Date(k.createdAt).toLocaleDateString()} ·{" "}
                      {k.lastUsedAt
                        ? `Last used ${new Date(k.lastUsedAt).toLocaleDateString()}`
                        : "Never used"}
                    </p>
                  </div>
                  {!k.revokedAt && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRevoke(k.id, k.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Give your key a descriptive name (e.g. &ldquo;My laptop&rdquo;).
                You will see the token only once.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="key-name">Name</Label>
                <Input
                  id="key-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My laptop"
                  disabled={saving}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="secondary"
                onClick={() => setCreateOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={saving || !name.trim()}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Show-once token dialog */}
        <Dialog open={!!newToken} onOpenChange={(open) => !open && setNewToken(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Your new API key</DialogTitle>
              <DialogDescription>
                {newToken?.notice}
              </DialogDescription>
            </DialogHeader>
            {newToken && (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-slate-100 rounded font-mono text-sm break-all">
                  {newToken.token}
                </div>
                <Button onClick={copyToken} variant="secondary" className="w-full">
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy to clipboard
                    </>
                  )}
                </Button>
              </div>
            )}
            <div className="flex justify-end pt-4">
              <Button onClick={() => setNewToken(null)}>I saved it</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </PublicLayout>
  );
}

"use client";

/**
 * Usage dashboard page.
 *
 * AUDIT-012 fix. Shows current plan, monthly consumption, remaining credits,
 * and the last 20 usage events.
 */

import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";

interface UsageRecord {
  id: string;
  kind: string;
  cost: number;
  createdAt: string;
}

interface UsageSummary {
  plan: string;
  usedThisMonth: number;
  remaining: number | null; // null = unlimited (enterprise)
  recent: UsageRecord[];
}

export default function UsagePage() {
  const [data, setData] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/usage");
      if (res.status === 401) {
        window.location.href = "/auth/signin";
        return;
      }
      if (!res.ok) throw new Error("Failed");
      setData(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <PublicLayout>
      <main className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Usage</h1>
          <p className="text-slate-600 mb-8">
            Your credit consumption for the current billing period.
          </p>

          {loading || !data ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white border rounded-lg p-6">
                  <p className="text-sm text-slate-500 uppercase tracking-wide mb-2">
                    Plan
                  </p>
                  <p className="text-2xl font-bold capitalize">{data.plan}</p>
                </div>
                <div className="bg-white border rounded-lg p-6">
                  <p className="text-sm text-slate-500 uppercase tracking-wide mb-2">
                    Used this month
                  </p>
                  <p className="text-2xl font-bold">{data.usedThisMonth}</p>
                </div>
                <div className="bg-white border rounded-lg p-6">
                  <p className="text-sm text-slate-500 uppercase tracking-wide mb-2">
                    Remaining
                  </p>
                  <p className="text-2xl font-bold">
                    {data.remaining === null ? "Unlimited" : data.remaining}
                  </p>
                </div>
              </div>

              <div className="bg-white border rounded-lg">
                <div className="px-6 py-4 border-b">
                  <h2 className="font-semibold">Recent activity</h2>
                </div>
                {data.recent.length === 0 ? (
                  <div className="px-6 py-10 text-center text-slate-500">
                    No usage recorded yet.
                  </div>
                ) : (
                  <div className="divide-y">
                    {data.recent.map((r) => (
                      <div
                        key={r.id}
                        className="px-6 py-3 flex items-center justify-between text-sm"
                      >
                        <div>
                          <span className="font-mono text-slate-700">{r.kind}</span>
                          <span className="text-slate-400 ml-3">
                            {new Date(r.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-slate-900 font-semibold">
                          -{r.cost} credits
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </PublicLayout>
  );
}

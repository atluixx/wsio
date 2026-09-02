"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Search } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.wsio.lol";

interface SystemStats {
  systemStatus: string;
  dbStatus: string;
  totalUsers: number;
  totalProfiles: number;
  totalLinks: number;
  timestamp: string;
}

interface UserAccount {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export function AdminDashboardClient() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAuthenticated, user?.role, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/admin/stats`, { credentials: "include" }).catch(() => null),
        fetch(`${API_BASE}/api/v1/admin/users`, { credentials: "include" }).catch(() => null),
      ]);
      if (statsRes?.ok) setStats(await statsRes.json());
      if (usersRes?.ok) setUsers(await usersRes.json());
      if (!statsRes?.ok && !usersRes?.ok) showToast("Couldn't load admin data", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || user?.role !== "admin") return;
    void (async () => {
      await load();
    })();
  }, [authLoading, isAuthenticated, user?.role, load]);

  const filtered = useMemo(
    () => users.filter((u) => u.email.toLowerCase().includes(query.toLowerCase())),
    [users, query]
  );

  if (authLoading || loading) {
    return <div className="mx-auto max-w-3xl px-5 py-24 text-center text-sm text-faint">Loading…</div>;
  }

  const cards = [
    { label: "Users", value: stats?.totalUsers ?? 0 },
    { label: "Profiles", value: stats?.totalProfiles ?? 0 },
    { label: "Links", value: stats?.totalLinks ?? 0 },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-5 py-10 sm:py-14">
      <div className="flex items-end justify-between border-b border-line pb-7">
        <div>
          <h1 className="font-display text-2xl font-medium tracking-tight">Admin</h1>
          <p className="mt-1 text-sm text-muted">
            {stats?.systemStatus ?? "—"} · database {stats?.dbStatus ?? "—"}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={load}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {cards.map(({ label, value }) => (
          <div key={label} className="surface-card p-5">
            <div className="text-sm text-muted">{label}</div>
            <div className="mt-1.5 font-display text-3xl font-medium tracking-tight">{value}</div>
          </div>
        ))}
      </div>

      <div className="surface-card p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-medium tracking-tight">
            Users ({users.length})
          </h2>
          <div className="relative w-52">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by email…"
              className="h-10 pl-9 text-sm"
            />
          </div>
        </div>
        <ul className="divide-y divide-line">
          {filtered.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span className="truncate text-ink">{u.email}</span>
              <span className="flex shrink-0 items-center gap-4 text-muted">
                <span className={u.role === "admin" ? "font-medium text-accent" : ""}>{u.role}</span>
                <span className="text-faint">{new Date(u.createdAt).toLocaleDateString()}</span>
              </span>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="py-8 text-center text-sm text-faint">No users.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

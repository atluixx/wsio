"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Search, Users, LinkIcon, IdCard } from "lucide-react";

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
      if (!statsRes?.ok && !usersRes?.ok) showToast("Failed to load admin data", "error");
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
    return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-sm text-zinc-500">Loading…</div>;
  }

  const cards = [
    { label: "Users", value: stats?.totalUsers ?? 0, Icon: Users },
    { label: "Profiles", value: stats?.totalProfiles ?? 0, Icon: IdCard },
    { label: "Links", value: stats?.totalLinks ?? 0, Icon: LinkIcon },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 font-sans sm:py-12">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Admin</h1>
          <p className="text-xs text-zinc-400">
            {stats?.systemStatus ?? "—"} · DB {stats?.dbStatus ?? "—"}
          </p>
        </div>
        <Button size="sm" variant="outline" className="h-9 text-xs" onClick={load}>
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {cards.map(({ label, value, Icon }) => (
          <div key={label} className="minimal-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{label}</span>
              <Icon className="h-4 w-4 text-zinc-500" />
            </div>
            <div className="mt-1 text-2xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      <div className="minimal-card p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-white">Users ({users.length})</h2>
          <div className="relative w-48">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter email…"
              className="minimal-input h-8 pl-8 text-xs"
            />
          </div>
        </div>
        <ul className="divide-y divide-white/5">
          {filtered.map((u) => (
            <li key={u.id} className="flex items-center justify-between py-2.5 text-xs">
              <span className="truncate text-zinc-200">{u.email}</span>
              <span className="flex items-center gap-3 text-zinc-500">
                <span className={u.role === "admin" ? "text-emerald-400" : ""}>{u.role}</span>
                <span>{new Date(u.createdAt).toLocaleDateString()}</span>
              </span>
            </li>
          ))}
          {filtered.length === 0 && <li className="py-6 text-center text-xs text-zinc-500">No users.</li>}
        </ul>
      </div>
    </div>
  );
}

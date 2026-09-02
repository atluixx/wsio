"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Search, ExternalLink } from "lucide-react";
import {
  fetchReports,
  updateReport,
  REPORT_REASONS,
  type ProfileReport,
  type ReportStatus,
} from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.wsio.lol";

const REASON_LABEL: Record<string, string> = Object.fromEntries(
  REPORT_REASONS.map((r) => [r.value, r.label])
);

const STATUS_STYLE: Record<ReportStatus, string> = {
  open: "bg-[var(--color-negative-soft)] text-[var(--color-negative)]",
  reviewed: "bg-raised text-muted",
  dismissed: "bg-raised text-faint",
  actioned: "bg-[var(--color-positive-soft)] text-[var(--color-positive)]",
};

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
  const [reports, setReports] = useState<ProfileReport[]>([]);
  const [openCount, setOpenCount] = useState(0);
  const [reportFilter, setReportFilter] = useState<"open" | "">("open");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAuthenticated, user?.role, router]);

  const loadReports = useCallback(async (filter: "open" | "") => {
    const { reports, openCount } = await fetchReports(filter);
    setReports(reports);
    setOpenCount(openCount);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/admin/stats`, { credentials: "include" }).catch(() => null),
        fetch(`${API_BASE}/api/v1/admin/users`, { credentials: "include" }).catch(() => null),
      ]);
      if (statsRes?.ok) setStats(await statsRes.json());
      if (usersRes?.ok) setUsers(await usersRes.json());
      await loadReports(reportFilter);
      if (!statsRes?.ok && !usersRes?.ok) showToast("Couldn't load admin data", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast, loadReports, reportFilter]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || user?.role !== "admin") return;
    void (async () => {
      await load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, user?.role]);

  const triage = async (id: string, status: ReportStatus) => {
    const { ok } = await updateReport(id, status);
    if (!ok) {
      showToast("Couldn't update the report", "error");
      return;
    }
    await loadReports(reportFilter);
  };

  const switchFilter = async (filter: "open" | "") => {
    setReportFilter(filter);
    await loadReports(filter);
  };

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
    { label: "Open reports", value: openCount },
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map(({ label, value }) => (
          <div key={label} className="surface-card p-5">
            <div className="text-sm text-muted">{label}</div>
            <div className="mt-1.5 font-display text-3xl font-medium tracking-tight">{value}</div>
          </div>
        ))}
      </div>

      {/* Reports */}
      <div className="surface-card p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-medium tracking-tight">Reports</h2>
          <div className="flex gap-1 rounded-[var(--radius-sm)] border border-line p-0.5 text-xs">
            {(["open", ""] as const).map((f) => (
              <button
                key={f || "all"}
                onClick={() => switchFilter(f)}
                className={`rounded-[var(--radius-xs)] px-2.5 py-1 transition-colors ${
                  reportFilter === f ? "bg-ink text-canvas" : "text-muted hover:text-ink"
                }`}
              >
                {f === "open" ? "Open" : "All"}
              </button>
            ))}
          </div>
        </div>

        {reports.length === 0 ? (
          <p className="py-8 text-center text-sm text-faint">
            {reportFilter === "open" ? "No open reports." : "No reports yet."}
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {reports.map((r) => (
              <li key={r.id} className="py-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-sm font-medium text-ink">
                    {REASON_LABEL[r.reason] ?? r.reason}
                  </span>
                  <Link
                    href={`/${r.username}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
                  >
                    wsio.lol/{r.username}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                  <span
                    className={`rounded-[var(--radius-pill)] px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[r.status]}`}
                  >
                    {r.status}
                  </span>
                  <span className="ml-auto text-xs text-faint">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {r.details && (
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{r.details}</p>
                )}
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {r.status === "open" ? (
                    <>
                      <MiniButton onClick={() => triage(r.id, "reviewed")}>Reviewed</MiniButton>
                      <MiniButton onClick={() => triage(r.id, "dismissed")}>Dismiss</MiniButton>
                      <MiniButton danger onClick={() => triage(r.id, "actioned")}>
                        Actioned
                      </MiniButton>
                    </>
                  ) : (
                    <MiniButton onClick={() => triage(r.id, "open")}>Reopen</MiniButton>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Users */}
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

function MiniButton({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[var(--radius-xs)] border px-2.5 py-1 text-xs font-medium transition-colors ${
        danger
          ? "border-[var(--color-negative)]/40 text-[var(--color-negative)] hover:bg-[var(--color-negative-soft)]"
          : "border-line-strong text-muted hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

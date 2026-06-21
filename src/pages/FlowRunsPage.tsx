import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { toast } from "sonner";
import { Bot, CheckCircle, XCircle, Clock, Pause, Loader2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FlowRun {
  id: string;
  leadId: string;
  status: string;
  currentNodeId: string | null;
  retryCount: number;
  scheduledAt: string;
  createdAt: string;
  lead: { id: string; fullName: string; phone: string } | null;
  definition: { id: string; name: string } | null;
}

interface FlowRunStats {
  total: number;
  active: number;
  completed: number;
  failed: number;
  paused: number;
  todayRuns: number;
}

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  active: { icon: Loader2, color: "text-blue-500", label: "Active" },
  completed: { icon: CheckCircle, color: "text-green-500", label: "Completed" },
  failed: { icon: XCircle, color: "text-red-500", label: "Failed" },
  paused: { icon: Pause, color: "text-yellow-500", label: "Paused" },
};

export default function FlowRunsPage() {
  const [runs, setRuns] = useState<FlowRun[]>([]);
  const [stats, setStats] = useState<FlowRunStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchData = async () => {
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (statusFilter) params.set("status", statusFilter);
      const [runsRes, statsRes] = await Promise.all([
        fetch(`/automation/runs?${params}`, { credentials: "include" }),
        fetch("/automation/runs/stats", { credentials: "include" }),
      ]);
      const runsData = await runsRes.json();
      const statsData = await statsRes.json();
      setRuns(runsData.data?.runs ?? []);
      setStats(statsData.data ?? null);
    } catch {
      toast.error("Failed to load flow runs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [statusFilter]);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[2rem] border border-border bg-card shadow-card overflow-hidden">
          <div className="relative px-8 py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(205_78%_52%/0.10),transparent_35%),radial-gradient(circle_at_bottom_right,hsl(152_58%_38%/0.10),transparent_40%)]" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <Bot className="h-4 w-4" />
                  Flow Runs
                </div>
                <h1 className="mt-5 text-3xl font-display font-bold text-foreground">Automation run history</h1>
                <p className="mt-4 text-muted-foreground">
                  Track flow execution status, debug failures, and monitor automation performance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {stats && (
          <div className="grid gap-6 md:grid-cols-5">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total Runs</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Active</p>
              <p className="mt-2 text-2xl font-bold text-blue-500">{stats.active}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Completed</p>
              <p className="mt-2 text-2xl font-bold text-green-500">{stats.completed}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Failed</p>
              <p className="mt-2 text-2xl font-bold text-red-500">{stats.failed}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Today</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{stats.todayRuns}</p>
            </div>
          </div>
        )}

        <div className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden">
          <div className="border-b border-border px-6 py-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Run History</h2>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-xl border border-input bg-background px-4 text-sm text-foreground"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>
          {loading ? (
            <div className="px-6 py-12 text-center text-muted-foreground">Loading runs...</div>
          ) : runs.length > 0 ? (
            <div className="divide-y divide-border">
              {runs.map((run) => {
                const config = statusConfig[run.status] ?? statusConfig.active;
                const StatusIcon = config.icon;
                return (
                  <div key={run.id} className="px-6 py-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <StatusIcon className={`h-5 w-5 ${config.color}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">
                              {run.definition?.name ?? "Unknown Flow"}
                            </p>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              run.status === "completed" ? "bg-green-50 text-green-700" :
                              run.status === "failed" ? "bg-red-50 text-red-700" :
                              run.status === "paused" ? "bg-yellow-50 text-yellow-700" :
                              "bg-blue-50 text-blue-700"
                            }`}>
                              {config.label}
                            </span>
                          </div>
                          <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                            {run.lead && <span>Lead: {run.lead.fullName}</span>}
                            <span>Retries: {run.retryCount}</span>
                            <span>Started: {formatTime(run.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <Bot className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-semibold text-foreground">No flow runs yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Flow runs will appear here once automation flows execute.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

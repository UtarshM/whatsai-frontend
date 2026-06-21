import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Activity, Shield, AlertTriangle, Info, Search, RefreshCw } from "lucide-react";

interface OperationalLog {
  id: string;
  eventType: string;
  level: string;
  summary: string;
  payload: any;
  createdAt: string;
}

export default function OpsLogsPage() {
  const [logs, setLogs] = useState<OperationalLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (levelFilter) params.set("level", levelFilter);
      if (typeFilter) params.set("eventType", typeFilter);
      if (search) params.set("search", search);
      const r = await fetch(`/ops/logs?${params}`, { credentials: "include" });
      const d = await r.json();
      setLogs(d.data?.logs ?? []);
      setTotal(d.data?.total ?? 0);
    } catch { toast.error("Failed to load logs"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, [page, levelFilter, typeFilter]);

  const levelIcon = (level: string) => {
    switch (level) {
      case "error": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[2rem] border border-border bg-card shadow-card overflow-hidden">
          <div className="relative px-8 py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(205_78%_52%/0.10),transparent_35%),radial-gradient(circle_at_bottom_right,hsl(152_58%_38%/0.10),transparent_40%)]" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <Activity className="h-4 w-4" /> Operations Logs
                </div>
                <h1 className="mt-5 text-3xl font-display font-bold text-foreground">System activity & audit trail</h1>
                <p className="mt-4 text-muted-foreground">Monitor API requests, system events, and user actions across your workspace.</p>
              </div>
              <Button onClick={() => void fetchLogs()}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-border bg-card shadow-card p-4">
          <div className="flex flex-wrap gap-3">
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void fetchLogs()}
              placeholder="Search logs..." className="h-10 flex-1 min-w-[200px] rounded-xl border border-input bg-background px-4 text-sm" />
            <select value={levelFilter} onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}
              className="h-10 rounded-xl border border-input bg-background px-4 text-sm">
              <option value="">All Levels</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="h-10 rounded-xl border border-input bg-background px-4 text-sm">
              <option value="">All Types</option>
              <option value="api_request">API Request</option>
              <option value="audit.*">Audit</option>
              <option value="flow.*">Automation</option>
            </select>
            <Button variant="outline" onClick={() => void fetchLogs()}>Search</Button>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden">
          {loading ? (
            <div className="px-6 py-12 text-center text-muted-foreground">Loading logs...</div>
          ) : logs.length > 0 ? (
            <div className="divide-y divide-border">
              {logs.map((log) => (
                <div key={log.id} className="px-6 py-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-3">
                    {levelIcon(log.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{log.summary}</p>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{log.eventType}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          log.level === "error" ? "bg-red-50 text-red-700" :
                          log.level === "warning" ? "bg-yellow-50 text-yellow-700" :
                          "bg-blue-50 text-blue-700"
                        }`}>{log.level}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                      {log.payload && Object.keys(log.payload).length > 0 && (
                        <pre className="mt-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-2 overflow-x-auto max-h-32">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <Activity className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-semibold text-foreground">No logs found</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="border-t border-border px-6 py-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Page {page} of {totalPages} ({total} total)</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

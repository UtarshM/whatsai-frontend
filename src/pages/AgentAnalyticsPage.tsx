import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { toast } from "sonner";
import { BarChart3, TrendingUp, Clock, CheckCircle, MessageSquare, Users } from "lucide-react";

interface AgentPerformance {
  agentId: string;
  userId: string;
  name: string;
  email: string;
  status: string;
  teamId: string | null;
  totalConversations: number;
  resolvedConversations: number;
  openConversations: number;
  pendingConversations: number;
  totalMessagesSent: number;
  avgResponseTimeSeconds: number | null;
  resolutionRate: number;
}

export default function AgentAnalyticsPage() {
  const [agents, setAgents] = useState<AgentPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/agents/performance", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setAgents(data.data ?? []))
      .catch(() => toast.error("Failed to load agent analytics"))
      .finally(() => setLoading(false));
  }, []);

  const totalConversations = agents.reduce((sum, a) => sum + a.totalConversations, 0);
  const totalResolved = agents.reduce((sum, a) => sum + a.resolvedConversations, 0);
  const totalMessages = agents.reduce((sum, a) => sum + a.totalMessagesSent, 0);
  const avgResponseTimes = agents.filter((a) => a.avgResponseTimeSeconds !== null);
  const globalAvgResponse = avgResponseTimes.length > 0
    ? avgResponseTimes.reduce((sum, a) => sum + (a.avgResponseTimeSeconds ?? 0), 0) / avgResponseTimes.length
    : null;

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "N/A";
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[2rem] border border-border bg-card shadow-card overflow-hidden">
          <div className="relative px-8 py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(205_78%_52%/0.10),transparent_35%),radial-gradient(circle_at_bottom_right,hsl(152_58%_38%/0.10),transparent_40%)]" />
            <div className="relative max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <BarChart3 className="h-4 w-4" />
                Agent Analytics
              </div>
              <h1 className="mt-5 text-3xl font-display font-bold text-foreground">Performance insights</h1>
              <p className="mt-4 text-muted-foreground">
                Track agent response times, resolution rates, and conversation workload.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.18em]">Total Agents</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{agents.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.18em]">Total Conversations</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{totalConversations}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.18em]">Resolution Rate</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {totalConversations > 0 ? Math.round((totalResolved / totalConversations) * 100) : 0}%
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.18em]">Avg Response Time</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{formatTime(globalAvgResponse)}</p>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden">
          <div className="border-b border-border px-6 py-5">
            <h2 className="font-display text-lg font-semibold text-foreground">Agent Performance</h2>
          </div>
          {loading ? (
            <div className="px-6 py-12 text-center text-muted-foreground">Loading analytics...</div>
          ) : agents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-3 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">Agent</th>
                    <th className="px-6 py-3 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">Status</th>
                    <th className="px-6 py-3 text-right text-xs uppercase tracking-[0.18em] text-muted-foreground">Conversations</th>
                    <th className="px-6 py-3 text-right text-xs uppercase tracking-[0.18em] text-muted-foreground">Resolved</th>
                    <th className="px-6 py-3 text-right text-xs uppercase tracking-[0.18em] text-muted-foreground">Open</th>
                    <th className="px-6 py-3 text-right text-xs uppercase tracking-[0.18em] text-muted-foreground">Messages Sent</th>
                    <th className="px-6 py-3 text-right text-xs uppercase tracking-[0.18em] text-muted-foreground">Avg Response</th>
                    <th className="px-6 py-3 text-right text-xs uppercase tracking-[0.18em] text-muted-foreground">Resolution Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {agents.map((agent) => (
                    <tr key={agent.agentId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                            {agent.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{agent.name}</p>
                            <p className="text-xs text-muted-foreground">{agent.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          agent.status === "online" ? "bg-green-50 text-green-700" :
                          agent.status === "busy" ? "bg-red-50 text-red-700" :
                          agent.status === "away" ? "bg-yellow-50 text-yellow-700" :
                          "bg-gray-50 text-gray-700"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            agent.status === "online" ? "bg-green-500" :
                            agent.status === "busy" ? "bg-red-500" :
                            agent.status === "away" ? "bg-yellow-500" :
                            "bg-gray-400"
                          }`} />
                          {agent.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-foreground">{agent.totalConversations}</td>
                      <td className="px-6 py-4 text-right text-sm text-foreground">{agent.resolvedConversations}</td>
                      <td className="px-6 py-4 text-right text-sm text-foreground">{agent.openConversations}</td>
                      <td className="px-6 py-4 text-right text-sm text-foreground">{agent.totalMessagesSent}</td>
                      <td className="px-6 py-4 text-right text-sm text-foreground">{formatTime(agent.avgResponseTimeSeconds)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full ${agent.resolutionRate >= 80 ? "bg-green-500" : agent.resolutionRate >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                              style={{ width: `${agent.resolutionRate}%` }}
                            />
                          </div>
                          <span className="text-sm text-foreground">{agent.resolutionRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-semibold text-foreground">No agent data yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Agent performance will appear once agents are assigned conversations.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

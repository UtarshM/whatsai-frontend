import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Headphones, Plus, Circle, Clock, CheckCircle, Trash2 } from "lucide-react";

interface AgentProfile {
  id: string;
  userId: string;
  status: string;
  skills: string[];
  maxConcurrentChats: number;
  currentChats: number;
  totalResolved: number;
  avgResponseTime: number | null;
  lastActiveAt: string | null;
  user: { id: string; name: string; email: string; role: string };
  team: { id: string; name: string } | null;
}

interface Team {
  id: string;
  name: string;
}

const statusColors: Record<string, string> = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  away: "bg-yellow-500",
  busy: "bg-red-500",
};

const statusLabels: Record<string, string> = {
  online: "Online",
  offline: "Offline",
  away: "Away",
  busy: "Busy",
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string; role: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [agentSkills, setAgentSkills] = useState("");
  const [maxChats, setMaxChats] = useState("10");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchData = async () => {
    try {
      const [agentsRes, teamsRes, usersRes] = await Promise.all([
        fetch("/agents", { credentials: "include" }),
        fetch("/teams", { credentials: "include" }),
        fetch("/admin/users", { credentials: "include" }),
      ]);
      const agentsData = await agentsRes.json();
      const teamsData = await teamsRes.json();
      const usersData = await usersRes.json();
      setAgents(agentsData.data?.agents ?? []);
      setTeams(teamsData.data ?? []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch {
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateAgent = async () => {
    if (!selectedUserId) {
      toast({ title: "User required", description: "Select a user to create an agent profile", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch("/agents", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          teamId: selectedTeamId || undefined,
          skills: agentSkills.split(",").map((s) => s.trim()).filter(Boolean),
          maxConcurrentChats: parseInt(maxChats, 10) || 10,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to create agent profile");
      }
      toast({ title: "Agent profile created" });
      setShowCreateForm(false);
      setSelectedUserId("");
      setSelectedTeamId("");
      setAgentSkills("");
      setMaxChats("10");
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to create agent", variant: "destructive" });
    }
  };

  const handleStatusChange = async (agentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/agents/${agentId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      toast({ title: "Status updated" });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to update status", variant: "destructive" });
    }
  };

  const handleDeleteAgent = async (agent: AgentProfile) => {
    if (!confirm(`Remove agent profile for ${agent.user.name}?`)) return;
    try {
      const response = await fetch(`/agents/${agent.id}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error("Failed to delete agent");
      toast({ title: "Agent removed" });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to remove agent", variant: "destructive" });
    }
  };

  const filteredAgents = statusFilter === "all" ? agents : agents.filter((a) => a.status === statusFilter);

  const agentUserIds = new Set(agents.map((a) => a.userId));
  const availableUsers = users.filter((u) => !agentUserIds.has(u.id));

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[2rem] border border-border bg-card shadow-card overflow-hidden">
          <div className="relative px-8 py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(205_78%_52%/0.10),transparent_35%),radial-gradient(circle_at_bottom_right,hsl(152_58%_38%/0.10),transparent_40%)]" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <Headphones className="h-4 w-4" />
                  Agent Management
                </div>
                <h1 className="mt-5 text-3xl font-display font-bold text-foreground">Manage support & sales agents</h1>
                <p className="mt-4 text-muted-foreground">
                  Create agent profiles, track availability, assign skills, and monitor workload.
                </p>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 rounded-xl border border-input bg-background px-4 text-sm text-foreground"
                >
                  <option value="all">All Status</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="away">Away</option>
                  <option value="busy">Busy</option>
                </select>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Agent
                </Button>
              </div>
            </div>
          </div>
        </div>

        {showCreateForm && (
          <div className="rounded-[1.5rem] border border-border bg-card shadow-card p-6">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Create Agent Profile</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">User</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground"
                >
                  <option value="">Select user...</option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Team</label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground"
                >
                  <option value="">No team</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Skills (comma-separated)</label>
                <input
                  value={agentSkills}
                  onChange={(e) => setAgentSkills(e.target.value)}
                  placeholder="sales, support, hindi"
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Max Concurrent Chats</label>
                <input
                  type="number"
                  value={maxChats}
                  onChange={(e) => setMaxChats(e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={handleCreateAgent}>Create Agent</Button>
              <Button variant="outline" onClick={() => { setShowCreateForm(false); setSelectedUserId(""); setSelectedTeamId(""); }}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden">
          <div className="border-b border-border px-6 py-5">
            <h2 className="font-display text-lg font-semibold text-foreground">Agents ({filteredAgents.length})</h2>
          </div>
          {loading ? (
            <div className="px-6 py-12 text-center text-muted-foreground">Loading agents...</div>
          ) : filteredAgents.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredAgents.map((agent) => (
                <div key={agent.id} className="px-6 py-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-foreground">
                          {agent.user.name.charAt(0).toUpperCase()}
                        </div>
                        <Circle className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 ${statusColors[agent.status]} border-2 border-card`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{agent.user.name}</p>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                            {statusLabels[agent.status]}
                          </span>
                          {agent.team && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                              {agent.team.name}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{agent.user.email}</p>
                        <div className="mt-1 flex gap-3 text-[11px] text-muted-foreground">
                          <span>{agent.currentChats}/{agent.maxConcurrentChats} chats</span>
                          <span>{agent.totalResolved} resolved</span>
                          {agent.avgResponseTime && (
                            <span>{Math.round(agent.avgResponseTime)}s avg response</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent.skills.length > 0 && (
                        <div className="hidden lg:flex flex-wrap gap-1">
                          {agent.skills.map((skill) => (
                            <span key={skill} className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                      <select
                        value={agent.status}
                        onChange={(e) => handleStatusChange(agent.id, e.target.value)}
                        className="h-8 rounded-lg border border-input bg-background px-2 text-xs text-foreground"
                      >
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                        <option value="away">Away</option>
                        <option value="busy">Busy</option>
                      </select>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteAgent(agent)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <Headphones className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-semibold text-foreground">No agents yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Add agent profiles to start managing your support team.</p>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total Agents</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{agents.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Online Now</p>
            <p className="mt-2 text-2xl font-bold text-green-600">{agents.filter((a) => a.status === "online").length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Active Chats</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{agents.reduce((sum, a) => sum + a.currentChats, 0)}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total Resolved</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{agents.reduce((sum, a) => sum + a.totalResolved, 0)}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

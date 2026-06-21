import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Users, Plus, Pencil, Trash2, UserPlus } from "lucide-react";

interface Team {
  id: string;
  name: string;
  description: string | null;
  members: Array<{ id: string; userId: string; status: string; currentChats: number; totalResolved: number }>;
  createdAt: string;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");

  const fetchTeams = async () => {
    try {
      const response = await fetch("/teams", { credentials: "include" });
      const data = await response.json();
      setTeams(data.data ?? []);
    } catch {
      toast({ title: "Error", description: "Failed to load teams", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeams(); }, []);

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      toast({ title: "Name required", description: "Enter a team name", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch("/teams", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: teamName.trim(), description: teamDescription.trim() || undefined }),
      });
      if (!response.ok) throw new Error("Failed to create team");
      toast({ title: "Team created", description: `${teamName} has been created` });
      setTeamName("");
      setTeamDescription("");
      setShowCreateForm(false);
      fetchTeams();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to create team", variant: "destructive" });
    }
  };

  const handleUpdateTeam = async () => {
    if (!editingTeam) return;
    try {
      const response = await fetch(`/teams/${editingTeam.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: teamName.trim(), description: teamDescription.trim() || undefined }),
      });
      if (!response.ok) throw new Error("Failed to update team");
      toast({ title: "Team updated" });
      setEditingTeam(null);
      setTeamName("");
      setTeamDescription("");
      fetchTeams();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to update team", variant: "destructive" });
    }
  };

  const handleDeleteTeam = async (team: Team) => {
    if (!confirm(`Delete team "${team.name}"? Members will be unassigned.`)) return;
    try {
      const response = await fetch(`/teams/${team.id}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error("Failed to delete team");
      toast({ title: "Team deleted" });
      fetchTeams();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete team", variant: "destructive" });
    }
  };

  const startEdit = (team: Team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setTeamDescription(team.description ?? "");
    setShowCreateForm(true);
  };

  const cancelForm = () => {
    setShowCreateForm(false);
    setEditingTeam(null);
    setTeamName("");
    setTeamDescription("");
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-[2rem] border border-border bg-card shadow-card overflow-hidden">
          <div className="relative px-8 py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(205_78%_52%/0.10),transparent_35%),radial-gradient(circle_at_bottom_right,hsl(152_58%_38%/0.10),transparent_40%)]" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <Users className="h-4 w-4" />
                  Agent Teams
                </div>
                <h1 className="mt-5 text-3xl font-display font-bold text-foreground">Manage agent teams</h1>
                <p className="mt-4 text-muted-foreground">
                  Create teams to organize agents and route conversations by skill, language, or department.
                </p>
              </div>
              <Button onClick={() => { cancelForm(); setShowCreateForm(true); }}>
                <Plus className="mr-2 h-4 w-4" /> New Team
              </Button>
            </div>
          </div>
        </div>

        {showCreateForm && (
          <div className="rounded-[1.5rem] border border-border bg-card shadow-card p-6">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">
              {editingTeam ? "Edit Team" : "Create Team"}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Team Name</label>
                <input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Sales Team"
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Description</label>
                <input
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  placeholder="Optional description"
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={editingTeam ? handleUpdateTeam : handleCreateTeam}>
                {editingTeam ? "Save Changes" : "Create Team"}
              </Button>
              <Button variant="outline" onClick={cancelForm}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden">
          <div className="border-b border-border px-6 py-5">
            <h2 className="font-display text-lg font-semibold text-foreground">Teams</h2>
          </div>
          {loading ? (
            <div className="px-6 py-12 text-center text-muted-foreground">Loading teams...</div>
          ) : teams.length > 0 ? (
            <div className="divide-y divide-border">
              {teams.map((team) => (
                <div key={team.id} className="px-6 py-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-semibold text-foreground">{team.name}</h3>
                        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
                          {team.members.length} members
                        </span>
                      </div>
                      {team.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{team.description}</p>
                      )}
                      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                        <span>{team.members.filter((m) => m.status === "online").length} online</span>
                        <span>{team.members.reduce((sum, m) => sum + m.currentChats, 0)} active chats</span>
                        <span>{team.members.reduce((sum, m) => sum + m.totalResolved, 0)} resolved</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(team)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteTeam(team)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <UserPlus className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-semibold text-foreground">No teams yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Create a team to start organizing your agents.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

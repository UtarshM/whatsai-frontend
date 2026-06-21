import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { GitBranch, Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

interface AssignmentRule {
  id: string;
  name: string;
  triggerType: string;
  conditions: { tags?: string[]; sources?: string[]; skills?: string[] };
  action: { type: string; targetId?: string };
  priority: number;
  enabled: boolean;
  createdAt: string;
}

interface Team { id: string; name: string; }

export default function AssignmentRulesPage() {
  const [rules, setRules] = useState<AssignmentRule[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AssignmentRule | null>(null);
  const [ruleName, setRuleName] = useState("");
  const [triggerType, setTriggerType] = useState("inbound");
  const [conditionTags, setConditionTags] = useState("");
  const [conditionSources, setConditionSources] = useState("");
  const [actionType, setActionType] = useState("round_robin");
  const [actionTargetId, setActionTargetId] = useState("");
  const [priority, setPriority] = useState("0");

  const fetchData = async () => {
    try {
      const [rulesRes, teamsRes] = await Promise.all([
        fetch("/assignment-rules", { credentials: "include" }),
        fetch("/teams", { credentials: "include" }),
      ]);
      const rulesData = await rulesRes.json();
      const teamsData = await teamsRes.json();
      setRules(rulesData.data ?? []);
      setTeams(teamsData.data ?? []);
    } catch {
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!ruleName.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch("/assignment-rules", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: ruleName.trim(),
          triggerType,
          conditions: {
            tags: conditionTags ? conditionTags.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
            sources: conditionSources ? conditionSources.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
          },
          action: {
            type: actionType,
            targetId: actionTargetId || undefined,
          },
          priority: parseInt(priority, 10) || 0,
        }),
      });
      if (!response.ok) throw new Error("Failed to create rule");
      toast({ title: "Rule created" });
      resetForm();
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed", variant: "destructive" });
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      const response = await fetch(`/assignment-rules/${editing.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: ruleName.trim(),
          triggerType,
          conditions: {
            tags: conditionTags ? conditionTags.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
            sources: conditionSources ? conditionSources.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
          },
          action: {
            type: actionType,
            targetId: actionTargetId || undefined,
          },
          priority: parseInt(priority, 10) || 0,
        }),
      });
      if (!response.ok) throw new Error("Failed to update rule");
      toast({ title: "Rule updated" });
      resetForm();
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed", variant: "destructive" });
    }
  };

  const handleToggle = async (rule: AssignmentRule) => {
    try {
      await fetch(`/assignment-rules/${rule.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !rule.enabled }),
      });
      fetchData();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleDelete = async (rule: AssignmentRule) => {
    if (!confirm(`Delete rule "${rule.name}"?`)) return;
    try {
      await fetch(`/assignment-rules/${rule.id}`, { method: "DELETE", credentials: "include" });
      toast({ title: "Rule deleted" });
      fetchData();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const startEdit = (rule: AssignmentRule) => {
    setEditing(rule);
    setRuleName(rule.name);
    setTriggerType(rule.triggerType);
    setConditionTags(rule.conditions.tags?.join(", ") ?? "");
    setConditionSources(rule.conditions.sources?.join(", ") ?? "");
    setActionType(rule.action.type);
    setActionTargetId(rule.action.targetId ?? "");
    setPriority(String(rule.priority));
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setRuleName("");
    setTriggerType("inbound");
    setConditionTags("");
    setConditionSources("");
    setActionType("round_robin");
    setActionTargetId("");
    setPriority("0");
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
                  <GitBranch className="h-4 w-4" />
                  Assignment Rules
                </div>
                <h1 className="mt-5 text-3xl font-display font-bold text-foreground">Automated conversation routing</h1>
                <p className="mt-4 text-muted-foreground">
                  Define rules to automatically assign incoming conversations to the right agent or team.
                </p>
              </div>
              <Button onClick={() => { resetForm(); setShowForm(true); }}>
                <Plus className="mr-2 h-4 w-4" /> New Rule
              </Button>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="rounded-[1.5rem] border border-border bg-card shadow-card p-6">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">
              {editing ? "Edit Rule" : "Create Rule"}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Rule Name</label>
                <input value={ruleName} onChange={(e) => setRuleName(e.target.value)} placeholder="e.g. Sales routing"
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Trigger</label>
                <select value={triggerType} onChange={(e) => setTriggerType(e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground">
                  <option value="inbound">Inbound Message</option>
                  <option value="campaign_reply">Campaign Reply</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Priority</label>
                <input type="number" value={priority} onChange={(e) => setPriority(e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Tags (comma-separated)</label>
                <input value={conditionTags} onChange={(e) => setConditionTags(e.target.value)} placeholder="vip, enterprise"
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Sources (comma-separated)</label>
                <input value={conditionSources} onChange={(e) => setConditionSources(e.target.value)} placeholder="meta_ads, organic"
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Action</label>
                <select value={actionType} onChange={(e) => setActionType(e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground">
                  <option value="round_robin">Round Robin</option>
                  <option value="team">Assign to Team</option>
                  <option value="agent">Assign to Agent</option>
                </select>
              </div>
              {actionType !== "round_robin" && (
                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Target Team</label>
                  <select value={actionTargetId} onChange={(e) => setActionTargetId(e.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground">
                    <option value="">Select...</option>
                    {teams.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                  </select>
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={editing ? handleUpdate : handleCreate}>
                {editing ? "Save Changes" : "Create Rule"}
              </Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden">
          <div className="border-b border-border px-6 py-5">
            <h2 className="font-display text-lg font-semibold text-foreground">Rules ({rules.length})</h2>
          </div>
          {loading ? (
            <div className="px-6 py-12 text-center text-muted-foreground">Loading...</div>
          ) : rules.length > 0 ? (
            <div className="divide-y divide-border">
              {rules.map((rule) => (
                <div key={rule.id} className="px-6 py-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{rule.name}</h3>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                          Priority {rule.priority}
                        </span>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                          {rule.triggerType}
                        </span>
                      </div>
                      <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                        <span>Action: {rule.action.type}</span>
                        {rule.conditions.tags && rule.conditions.tags.length > 0 && (
                          <span>Tags: {rule.conditions.tags.join(", ")}</span>
                        )}
                        {rule.conditions.sources && rule.conditions.sources.length > 0 && (
                          <span>Sources: {rule.conditions.sources.join(", ")}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleToggle(rule)} className="text-muted-foreground hover:text-foreground">
                        {rule.enabled ? <ToggleRight className="h-6 w-6 text-green-500" /> : <ToggleLeft className="h-6 w-6" />}
                      </button>
                      <Button variant="outline" size="sm" onClick={() => startEdit(rule)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(rule)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <GitBranch className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-semibold text-foreground">No assignment rules yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Create rules to auto-route conversations.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

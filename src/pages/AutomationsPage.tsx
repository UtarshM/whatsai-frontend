import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useAppContext } from "@/context/AppContext";
import type { AutomationRule } from "@/lib/api";
import { Bot, Clock3, MessageSquareMore, Sparkles, UserPlus2, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type DraftState = Record<string, { enabled: boolean; message: string; ownerName: string; reminderHours: string }>;

const ruleMeta: Record<AutomationRule["type"], { icon: typeof Bot; helper: string }> = {
  auto_reply_first_inbound: {
    icon: MessageSquareMore,
    helper: "Reply instantly when a brand-new inbound WhatsApp conversation starts.",
  },
  auto_assign_new_lead: {
    icon: UserPlus2,
    helper: "Route new inbound and Meta ad leads to the right owner automatically.",
  },
  no_reply_reminder: {
    icon: Clock3,
    helper: "Flag conversations that have gone too long without an outbound response.",
  },
  follow_up_after_contacted: {
    icon: Sparkles,
    helper: "Send a structured follow-up once an operator moves a lead to Contacted.",
  },
};

export default function AutomationsPage() {
  const navigate = useNavigate();
  const { automations, automationEvents, updateAutomation, runAutomationSweep } = useAppContext();
  const [drafts, setDrafts] = useState<DraftState>({});
  const [customFlows, setCustomFlows] = useState<any[]>([]);
  const [isRunningSweep, setIsRunningSweep] = useState(false);

  useEffect(() => {
    setDrafts(Object.fromEntries(
      automations.map((automation) => [
        automation.type,
        {
          enabled: automation.enabled,
          message: automation.config.message ?? "",
          ownerName: automation.config.ownerName ?? "",
          reminderHours: automation.config.reminderHours ? String(automation.config.reminderHours) : "",
        },
      ]),
    ));
  }, [automations]);

  useEffect(() => {
    const fetchCustomFlows = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:3001";
        const res = await fetch(`${baseUrl}/automation/definitions`);
        if (res.ok) {
          const data = await res.json();
          setCustomFlows(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    void fetchCustomFlows();
  }, []);

  const sortedEvents = useMemo(() => automationEvents.slice(0, 8), [automationEvents]);

  const handleSaveAutomation = async (rule: AutomationRule) => {
    const draft = drafts[rule.type];
    if (!draft) {
      return;
    }

    try {
      await updateAutomation({
        type: rule.type,
        enabled: draft.enabled,
        config: {
          message: draft.message.trim() || undefined,
          ownerName: draft.ownerName.trim() || undefined,
          reminderHours: draft.reminderHours ? Number(draft.reminderHours) : undefined,
        },
      });
      toast({ title: "Automation saved", description: `${rule.name} is updated for this workspace.` });
    } catch (error) {
      toast({
        title: "Automation save failed",
        description: error instanceof Error ? error.message : "Could not save the automation rule.",
        variant: "destructive",
      });
    }
  };

  const handleRunSweep = async () => {
    try {
      setIsRunningSweep(true);
      const result = await runAutomationSweep();
      toast({ title: result.ok ? "Reminder sweep completed" : "Reminder sweep blocked", description: result.message });
    } catch (error) {
      toast({
        title: "Sweep failed",
        description: error instanceof Error ? error.message : "Could not run the reminder sweep.",
        variant: "destructive",
      });
    } finally {
      setIsRunningSweep(false);
    }
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
                  Automation engine v1
                </div>
                <h1 className="mt-5 text-3xl font-display font-bold text-foreground">Automate first response, lead routing, reminders, and early follow-up</h1>
                <p className="mt-4 text-muted-foreground">
                  This first automation layer focuses on the operational wins most WhatsApp teams need first: instant first response, owner assignment, no-reply monitoring, and structured follow-up.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                <Stat label="Rules" value={automations.length.toString()} />
                <Stat label="Enabled" value={automations.filter((rule) => rule.enabled).length.toString()} />
                <Stat label="Recent runs" value={automationEvents.length.toString()} />
              </div>
            </div>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display">Custom Workflows</h2>
            <Button onClick={() => navigate("/automations/builder")} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Custom Flow
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {customFlows.length > 0 ? customFlows.map(flow => (
              <Card key={flow.id} className="p-5 flex flex-col justify-between hover:border-primary transition-colors cursor-pointer" onClick={() => navigate(`/automations/builder?id=${flow.id}`)}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">{flow.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${flow.isActive ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                      {flow.isActive ? 'Active' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{flow.description || 'No description provided.'}</p>
                </div>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{Array.isArray(flow.nodes) ? flow.nodes.length : 0} nodes</span>
                  <span>{new Date(flow.updatedAt).toLocaleDateString()}</span>
                </div>
              </Card>
            )) : (
              <div className="col-span-full border border-dashed rounded-xl p-8 text-center bg-muted/5">
                <p className="text-muted-foreground mb-4">You haven't created any custom workflows yet.</p>
                <Button variant="outline" onClick={() => navigate("/automations/builder")}>Get Started</Button>
              </div>
            )}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
          <section className="space-y-4">
            {automations.map((rule) => {
              const meta = ruleMeta[rule.type];
              const Icon = meta.icon;
              const draft = drafts[rule.type] ?? {
                enabled: rule.enabled,
                message: rule.config.message ?? "",
                ownerName: rule.config.ownerName ?? "",
                reminderHours: rule.config.reminderHours ? String(rule.config.reminderHours) : "",
              };

              return (
                <div key={rule.id} className="rounded-[1.5rem] border border-border bg-card p-6 shadow-card">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-display text-lg font-semibold text-foreground">{rule.name}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{meta.helper}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          Updated {new Date(rule.updatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      </div>
                    </div>
                    <label className="inline-flex items-center gap-3 rounded-full border border-border bg-muted/20 px-4 py-2 text-sm text-foreground">
                      <span>{draft.enabled ? "Enabled" : "Disabled"}</span>
                      <input
                        type="checkbox"
                        checked={draft.enabled}
                        onChange={(event) => setDrafts((current) => ({
                          ...current,
                          [rule.type]: {
                            ...draft,
                            enabled: event.target.checked,
                          },
                        }))}
                        className="h-4 w-4 rounded border-border"
                      />
                    </label>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {(rule.type === "auto_reply_first_inbound" || rule.type === "follow_up_after_contacted") && (
                      <div className="md:col-span-2">
                        <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Message</label>
                        <textarea
                          rows={4}
                          value={draft.message}
                          onChange={(event) => setDrafts((current) => ({
                            ...current,
                            [rule.type]: {
                              ...draft,
                              message: event.target.value,
                            },
                          }))}
                          className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground"
                          placeholder="Use {{contact.name}} to personalize the reply"
                        />
                      </div>
                    )}

                    {(rule.type === "auto_assign_new_lead" || rule.type === "no_reply_reminder") && (
                      <div>
                        <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Owner</label>
                        <input
                          value={draft.ownerName}
                          onChange={(event) => setDrafts((current) => ({
                            ...current,
                            [rule.type]: {
                              ...draft,
                              ownerName: event.target.value,
                            },
                          }))}
                          className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground"
                          placeholder="Growth Desk"
                        />
                      </div>
                    )}

                    {rule.type === "no_reply_reminder" && (
                      <div>
                        <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Reminder after hours</label>
                        <input
                          type="number"
                          min={1}
                          value={draft.reminderHours}
                          onChange={(event) => setDrafts((current) => ({
                            ...current,
                            [rule.type]: {
                              ...draft,
                              reminderHours: event.target.value,
                            },
                          }))}
                          className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground"
                          placeholder="4"
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-5 flex justify-end">
                    <Button onClick={() => void handleSaveAutomation(rule)}>Save rule</Button>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="space-y-6">
            <div className="rounded-[1.5rem] border border-border bg-card p-6 shadow-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">Reminder sweeps</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Run the no-reply scanner to flag overdue conversations and generate automation events.
                  </p>
                </div>
                <Button onClick={() => void handleRunSweep()} disabled={isRunningSweep}>
                  {isRunningSweep ? "Running..." : "Run sweep"}
                </Button>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-border bg-card p-6 shadow-card">
              <h2 className="font-display text-lg font-semibold text-foreground">Recent automation events</h2>
              <div className="mt-4 space-y-3">
                {sortedEvents.length > 0 ? sortedEvents.map((event) => (
                  <div key={event.id} className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">{event.summary}</p>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs capitalize text-foreground">{event.status}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {event.ruleType} · {new Date(event.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                )) : (
                  <div className="rounded-xl border border-dashed border-border bg-muted/10 p-4 text-sm text-muted-foreground">
                    No automation runs recorded yet.
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

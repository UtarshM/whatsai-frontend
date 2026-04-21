import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useAppContext } from "@/context/AppContext";
import { BarChart3, Megaphone, Phone, Search, UserRound } from "lucide-react";
import { fetchMetaSourceMappings, type MetaLeadSourceMapping } from "@/lib/meta/sourceMappings";
import { matchLeadToMetaMapping } from "@/lib/meta/attribution";

export default function LeadsPage() {
  const { leads, updateLead, user } = useAppContext();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(leads[0]?.id ?? null);
  const [statusFilter, setStatusFilter] = useState<"All" | "New" | "Contacted" | "Qualified" | "Won" | "Lost">("All");
  const [sourceFilter, setSourceFilter] = useState<"All" | "Meta Ads" | "WhatsApp Inbound" | "Campaign" | "Manual" | "Organic">("All");
  const [search, setSearch] = useState("");
  const [assignmentDraft, setAssignmentDraft] = useState("");
  const [notesDraft, setNotesDraft] = useState("");
  const [mappings, setMappings] = useState<MetaLeadSourceMapping[]>([]);

  useEffect(() => {
    void fetchMetaSourceMappings()
      .then(setMappings)
      .catch(() => setMappings([]));
  }, []);

  useEffect(() => {
    if (!selectedLeadId && leads[0]?.id) {
      setSelectedLeadId(leads[0].id);
    }
  }, [leads, selectedLeadId]);

  const filteredLeads = useMemo(() => (
    leads.filter((lead) => {
      const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
      const matchesSource = sourceFilter === "All" || lead.source === sourceFilter;
      const matchesSearch = !search.trim()
        || lead.fullName.toLowerCase().includes(search.toLowerCase())
        || lead.phone.includes(search)
        || lead.sourceLabel.toLowerCase().includes(search.toLowerCase())
        || (lead.assignedTo || "").toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSource && matchesSearch;
    })
  ), [leads, search, sourceFilter, statusFilter]);

  const activeLead = filteredLeads.find((lead) => lead.id === selectedLeadId)
    ?? leads.find((lead) => lead.id === selectedLeadId)
    ?? filteredLeads[0]
    ?? leads[0];

  useEffect(() => {
    setAssignmentDraft(activeLead?.assignedTo ?? user?.name ?? "");
    setNotesDraft(activeLead?.notes ?? "");
  }, [activeLead?.assignedTo, activeLead?.id, activeLead?.notes, user?.name]);

  const handleLeadUpdate = async (
    input: Parameters<typeof updateLead>[0],
    successMessage: string,
  ) => {
    try {
      await updateLead(input);
      toast({ title: "Lead updated", description: successMessage });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Could not update the lead.",
        variant: "destructive",
      });
    }
  };

  const attributionDetails = useMemo(() => {
    if (!activeLead) {
      return null;
    }

    const getNoteMatch = (label: string) => {
      const match = activeLead.notes.match(new RegExp(`${label}:\\s*([^\\n]+)`));
      return match?.[1]?.trim() || "-";
    };

    const matched = matchLeadToMetaMapping(activeLead, mappings);
    return {
      sourceType: activeLead.source,
      sourceLabel: activeLead.sourceLabel || "-",
      mappedLabel: matched.mapping?.label ?? "Unmapped",
      metaPageId: activeLead.source === "Meta Ads" ? (matched.ids.pageId || getNoteMatch("Page ID")) : "-",
      metaAdId: activeLead.source === "Meta Ads" ? (matched.ids.adId || getNoteMatch("Ad ID")) : "-",
      metaFormId: activeLead.source === "Meta Ads" ? (matched.ids.formId || getNoteMatch("Form ID")) : "-",
    };
  }, [activeLead, mappings]);

  const ownerLoad = useMemo(() => {
    const counts = new Map<string, number>();
    for (const lead of leads) {
      const owner = lead.assignedTo || "Unassigned";
      counts.set(owner, (counts.get(owner) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([owner, count]) => ({ owner, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 4);
  }, [leads]);

  const qualifiedPipeline = leads.filter((lead) => lead.status === "Qualified" || lead.status === "Won").length;
  const unassignedLeads = leads.filter((lead) => !lead.assignedTo).length;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[2rem] border border-border bg-card shadow-card overflow-hidden">
          <div className="relative px-8 py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(205_78%_52%/0.10),transparent_35%),radial-gradient(circle_at_bottom_right,hsl(152_58%_38%/0.10),transparent_40%)]" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <Megaphone className="h-4 w-4" />
                  Leads and attribution
                </div>
                <h1 className="mt-5 text-3xl font-display font-bold text-foreground">Capture, qualify, assign, and route leads like a working CRM desk</h1>
                <p className="mt-4 text-muted-foreground">
                  This phase adds stronger search, ownership visibility, and faster qualification loops on top of your CTWA attribution layer.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-4 lg:min-w-[520px]">
                <Stat label="New leads" value={leads.filter((lead) => lead.status === "New").length.toString()} />
                <Stat label="Qualified pipeline" value={qualifiedPipeline.toString()} />
                <Stat label="Meta Ads" value={leads.filter((lead) => lead.source === "Meta Ads").length.toString()} />
                <Stat label="Unassigned" value={unassignedLeads.toString()} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
          <section className="rounded-[1.5rem] border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-3 justify-between flex-wrap">
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">Lead pipeline</h2>
                <p className="text-xs text-muted-foreground mt-1">Filter by source, stage, and free-text search.</p>
              </div>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search lead, phone, source, or owner"
                  className="h-10 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as "All" | "New" | "Contacted" | "Qualified" | "Won" | "Lost")}
                className="h-10 rounded-xl border border-input bg-background px-4 text-sm text-foreground"
              >
                {["All", "New", "Contacted", "Qualified", "Won", "Lost"].map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
              <select
                value={sourceFilter}
                onChange={(event) => setSourceFilter(event.target.value as typeof sourceFilter)}
                className="h-10 rounded-xl border border-input bg-background px-4 text-sm text-foreground"
              >
                {["All", "Meta Ads", "WhatsApp Inbound", "Campaign", "Manual", "Organic"].map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-border bg-card p-5 shadow-card">
            <h3 className="font-display text-lg font-semibold text-foreground">Owner load</h3>
            <div className="mt-4 grid gap-3">
              {ownerLoad.map((item) => (
                <div key={item.owner} className="rounded-xl border border-border bg-muted/20 p-4">
                  <p className="text-sm font-medium text-foreground">{item.owner}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.count} active lead{item.count === 1 ? "" : "s"}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
          <section className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden">
            <div className="divide-y divide-border">
              {filteredLeads.length > 0 ? filteredLeads.map((lead) => (
                <button
                  type="button"
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                  className={`block w-full px-6 py-5 text-left transition-colors hover:bg-muted/30 ${
                    activeLead?.id === lead.id ? "bg-muted/30" : ""
                  }`}
                >
                  <div className="grid gap-4 md:grid-cols-[1.2fr,0.9fr,0.9fr,0.9fr] md:items-center">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{lead.fullName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{lead.sourceLabel}</p>
                      {lead.source === "Meta Ads" && (
                        <p className="mt-1 text-xs text-primary">
                          {matchLeadToMetaMapping(lead, mappings).mapping?.label ?? "Unmapped CTWA source"}
                        </p>
                      )}
                    </div>
                    <InfoLine icon={Phone} value={lead.phone} />
                    <InfoLine icon={BarChart3} value={lead.status} />
                    <InfoLine icon={UserRound} value={lead.assignedTo || "Unassigned"} />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{lead.notes}</p>
                </button>
              )) : (
                <div className="px-6 py-12 text-center">
                  <p className="text-base font-semibold text-foreground">No leads yet</p>
                  <p className="mt-2 text-sm text-muted-foreground">Meta ad leads, inbound chats, and manual entries will appear here.</p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden">
            <div className="border-b border-border px-6 py-5">
              <h2 className="font-display text-lg font-semibold text-foreground">Lead operator panel</h2>
            </div>
            <div className="space-y-5 px-6 py-6">
              {activeLead ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <LeadInfoBlock label="Lead" value={activeLead.fullName} />
                    <LeadInfoBlock label="Phone" value={activeLead.phone} />
                    <LeadInfoBlock label="Source" value={activeLead.sourceLabel} />
                    <LeadInfoBlock label="Status" value={activeLead.status} />
                  </div>

                  <div className="rounded-[1.25rem] border border-border bg-muted/20 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Owner</p>
                    <input
                      value={assignmentDraft}
                      onChange={(event) => setAssignmentDraft(event.target.value)}
                      placeholder="Assign sales owner"
                      className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground"
                    />
                    <Button
                      variant="outline"
                      className="mt-3"
                      onClick={() => void handleLeadUpdate(
                        { id: activeLead.id, assignedTo: assignmentDraft.trim() || null },
                        assignmentDraft.trim() ? `Lead assigned to ${assignmentDraft.trim()}.` : "Lead is now unassigned.",
                      )}
                    >
                      Save owner
                    </Button>
                  </div>

                  <div className="rounded-[1.25rem] border border-border bg-muted/20 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Attribution detail</p>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <LeadInfoBlock label="Source type" value={attributionDetails?.sourceType ?? "-"} />
                      <LeadInfoBlock label="Source label" value={attributionDetails?.sourceLabel ?? "-"} />
                      <LeadInfoBlock label="Mapping match" value={attributionDetails?.mappedLabel ?? "-"} />
                      <LeadInfoBlock label="Meta page" value={attributionDetails?.metaPageId ?? "-"} />
                      <LeadInfoBlock label="Meta ad" value={attributionDetails?.metaAdId ?? "-"} />
                      <LeadInfoBlock label="Meta form" value={attributionDetails?.metaFormId ?? "-"} />
                    </div>
                  </div>

                  <div className="rounded-[1.25rem] border border-border bg-muted/20 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Qualification notes</p>
                    <textarea
                      value={notesDraft}
                      onChange={(event) => setNotesDraft(event.target.value)}
                      rows={5}
                      className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground"
                      placeholder="Add campaign context, next step, or qualification notes"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        "Requested pricing breakdown",
                        "Needs callback tomorrow",
                        "High-intent Shopify lead",
                      ].map((snippet) => (
                        <button
                          key={snippet}
                          type="button"
                          onClick={() => setNotesDraft((current) => current ? `${current}\n${snippet}` : snippet)}
                          className="rounded-full bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground"
                        >
                          {snippet}
                        </button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      className="mt-3"
                      onClick={() => void handleLeadUpdate(
                        { id: activeLead.id, notes: notesDraft },
                        "Lead notes updated.",
                      )}
                    >
                      Save notes
                    </Button>
                  </div>

                  <div className="rounded-[1.25rem] border border-border bg-muted/20 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Move stage</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(["Contacted", "Qualified", "Won", "Lost"] as const).map((status) => (
                        <Button
                          key={status}
                          variant={activeLead.status === status ? "default" : "outline"}
                          onClick={() => void handleLeadUpdate(
                            { id: activeLead.id, status },
                            `Lead moved to ${status}.`,
                          )}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-base font-semibold text-foreground">No lead selected</p>
                  <p className="mt-2 text-sm text-muted-foreground">Choose a lead from the pipeline to assign, qualify, and track follow-up progress.</p>
                </div>
              )}
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

function InfoLine({ icon: Icon, value }: { icon: typeof Phone; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-foreground">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span>{value}</span>
    </div>
  );
}

function LeadInfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

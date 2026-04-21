import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, FileText, Pencil, Plus, Send, ShieldCheck, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { toast } from "@/components/ui/use-toast";
import type { CreateTemplateInput, Template, UpdateTemplateInput } from "@/lib/api";

const statusConfig = {
  Approved: { icon: CheckCircle2, className: "bg-success/10 text-success" },
  Pending: { icon: Clock, className: "bg-warning/10 text-warning" },
  Rejected: { icon: XCircle, className: "bg-destructive/10 text-destructive" },
};

const emptyDraft: CreateTemplateInput = {
  name: "",
  category: "Marketing",
  language: "English",
  preview: "",
};

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { templates, createTemplate, updateTemplate } = useAppContext();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Template["status"]>("All");
  const [categoryFilter, setCategoryFilter] = useState<"All" | Template["category"]>("All");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CreateTemplateInput>(emptyDraft);
  const [draftStatus, setDraftStatus] = useState<Template["status"]>("Pending");
  const approvedCount = templates.filter((template) => template.status === "Approved").length;

  const filteredTemplates = useMemo(
    () => templates.filter((template) => {
      const matchesSearch = [template.name, template.preview, template.language, template.category]
        .some((value) => value.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === "All" || template.status === statusFilter;
      const matchesCategory = categoryFilter === "All" || template.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    }),
    [categoryFilter, search, statusFilter, templates],
  );

  const resetEditor = () => {
    setEditorOpen(false);
    setEditingTemplateId(null);
    setDraft(emptyDraft);
    setDraftStatus("Pending");
  };

  const openCreate = () => {
    setEditorOpen(true);
    setEditingTemplateId(null);
    setDraft(emptyDraft);
    setDraftStatus("Pending");
  };

  const openEdit = (template: Template) => {
    setEditorOpen(true);
    setEditingTemplateId(template.id);
    setDraft({
      name: template.name,
      category: template.category,
      language: template.language,
      preview: template.preview,
    });
    setDraftStatus(template.status);
  };

  const handleSubmit = async () => {
    if (!draft.name.trim() || !draft.preview.trim()) {
      toast({ title: "Template details missing", description: "Add a template name and body before saving." });
      return;
    }

    if (editingTemplateId) {
      const payload: UpdateTemplateInput = {
        id: editingTemplateId,
        ...draft,
        status: draftStatus,
      };
      await updateTemplate(payload);
      toast({ title: "Template updated", description: `${draft.name} is now ${draftStatus.toLowerCase()}.` });
    } else {
      await createTemplate(draft);
      toast({ title: "Template created", description: `${draft.name} has been added to the review queue.` });
    }

    resetEditor();
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-border bg-card shadow-card overflow-hidden"
        >
          <div className="relative px-8 py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(205_78%_52%/0.10),transparent_35%),radial-gradient(circle_at_bottom_right,hsl(152_58%_38%/0.10),transparent_40%)]" />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  Approval-aware template system
                </div>
                <h1 className="mt-5 text-3xl font-display font-bold text-foreground">Manage the approved messaging layer behind every campaign</h1>
                <p className="mt-4 text-muted-foreground">
                  Phase 1 now includes a working template builder, review states, and a tighter library so operators can move from creation to campaign selection without leaving the product.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Templates</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{templates.length} total</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Approved</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{approvedCount} ready</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Review queue</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{templates.filter((template) => template.status === "Pending").length} pending</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">Template library</h2>
            <p className="text-muted-foreground mt-1">Create, review, and activate WhatsApp message templates</p>
          </div>
          <Button variant="gradient" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> Create Template
          </Button>
        </div>

        {editorOpen && (
          <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-card">
            <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {editingTemplateId ? "Edit template" : "New template"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Name it, choose its category, then write the exact WhatsApp copy operators will use.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={resetEditor}>Close</Button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input
                type="text"
                value={draft.name}
                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                placeholder="Template name"
                className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
              />
              <input
                type="text"
                value={draft.language}
                onChange={(event) => setDraft((current) => ({ ...current, language: event.target.value }))}
                placeholder="Language"
                className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
              />
              <select
                value={draft.category}
                onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value as Template["category"] }))}
                className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
              >
                {["Marketing", "Utility"].map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
              <select
                value={draftStatus}
                onChange={(event) => setDraftStatus(event.target.value as Template["status"])}
                className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
                disabled={!editingTemplateId}
              >
                {["Pending", "Approved", "Rejected"].map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>
            <textarea
              rows={5}
              value={draft.preview}
              onChange={(event) => setDraft((current) => ({ ...current, preview: event.target.value }))}
              placeholder="Hi {{1}}, your order #{{2}} is confirmed..."
              className="mt-4 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground"
            />
            <div className="mt-4 rounded-xl bg-muted/40 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Live preview</p>
              <p className="mt-2 text-sm text-foreground whitespace-pre-wrap">{draft.preview || "Template body preview will appear here."}</p>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={resetEditor}>Cancel</Button>
              <Button onClick={() => void handleSubmit()}>
                {editingTemplateId ? "Save Template" : "Create Template"}
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-card">
          <div className="grid gap-3 md:grid-cols-[1fr,180px,180px]">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, category, language, or body"
              className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "All" | Template["status"])}
              className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
            >
              {["All", "Approved", "Pending", "Rejected"].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as "All" | Template["category"])}
              className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
            >
              {["All", "Marketing", "Utility"].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredTemplates.map((template, index) => {
            const statusInfo = statusConfig[template.status];
            const StatusIcon = statusInfo.icon;
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-[1.5rem] border border-border bg-card p-5 shadow-card"
              >
                <div className="flex items-start justify-between gap-4 mb-4 flex-col lg:flex-row">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-display font-semibold text-foreground">{template.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{template.category}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{template.language}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ${statusInfo.className}`}>
                      <StatusIcon className="h-3 w-3" />
                      {template.status}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => openEdit(template)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    {template.status === "Approved" && (
                      <Button variant="outline" size="sm" onClick={() => navigate("/campaigns")}>
                        <Send className="h-3.5 w-3.5 mr-1" /> Use
                      </Button>
                    )}
                  </div>
                </div>
                <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground font-mono whitespace-pre-wrap">
                  {template.preview}
                </div>
              </motion.div>
            );
          })}

          {filteredTemplates.length === 0 && (
            <div className="rounded-[1.5rem] border border-dashed border-border bg-card px-6 py-12 text-center shadow-card">
              <p className="text-base font-semibold text-foreground">No templates match these filters</p>
              <p className="mt-2 text-sm text-muted-foreground">Adjust the search or create a new template to grow your library.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

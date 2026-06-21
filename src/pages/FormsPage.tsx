import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText, Plus, Trash2, Eye, Send } from "lucide-react";

interface Form { id: string; name: string; description: string | null; fields: any; isActive: boolean; createdAt: string; }

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<Array<{ name: string; type: string; label: string; required: boolean }>>([
    { name: "name", type: "text", label: "Name", required: true },
    { name: "phone", type: "phone", label: "Phone", required: true },
    { name: "email", type: "email", label: "Email", required: false },
  ]);

  const fetchForms = async () => {
    try { const r = await fetch("/forms", { credentials: "include" }); const d = await r.json(); setForms(d.data ?? []); }
    catch { toast.error("Failed to load forms"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchForms(); }, []);

  const handleCreate = async () => {
    if (!name.trim()) { toast.error("Name required"); return; }
    try {
      const r = await fetch("/forms", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined, fields }),
      });
      if (!r.ok) throw new Error("Failed");
      toast.success("Form created"); setShowForm(false); setName(""); setDescription(""); fetchForms();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  const handleDelete = async (f: Form) => {
    if (!confirm(`Delete "${f.name}"?`)) return;
    try { await fetch(`/forms/${f.id}`, { method: "DELETE", credentials: "include" }); toast.success("Deleted"); fetchForms(); }
    catch { toast.error("Failed"); }
  };

  const addField = () => setFields([...fields, { name: "", type: "text", label: "", required: false }]);
  const removeField = (i: number) => setFields(fields.filter((_, idx) => idx !== i));
  const updateField = (i: number, key: string, value: any) => setFields(fields.map((f, idx) => idx === i ? { ...f, [key]: value } : f));

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-[2rem] border border-border bg-card shadow-card overflow-hidden">
          <div className="relative px-8 py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(205_78%_52%/0.10),transparent_35%),radial-gradient(circle_at_bottom_right,hsl(152_58%_38%/0.10),transparent_40%)]" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <FileText className="h-4 w-4" /> WhatsApp Forms
                </div>
                <h1 className="mt-5 text-3xl font-display font-bold text-foreground">Capture leads with forms</h1>
                <p className="mt-4 text-muted-foreground">Create forms to collect customer information via WhatsApp.</p>
              </div>
              <Button onClick={() => setShowForm(true)}><Plus className="mr-2 h-4 w-4" /> New Form</Button>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="rounded-[1.5rem] border border-border bg-card shadow-card p-6 space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Create Form</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Form Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm" /></div>
              <div><label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Description</label>
                <input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm" /></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Fields</label>
                <Button variant="outline" size="sm" onClick={addField}>Add Field</Button>
              </div>
              <div className="space-y-2">
                {fields.map((f, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input value={f.name} onChange={(e) => updateField(i, "name", e.target.value)} placeholder="name" className="h-9 w-24 rounded-lg border border-input bg-background px-2 text-xs" />
                    <select value={f.type} onChange={(e) => updateField(i, "type", e.target.value)} className="h-9 rounded-lg border border-input bg-background px-2 text-xs">
                      <option value="text">Text</option><option value="email">Email</option><option value="phone">Phone</option>
                      <option value="number">Number</option><option value="select">Select</option><option value="textarea">Textarea</option>
                    </select>
                    <input value={f.label} onChange={(e) => updateField(i, "label", e.target.value)} placeholder="Label" className="flex-1 h-9 rounded-lg border border-input bg-background px-2 text-xs" />
                    <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={f.required} onChange={(e) => updateField(i, "required", e.target.checked)} className="h-3 w-3" /> Required</label>
                    <Button variant="ghost" size="sm" onClick={() => removeField(i)} className="text-destructive h-8 w-8 p-0"><Trash2 className="h-3 w-3" /></Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => void handleCreate()}>Create Form</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden">
          <div className="border-b border-border px-6 py-5"><h2 className="font-display text-lg font-semibold text-foreground">Forms ({forms.length})</h2></div>
          {loading ? <div className="px-6 py-12 text-center text-muted-foreground">Loading...</div>
          : forms.length > 0 ? (
            <div className="divide-y divide-border">
              {forms.map((f) => (
                <div key={f.id} className="px-6 py-4 hover:bg-muted/30 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.description || "No description"} · {(f.fields as any[])?.length || 0} fields</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleDelete(f)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="px-6 py-12 text-center"><FileText className="mx-auto h-10 w-10 text-muted-foreground/40" /><p className="mt-3 text-sm font-semibold">No forms yet</p></div>}
        </div>
      </div>
    </DashboardLayout>
  );
}

import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Edit2, Plus, Search, Trash2, Upload, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { toast } from "@/components/ui/use-toast";
import type { Contact } from "@/lib/api";

const tagColors: Record<string, string> = {
  VIP: "bg-primary/10 text-primary",
  Shopify: "bg-info/10 text-info",
  New: "bg-success/10 text-success",
  Returning: "bg-warning/10 text-warning",
  D2C: "bg-accent/10 text-accent",
  CSV: "bg-muted text-muted-foreground",
  Retail: "bg-muted text-muted-foreground",
};

export default function ContactsPage() {
  const { contacts, addContact, uploadSampleContacts } = useAppContext();
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string>("All");
  const [showForm, setShowForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tags, setTags] = useState("");
  const [bulkRows, setBulkRows] = useState("");

  const availableTags = useMemo(
    () => ["All", ...Array.from(new Set(contacts.flatMap((contact) => contact.tags))).sort()],
    [contacts],
  );

  const filtered = useMemo(
    () =>
      contacts.filter((contact) => {
        const matchesSearch =
          contact.name.toLowerCase().includes(search.toLowerCase()) ||
          contact.phone.includes(search) ||
          contact.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
        const matchesTag = activeTag === "All" || contact.tags.includes(activeTag);
        return matchesSearch && matchesTag;
      }),
    [activeTag, contacts, search],
  );

  const segmentSummary = useMemo(() => {
    return availableTags
      .filter((tag) => tag !== "All")
      .map((tag) => ({
        tag,
        count: contacts.filter((contact) => contact.tags.includes(tag)).length,
      }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 4);
  }, [availableTags, contacts]);

  const resetForm = () => {
    setName("");
    setPhone("");
    setTags("");
    setEditingContactId(null);
    setShowForm(false);
  };

  const handleSaveContact = async () => {
    if (!name.trim() || !phone.trim()) {
      toast({ title: "Missing details", description: "Add both a name and phone number." });
      return;
    }

    await addContact({
      name: name.trim(),
      phone: phone.trim(),
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });

    toast({
      title: editingContactId ? "Contact updated" : "Contact added",
      description: `${name.trim()} is ready for your CRM and campaign workflows.`,
    });
    resetForm();
  };

  const handleBulkImport = async () => {
    const rows = bulkRows
      .split("\n")
      .map((row) => row.trim())
      .filter(Boolean);

    if (rows.length === 0) {
      toast({ title: "No rows found", description: "Paste at least one CSV row in the format name, phone, tags." });
      return;
    }

    let imported = 0;
    for (const row of rows) {
      const [rawName, rawPhone, ...rawTags] = row.split(",").map((value) => value.trim());
      if (!rawName || !rawPhone) {
        continue;
      }
      await addContact({
        name: rawName,
        phone: rawPhone,
        tags: rawTags.join(",").split("|").map((tag) => tag.trim()).filter(Boolean),
      });
      imported += 1;
    }

    toast({
      title: "Audience import complete",
      description: `${imported} contact${imported === 1 ? "" : "s"} were added or refreshed from the pasted CSV rows.`,
    });
    setBulkRows("");
    setShowBulkImport(false);
  };

  const startEditing = (contact: Contact) => {
    setEditingContactId(contact.id);
    setName(contact.name);
    setPhone(contact.phone);
    setTags(contact.tags.join(", "));
    setShowForm(true);
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
                  <Users className="h-4 w-4" />
                  Audience operating layer
                </div>
                <h1 className="mt-5 text-3xl font-display font-bold text-foreground">Build cleaner WhatsApp audiences and reusable CRM segments</h1>
                <p className="mt-4 text-muted-foreground">
                  Contacts now behave more like a real CRM surface: searchable lists, segment filters, and editable records that roll straight into campaigns.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                <Metric label="Total contacts" value={contacts.length.toString()} />
                <Metric label="Tagged segments" value={(availableTags.length - 1).toString()} />
                <Metric label="Visible now" value={filtered.length.toString()} />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
          <section className="rounded-[1.5rem] border border-border bg-card p-5 shadow-card">
            <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground">Contact workspace</h2>
                <p className="text-muted-foreground mt-1">{contacts.length} contacts available for targeting</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await uploadSampleContacts();
                    toast({ title: "CSV uploaded", description: "Sample contacts imported successfully." });
                  }}
                >
                  <Upload className="h-4 w-4 mr-1" /> Upload CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowBulkImport((value) => !value)}>
                  <Upload className="h-4 w-4 mr-1" /> Paste CSV
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => {
                    setEditingContactId(null);
                    setShowForm((value) => !value);
                    if (showForm) {
                      resetForm();
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Contact
                </Button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeTag === tag ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-border bg-card p-5 shadow-card">
            <h3 className="font-display text-lg font-semibold text-foreground">Top segments</h3>
            <div className="mt-4 grid gap-3">
              {segmentSummary.length > 0 ? segmentSummary.map((item) => (
                <div key={item.tag} className="rounded-xl border border-border bg-muted/20 p-4">
                  <p className="text-sm font-medium text-foreground">{item.tag}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.count} contact{item.count === 1 ? "" : "s"} in this segment</p>
                </div>
              )) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/10 p-4 text-sm text-muted-foreground">
                  Tags will appear here as contacts are enriched.
                </div>
              )}
            </div>
          </section>
        </div>

        {showForm && (
          <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-card">
            <h3 className="font-display text-lg font-semibold text-foreground">
              {editingContactId ? "Edit audience record" : "Add a new audience record"}
            </h3>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
              />
              <input
                type="text"
                placeholder="Phone number"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
              />
              <input
                type="text"
                placeholder="Tags separated by commas"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Editing uses the existing contact save path, so keeping the phone number stable will update the current record cleanly.</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={() => void handleSaveContact()}>{editingContactId ? "Update Contact" : "Save Contact"}</Button>
            </div>
          </div>
        )}

        {showBulkImport && (
          <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-card">
            <h3 className="font-display text-lg font-semibold text-foreground">Paste contacts in CSV format</h3>
            <p className="mt-1 text-sm text-muted-foreground">Use one row per contact: <span className="font-mono">name, phone, tag1|tag2</span></p>
            <textarea
              rows={6}
              value={bulkRows}
              onChange={(event) => setBulkRows(event.target.value)}
              placeholder={"Rahul Sharma, +91 98765 43210, VIP|Shopify\nSneha Gupta, +91 65432 10987, D2C|Demo"}
              className="mt-4 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBulkImport(false)}>Cancel</Button>
              <Button onClick={() => void handleBulkImport()}>Import Rows</Button>
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden"
        >
          <div className="border-b border-border px-6 py-5">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-[0.18em]">Contact</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-[0.18em]">Phone</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-[0.18em]">Tags</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-[0.18em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((contact) => (
                  <tr key={contact.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {contact.name.split(" ").map((part) => part[0]).join("")}
                        </div>
                        <span className="text-sm font-medium text-foreground">{contact.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-muted-foreground">{contact.phone}</td>
                    <td className="px-6 py-5">
                      <div className="flex gap-1.5 flex-wrap">
                        {contact.tags.map((tag) => (
                          <span key={tag} className={`text-xs px-2 py-0.5 rounded-full font-medium ${tagColors[tag] || "bg-muted text-muted-foreground"}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEditing(contact)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => toast({ title: "Delete not enabled", description: "We have editing and segmentation in place; delete can be added next without losing current state safety." })}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

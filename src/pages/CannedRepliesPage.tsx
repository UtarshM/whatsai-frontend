import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { MessageSquare, Plus, Pencil, Trash2, Search } from "lucide-react";

interface CannedReply {
  id: string;
  title: string;
  shortcut: string | null;
  body: string;
  category: string | null;
  isPublic: boolean;
  createdAt: string;
}

export default function CannedRepliesPage() {
  const [replies, setReplies] = useState<CannedReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CannedReply | null>(null);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [shortcut, setShortcut] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");

  const fetchReplies = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const response = await fetch(`/canned-replies?${params}`, { credentials: "include" });
      const data = await response.json();
      setReplies(data.data?.replies ?? []);
    } catch {
      toast({ title: "Error", description: "Failed to load canned replies", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReplies(); }, [search]);

  const handleCreate = async () => {
    if (!title.trim() || !body.trim()) {
      toast({ title: "Required fields", description: "Title and body are required", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch("/canned-replies", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          shortcut: shortcut.trim() || undefined,
          body: body.trim(),
          category: category.trim() || undefined,
        }),
      });
      if (!response.ok) throw new Error("Failed to create");
      toast({ title: "Canned reply created" });
      resetForm();
      fetchReplies();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to create", variant: "destructive" });
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      const response = await fetch(`/canned-replies/${editing.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          shortcut: shortcut.trim() || undefined,
          body: body.trim(),
          category: category.trim() || undefined,
        }),
      });
      if (!response.ok) throw new Error("Failed to update");
      toast({ title: "Canned reply updated" });
      resetForm();
      fetchReplies();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to update", variant: "destructive" });
    }
  };

  const handleDelete = async (reply: CannedReply) => {
    if (!confirm(`Delete canned reply "${reply.title}"?`)) return;
    try {
      const response = await fetch(`/canned-replies/${reply.id}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error("Failed to delete");
      toast({ title: "Canned reply deleted" });
      fetchReplies();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete", variant: "destructive" });
    }
  };

  const startEdit = (reply: CannedReply) => {
    setEditing(reply);
    setTitle(reply.title);
    setShortcut(reply.shortcut ?? "");
    setBody(reply.body);
    setCategory(reply.category ?? "");
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setTitle("");
    setShortcut("");
    setBody("");
    setCategory("");
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
                  <MessageSquare className="h-4 w-4" />
                  Canned Replies
                </div>
                <h1 className="mt-5 text-3xl font-display font-bold text-foreground">Quick response templates</h1>
                <p className="mt-4 text-muted-foreground">
                  Create reusable message templates for agents to insert in conversations with one click.
                </p>
              </div>
              <Button onClick={() => { resetForm(); setShowForm(true); }}>
                <Plus className="mr-2 h-4 w-4" /> New Reply
              </Button>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="rounded-[1.5rem] border border-border bg-card shadow-card p-6">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">
              {editing ? "Edit Canned Reply" : "Create Canned Reply"}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Greeting"
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Shortcut</label>
                <input
                  value={shortcut}
                  onChange={(e) => setShortcut(e.target.value)}
                  placeholder="e.g. /greeting"
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Message Body</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  placeholder="Type the canned reply message..."
                  className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Category</label>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Sales, Support"
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={editing ? handleUpdate : handleCreate}>
                {editing ? "Save Changes" : "Create Reply"}
              </Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden">
          <div className="border-b border-border px-6 py-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Replies</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search replies..."
                  className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-sm text-foreground"
                />
              </div>
            </div>
          </div>
          {loading ? (
            <div className="px-6 py-12 text-center text-muted-foreground">Loading...</div>
          ) : replies.length > 0 ? (
            <div className="divide-y divide-border">
              {replies.map((reply) => (
                <div key={reply.id} className="px-6 py-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{reply.title}</h3>
                        {reply.shortcut && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary font-mono">
                            {reply.shortcut}
                          </span>
                        )}
                        {reply.category && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                            {reply.category}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{reply.body}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => startEdit(reply)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(reply)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-semibold text-foreground">No canned replies yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Create templates for quick agent responses.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

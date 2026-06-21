import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BookOpen, Plus, Trash2, FileText, Search, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface KnowledgeDoc {
  id: string;
  title: string;
  type: string;
  status: string;
  errorMessage: string | null;
  createdAt: string;
}

export default function KnowledgeBasePage() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"url" | "text" | "faq">("text");
  const [content, setContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ docId: string; title: string; chunk: string; score: number }>>([]);

  const fetchDocs = async () => {
    try {
      const response = await fetch("/knowledge-base", { credentials: "include" });
      const data = await response.json();
      setDocs(data.data ?? []);
    } catch {
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    try {
      const response = await fetch("/knowledge-base", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), type, content: content.trim() }),
      });
      if (!response.ok) throw new Error("Failed to create");
      toast.success("Document created and indexed");
      setShowForm(false);
      setTitle("");
      setContent("");
      fetchDocs();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create");
    }
  };

  const handleDelete = async (doc: KnowledgeDoc) => {
    if (!confirm(`Delete "${doc.title}"?`)) return;
    try {
      await fetch(`/knowledge-base/${doc.id}`, { method: "DELETE", credentials: "include" });
      toast.success("Document deleted");
      fetchDocs();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await fetch(`/knowledge-base/search?q=${encodeURIComponent(searchQuery)}`, { credentials: "include" });
      const data = await response.json();
      setSearchResults(data.data ?? []);
    } catch {
      toast.error("Search failed");
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "indexed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
    }
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
                  <BookOpen className="h-4 w-4" />
                  Knowledge Base
                </div>
                <h1 className="mt-5 text-3xl font-display font-bold text-foreground">AI knowledge base</h1>
                <p className="mt-4 text-muted-foreground">
                  Upload documents, FAQs, and content that your AI agent uses to answer customer questions.
                </p>
              </div>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Document
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-border bg-card shadow-card p-6">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Search className="h-5 w-5" /> Test Knowledge Search
          </h2>
          <div className="flex gap-3">
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void handleSearch()}
              placeholder="Search knowledge base..."
              className="flex-1 h-11 rounded-xl border border-input bg-background px-4 text-sm" />
            <Button variant="outline" onClick={() => void handleSearch()}>Search</Button>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-3">
              {searchResults.map((r, i) => (
                <div key={i} className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{r.title}</p>
                    <span className="text-xs text-muted-foreground">Score: {Math.round(r.score * 100)}%</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{r.chunk}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {showForm && (
          <div className="rounded-[1.5rem] border border-border bg-card shadow-card p-6 space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Add Document</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Pricing FAQ"
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Type</label>
                <select value={type} onChange={(e) => setType(e.target.value as "url" | "text" | "faq")}
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm">
                  <option value="text">Text Document</option>
                  <option value="faq">FAQ</option>
                  <option value="url">URL Content</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Content</label>
              <textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)}
                placeholder={type === "url" ? "Paste URL content here..." : "Enter document content or FAQ..."}
                className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => void handleCreate()}>Create & Index</Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setTitle(""); setContent(""); }}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden">
          <div className="border-b border-border px-6 py-5">
            <h2 className="font-display text-lg font-semibold text-foreground">Documents ({docs.length})</h2>
          </div>
          {loading ? (
            <div className="px-6 py-12 text-center text-muted-foreground">Loading...</div>
          ) : docs.length > 0 ? (
            <div className="divide-y divide-border">
              {docs.map((doc) => (
                <div key={doc.id} className="px-6 py-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{doc.title}</p>
                          {statusIcon(doc.status)}
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{doc.type}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Created {new Date(doc.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => void handleDelete(doc)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-semibold text-foreground">No documents yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Add documents to build your AI agent's knowledge base.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

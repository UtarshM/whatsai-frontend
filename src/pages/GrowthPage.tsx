import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link2, QrCode, Plus, ExternalLink, BarChart3 } from "lucide-react";

interface WhatsAppLink { id: string; code: string; originalUrl: string; title: string | null; clickCount: number; createdAt: string; }

export default function GrowthPage() {
  const [links, setLinks] = useState<WhatsAppLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [qrLink, setQrLink] = useState<{ qrUrl: string; url: string } | null>(null);

  const fetchLinks = async () => {
    try {
      const r = await fetch("/growth/links", { credentials: "include" });
      const d = await r.json();
      setLinks(d.data ?? []);
    } catch { toast.error("Failed to load links"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLinks(); }, []);

  const handleCreate = async () => {
    if (!phone.trim()) { toast.error("Phone number required"); return; }
    try {
      const r = await fetch("/growth/links", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), message: message.trim() || undefined, title: title.trim() || undefined }),
      });
      if (!r.ok) throw new Error("Failed");
      toast.success("WhatsApp link created");
      setShowForm(false); setPhone(""); setMessage(""); setTitle("");
      fetchLinks();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  const handleQR = async (linkId: string) => {
    try {
      const r = await fetch(`/growth/links/${linkId}/qr`, { credentials: "include" });
      const d = await r.json();
      setQrLink(d.data);
    } catch { toast.error("Failed to generate QR"); }
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
                  <Link2 className="h-4 w-4" /> WhatsApp Links & QR
                </div>
                <h1 className="mt-5 text-3xl font-display font-bold text-foreground">Grow your WhatsApp audience</h1>
                <p className="mt-4 text-muted-foreground">Create shareable WhatsApp links and QR codes to capture leads.</p>
              </div>
              <Button onClick={() => setShowForm(true)}><Plus className="mr-2 h-4 w-4" /> New Link</Button>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="rounded-[1.5rem] border border-border bg-card shadow-card p-6 space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Create WhatsApp Link</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Phone Number</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="919999999999" className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm" /></div>
              <div><label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional title" className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm" /></div>
              <div className="md:col-span-2"><label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Prefilled Message</label>
                <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Hi, I'm interested in..." className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" /></div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => void handleCreate()}>Create Link</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {qrLink && (
          <div className="rounded-[1.5rem] border border-border bg-card shadow-card p-6 text-center">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">QR Code</h2>
            <img src={qrLink.qrUrl} alt="QR Code" className="mx-auto h-48 w-48" />
            <p className="mt-4 text-sm text-muted-foreground break-all">{qrLink.url}</p>
            <Button variant="outline" className="mt-4" onClick={() => setQrLink(null)}>Close</Button>
          </div>
        )}

        <div className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden">
          <div className="border-b border-border px-6 py-5"><h2 className="font-display text-lg font-semibold text-foreground">Links ({links.length})</h2></div>
          {loading ? <div className="px-6 py-12 text-center text-muted-foreground">Loading...</div>
          : links.length > 0 ? (
            <div className="divide-y divide-border">
              {links.map((l) => (
                <div key={l.id} className="px-6 py-4 hover:bg-muted/30 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{l.title || l.originalUrl}</p>
                    <p className="text-xs text-muted-foreground break-all">{l.originalUrl}</p>
                    <p className="text-xs text-muted-foreground mt-1">{l.clickCount} clicks · {new Date(l.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => void handleQR(l.id)}><QrCode className="h-4 w-4" /></Button>
                    <a href={l.originalUrl} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm"><ExternalLink className="h-4 w-4" /></Button></a>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="px-6 py-12 text-center"><Link2 className="mx-auto h-10 w-10 text-muted-foreground/40" /><p className="mt-3 text-sm font-semibold">No links yet</p></div>}
        </div>
      </div>
    </DashboardLayout>
  );
}

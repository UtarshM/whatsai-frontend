import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import {
  Link2,
  Plus,
  Copy,
  BarChart3,
  ExternalLink,
  X,
  MousePointerClick,
} from "lucide-react";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppContext } from "@/context/AppContext";
import { useLinksQuery, useCreateLinkMutation, useLinkAnalyticsQuery } from "@/hooks/useAdvancedApi";
import type { TrackedLink } from "@/lib/api/advanced";

const inputClass = "h-11 w-full rounded-xl border border-input bg-background px-4 text-sm";

function AnalyticsPanel({ link, onClose }: { link: TrackedLink; onClose: () => void }) {
  const { data, isLoading } = useLinkAnalyticsQuery(link.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[1.75rem] border border-border bg-card p-6 shadow-card"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-semibold text-foreground">{link.title || link.code}</h2>
          <p className="text-sm text-muted-foreground break-all">{link.originalUrl}</p>
        </div>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
          aria-label="Close analytics"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {isLoading && <p className="mt-4 text-sm text-muted-foreground">Loading analytics…</p>}

      {data && (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total clicks</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{data.totalClicks.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Unique clicks</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{data.uniqueClicks.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Active days</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{data.timeline.length}</p>
            </div>
          </div>

          {data.timeline.length > 0 ? (
            <div className="mt-5 h-64 rounded-2xl border border-border bg-background p-4">
              <p className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">Clicks over time</p>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={data.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mt-5 rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
              No clicks recorded yet. Share the short link to start tracking.
            </p>
          )}

          {data.recentClicks.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">Recent clicks</p>
              <div className="space-y-2">
                {data.recentClicks.slice(0, 8).map((click, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-sm">
                    <span className="text-foreground">{click.contactId ? "Known contact" : click.ipAddress || "Anonymous"}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(click.clickedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

export default function TrackedLinksPage() {
  const { campaigns } = useAppContext();
  const { data, isLoading } = useLinksQuery();
  const createLink = useCreateLinkMutation();

  const [showForm, setShowForm] = useState(false);
  const [originalUrl, setOriginalUrl] = useState("");
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [analyticsLink, setAnalyticsLink] = useState<TrackedLink | null>(null);

  const links = data?.links ?? [];

  const resetForm = () => {
    setShowForm(false);
    setOriginalUrl("");
    setTitle("");
    setCode("");
    setCampaignId("");
  };

  const submit = async () => {
    if (!/^https?:\/\//i.test(originalUrl.trim())) {
      toast({ title: "Invalid URL", description: "Enter a full destination URL starting with http(s)://" });
      return;
    }
    try {
      await createLink.mutateAsync({
        originalUrl: originalUrl.trim(),
        title: title.trim() || undefined,
        code: code.trim() || undefined,
        campaignId: campaignId || undefined,
      });
      toast({ title: "Link created", description: "Your trackable short link is ready." });
      resetForm();
    } catch (error) {
      toast({
        title: "Could not create link",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Copied", description: "Short link copied to clipboard." });
    } catch {
      toast({ title: "Copy failed", description: url });
    }
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
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <MousePointerClick className="h-4 w-4" />
                  Click tracking
                </div>
                <h1 className="mt-5 text-3xl font-display font-bold text-foreground">Tracked Links</h1>
                <p className="mt-3 text-muted-foreground">
                  Create short links that log every click. Attribute them to a campaign to power
                  click-through analytics and click-based retargeting.
                </p>
              </div>
              <Button variant="gradient" onClick={() => setShowForm((v) => !v)}>
                <Plus className="h-4 w-4 mr-1" /> New Link
              </Button>
            </div>
          </div>
        </motion.div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[1.75rem] border border-border bg-card p-6 shadow-card"
          >
            <h2 className="text-xl font-display font-semibold text-foreground">Create tracked link</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-foreground">Destination URL</label>
                <input
                  className={inputClass}
                  placeholder="https://shop.example.com/diwali-sale"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Title (optional)</label>
                <input className={inputClass} placeholder="Diwali sale landing" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Custom code (optional)</label>
                <input className={inputClass} placeholder="diwali24" value={code} onChange={(e) => setCode(e.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Attribute to campaign (optional)</label>
                <select className={inputClass} value={campaignId} onChange={(e) => setCampaignId(e.target.value)}>
                  <option value="">None</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <Button variant="gradient" onClick={submit} disabled={createLink.isPending}>
                {createLink.isPending ? "Creating…" : "Create link"}
              </Button>
              <Button variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {analyticsLink && <AnalyticsPanel link={analyticsLink} onClose={() => setAnalyticsLink(null)} />}

        <div className="grid gap-4">
          {isLoading && <p className="text-sm text-muted-foreground">Loading links…</p>}
          {!isLoading &&
            links.map((link, index) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="rounded-[1.5rem] border border-border bg-card p-5 shadow-card"
              >
                <div className="flex items-center justify-between gap-4 flex-col md:flex-row">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
                      <Link2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-foreground">{link.title || link.code}</h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono text-primary truncate">{link.shortUrl}</span>
                        <button onClick={() => copy(link.shortUrl)} className="hover:text-foreground" aria-label="Copy link">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <a
                        href={link.originalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground truncate"
                      >
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{link.originalUrl}</span>
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Clicks</p>
                      <p className="text-lg font-semibold text-foreground">{link.clickCount.toLocaleString()}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary" onClick={() => setAnalyticsLink(link)}>
                      <BarChart3 className="h-4 w-4 mr-1" /> Analytics
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          {!isLoading && links.length === 0 && (
            <div className="rounded-[1.5rem] border border-dashed border-border bg-card px-6 py-12 text-center shadow-card">
              <p className="text-base font-semibold text-foreground">No tracked links yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Create a short link to measure clicks and attribute engagement to campaigns.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

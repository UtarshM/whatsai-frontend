import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Send, XCircle, Clock, MousePointerClick, Wallet } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCampaignAnalyticsQuery } from "@/hooks/useAdvancedApi";

const statusStyles: Record<string, string> = {
  delivered: "bg-success/10 text-success",
  sending: "bg-warning/10 text-warning",
  scheduled: "bg-info/10 text-info",
  draft: "bg-muted text-muted-foreground",
};

function pct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function FunnelCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof Send;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <Icon className={`h-4 w-4 ${tone}`} />
      </div>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value.toLocaleString()}</p>
    </div>
  );
}

function RateBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{pct(value)}</span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-muted">
        <div
          className="h-2 rounded-full gradient-primary"
          style={{ width: `${Math.min(value * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function CampaignAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useCampaignAnalyticsQuery(id);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4">
          <Link to="/campaigns">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to campaigns
            </Button>
          </Link>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading analytics…</p>}
        {error && (
          <div className="rounded-[1.5rem] border border-destructive/20 bg-destructive/5 px-6 py-8 text-center">
            <p className="font-semibold text-foreground">Could not load analytics</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Campaign not found."}
            </p>
          </div>
        )}

        {data && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2rem] border border-border bg-card p-8 shadow-card"
            >
              <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
                <div>
                  <h1 className="text-3xl font-display font-bold text-foreground">{data.campaign.name}</h1>
                  <div className="mt-3 flex items-center gap-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusStyles[data.campaign.status] ?? "bg-muted text-muted-foreground"}`}>
                      {data.campaign.status}
                    </span>
                    {data.campaign.launchedAt && (
                      <span className="text-xs text-muted-foreground">
                        Launched {new Date(data.campaign.launchedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/30 px-4 py-3">
                  <Wallet className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Spent</p>
                    <p className="text-sm font-semibold text-foreground">
                      Rs {data.campaign.spent.toLocaleString()} / {data.campaign.estimatedCost.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <FunnelCard label="Total" value={data.funnel.total} icon={Send} tone="text-primary" />
              <FunnelCard label="Queued" value={data.funnel.queued} icon={Clock} tone="text-info" />
              <FunnelCard label="Sent" value={data.funnel.sent} icon={Send} tone="text-warning" />
              <FunnelCard label="Delivered" value={data.funnel.delivered} icon={CheckCircle2} tone="text-success" />
              <FunnelCard label="Failed" value={data.funnel.failed} icon={XCircle} tone="text-destructive" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[1.5rem] border border-border bg-card p-6 shadow-card">
                <h2 className="text-lg font-display font-semibold text-foreground">Performance rates</h2>
                <div className="mt-5 space-y-5">
                  <RateBar label="Delivery rate" value={data.rates.deliveryRate} />
                  <RateBar label="Reach rate (sent + delivered)" value={data.rates.sentRate} />
                  <RateBar label="Failure rate" value={data.rates.failureRate} />
                  <RateBar label="Click-through rate" value={data.rates.clickThroughRate} />
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-border bg-card p-6 shadow-card">
                <div className="flex items-center gap-2">
                  <MousePointerClick className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-display font-semibold text-foreground">Click attribution</h2>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{data.clicks.total.toLocaleString()}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Unique</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{data.clicks.unique.toLocaleString()}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Links</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{data.clicks.linkCount.toLocaleString()}</p>
                  </div>
                </div>
                {data.clicks.linkCount === 0 && (
                  <p className="mt-4 text-xs text-muted-foreground">
                    Attribute a tracked link to this campaign to measure click-through.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-border bg-card p-6 shadow-card">
              <h2 className="text-lg font-display font-semibold text-foreground">Send timeline</h2>
              {data.timeline.length > 0 ? (
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.timeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="mt-4 rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                  No messages sent yet for this campaign.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

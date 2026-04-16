import { DashboardLayout } from "@/components/DashboardLayout";
import { useAppContext } from "@/context/AppContext";
import { BarChart3, Clock3, IndianRupee, MessageSquare, Target, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  const {
    campaigns,
    conversationMessages,
    conversations,
    leads,
    totalSpent,
    walletBalance,
  } = useAppContext();

  const outboundMessages = conversationMessages.filter((message) => message.direction === "Outbound");
  const inboundMessages = conversationMessages.filter((message) => message.direction === "Inbound");
  const deliveredMessages = outboundMessages.filter((message) => message.status.toLowerCase() === "delivered");
  const readMessages = outboundMessages.filter((message) => message.status.toLowerCase() === "read");
  const failedMessages = outboundMessages.filter((message) => message.status.toLowerCase() === "failed");

  const deliveryRate = outboundMessages.length > 0 ? Math.round((deliveredMessages.length / outboundMessages.length) * 100) : 0;
  const readRate = outboundMessages.length > 0 ? Math.round((readMessages.length / outboundMessages.length) * 100) : 0;
  const failureRate = outboundMessages.length > 0 ? Math.round((failedMessages.length / outboundMessages.length) * 100) : 0;

  const totalCampaigns = campaigns.length;
  const deliveredCampaigns = campaigns.filter((campaign) => campaign.status === "Delivered").length;
  const liveCampaigns = campaigns.filter((campaign) => campaign.status === "Sending" || campaign.status === "Scheduled").length;
  const campaignDeliveryRate = totalCampaigns > 0 ? Math.round((deliveredCampaigns / totalCampaigns) * 100) : 0;
  const averageCampaignSpend = totalCampaigns > 0
    ? Math.round(campaigns.reduce((sum, campaign) => sum + campaign.spent, 0) / totalCampaigns)
    : 0;

  const leadSourceRows = (["Meta Ads", "WhatsApp Inbound", "Campaign", "Manual", "Organic"] as const).map((source) => {
    const sourceLeads = leads.filter((lead) => lead.source === source);
    const qualified = sourceLeads.filter((lead) => lead.status === "Qualified" || lead.status === "Won").length;
    const won = sourceLeads.filter((lead) => lead.status === "Won").length;
    return {
      source,
      total: sourceLeads.length,
      qualified,
      won,
    };
  }).filter((row) => row.total > 0);

  const responsePairs = conversations.flatMap((conversation) => {
    const thread = conversationMessages
      .filter((message) => message.conversationId === conversation.id)
      .sort((left, right) => new Date(left.sentAt).getTime() - new Date(right.sentAt).getTime());

    const pairs: number[] = [];
    for (let index = 0; index < thread.length; index += 1) {
      const current = thread[index];
      if (current.direction !== "Inbound") {
        continue;
      }

      const reply = thread.slice(index + 1).find((message) => message.direction === "Outbound");
      if (!reply) {
        continue;
      }

      const diffMinutes = Math.max(
        0,
        Math.round((new Date(reply.sentAt).getTime() - new Date(current.sentAt).getTime()) / (1000 * 60)),
      );
      pairs.push(diffMinutes);
    }
    return pairs;
  });

  const averageResponseMinutes = responsePairs.length > 0
    ? Math.round(responsePairs.reduce((sum, value) => sum + value, 0) / responsePairs.length)
    : 0;

  const wonLeads = leads.filter((lead) => lead.status === "Won").length;
  const qualifiedLeads = leads.filter((lead) => lead.status === "Qualified" || lead.status === "Won").length;
  const costPerLead = leads.length > 0 ? Math.round(totalSpent / leads.length) : 0;
  const costPerQualifiedLead = qualifiedLeads > 0 ? Math.round(totalSpent / qualifiedLeads) : 0;
  const costPerWonLead = wonLeads > 0 ? Math.round(totalSpent / wonLeads) : 0;

  const performanceRows = [
    {
      label: "Outbound delivery rate",
      value: `${deliveryRate}%`,
      meta: `${deliveredMessages.length} delivered out of ${outboundMessages.length} outbound replies`,
    },
    {
      label: "Outbound read rate",
      value: `${readRate}%`,
      meta: `${readMessages.length} read callbacks recorded`,
    },
    {
      label: "Outbound failure rate",
      value: `${failureRate}%`,
      meta: `${failedMessages.length} failed sends need attention`,
    },
    {
      label: "Message mix",
      value: `${inboundMessages.length} in / ${outboundMessages.length} out`,
      meta: "Useful for support versus campaign-engagement balance",
    },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[2rem] border border-border bg-card shadow-card overflow-hidden">
          <div className="relative px-8 py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(205_78%_52%/0.10),transparent_35%),radial-gradient(circle_at_bottom_right,hsl(152_58%_38%/0.10),transparent_40%)]" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <BarChart3 className="h-4 w-4" />
                  Analytics and reporting
                </div>
                <h1 className="mt-5 text-3xl font-display font-bold text-foreground">Measure message quality, campaign performance, lead sources, and spend efficiency</h1>
                <p className="mt-4 text-muted-foreground">
                  This reporting layer gives operators and founders a faster read on delivery health, source performance, response speed, and how prepaid spend is translating into pipeline outcomes.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                <TopStat label="Total spent" value={`Rs ${totalSpent.toLocaleString()}`} />
                <TopStat label="Wallet balance" value={`Rs ${walletBalance.toLocaleString()}`} />
                <TopStat label="Qualified pipeline" value={`${qualifiedLeads} leads`} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard icon={MessageSquare} title="Delivery rate" value={`${deliveryRate}%`} subtitle="Across outbound WhatsApp replies" />
          <MetricCard icon={TrendingUp} title="Read rate" value={`${readRate}%`} subtitle="Read callbacks tracked from Meta" />
          <MetricCard icon={Target} title="Campaign delivery" value={`${campaignDeliveryRate}%`} subtitle={`${deliveredCampaigns} of ${totalCampaigns} campaigns delivered`} />
          <MetricCard icon={Clock3} title="Avg response time" value={averageResponseMinutes ? `${averageResponseMinutes} min` : "-"} subtitle="Inbound to first outbound reply" />
          <MetricCard icon={IndianRupee} title="Cost per lead" value={leads.length > 0 ? `Rs ${costPerLead}` : "-"} subtitle="Total spend divided by all leads" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
          <section className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden">
            <div className="border-b border-border px-6 py-5">
              <h2 className="font-display text-lg font-semibold text-foreground">Message performance</h2>
            </div>
            <div className="space-y-4 px-6 py-6">
              {performanceRows.map((row) => (
                <div key={row.label} className="rounded-2xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">{row.label}</p>
                    <p className="text-lg font-semibold text-foreground">{row.value}</p>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{row.meta}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden">
            <div className="border-b border-border px-6 py-5">
              <h2 className="font-display text-lg font-semibold text-foreground">Campaign delivery and read posture</h2>
            </div>
            <div className="grid gap-4 px-6 py-6 md:grid-cols-2">
              <AnalyticsBlock label="Delivered campaigns" value={deliveredCampaigns.toString()} meta="Completed successfully" />
              <AnalyticsBlock label="Live campaigns" value={liveCampaigns.toString()} meta="Sending or scheduled" />
              <AnalyticsBlock label="Avg campaign spend" value={totalCampaigns > 0 ? `Rs ${averageCampaignSpend}` : "-"} meta="Based on recorded campaign spend" />
              <AnalyticsBlock label="Read-tracked messages" value={readMessages.length.toString()} meta="Useful signal for engagement" />
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
          <section className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden">
            <div className="border-b border-border px-6 py-5">
              <h2 className="font-display text-lg font-semibold text-foreground">Lead source performance</h2>
            </div>
            <div className="divide-y divide-border">
              {leadSourceRows.length > 0 ? leadSourceRows.map((row) => (
                <div key={row.source} className="grid gap-4 px-6 py-5 md:grid-cols-[1.1fr,0.9fr,0.9fr,0.9fr] md:items-center">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{row.source}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Source-attributed pipeline performance</p>
                  </div>
                  <SourceStat label="Total" value={row.total.toString()} />
                  <SourceStat label="Qualified" value={row.qualified.toString()} />
                  <SourceStat label="Won" value={row.won.toString()} />
                </div>
              )) : (
                <EmptyBlock title="No lead-source data yet" body="Lead source analytics will populate as conversations and ad leads accumulate." />
              )}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-border bg-card shadow-card overflow-hidden">
            <div className="border-b border-border px-6 py-5">
              <h2 className="font-display text-lg font-semibold text-foreground">Spend versus outcome</h2>
            </div>
            <div className="grid gap-4 px-6 py-6">
              <AnalyticsBlock label="Total spend" value={`Rs ${totalSpent.toLocaleString()}`} meta="Wallet debits tied to sends" />
              <AnalyticsBlock label="Cost per lead" value={leads.length > 0 ? `Rs ${costPerLead}` : "-"} meta={`${leads.length} total leads in CRM`} />
              <AnalyticsBlock label="Cost per qualified lead" value={qualifiedLeads > 0 ? `Rs ${costPerQualifiedLead}` : "-"} meta={`${qualifiedLeads} qualified or won leads`} />
              <AnalyticsBlock label="Cost per won lead" value={wonLeads > 0 ? `Rs ${costPerWonLead}` : "-"} meta={wonLeads > 0 ? `${wonLeads} won leads` : "No won leads yet"} />
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

function TopStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  title,
  value,
  subtitle,
}: {
  icon: typeof MessageSquare;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <p className="text-2xl font-display font-bold text-foreground">{value}</p>
      </div>
      <p className="mt-4 text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function AnalyticsBlock({ label, value, meta }: { label: string; value: string; meta: string }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/20 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{meta}</p>
    </div>
  );
}

function SourceStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function EmptyBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  MessageSquare,
  Send,
  ShieldCheck,
  Target,
  Users,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  getBusinessVerificationLabel,
  getConnectionStatusLabel,
  getObaStatusLabel,
} from "@/lib/meta/status";

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    walletBalance,
    messagesSent,
    totalContacts,
    activeCampaigns,
    campaigns,
    recentActivity,
    lowBalanceThreshold,
    whatsApp,
    templates,
  } = useAppContext();

  const approvedTemplates = templates.filter((template) => template.status === "Approved").length;
  const deliveredCampaigns = campaigns.filter((campaign) => campaign.status === "Delivered").length;
  const estimatedPipelineSpend = campaigns
    .filter((campaign) => campaign.status === "Sending" || campaign.status === "Scheduled")
    .reduce((sum, campaign) => sum + campaign.estimatedCost, 0);
  const connectionSummary = getConnectionStatusLabel(whatsApp.connectionStatus);
  const businessVerification = getBusinessVerificationLabel(whatsApp.businessVerificationStatus);
  const obaSummary = getObaStatusLabel(whatsApp.obaStatus);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-card"
        >
          <div className="relative px-8 py-8 lg:px-10 lg:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(205_78%_52%/0.10),transparent_35%),radial-gradient(circle_at_bottom_right,hsl(152_58%_38%/0.10),transparent_40%)]" />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  Workspace command center
                </div>
                <h1 className="mt-5 text-3xl lg:text-4xl font-display font-bold tracking-tight text-foreground">
                  Operate WhatsApp campaigns with more control, visibility, and trust
                </h1>
                <p className="mt-4 text-muted-foreground max-w-2xl">
                  Your dashboard now behaves more like an enterprise control layer: connection health, prepaid readiness, campaign velocity, and messaging capacity all in one view.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Connection</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {connectionSummary}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {whatsApp.connected ? whatsApp.displayPhoneNumber : "Connect business account"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Templates</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{approvedTemplates} approved</p>
                  <p className="mt-1 text-xs text-muted-foreground">Broadcast-ready assets</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pipeline spend</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">Rs {estimatedPipelineSpend.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Sending + scheduled campaigns</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {walletBalance <= lowBalanceThreshold && (
          <div className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 px-5 py-4 text-sm">
            <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Low wallet reserve detected</p>
              <p className="text-muted-foreground">
                You are nearing the prepaid threshold. Add funds before launching the next campaign to avoid blocked sends.
              </p>
            </div>
          </div>
        )}

        {(whatsApp.authorizationStatus === "expired" || whatsApp.authorizationStatus === "expiring_soon" || whatsApp.authorizationStatus === "missing") && (
          <div className={`flex items-start gap-3 rounded-2xl px-5 py-4 text-sm ${
            whatsApp.authorizationStatus === "expired" || whatsApp.authorizationStatus === "missing"
              ? "border border-destructive/20 bg-destructive/5"
              : "border border-warning/30 bg-warning/10"
          }`}>
            <AlertTriangle className={`h-5 w-5 mt-0.5 ${
              whatsApp.authorizationStatus === "expired" || whatsApp.authorizationStatus === "missing"
                ? "text-destructive"
                : "text-warning"
            }`} />
            <div>
              <p className="font-semibold text-foreground">
                {whatsApp.authorizationStatus === "expired"
                  ? "Meta authorization expired"
                  : whatsApp.authorizationStatus === "expiring_soon"
                    ? "Meta authorization expiring soon"
                    : "Meta authorization missing"}
              </p>
              <p className="text-muted-foreground">
                Reconnect WhatsApp from the connect screen so campaigns, inbox replies, and automations keep sending reliably.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Messages Sent" value={messagesSent.toLocaleString()} icon={Send} trend={{ value: "12% vs last week", positive: true }} />
          <StatCard title="Reachable Contacts" value={totalContacts.toLocaleString()} icon={Users} trend={{ value: "Audience growth is healthy", positive: true }} />
          <StatCard title="Wallet Balance" value={`Rs ${walletBalance.toLocaleString()}`} icon={Wallet} subtitle="Prepaid wallet available now" />
          <StatCard title="Active Campaigns" value={activeCampaigns.toString()} icon={Target} subtitle={`${deliveredCampaigns} campaigns delivered recently`} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="rounded-[1.5rem] border border-border bg-card shadow-card"
          >
            <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-5">
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">Campaign operating board</h2>
                <p className="text-sm text-muted-foreground mt-1">Recent launches, recipients, and spend posture</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/campaigns")}>
                View campaigns
              </Button>
            </div>
            <div className="divide-y divide-border">
              {campaigns.slice(0, 5).map((campaign) => (
                <div key={campaign.id} className="px-6 py-5 hover:bg-muted/40 transition-colors">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{campaign.name}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {campaign.contactIds.length.toLocaleString()} recipients
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="h-3.5 w-3.5" />
                            {new Date(campaign.date).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Wallet className="h-3.5 w-3.5" />
                            Rs {campaign.estimatedCost.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Status</p>
                        <span
                          className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            campaign.status === "Delivered"
                              ? "bg-success/10 text-success"
                              : campaign.status === "Sending"
                                ? "bg-warning/10 text-warning"
                                : campaign.status === "Scheduled"
                                  ? "bg-info/10 text-info"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate("/campaigns")}>
                        Open <ArrowUpRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-[1.5rem] border border-border bg-card p-6 shadow-card"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10">
                  <BarChart3 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">Performance pulse</h2>
                  <p className="text-xs text-muted-foreground">High-level metrics for operators and founders</p>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {[
                  { label: "Delivery quality", value: "98.4%", meta: "Strong broadcast health" },
                  { label: "Average campaign cost", value: "Rs 685", meta: "Pre-send estimate aligned" },
                  { label: "Ready-to-send inventory", value: `${approvedTemplates} templates`, meta: "Approval coverage is healthy" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-border bg-muted/30 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="text-sm font-semibold text-foreground">{item.value}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{item.meta}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="rounded-[1.5rem] border border-border bg-card p-6 shadow-card"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-info/10">
                  <ShieldCheck className="h-5 w-5 text-info" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">Platform readiness</h2>
                  <p className="text-xs text-muted-foreground">What is ready right now in the workspace</p>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-success mt-1" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {whatsApp.connected ? "WhatsApp connection mapped" : "WhatsApp connection pending"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {whatsApp.connected ? `${whatsApp.displayPhoneNumber} mapped to workspace` : "Complete Meta setup before scaling campaigns"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-success mt-1" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{businessVerification}</p>
                    <p className="text-xs text-muted-foreground">
                      {whatsApp.businessVerificationStatus === "verified" ? "Meta business verification is complete." : "Business verification is tracked separately from connection."}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-success mt-1" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{obaSummary}</p>
                    <p className="text-xs text-muted-foreground">
                      {whatsApp.obaStatus === "approved" ? "This number has Meta-approved Official Business Account status." : "Green tick only appears if Meta explicitly approves it."}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-success mt-1" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Wallet and template controls active</p>
                    <p className="text-xs text-muted-foreground">Campaign sending is still guarded by balance and template approval state</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="rounded-[1.5rem] border border-border bg-card p-6 shadow-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">Recent activity</h2>
                  <p className="text-xs text-muted-foreground">Operator and system events across the workspace</p>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {recentActivity.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-success mt-1" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

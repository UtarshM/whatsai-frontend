import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { CheckCircle2, KeyRound, Link2, PlugZap, RefreshCcw, ShieldCheck, UserCircle2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  getAccountReviewLabel,
  getAuthorizationStatusLabel,
  getBusinessVerificationLabel,
  getConnectionStatusLabel,
  getObaStatusLabel,
} from "@/lib/meta/status";
import {
  createMetaSourceMapping,
  fetchMetaSourceMappings,
  type MetaLeadSourceMapping,
} from "@/lib/meta/sourceMappings";
import { matchLeadToMetaMapping } from "@/lib/meta/attribution";
import {
  readIntegrationConfigs,
  upsertIntegrationConfig,
  type IntegrationConfig,
  type IntegrationKey,
  type IntegrationSyncMode,
} from "@/lib/integrations/config";

export default function SettingsPage() {
  const { user, whatsApp, leads } = useAppContext();
  const connectionLabel = getConnectionStatusLabel(whatsApp.connectionStatus);
  const authorizationLabel = getAuthorizationStatusLabel(whatsApp.authorizationStatus);
  const businessVerificationLabel = getBusinessVerificationLabel(whatsApp.businessVerificationStatus);
  const accountReviewLabel = getAccountReviewLabel(whatsApp.accountReviewStatus);
  const obaLabel = getObaStatusLabel(whatsApp.obaStatus);
  const [mappings, setMappings] = useState<MetaLeadSourceMapping[]>([]);
  const [mappingLabel, setMappingLabel] = useState("");
  const [pageId, setPageId] = useState("");
  const [adId, setAdId] = useState("");
  const [formId, setFormId] = useState("");
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [selectedIntegrationKey, setSelectedIntegrationKey] = useState<IntegrationKey>("shopify");
  const [integrationDraft, setIntegrationDraft] = useState<IntegrationConfig | null>(null);
  const metaLeads = leads.filter((lead) => lead.source === "Meta Ads");
  const mappedMetaLeads = metaLeads.filter((lead) => matchLeadToMetaMapping(lead, mappings).mapping);
  const unmappedMetaLeads = metaLeads.length - mappedMetaLeads.length;

  useEffect(() => {
    void fetchMetaSourceMappings()
      .then(setMappings)
      .catch(() => {
        setMappings([]);
      });

    setIntegrations(readIntegrationConfigs());
  }, []);

  useEffect(() => {
    const nextDraft = integrations.find((config) => config.key === selectedIntegrationKey) ?? null;
    setIntegrationDraft(nextDraft ? { ...nextDraft } : null);
  }, [integrations, selectedIntegrationKey]);

  const connectedIntegrations = useMemo(
    () => integrations.filter((config) => config.status === "connected").length,
    [integrations],
  );
  const attentionIntegrations = useMemo(
    () => integrations.filter((config) => config.status === "attention").length,
    [integrations],
  );

  const handleSaveMapping = async () => {
    try {
      const mapping = await createMetaSourceMapping({
        label: mappingLabel,
        pageId,
        adId,
        formId,
      });

      setMappings((current) => [mapping, ...current]);
      setMappingLabel("");
      setPageId("");
      setAdId("");
      setFormId("");
      toast({ title: "Mapping saved", description: "Meta lead source mapping is now linked to this workspace." });
    } catch (error) {
      toast({
        title: "Mapping failed",
        description: error instanceof Error ? error.message : "Could not save the Meta source mapping.",
        variant: "destructive",
      });
    }
  };

  const saveIntegrationDraft = (overrides?: Partial<IntegrationConfig>, successTitle = "Integration saved") => {
    if (!integrationDraft) {
      return;
    }

    const nextConfig: IntegrationConfig = { ...integrationDraft, ...overrides };
    const nextIntegrations = upsertIntegrationConfig(nextConfig);
    setIntegrations(nextIntegrations);
    toast({ title: successTitle, description: `${nextConfig.name} settings are now stored for this workspace.` });
  };

  const handleRunSync = () => {
    if (!integrationDraft) {
      return;
    }

    saveIntegrationDraft(
      {
        status: integrationDraft.endpoint || integrationDraft.reference ? "connected" : "attention",
        lastSyncAt: new Date().toISOString(),
        connectedAt: integrationDraft.connectedAt ?? new Date().toISOString(),
      },
      "Sync completed",
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="rounded-[2rem] border border-border bg-card shadow-card overflow-hidden">
          <div className="relative px-8 py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(205_78%_52%/0.10),transparent_35%),radial-gradient(circle_at_bottom_right,hsl(152_58%_38%/0.10),transparent_40%)]" />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  Workspace configuration
                </div>
                <h1 className="mt-5 text-3xl font-display font-bold text-foreground">Manage profile, trust, and integration readiness</h1>
                <p className="mt-4 text-muted-foreground">
                  This is now a working control panel for workspace identity, Meta mapping, and the first real integration layer.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                <Metric label="Owner" value={user?.name || "No user"} />
                <Metric label="WhatsApp" value={connectionLabel} />
                <Metric label="Integrations live" value={connectedIntegrations.toString()} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-[1.5rem] border border-border bg-card p-6 shadow-card">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <UserCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">Profile</h2>
                <p className="text-xs text-muted-foreground">Workspace owner and login identity</p>
              </div>
            </div>
            <div className="space-y-4 text-sm">
              <InfoCard label="Name" value={user?.name || "No user"} />
              <InfoCard label="Email" value={user?.email || "No email"} />
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-border bg-card p-6 shadow-card">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-info/10">
                <Link2 className="h-5 w-5 text-info" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">WhatsApp Connection</h2>
                <p className="text-xs text-muted-foreground">Current Meta account mapping and trust state</p>
              </div>
            </div>
            <div className="space-y-4 text-sm">
              <InfoCard label="Status" value={connectionLabel} />
              <InfoCard label="Authorization" value={authorizationLabel} />
              <InfoCard label="Authorization expiry" value={formatDateTime(whatsApp.authorizationExpiresAt)} />
              <InfoCard label="Display number" value={whatsApp.displayPhoneNumber || "No number linked"} />
              <InfoCard label="Business portfolio" value={whatsApp.businessPortfolio || "No portfolio selected"} />
              <InfoCard label="Business verification" value={businessVerificationLabel} />
              <InfoCard label="Account review" value={accountReviewLabel} />
              <InfoCard label="Official Business Account" value={obaLabel} />
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-border bg-card p-6 shadow-card">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/10">
                <KeyRound className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">API Keys</h2>
                <p className="text-xs text-muted-foreground">Developer access stays reserved until the backend key flow is added</p>
              </div>
            </div>
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5">
              <p className="text-sm text-foreground font-medium">API key issuance is still pending backend support.</p>
              <p className="text-sm text-muted-foreground mt-1">The product now stores real integration settings, but token minting and rotation are still a backend follow-up.</p>
              <Button className="mt-4" variant="outline" onClick={() => toast({ title: "Coming soon", description: "API key generation will plug into the backend later." })}>
                Request API Access
              </Button>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-border bg-card p-6 shadow-card">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10">
                <PlugZap className="h-5 w-5 text-success" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">Integrations control center</h2>
                <p className="text-xs text-muted-foreground">Persist connection settings, sync posture, and operator ownership</p>
              </div>
            </div>
            <div className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="Connected" value={connectedIntegrations.toString()} />
                <Metric label="Needs attention" value={attentionIntegrations.toString()} />
                <Metric label="CTWA mapped" value={`${mappedMetaLeads.length}/${metaLeads.length || 0}`} />
              </div>
              {integrations.map((integration) => (
                <button
                  key={integration.key}
                  type="button"
                  onClick={() => setSelectedIntegrationKey(integration.key)}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    selectedIntegrationKey === integration.key
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/20 hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{integration.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{integration.description}</p>
                    </div>
                    <StatusPill status={integration.status} />
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                    <span>Owner: {integration.owner || "Unassigned"}</span>
                    <span>Sync: {formatSyncMode(integration.syncMode)}</span>
                    <span>Reference: {integration.reference || "-"}</span>
                    <span>Last sync: {formatDateTime(integration.lastSyncAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-border bg-card p-6 shadow-card lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10">
                <PlugZap className="h-5 w-5 text-success" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">Integration workspace</h2>
                <p className="text-xs text-muted-foreground">We can now store and operate integration setup, even before the full backend sync engine lands.</p>
              </div>
            </div>
            {integrationDraft ? (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <label className="space-y-2 text-sm">
                    <span className="text-muted-foreground">Integration</span>
                    <select
                      value={integrationDraft.key}
                      onChange={(event) => setSelectedIntegrationKey(event.target.value as IntegrationKey)}
                      className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground"
                    >
                      {integrations.map((integration) => (
                        <option key={integration.key} value={integration.key}>{integration.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="text-muted-foreground">Owner</span>
                    <input
                      value={integrationDraft.owner}
                      onChange={(event) => setIntegrationDraft((current) => current ? { ...current, owner: event.target.value } : current)}
                      className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="text-muted-foreground">Sync mode</span>
                    <select
                      value={integrationDraft.syncMode}
                      onChange={(event) => setIntegrationDraft((current) => current ? { ...current, syncMode: event.target.value as IntegrationSyncMode } : current)}
                      className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground"
                    >
                      <option value="two_way">Two-way</option>
                      <option value="import_only">Import only</option>
                      <option value="export_only">Export only</option>
                    </select>
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <select
                      value={integrationDraft.status}
                      onChange={(event) => setIntegrationDraft((current) => current ? { ...current, status: event.target.value as IntegrationConfig["status"] } : current)}
                      className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground"
                    >
                      <option value="connected">Connected</option>
                      <option value="attention">Needs attention</option>
                      <option value="disconnected">Disconnected</option>
                    </select>
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="text-muted-foreground">Endpoint / store URL / webhook</span>
                    <input
                      value={integrationDraft.endpoint}
                      onChange={(event) => setIntegrationDraft((current) => current ? { ...current, endpoint: event.target.value } : current)}
                      placeholder="https://"
                      className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="text-muted-foreground">Reference</span>
                    <input
                      value={integrationDraft.reference}
                      onChange={(event) => setIntegrationDraft((current) => current ? { ...current, reference: event.target.value } : current)}
                      placeholder="Store name, sheet ID, or workflow label"
                      className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                    />
                  </label>
                </div>

                <label className="block space-y-2 text-sm">
                  <span className="text-muted-foreground">Operator notes</span>
                  <textarea
                    rows={4}
                    value={integrationDraft.notes}
                    onChange={(event) => setIntegrationDraft((current) => current ? { ...current, notes: event.target.value } : current)}
                    placeholder="Describe what should sync, which team owns it, and any caveats."
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                  />
                </label>

                <div className="grid gap-3 md:grid-cols-3">
                  <InfoCard label="Connected at" value={formatDateTime(integrationDraft.connectedAt)} compact />
                  <InfoCard label="Last sync" value={formatDateTime(integrationDraft.lastSyncAt)} compact />
                  <InfoCard label="Status" value={formatIntegrationStatus(integrationDraft.status)} compact />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => saveIntegrationDraft({
                      connectedAt: integrationDraft.connectedAt ?? new Date().toISOString(),
                      status: integrationDraft.endpoint || integrationDraft.reference ? integrationDraft.status : "attention",
                    })}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Save integration
                  </Button>
                  <Button variant="outline" onClick={handleRunSync}>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Run test sync
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => saveIntegrationDraft({ status: "disconnected", lastSyncAt: null }, "Integration disconnected")}
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-[1.5rem] border border-border bg-card p-6 shadow-card lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-info/10">
                <Link2 className="h-5 w-5 text-info" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">Meta lead source mappings</h2>
                <p className="text-xs text-muted-foreground">Route Meta ad leads to the correct workspace using page, ad, or form identifiers</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <input value={mappingLabel} onChange={(event) => setMappingLabel(event.target.value)} placeholder="Label (Spring Lead Ads)" className="h-11 rounded-xl border border-input bg-background px-4 text-sm" />
              <input value={pageId} onChange={(event) => setPageId(event.target.value)} placeholder="Meta Page ID" className="h-11 rounded-xl border border-input bg-background px-4 text-sm" />
              <input value={adId} onChange={(event) => setAdId(event.target.value)} placeholder="Meta Ad ID" className="h-11 rounded-xl border border-input bg-background px-4 text-sm" />
              <input value={formId} onChange={(event) => setFormId(event.target.value)} placeholder="Meta Form ID" className="h-11 rounded-xl border border-input bg-background px-4 text-sm" />
            </div>

            <Button className="mt-4" onClick={handleSaveMapping}>Save Mapping</Button>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Metric label="Saved mappings" value={mappings.length.toString()} />
              <Metric label="Mapped Meta leads" value={mappedMetaLeads.length.toString()} />
              <Metric label="Unmapped Meta leads" value={unmappedMetaLeads.toString()} />
            </div>

            <div className="mt-6 space-y-3">
              {mappings.length > 0 ? mappings.map((mapping) => (
                <div key={mapping.id} className="rounded-xl border border-border bg-muted/20 p-4 text-sm">
                  <p className="font-medium text-foreground">{mapping.label || "Meta mapping"}</p>
                  <p className="mt-1 text-muted-foreground">
                    Page: {mapping.page_id || "-"} | Ad: {mapping.ad_id || "-"} | Form: {mapping.form_id || "-"}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Leads matched: {metaLeads.filter((lead) => matchLeadToMetaMapping(lead, [mapping]).mapping).length}
                  </p>
                </div>
              )) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/10 p-4 text-sm text-muted-foreground">
                  No Meta lead source mappings saved yet.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function InfoCard({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className={`rounded-xl border border-border bg-muted/30 ${compact ? "p-4" : "p-4"}`}>
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: IntegrationConfig["status"] }) {
  const className = status === "connected"
    ? "bg-success/10 text-success"
    : status === "attention"
      ? "bg-warning/10 text-warning"
      : "bg-muted text-muted-foreground";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {formatIntegrationStatus(status)}
    </span>
  );
}

function formatIntegrationStatus(status: IntegrationConfig["status"]) {
  if (status === "connected") return "Connected";
  if (status === "attention") return "Needs attention";
  return "Disconnected";
}

function formatSyncMode(syncMode: IntegrationSyncMode) {
  if (syncMode === "two_way") return "Two-way";
  if (syncMode === "import_only") return "Import only";
  return "Export only";
}

function formatDateTime(value: string | null) {
  return value
    ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : "Not set";
}

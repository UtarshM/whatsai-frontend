import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { KeyRound, Link2, PlugZap, ShieldCheck, UserCircle2 } from "lucide-react";
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

export default function SettingsPage() {
  const { user, whatsApp } = useAppContext();
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

  useEffect(() => {
    void fetchMetaSourceMappings()
      .then(setMappings)
      .catch(() => {
        setMappings([]);
      });
  }, []);

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
                <h1 className="mt-5 text-3xl font-display font-bold text-foreground">Manage profile, connection trust, and future platform access</h1>
                <p className="mt-4 text-muted-foreground">
                  Settings now read more like a control panel for workspace identity, WhatsApp mapping, and the expansion path toward APIs and automation.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Owner</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{user?.name || "No user"}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">WhatsApp</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{connectionLabel}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">API readiness</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">Structured for next phase</p>
                </div>
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
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-muted-foreground">Name</p>
                <p className="mt-1 font-medium text-foreground">{user?.name || "No user"}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-muted-foreground">Email</p>
                <p className="mt-1 font-medium text-foreground">{user?.email || "No email"}</p>
              </div>
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
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-muted-foreground">Status</p>
                <p className="mt-1 font-medium text-foreground">{connectionLabel}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-muted-foreground">Authorization</p>
                <p className="mt-1 font-medium text-foreground">{authorizationLabel}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-muted-foreground">Authorization expiry</p>
                <p className="mt-1 font-medium text-foreground">
                  {whatsApp.authorizationExpiresAt
                    ? new Date(whatsApp.authorizationExpiresAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
                    : "No expiry stored"}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-muted-foreground">Display number</p>
                <p className="mt-1 font-medium text-foreground">{whatsApp.displayPhoneNumber || "No number linked"}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-muted-foreground">Business portfolio</p>
                <p className="mt-1 font-medium text-foreground">{whatsApp.businessPortfolio || "No portfolio selected"}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-muted-foreground">Business verification</p>
                <p className="mt-1 font-medium text-foreground">{businessVerificationLabel}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-muted-foreground">Account review</p>
                <p className="mt-1 font-medium text-foreground">{accountReviewLabel}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-muted-foreground">Official Business Account</p>
                <p className="mt-1 font-medium text-foreground">{obaLabel}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-border bg-card p-6 shadow-card">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/10">
                <KeyRound className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">API Keys</h2>
                <p className="text-xs text-muted-foreground">Planned platform access and developer controls</p>
              </div>
            </div>
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5">
              <p className="text-sm text-foreground font-medium">API access is not enabled in this MVP yet.</p>
              <p className="text-sm text-muted-foreground mt-1">The structure is ready for issued keys, scoped environments, and rotation logs when the backend expands.</p>
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
                <h2 className="font-display text-lg font-semibold text-foreground">Future Modules</h2>
                <p className="text-xs text-muted-foreground">Reserved platform surfaces for expansion</p>
              </div>
            </div>
            <div className="grid gap-3">
              {["Shopify integration", "Automation flows", "Chat inbox"].map((item) => (
                <div key={item} className="rounded-xl border border-border bg-muted/20 p-4">
                  <p className="text-sm font-medium text-foreground">{item}</p>
                  <p className="text-xs text-muted-foreground mt-1">Reserved in the architecture so the product can expand without a redesign.</p>
                </div>
              ))}
            </div>
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

            <div className="mt-6 space-y-3">
              {mappings.length > 0 ? mappings.map((mapping) => (
                <div key={mapping.id} className="rounded-xl border border-border bg-muted/20 p-4 text-sm">
                  <p className="font-medium text-foreground">{mapping.label || "Meta mapping"}</p>
                  <p className="mt-1 text-muted-foreground">
                    Page: {mapping.page_id || "-"} | Ad: {mapping.ad_id || "-"} | Form: {mapping.form_id || "-"}
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

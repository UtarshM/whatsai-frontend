import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  MessageSquare,
  Plus,
  Send,
  Target,
  Users,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { toast } from "@/components/ui/use-toast";
import { activeApiAdapter } from "@/lib/api";
import { sendMetaCampaignWithServer } from "@/lib/meta/server";

const statusStyles: Record<string, string> = {
  Delivered: "bg-success/10 text-success",
  Sending: "bg-warning/10 text-warning",
  Scheduled: "bg-info/10 text-info",
  Draft: "bg-muted text-muted-foreground",
};

const wizardSteps = ["Audience", "Template", "Review"];

export default function CampaignsPage() {
  const {
    campaigns,
    contacts,
    approvedTemplates,
    createCampaign,
    walletBalance,
    costPerMessage,
    lowBalanceThreshold,
    whatsApp,
  } = useAppContext();
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(0);
  const [campaignName, setCampaignName] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [search, setSearch] = useState("");
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});

  const filteredContacts = useMemo(
    () =>
      contacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(search.toLowerCase()) ||
          contact.phone.includes(search) ||
          contact.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())),
      ),
    [contacts, search],
  );

  const selectedTemplate = approvedTemplates.find((template) => template.id === selectedTemplateId);
  const templatePlaceholders = useMemo(() => {
    if (!selectedTemplate) {
      return [];
    }
    return Array.from(new Set(selectedTemplate.preview.match(/\{\{\d+\}\}/g) ?? []));
  }, [selectedTemplate]);

  const estimatedCost = Number((selectedContacts.length * costPerMessage).toFixed(2));
  const isLowBalance = walletBalance <= lowBalanceThreshold;
  const canSend = selectedContacts.length > 0 && Boolean(selectedTemplateId) && walletBalance >= estimatedCost && whatsApp.connected;
  const sendingCampaigns = campaigns.filter((campaign) => campaign.status === "Sending" || campaign.status === "Scheduled").length;

  const toggleContact = (contactId: string) => {
    setSelectedContacts((current) =>
      current.includes(contactId)
        ? current.filter((id) => id !== contactId)
        : [...current, contactId],
    );
  };

  const selectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = approvedTemplates.find((item) => item.id === templateId);
    const placeholders = Array.from(new Set(template?.preview.match(/\{\{\d+\}\}/g) ?? []));
    setTemplateVariables(() => Object.fromEntries(
      placeholders.map((placeholder, index) => [placeholder, index === 0 ? "{{contact.name}}" : ""]),
    ));
  };

  const resetWizard = () => {
    setShowWizard(false);
    setStep(0);
    setCampaignName("");
    setSelectedContacts([]);
    setSelectedTemplateId("");
    setSearch("");
    setTemplateVariables({});
  };

  const goNext = () => {
    if (step === 0 && selectedContacts.length === 0) {
      toast({ title: "Select contacts", description: "Choose at least one recipient before continuing." });
      return;
    }

    if (step === 1 && !selectedTemplateId) {
      toast({ title: "Select a template", description: "Choose an approved template for this campaign." });
      return;
    }

    if (step === 1 && templatePlaceholders.some((placeholder) => !(templateVariables[placeholder] ?? "").trim())) {
      toast({ title: "Map template variables", description: "Fill every template placeholder before continuing." });
      return;
    }

    setStep((current) => Math.min(current + 1, wizardSteps.length - 1));
  };

  const handleSubmit = async (sendNow: boolean) => {
    if (sendNow && !whatsApp.connected) {
      toast({
        title: "WhatsApp not connected",
        description: "Connect a Meta WhatsApp number before sending live campaigns.",
      });
      return;
    }

    if (sendNow && activeApiAdapter === "supabase") {
      try {
        await sendMetaCampaignWithServer({
          templateId: selectedTemplateId,
          contactIds: selectedContacts,
          bodyParameters: templatePlaceholders.map((placeholder) => templateVariables[placeholder] ?? ""),
        });
      } catch (error) {
        toast({
          title: "Meta send failed",
          description: error instanceof Error ? error.message : "Campaign could not be sent through Meta.",
          variant: "destructive",
        });
        return;
      }
    }

    const result = await createCampaign({
      name: campaignName || `Campaign ${new Date().toLocaleDateString("en-IN")}`,
      templateId: selectedTemplateId,
      contactIds: selectedContacts,
      sendNow,
    });

    if (!result.ok) {
      toast({ title: sendNow ? "Campaign blocked" : "Draft not saved", description: result.message });
      return;
    }

    toast({ title: sendNow ? "Campaign sent" : "Draft saved", description: result.message });
    resetWizard();
  };

  const renderedTemplatePreview = useMemo(() => {
    if (!selectedTemplate) {
      return "";
    }

    return selectedTemplate.preview.replace(/\{\{\d+\}\}/g, (placeholder) => {
      const mappedValue = (templateVariables[placeholder] ?? "").trim();
      if (!mappedValue) {
        return placeholder;
      }

      if (mappedValue === "{{contact.name}}") {
        return "[Contact Name]";
      }

      if (mappedValue === "{{contact.phone}}") {
        return "[Contact Phone]";
      }

      return mappedValue;
    });
  }, [selectedTemplate, templateVariables]);

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
                  <Target className="h-4 w-4" />
                  Campaign operations workspace
                </div>
                <h1 className="mt-5 text-3xl font-display font-bold text-foreground">Launch campaigns with more financial control and sending confidence</h1>
                <p className="mt-4 text-muted-foreground">
                  This flow is built to feel safer for operators: audience selection, approved template choice, cost estimation, wallet validation, and send blocking when balance is insufficient.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Active pipeline</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{sendingCampaigns} live campaigns</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Wallet</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">Rs {walletBalance.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Approved templates</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{approvedTemplates.length} ready</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">Campaign center</h2>
            <p className="text-muted-foreground mt-1">Draft, review, and launch WhatsApp broadcasts</p>
          </div>
          <Button variant="gradient" size="sm" onClick={() => setShowWizard(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Campaign
          </Button>
        </div>

        {showWizard && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[1.75rem] border border-border bg-card p-6 shadow-card"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  {wizardSteps.map((label, index) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                        index <= step ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-sm text-foreground">{label}</span>
                      {index < wizardSteps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-foreground">Campaign name</label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(event) => setCampaignName(event.target.value)}
                    placeholder="Festive launch broadcast"
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                  />
                </div>

                {step === 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4 flex-col md:flex-row">
                      <div>
                        <h3 className="font-display text-lg font-semibold text-foreground">Choose audience</h3>
                        <p className="text-sm text-muted-foreground">Select the customer group that should receive this campaign</p>
                      </div>
                      <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search name, phone, or tag"
                        className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm md:max-w-xs"
                      />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {filteredContacts.map((contact) => (
                        <label key={contact.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
                          selectedContacts.includes(contact.id) ? "border-primary bg-primary/5" : "border-border"
                        }`}>
                          <input
                            type="checkbox"
                            checked={selectedContacts.includes(contact.id)}
                            onChange={() => toggleContact(contact.id)}
                            className="mt-1 h-4 w-4 rounded border-border"
                          />
                          <div>
                            <p className="text-sm font-medium text-foreground">{contact.name}</p>
                            <p className="text-xs text-muted-foreground">{contact.phone}</p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {contact.tags.map((tag) => (
                                <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground">Choose template</h3>
                      <p className="text-sm text-muted-foreground">Approved templates only, for safer send operations</p>
                    </div>
                    <div className="grid gap-3">
                      {approvedTemplates.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => selectTemplate(template.id)}
                          className={`rounded-2xl border p-4 text-left transition-colors ${
                            selectedTemplateId === template.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{template.name}</p>
                              <p className="text-xs text-muted-foreground">{template.category} · {template.language}</p>
                            </div>
                            {selectedTemplateId === template.id && <CheckCircle2 className="h-5 w-5 text-success" />}
                          </div>
                          <div className="mt-3 rounded-xl bg-muted/40 p-3 text-sm text-muted-foreground font-mono">
                            {template.preview}
                          </div>
                        </button>
                      ))}
                    </div>
                    {selectedTemplate && templatePlaceholders.length > 0 && (
                      <div className="rounded-2xl border border-border bg-muted/20 p-4">
                        <div className="flex items-start justify-between gap-4 flex-col lg:flex-row">
                          <div>
                            <h4 className="text-sm font-semibold text-foreground">Template variable mapping</h4>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Map each placeholder before sending. Supported dynamic values: <span className="font-mono">{"{{contact.name}}"}</span>, <span className="font-mono">{"{{contact.phone}}"}</span>
                            </p>
                          </div>
                          <div className="rounded-xl bg-background px-3 py-2 text-xs text-muted-foreground">
                            Preview updates as you map variables
                          </div>
                        </div>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          {templatePlaceholders.map((placeholder, index) => (
                            <div key={placeholder} className="rounded-xl border border-border bg-background p-4">
                              <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                {placeholder} {index === 0 ? "recommended: contact name" : ""}
                              </label>
                              <input
                                type="text"
                                value={templateVariables[placeholder] ?? ""}
                                onChange={(event) => setTemplateVariables((current) => ({
                                  ...current,
                                  [placeholder]: event.target.value,
                                }))}
                                placeholder={index === 0 ? "{{contact.name}}" : "Enter value or token"}
                                className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 rounded-xl bg-background p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Rendered preview</p>
                          <p className="mt-2 text-sm text-foreground">{renderedTemplatePreview}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground">Review and approve send</h3>
                      <p className="text-sm text-muted-foreground">Confirm operational details before this campaign goes live</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-border bg-muted/30 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Audience</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">{selectedContacts.length} contacts</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-muted/30 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Estimated cost</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">Rs {estimatedCost.toLocaleString()}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-muted/30 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Wallet balance</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">Rs {walletBalance.toLocaleString()}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-muted/30 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Template</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">{selectedTemplate?.name || "Not selected"}</p>
                      </div>
                    </div>

                    {selectedTemplate && templatePlaceholders.length > 0 && (
                      <div className="rounded-2xl border border-border bg-muted/30 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Variable mapping</p>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          {templatePlaceholders.map((placeholder) => (
                            <div key={placeholder} className="rounded-xl bg-background p-3 text-sm">
                              <p className="text-muted-foreground">{placeholder}</p>
                              <p className="mt-1 font-medium text-foreground">{templateVariables[placeholder] || "Not mapped"}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {isLowBalance && (
                      <div className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm">
                        <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                        <div>
                          <p className="font-semibold text-foreground">Low balance warning</p>
                          <p className="text-muted-foreground">The wallet is below the recommended reserve for larger sends.</p>
                        </div>
                      </div>
                    )}

                    {walletBalance < estimatedCost && (
                      <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm">
                        <Wallet className="h-5 w-5 text-destructive mt-0.5" />
                        <div>
                          <p className="font-semibold text-foreground">Insufficient wallet balance</p>
                          <p className="text-muted-foreground">This send is blocked until the workspace balance is topped up.</p>
                        </div>
                      </div>
                    )}

                    {!whatsApp.connected && (
                      <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm">
                        <MessageSquare className="h-5 w-5 text-destructive mt-0.5" />
                        <div>
                          <p className="font-semibold text-foreground">Meta connection required</p>
                          <p className="text-muted-foreground">Live sends are blocked until this workspace has a connected Meta WhatsApp number.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="w-full rounded-[1.5rem] border border-border bg-muted/30 p-5 lg:max-w-sm">
                <h3 className="font-display text-base font-semibold text-foreground">Campaign summary</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Recipients</span>
                    <span className="font-medium text-foreground">{selectedContacts.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Cost per message</span>
                    <span className="font-medium text-foreground">Rs {costPerMessage.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Estimated spend</span>
                    <span className="font-medium text-foreground">Rs {estimatedCost.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Balance after send</span>
                    <span className="font-medium text-foreground">Rs {Math.max(walletBalance - estimatedCost, 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-border bg-background/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Operator note</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This wizard is designed to reduce accidental overspend and keep campaign launch decisions more deliberate.
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  {step < wizardSteps.length - 1 ? (
                    <Button variant="gradient" onClick={goNext}>
                      Continue
                    </Button>
                  ) : (
                    <>
                      <Button variant="gradient" onClick={() => handleSubmit(true)} disabled={!canSend}>
                        <Send className="h-4 w-4 mr-1" /> Send Campaign
                      </Button>
                      <Button variant="outline" onClick={() => handleSubmit(false)}>
                        Save as Draft
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" onClick={resetWizard}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid gap-4">
          {campaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-[1.5rem] border border-border bg-card p-5 shadow-card"
            >
              <div className="flex items-center justify-between gap-4 flex-col md:flex-row">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <Send className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{campaign.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {approvedTemplates.find((template) => template.id === campaign.templateId)?.name || "Template"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {campaign.contactIds.length.toLocaleString()} recipients
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(campaign.date).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Spend</p>
                    <p className="text-sm font-semibold text-foreground">Rs {campaign.estimatedCost.toLocaleString()}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[campaign.status]}`}>
                    {campaign.status}
                  </span>
                  <Button variant="ghost" size="sm" className="text-primary">
                    Open <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

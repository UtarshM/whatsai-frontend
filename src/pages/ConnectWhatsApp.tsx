import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronRight,
  KeyRound,
  MessageSquare,
  Phone,
  ShieldCheck,
  Unplug,
  Wallet,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useAppContext } from "@/context/AppContext";
import type {
  ConnectWhatsAppInput,
} from "@/lib/api/types";
import { buildMetaEmbeddedSignupUrl, hasMetaEmbeddedSignupConfig } from "@/lib/meta/config";
import { exchangeMetaCodeWithServer } from "@/lib/meta/server";
import {
  getAccountReviewLabel,
  getAuthorizationStatusLabel,
  getBusinessVerificationLabel,
  getConnectionStatusLabel,
  getObaStatusLabel,
  getStatusTone,
} from "@/lib/meta/status";

const connectSteps = [
  "Authenticate with Meta",
  "Authorize business assets",
  "Store workspace mapping",
  "Track verification and OBA",
];

export default function ConnectWhatsApp() {
  const { whatsApp, connectWhatsApp, disconnectWhatsApp } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSaving, setIsSaving] = useState(false);
  const [isExchangingCode, setIsExchangingCode] = useState(false);
  const [form, setForm] = useState<ConnectWhatsAppInput>({
    connectionStatus: whatsApp.connectionStatus,
    businessVerificationStatus: whatsApp.businessVerificationStatus,
    accountReviewStatus: whatsApp.accountReviewStatus,
    obaStatus: whatsApp.obaStatus,
    metaBusinessId: whatsApp.metaBusinessId,
    metaBusinessPortfolioId: whatsApp.metaBusinessPortfolioId,
    wabaId: whatsApp.wabaId,
    phoneNumberId: whatsApp.phoneNumberId,
    displayPhoneNumber: whatsApp.displayPhoneNumber,
    verifiedName: whatsApp.verifiedName,
    businessPortfolio: whatsApp.businessPortfolio,
    businessName: whatsApp.businessName,
    authorizationStatus: whatsApp.authorizationStatus,
    authorizationExpiresAt: whatsApp.authorizationExpiresAt,
  });

  const connectionState = useMemo(() => ({
    connection: getConnectionStatusLabel(whatsApp.connectionStatus),
    authorization: getAuthorizationStatusLabel(whatsApp.authorizationStatus),
    businessVerification: getBusinessVerificationLabel(whatsApp.businessVerificationStatus),
    review: getAccountReviewLabel(whatsApp.accountReviewStatus),
    oba: getObaStatusLabel(whatsApp.obaStatus),
  }), [whatsApp.accountReviewStatus, whatsApp.authorizationStatus, whatsApp.businessVerificationStatus, whatsApp.connectionStatus, whatsApp.obaStatus]);

  const updateField = <T extends keyof ConnectWhatsAppInput>(key: T, value: ConnectWhatsAppInput[T]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    const code = searchParams.get("code");
    const errorReason = searchParams.get("error_reason");
    const returnedState = searchParams.get("state");
    const expectedState = window.sessionStorage.getItem("wabiz_meta_signup_state");

    if (errorReason) {
      toast({
        title: "Meta signup was not completed",
        description: "The Meta flow returned without authorization. You can retry when ready.",
        variant: "destructive",
      });
      setSearchParams({}, { replace: true });
      return;
    }

    if (!code) {
      return;
    }

    if (expectedState && returnedState && expectedState !== returnedState) {
      toast({
        title: "Meta authorization state mismatch",
        description: "The Meta callback state did not match this browser session. Retry the flow once more.",
        variant: "destructive",
      });
      setSearchParams({}, { replace: true });
      return;
    }

    setIsExchangingCode(true);

    void exchangeMetaCodeWithServer(code)
      .then(async (payload) => {
        setForm((current) => ({
          ...current,
          ...payload.candidate,
        }));
        await connectWhatsApp(payload.candidate);
        toast({
          title: "Meta connection saved",
          description: "We exchanged the authorization code, loaded your Meta assets, and saved the first available business mapping into this workspace.",
        });
      })
      .catch((error) => {
        toast({
          title: "Meta code exchange failed",
          description: error instanceof Error ? error.message : "The authorization code could not be exchanged.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsExchangingCode(false);
        window.sessionStorage.removeItem("wabiz_meta_signup_state");
        setSearchParams({}, { replace: true });
      });
  }, [searchParams, setSearchParams, connectWhatsApp]);

  const handleLaunchEmbeddedSignup = () => {
    if (!hasMetaEmbeddedSignupConfig) {
      toast({
        title: "Meta Embedded Signup not configured",
        description: "Add VITE_META_APP_ID and VITE_META_CONFIG_ID to enable the real Meta launch flow, then save the returned IDs here.",
      });
      return;
    }

    const state = crypto.randomUUID();
    window.sessionStorage.setItem("wabiz_meta_signup_state", state);
    const url = buildMetaEmbeddedSignupUrl(state);

    if (!url) {
      toast({
        title: "Meta launch unavailable",
        description: "The Meta configuration could not be converted into a launch URL.",
        variant: "destructive",
      });
      return;
    }

    window.location.assign(url);
  };

  const handleSave = async () => {
    if (!form.businessPortfolio.trim() || !form.businessName.trim() || !form.displayPhoneNumber.trim()) {
      toast({
        title: "Missing Meta details",
        description: "Business portfolio, business name, and display phone number are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await connectWhatsApp(form);
      toast({
        title: "Meta connection saved",
        description: `${form.displayPhoneNumber} is now mapped to this workspace with its current review state.`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <ShieldCheck className="h-4 w-4" />
            Meta-owned number onboarding
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Connect WhatsApp Business</h1>
              <p className="mt-2 max-w-3xl text-muted-foreground">
                Each subscriber should connect their own Meta business assets and their own WhatsApp number.
                WaBiz stores the mapping, review status, and green-tick eligibility without pretending the number belongs to the platform.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card px-5 py-4 shadow-card">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Current status</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{connectionState.connection}</p>
            </div>
          </div>
        </motion.div>

        {(whatsApp.authorizationStatus === "expired" || whatsApp.authorizationStatus === "expiring_soon" || whatsApp.authorizationStatus === "missing") && (
          <div className={`rounded-[1.5rem] border p-5 ${
            whatsApp.authorizationStatus === "expired" || whatsApp.authorizationStatus === "missing"
              ? "border-destructive/20 bg-destructive/5"
              : "border-warning/30 bg-warning/10"
          }`}>
            <h2 className="text-base font-semibold text-foreground">{connectionState.authorization}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {whatsApp.authorizationStatus === "expired"
                ? "This workspace needs a fresh Meta authorization before campaigns, inbox replies, and automations can keep sending."
                : whatsApp.authorizationStatus === "expiring_soon"
                  ? "This Meta authorization is close to expiry. Reconnect now to avoid blocked sends later."
                  : "No stored Meta authorization was found for this workspace yet."}
            </p>
            <Button variant="whatsapp" className="mt-4" onClick={handleLaunchEmbeddedSignup} disabled={isExchangingCode}>
              <MessageSquare className="mr-2 h-4 w-4" />
              {isExchangingCode ? "Refreshing Meta authorization..." : "Reconnect Meta authorization"}
            </Button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.35fr,0.65fr]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-card"
          >
            <div className="border-b border-border px-6 py-5">
              <div className="flex flex-wrap items-center gap-2">
                {connectSteps.map((label, index) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-xs font-semibold text-primary-foreground">
                      {index + 1}
                    </div>
                    <span className="text-sm text-foreground">{label}</span>
                    {index < connectSteps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.02fr,0.98fr]">
              <div className="space-y-6">
                <div className="rounded-[1.5rem] border border-border bg-muted/30 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-display font-semibold text-foreground">Launch Meta Embedded Signup</h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        This should eventually open Meta&apos;s real embedded flow so the subscriber can choose their own business portfolio, WABA, and phone number.
                      </p>
                    </div>
                    <div className={`rounded-full px-3 py-1 text-xs font-medium ${hasMetaEmbeddedSignupConfig ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                      {hasMetaEmbeddedSignupConfig ? "Meta app configured" : "Meta app config missing"}
                    </div>
                  </div>

                  <Button variant="whatsapp" size="lg" className="mt-6" onClick={handleLaunchEmbeddedSignup} disabled={isExchangingCode}>
                    <MessageSquare className="mr-2 h-5 w-5" />
                    {isExchangingCode ? "Exchanging Meta code..." : "Launch Meta Embedded Signup"}
                  </Button>

                  <div className="mt-4 rounded-xl border border-border bg-background/80 p-4 text-sm text-muted-foreground">
                    If Meta returns a code back to this screen, that means the browser launch step worked. The remaining step is backend code exchange, asset fetch, and automatic record creation.
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-border p-5">
                    <label className="mb-3 block text-sm font-medium text-foreground">
                      <Building2 className="mr-2 inline h-4 w-4" />
                      Business Portfolio
                    </label>
                    <input
                      value={form.businessPortfolio}
                      onChange={(event) => updateField("businessPortfolio", event.target.value)}
                      placeholder="Meta business portfolio name"
                      className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                    />
                  </div>

                  <div className="rounded-2xl border border-border p-5">
                    <label className="mb-3 block text-sm font-medium text-foreground">
                      <BadgeCheck className="mr-2 inline h-4 w-4" />
                      Verified Name
                    </label>
                    <input
                      value={form.verifiedName}
                      onChange={(event) => updateField("verifiedName", event.target.value)}
                      placeholder="Meta approved display name"
                      className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                    />
                  </div>

                  <div className="rounded-2xl border border-border p-5">
                    <label className="mb-3 block text-sm font-medium text-foreground">
                      <Building2 className="mr-2 inline h-4 w-4" />
                      Business Name
                    </label>
                    <input
                      value={form.businessName}
                      onChange={(event) => updateField("businessName", event.target.value)}
                      placeholder="Legal or operating business name"
                      className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                    />
                  </div>

                  <div className="rounded-2xl border border-border p-5">
                    <label className="mb-3 block text-sm font-medium text-foreground">
                      <Phone className="mr-2 inline h-4 w-4" />
                      Display Phone Number
                    </label>
                    <input
                      value={form.displayPhoneNumber}
                      onChange={(event) => updateField("displayPhoneNumber", event.target.value)}
                      placeholder="+91 98XXX XXXXX"
                      className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-border p-5">
                    <label className="mb-3 block text-sm font-medium text-foreground">Meta Business ID</label>
                    <input
                      value={form.metaBusinessId}
                      onChange={(event) => updateField("metaBusinessId", event.target.value)}
                      placeholder="Meta business ID"
                      className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                    />
                  </div>
                  <div className="rounded-2xl border border-border p-5">
                    <label className="mb-3 block text-sm font-medium text-foreground">Business Portfolio ID</label>
                    <input
                      value={form.metaBusinessPortfolioId}
                      onChange={(event) => updateField("metaBusinessPortfolioId", event.target.value)}
                      placeholder="Meta portfolio ID"
                      className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                    />
                  </div>
                  <div className="rounded-2xl border border-border p-5">
                    <label className="mb-3 block text-sm font-medium text-foreground">WABA ID</label>
                    <input
                      value={form.wabaId}
                      onChange={(event) => updateField("wabaId", event.target.value)}
                      placeholder="WhatsApp Business Account ID"
                      className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                    />
                  </div>
                  <div className="rounded-2xl border border-border p-5">
                    <label className="mb-3 block text-sm font-medium text-foreground">Phone Number ID</label>
                    <input
                      value={form.phoneNumberId}
                      onChange={(event) => updateField("phoneNumberId", event.target.value)}
                      placeholder="Phone number ID"
                      className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <StatusSelect
                    label="Connection status"
                    value={form.connectionStatus}
                    onChange={(value) => updateField("connectionStatus", value)}
                    options={["pending", "connected", "disconnected"]}
                  />
                  <StatusSelect
                    label="Business verification"
                    value={form.businessVerificationStatus}
                    onChange={(value) => updateField("businessVerificationStatus", value)}
                    options={["unverified", "in_review", "verified"]}
                  />
                  <StatusSelect
                    label="Account review"
                    value={form.accountReviewStatus}
                    onChange={(value) => updateField("accountReviewStatus", value)}
                    options={["pending_review", "in_review", "approved", "rejected"]}
                  />
                  <StatusSelect
                    label="Official Business Account"
                    value={form.obaStatus}
                    onChange={(value) => updateField("obaStatus", value)}
                    options={["not_applied", "pending", "approved", "rejected"]}
                  />
                </div>

                <Button variant="gradient" size="lg" className="w-full" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving Meta mapping..." : "Save Meta connection details"}
                </Button>
              </div>

              <div className="space-y-6">
                <div className="rounded-[1.5rem] border border-border bg-muted/30 p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground">Live trust state</h3>
                  <div className="mt-5 space-y-4">
                    <StatusCard label="Connection" value={connectionState.connection} tone={getStatusTone(whatsApp.connectionStatus)} />
                    <StatusCard label="Authorization" value={connectionState.authorization} tone={getStatusTone(whatsApp.authorizationStatus)} />
                    <StatusCard label="Business verification" value={connectionState.businessVerification} tone={getStatusTone(whatsApp.businessVerificationStatus)} />
                    <StatusCard label="Account review" value={connectionState.review} tone={getStatusTone(whatsApp.accountReviewStatus)} />
                    <StatusCard label="Green tick / OBA" value={connectionState.oba} tone={getStatusTone(whatsApp.obaStatus)} />
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-border bg-card p-6 shadow-card">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                      <KeyRound className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-display text-lg font-semibold text-foreground">Stored Meta identifiers</h2>
                      <p className="text-xs text-muted-foreground">The IDs your backend should keep for sending and sync</p>
                    </div>
                  </div>
                  <div className="mt-6 space-y-4 text-sm">
                    <InfoRow label="Display number" value={whatsApp.displayPhoneNumber || "No number linked yet"} />
                    <InfoRow
                      label="Authorization expiry"
                      value={whatsApp.authorizationExpiresAt
                        ? new Date(whatsApp.authorizationExpiresAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
                        : "No expiry stored yet"}
                    />
                    <InfoRow label="Verified name" value={whatsApp.verifiedName || "No verified name saved"} />
                    <InfoRow label="Meta business ID" value={whatsApp.metaBusinessId || "Not stored yet"} />
                    <InfoRow label="Portfolio ID" value={whatsApp.metaBusinessPortfolioId || "Not stored yet"} />
                    <InfoRow label="WABA ID" value={whatsApp.wabaId || "Not stored yet"} />
                    <InfoRow label="Phone number ID" value={whatsApp.phoneNumberId || "Not stored yet"} />
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-border bg-card p-6 shadow-card">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                      <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-display text-lg font-semibold text-foreground">Why this matters</h2>
                      <p className="text-xs text-muted-foreground">Connection, verification, and OBA are different truths</p>
                    </div>
                  </div>
                  <div className="mt-6 space-y-4 text-sm text-muted-foreground">
                    <p>Show Connected only after Meta signup succeeds and the workspace stores the returned IDs.</p>
                    <p>Show Business verified only when Meta business verification is actually complete.</p>
                    <p>Show Official Business Account only when Meta has approved the green tick for that number.</p>
                  </div>

                  {whatsApp.connected && (
                    <Button
                      variant="outline"
                      className="mt-6 w-full border-destructive/20 text-destructive hover:bg-destructive/5"
                      onClick={async () => {
                        await disconnectWhatsApp();
                        toast({ title: "WhatsApp disconnected", description: "The workspace mapping has been marked as disconnected." });
                      }}
                    >
                      <Unplug className="mr-2 h-4 w-4" />
                      Disconnect current account
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatusCard({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/80 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-medium ${tone}`}>{value}</span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium text-foreground">{value}</p>
    </div>
  );
}

function StatusSelect<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: T[];
}) {
  return (
    <div className="rounded-2xl border border-border p-5">
      <label className="mb-3 block text-sm font-medium text-foreground">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

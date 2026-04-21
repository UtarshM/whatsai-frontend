export type IntegrationKey = "shopify" | "google_sheets" | "zapier" | "webhook";
export type IntegrationStatus = "connected" | "attention" | "disconnected";
export type IntegrationSyncMode = "two_way" | "import_only" | "export_only";

export interface IntegrationConfig {
  key: IntegrationKey;
  name: string;
  description: string;
  status: IntegrationStatus;
  syncMode: IntegrationSyncMode;
  connectedAt: string | null;
  lastSyncAt: string | null;
  owner: string;
  endpoint: string;
  reference: string;
  notes: string;
}

const STORAGE_KEY = "wabiz-integrations";

const defaultConfigs: IntegrationConfig[] = [
  {
    key: "shopify",
    name: "Shopify",
    description: "Sync customers, orders, and lifecycle tags into WhatsApp audiences.",
    status: "disconnected",
    syncMode: "import_only",
    connectedAt: null,
    lastSyncAt: null,
    owner: "Growth Ops",
    endpoint: "",
    reference: "",
    notes: "",
  },
  {
    key: "google_sheets",
    name: "Google Sheets",
    description: "Push qualified leads and campaign outcomes into a live sheet.",
    status: "disconnected",
    syncMode: "export_only",
    connectedAt: null,
    lastSyncAt: null,
    owner: "Ops Desk",
    endpoint: "",
    reference: "",
    notes: "",
  },
  {
    key: "zapier",
    name: "Zapier",
    description: "Fan out lead, contact, and automation events to the rest of your stack.",
    status: "attention",
    syncMode: "two_way",
    connectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastSyncAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    owner: "Automation Team",
    endpoint: "https://hooks.zapier.com/hooks/catch/123456/abcde",
    reference: "Lead webhook",
    notes: "Use for lead-qualified and campaign-click events.",
  },
  {
    key: "webhook",
    name: "Webhook",
    description: "Send workspace events to internal systems or external services.",
    status: "connected",
    syncMode: "export_only",
    connectedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    lastSyncAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    owner: "Backend",
    endpoint: "https://api.example.com/wabiz/webhook",
    reference: "prod-workspace",
    notes: "Receives new lead, conversation, and delivery-failure events.",
  },
];

function cloneDefaults() {
  return defaultConfigs.map((config) => ({ ...config }));
}

export function readIntegrationConfigs(): IntegrationConfig[] {
  if (typeof window === "undefined") {
    return cloneDefaults();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return cloneDefaults();
  }

  try {
    const parsed = JSON.parse(raw) as IntegrationConfig[];
    const byKey = new Map(parsed.map((config) => [config.key, config]));
    return defaultConfigs.map((config) => ({ ...config, ...byKey.get(config.key) }));
  } catch {
    return cloneDefaults();
  }
}

export function writeIntegrationConfigs(configs: IntegrationConfig[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  }
}

export function upsertIntegrationConfig(input: IntegrationConfig) {
  const configs = readIntegrationConfigs();
  const nextConfigs = configs.map((config) => (config.key === input.key ? input : config));
  writeIntegrationConfigs(nextConfigs);
  return nextConfigs;
}

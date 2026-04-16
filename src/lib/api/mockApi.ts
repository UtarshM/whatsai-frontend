import { defaultAppState, sampleUploadedContacts } from "@/lib/api/mockData";
import {
  COST_PER_MESSAGE,
  STORAGE_KEY,
  type ActionResult,
  type AddContactInput,
  type AppState,
  type ConnectWhatsAppInput,
  type CreateCampaignInput,
  type AddConversationNoteInput,
  type RetryFailedSendInput,
  type UpdateAutomationInput,
  type UpdateConversationInput,
  type UpdateLeadInput,
  type Partner,
  type PartnerApplyInput,
  type PartnerDashboardStats,
  type PartnerPayout,
  type PartnerReferral,
  type PartnerStatus,
  type PayoutStatus,
} from "@/lib/api/types";

function cloneState(state: AppState): AppState {
  return JSON.parse(JSON.stringify(state)) as AppState;
}

function pushActivity(state: AppState, title: string, subtitle: string) {
  return [
    {
      id: crypto.randomUUID(),
      title,
      subtitle,
      timestamp: "Just now",
    },
    ...state.recentActivity,
  ].slice(0, 6);
}

const PARTNERS_KEY = "wabiz_partners";
const PARTNER_REFERRALS_KEY = "wabiz_partner_referrals";
const PARTNER_PAYOUTS_KEY = "wabiz_partner_payouts";

function readPartners(): Partner[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(PARTNERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Partner[];
  } catch {
    return [];
  }
}

function writePartners(partners: Partner[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(PARTNERS_KEY, JSON.stringify(partners));
  }
}

function readPartnerReferrals(): PartnerReferral[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(PARTNER_REFERRALS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PartnerReferral[];
  } catch {
    return [];
  }
}

function writePartnerReferrals(referrals: PartnerReferral[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(PARTNER_REFERRALS_KEY, JSON.stringify(referrals));
  }
}

function readPartnerPayouts(): PartnerPayout[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(PARTNER_PAYOUTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PartnerPayout[];
  } catch {
    return [];
  }
}

function writePartnerPayouts(payouts: PartnerPayout[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(PARTNER_PAYOUTS_KEY, JSON.stringify(payouts));
  }
}

function generateReferralCode(): string {
  return "REF" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function readAppState(): AppState {
  if (typeof window === "undefined") {
    return cloneState(defaultAppState);
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return cloneState(defaultAppState);
  }

  try {
    return { ...cloneState(defaultAppState), ...JSON.parse(raw) };
  } catch {
    return cloneState(defaultAppState);
  }
}

export function writeAppState(state: AppState) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

export const mockApi = {
  async getAppState() {
    return readAppState();
  },

  async signIn(email: string, _password: string) {
    const state = readAppState();
    const fallbackName = email.split("@")[0].replace(/[._-]/g, " ");
    const nextState: AppState = {
      ...state,
      user: {
        name: fallbackName.replace(/\b\w/g, (char) => char.toUpperCase()),
        email,
      },
    };
    writeAppState(nextState);
    return nextState;
  },

  async signUp(name: string, email: string, _password: string) {
    const state = readAppState();
    const nextState: AppState = {
      ...state,
      user: { name, email },
    };
    writeAppState(nextState);
    return nextState;
  },

  async signOut() {
    const state = readAppState();
    const nextState: AppState = {
      ...state,
      user: null,
      onboardingComplete: false,
    };
    writeAppState(nextState);
    return nextState;
  },

  async completeOnboarding() {
    const state = readAppState();
    const nextState: AppState = {
      ...state,
      onboardingComplete: true,
    };
    writeAppState(nextState);
    return nextState;
  },

  async connectWhatsApp(input: ConnectWhatsAppInput) {
    const state = readAppState();
    const nextState: AppState = {
      ...state,
      whatsApp: {
        connected: input.connectionStatus === "connected",
        authorizationStatus: input.authorizationStatus || "active",
        authorizationExpiresAt: input.authorizationExpiresAt || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        ...input,
      },
      recentActivity: pushActivity(
        state,
        "WhatsApp connected",
        `${input.displayPhoneNumber} linked to ${input.businessName}`,
      ),
    };
    writeAppState(nextState);
    return nextState;
  },

  async disconnectWhatsApp() {
    const state = readAppState();
    const nextState: AppState = {
      ...state,
      whatsApp: cloneState(defaultAppState).whatsApp,
      recentActivity: pushActivity(
        state,
        "WhatsApp disconnected",
        "Business connection has been removed from the workspace",
      ),
    };
    writeAppState(nextState);
    return nextState;
  },

  async addWalletFunds(amount: number, source = "Wallet Recharge"): Promise<{ state: AppState; result: ActionResult }> {
    const state = readAppState();
    if (!Number.isFinite(amount) || amount <= 0) {
      return { state, result: { ok: false, message: "Enter a valid recharge amount." } };
    }

    const nextBalance = state.walletBalance + amount;
    const nextState: AppState = {
      ...state,
      walletBalance: nextBalance,
      transactions: [
        {
          id: crypto.randomUUID(),
          type: "credit",
          desc: source,
          amount,
          date: new Date().toISOString(),
          balance: nextBalance,
        },
        ...state.transactions,
      ],
      recentActivity: pushActivity(
        state,
        "Wallet recharged",
        `Added Rs ${amount.toLocaleString()} to your wallet`,
      ),
    };
    writeAppState(nextState);
    return { state: nextState, result: { ok: true, message: "Balance added successfully." } };
  },

  async addContact(input: AddContactInput) {
    const state = readAppState();
    const nextState: AppState = {
      ...state,
      contacts: [{ id: crypto.randomUUID(), ...input }, ...state.contacts],
      recentActivity: pushActivity(
        state,
        "Contact added",
        `${input.name} is now available for campaigns`,
      ),
    };
    writeAppState(nextState);
    return nextState;
  },

  async uploadSampleContacts() {
    const state = readAppState();
    const extraContacts = sampleUploadedContacts();
    const nextState: AppState = {
      ...state,
      contacts: [...extraContacts, ...state.contacts],
      recentActivity: pushActivity(
        state,
        "Contacts uploaded",
        `${extraContacts.length} contacts imported from CSV`,
      ),
    };
    writeAppState(nextState);
    return nextState;
  },

  async updateConversation(input: UpdateConversationInput) {
    const state = readAppState();
    const previousConversation = state.conversations.find((conversation) => conversation.id === input.id);
    const nextState: AppState = {
      ...state,
      conversations: state.conversations.map((conversation) => (
        conversation.id === input.id
          ? {
              ...conversation,
              status: input.status ?? conversation.status,
              assignedTo: input.assignedTo === undefined ? conversation.assignedTo : input.assignedTo,
              unreadCount: input.unreadCount ?? conversation.unreadCount,
            }
          : conversation
      )),
      conversationEvents: previousConversation ? [
        {
          id: crypto.randomUUID(),
          conversationId: input.id,
          eventType: input.status && input.status !== previousConversation.status
            ? "status_updated"
            : input.assignedTo !== undefined && input.assignedTo !== previousConversation.assignedTo
              ? "assignment_updated"
              : "conversation_updated",
          summary: input.status && input.status !== previousConversation.status
            ? `Conversation moved to ${input.status}.`
            : input.assignedTo !== undefined && input.assignedTo !== previousConversation.assignedTo
              ? `Conversation assignment updated to ${input.assignedTo || "Unassigned"}.`
              : "Conversation updated.",
          actorName: input.actorName || "Workspace Operator",
          createdAt: new Date().toISOString(),
        },
        ...state.conversationEvents,
      ] : state.conversationEvents,
    };
    writeAppState(nextState);
    return nextState;
  },

  async addConversationNote(input: AddConversationNoteInput) {
    const state = readAppState();
    const nextState: AppState = {
      ...state,
      conversationNotes: [
        {
          id: crypto.randomUUID(),
          conversationId: input.conversationId,
          body: input.body,
          authorName: input.authorName,
          createdAt: new Date().toISOString(),
        },
        ...state.conversationNotes,
      ],
      conversationEvents: [
        {
          id: crypto.randomUUID(),
          conversationId: input.conversationId,
          eventType: "internal_note_added",
          summary: "Internal note added to conversation.",
          actorName: input.authorName,
          createdAt: new Date().toISOString(),
        },
        ...state.conversationEvents,
      ],
    };
    writeAppState(nextState);
    return nextState;
  },

  async updateLead(input: UpdateLeadInput) {
    const state = readAppState();
    const nextState: AppState = {
      ...state,
      leads: state.leads.map((lead) => (
        lead.id === input.id
          ? {
              ...lead,
              status: input.status ?? lead.status,
              assignedTo: input.assignedTo === undefined ? lead.assignedTo : input.assignedTo,
              notes: input.notes ?? lead.notes,
            }
          : lead
      )),
    };
    writeAppState(nextState);
    return nextState;
  },

  async updateAutomation(input: UpdateAutomationInput) {
    const state = readAppState();
    const nextState: AppState = {
      ...state,
      automations: state.automations.map((automation) => (
        automation.type === input.type
          ? {
              ...automation,
              enabled: input.enabled,
              config: input.config,
              updatedAt: new Date().toISOString(),
            }
          : automation
      )),
    };
    writeAppState(nextState);
    return nextState;
  },

  async runAutomationSweep() {
    const state = readAppState();
    const nextState: AppState = {
      ...state,
      automationEvents: [
        {
          id: crypto.randomUUID(),
          ruleType: "no_reply_reminder",
          conversationId: state.conversations[0]?.id ?? null,
          leadId: state.leads[0]?.id ?? null,
          status: "triggered",
          summary: "Reminder sweep completed and pending follow-up conversations were flagged.",
          createdAt: new Date().toISOString(),
        },
        ...state.automationEvents,
      ].slice(0, 20),
    };
    writeAppState(nextState);
    return {
      state: nextState,
      result: { ok: true, message: "Automation reminder sweep completed." },
    };
  },

  async retryFailedSend(input: RetryFailedSendInput) {
    const state = readAppState();
    const failedSend = state.failedSendLogs.find((item) => item.id === input.failedSendLogId);
    if (!failedSend) {
      return { state, result: { ok: false, message: "Failed send record not found." } };
    }

    const nextState: AppState = {
      ...state,
      failedSendLogs: state.failedSendLogs.map((item) => (
        item.id === input.failedSendLogId ? { ...item, status: "retried" } : item
      )),
      operationalLogs: [
        {
          id: crypto.randomUUID(),
          eventType: "failed_send_retried",
          level: "info",
          summary: `Retry initiated for ${failedSend.channel} send to ${failedSend.destination}.`,
          createdAt: new Date().toISOString(),
        },
        ...state.operationalLogs,
      ],
    };
    writeAppState(nextState);
    return {
      state: nextState,
      result: { ok: true, message: "Retry initiated for the failed send." },
    };
  },

  async createCampaign(input: CreateCampaignInput): Promise<{ state: AppState; result: ActionResult }> {
    const state = readAppState();

    if (!input.name.trim()) {
      return { state, result: { ok: false, message: "Campaign name is required." } };
    }
    if (!input.templateId) {
      return { state, result: { ok: false, message: "Choose a template before continuing." } };
    }
    if (input.contactIds.length === 0) {
      return { state, result: { ok: false, message: "Select at least one contact." } };
    }

    const estimatedCost = Number((input.contactIds.length * COST_PER_MESSAGE).toFixed(2));
    if (input.sendNow && state.walletBalance < estimatedCost) {
      return { state, result: { ok: false, message: "Insufficient wallet balance for this campaign." } };
    }

    const selectedTemplate = state.templates.find((template) => template.id === input.templateId);
    const nextBalance = input.sendNow ? state.walletBalance - estimatedCost : state.walletBalance;
    const nextState: AppState = {
      ...state,
      campaigns: [
        {
          id: crypto.randomUUID(),
          name: input.name,
          templateId: input.templateId,
          contactIds: input.contactIds,
          status: input.sendNow ? "Sending" : "Draft",
          date: new Date().toISOString(),
          estimatedCost,
          spent: input.sendNow ? estimatedCost : 0,
        },
        ...state.campaigns,
      ],
      walletBalance: nextBalance,
      totalSpent: input.sendNow ? state.totalSpent + estimatedCost : state.totalSpent,
      messagesSent: input.sendNow ? state.messagesSent + input.contactIds.length : state.messagesSent,
      transactions: input.sendNow
        ? [
            {
              id: crypto.randomUUID(),
              type: "debit",
              desc: `${input.name} (${input.contactIds.length} msgs)`,
              amount: -estimatedCost,
              date: new Date().toISOString(),
              balance: nextBalance,
            },
            ...state.transactions,
          ]
        : state.transactions,
      recentActivity: pushActivity(
        state,
        input.sendNow ? "Campaign launched" : "Campaign drafted",
        `${input.name} using ${selectedTemplate?.name ?? "selected template"}`,
      ),
    };

    writeAppState(nextState);
    return {
      state: nextState,
      result: {
        ok: true,
        message: input.sendNow ? "Campaign launched successfully." : "Draft saved successfully.",
      },
    };
  },

  async getPartners() {
    return readPartners();
  },

  async getPartnerDashboard() {
    const partners = readPartners();
    const referrals = readPartnerReferrals();
    const payouts = readPartnerPayouts();

    // For mock, assume the first approved partner belongs to current user
    const partner = partners.find((p) => p.status === "approved") || partners[0];

    if (!partner) {
      return {
        partner: null as unknown as Partner,
        stats: {
          totalReferrals: 0,
          activeCustomers: 0,
          commissionEarned: 0,
          pendingPayout: 0,
          conversionRate: 0,
          currentTier: "standard",
        } as PartnerDashboardStats,
        referrals: [],
        payouts: [],
      };
    }

    const partnerReferrals = referrals.filter((r) => r.partnerId === partner.id);
    const partnerPayouts = payouts.filter((p) => p.partnerId === partner.id);
    const convertedReferrals = partnerReferrals.filter((r) => r.status === "converted");
    const totalEarned = convertedReferrals.reduce((sum, r) => sum + r.commissionAmount, 0);
    const totalPaid = partnerPayouts
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingPayout = totalEarned - totalPaid;

    const stats: PartnerDashboardStats = {
      totalReferrals: partnerReferrals.length,
      activeCustomers: convertedReferrals.length,
      commissionEarned: totalEarned,
      pendingPayout: pendingPayout > 0 ? pendingPayout : 0,
      conversionRate: partnerReferrals.length > 0
        ? Math.round((convertedReferrals.length / partnerReferrals.length) * 100)
        : 0,
      currentTier: partner.tier,
    };

    return { partner, stats, referrals: partnerReferrals, payouts: partnerPayouts };
  },

  async applyAsPartner(input: PartnerApplyInput): Promise<ActionResult> {
    const partners = readPartners();

    // Check if email already exists
    if (partners.some((p) => p.email === input.email)) {
      return { ok: false, message: "An application with this email already exists." };
    }

    const newPartner: Partner = {
      id: crypto.randomUUID(),
      partnerType: input.partnerType,
      status: "pending",
      companyName: input.companyName || null,
      contactName: input.contactName,
      email: input.email,
      phone: input.phone || null,
      commissionRate: 10, // Default 10%
      tier: "standard",
      referralCode: generateReferralCode(),
      totalReferrals: 0,
      totalEarned: 0,
      totalPaid: 0,
      createdAt: new Date().toISOString(),
    };

    writePartners([newPartner, ...partners]);
    return { ok: true, message: "Partner application submitted successfully." };
  },

  async approvePartner(partnerId: string): Promise<ActionResult> {
    const partners = readPartners();
    const partner = partners.find((p) => p.id === partnerId);

    if (!partner) {
      return { ok: false, message: "Partner not found." };
    }

    if (partner.status === "approved") {
      return { ok: false, message: "Partner is already approved." };
    }

    const updatedPartners = partners.map((p) =>
      p.id === partnerId ? { ...p, status: "approved" as PartnerStatus } : p
    );

    writePartners(updatedPartners);
    return { ok: true, message: "Partner approved successfully." };
  },

  async rejectPartner(partnerId: string): Promise<ActionResult> {
    const partners = readPartners();
    const partner = partners.find((p) => p.id === partnerId);

    if (!partner) {
      return { ok: false, message: "Partner not found." };
    }

    if (partner.status === "rejected") {
      return { ok: false, message: "Partner is already rejected." };
    }

    const updatedPartners = partners.map((p) =>
      p.id === partnerId ? { ...p, status: "rejected" as PartnerStatus } : p
    );

    writePartners(updatedPartners);
    return { ok: true, message: "Partner rejected successfully." };
  },

  async getPartnerReferrals(_partnerId?: string) {
    const referrals = readPartnerReferrals();
    const partners = readPartners();
    const partner = partners[0]; // Mock: assume first partner

    if (!partner) return [];

    // Generate some sample referrals if none exist
    if (referrals.length === 0) {
      const sampleReferrals: PartnerReferral[] = [
        {
          id: crypto.randomUUID(),
          partnerId: partner.id,
          referredEmail: "referral1@example.com",
          referredWorkspaceId: null,
          status: "converted",
          commissionAmount: 500,
          convertedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: crypto.randomUUID(),
          partnerId: partner.id,
          referredEmail: "referral2@example.com",
          referredWorkspaceId: null,
          status: "pending",
          commissionAmount: 0,
          convertedAt: null,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      writePartnerReferrals(sampleReferrals);
      return sampleReferrals;
    }

    return referrals.filter((r) => r.partnerId === partner.id);
  },

  async getPartnerPayouts(_partnerId?: string) {
    const payouts = readPartnerPayouts();
    const partners = readPartners();
    const partner = partners[0]; // Mock: assume first partner

    if (!partner) return [];

    // Generate some sample payouts if none exist
    if (payouts.length === 0) {
      const samplePayouts: PartnerPayout[] = [
        {
          id: crypto.randomUUID(),
          partnerId: partner.id,
          amount: 500,
          status: "completed",
          paymentMethod: "bank_transfer",
          paymentDetails: { accountNumber: "****1234" },
          notes: null,
          processedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      writePartnerPayouts(samplePayouts);
      return samplePayouts;
    }

    return payouts.filter((p) => p.partnerId === partner.id);
  },

  async requestPayout(
    amount: number,
    paymentMethod: string,
    paymentDetails: Record<string, unknown>
  ): Promise<ActionResult> {
    if (!Number.isFinite(amount) || amount <= 0) {
      return { ok: false, message: "Enter a valid payout amount." };
    }

    const partners = readPartners();
    const payouts = readPartnerPayouts();
    const partner = partners[0]; // Mock: assume first partner

    if (!partner) {
      return { ok: false, message: "No partner profile found." };
    }

    const newPayout: PartnerPayout = {
      id: crypto.randomUUID(),
      partnerId: partner.id,
      amount,
      status: "pending",
      paymentMethod,
      paymentDetails,
      notes: null,
      processedAt: null,
      createdAt: new Date().toISOString(),
    };

    writePartnerPayouts([newPayout, ...payouts]);
    return { ok: true, message: "Payout request submitted successfully." };
  },

  async updatePartnerCommission(partnerId: string, commissionRate: number): Promise<ActionResult> {
    if (!Number.isFinite(commissionRate) || commissionRate < 0 || commissionRate > 100) {
      return { ok: false, message: "Commission rate must be between 0 and 100." };
    }

    const partners = readPartners();
    const partner = partners.find((p) => p.id === partnerId);

    if (!partner) {
      return { ok: false, message: "Partner not found." };
    }

    const updatedPartners = partners.map((p) =>
      p.id === partnerId ? { ...p, commissionRate } : p
    );

    writePartners(updatedPartners);
    return { ok: true, message: "Commission rate updated successfully." };
  },
};

export interface AppApi {
  getAppState: () => Promise<AppState>;
  signIn: (email: string, password: string) => Promise<AppState>;
  signUp: (name: string, email: string, password: string) => Promise<AppState>;
  signOut: () => Promise<AppState>;
  completeOnboarding: () => Promise<AppState>;
  connectWhatsApp: (input: ConnectWhatsAppInput) => Promise<AppState>;
  disconnectWhatsApp: () => Promise<AppState>;
  addWalletFunds: (amount: number, source?: string) => Promise<{ state: AppState; result: ActionResult }>;
  addContact: (input: AddContactInput) => Promise<AppState>;
  uploadSampleContacts: () => Promise<AppState>;
  updateConversation: (input: UpdateConversationInput) => Promise<AppState>;
  addConversationNote: (input: AddConversationNoteInput) => Promise<AppState>;
  updateLead: (input: UpdateLeadInput) => Promise<AppState>;
  updateAutomation: (input: UpdateAutomationInput) => Promise<AppState>;
  runAutomationSweep: () => Promise<{ state: AppState; result: ActionResult }>;
  retryFailedSend: (input: RetryFailedSendInput) => Promise<{ state: AppState; result: ActionResult }>;
  createCampaign: (input: CreateCampaignInput) => Promise<{ state: AppState; result: ActionResult }>;
  // Partner system
  getPartners: () => Promise<Partner[]>;
  getPartnerDashboard: () => Promise<{ partner: Partner; stats: PartnerDashboardStats; referrals: PartnerReferral[]; payouts: PartnerPayout[] }>;
  applyAsPartner: (input: PartnerApplyInput) => Promise<ActionResult>;
  approvePartner: (partnerId: string) => Promise<ActionResult>;
  rejectPartner: (partnerId: string) => Promise<ActionResult>;
  getPartnerReferrals: (partnerId?: string) => Promise<PartnerReferral[]>;
  getPartnerPayouts: (partnerId?: string) => Promise<PartnerPayout[]>;
  requestPayout: (amount: number, paymentMethod: string, paymentDetails: Record<string, unknown>) => Promise<ActionResult>;
  updatePartnerCommission: (partnerId: string, commissionRate: number) => Promise<ActionResult>;
}

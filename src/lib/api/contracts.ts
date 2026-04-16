import type {
  ActionResult,
  AddContactInput,
  AppState,
  ConnectWhatsAppInput,
  CreateCampaignInput,
  User,
} from "@/lib/api/types";

export const apiRoutes = {
  session: "/session",
  signup: "/auth/signup",
  signout: "/auth/signout",
  onboarding: "/onboarding/complete",
  appState: "/app-state",
  whatsappConnect: "/whatsapp/connect",
  whatsappDisconnect: "/whatsapp/disconnect",
  walletTopup: "/wallet/top-up",
  contacts: "/contacts",
  contactsUpload: "/contacts/upload-sample",
  campaigns: "/campaigns",
  // Partner system
  partners: "/partners",
  partnerDashboard: "/partners/dashboard",
  partnerApply: "/partners/apply",
  partnerApprove: "/partners/:id/approve",
  partnerReject: "/partners/:id/reject",
  partnerCommission: "/partners/:id/commission",
  partnerReferrals: "/partners/referrals",
  partnerPayouts: "/partners/payouts",
  partnerPayoutRequest: "/partners/payouts/request",
  partnerPayoutProcess: "/partners/payouts/:id/process",
} as const;

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}

export interface WalletTopUpRequest {
  amount: number;
  source?: string;
}

export interface ApiStateResponse {
  data: AppState;
}

export interface ApiActionResponse {
  data: AppState;
  result: ActionResult;
}

export type SessionResponse = ApiStateResponse;
export type SignUpResponse = ApiStateResponse;
export type SignOutResponse = ApiStateResponse;
export type CompleteOnboardingResponse = ApiStateResponse;
export type GetAppStateResponse = ApiStateResponse;
export type ConnectWhatsAppRequest = ConnectWhatsAppInput;
export type ConnectWhatsAppResponse = ApiStateResponse;
export type DisconnectWhatsAppResponse = ApiStateResponse;
export type CreateContactRequest = AddContactInput;
export type CreateContactResponse = ApiStateResponse;
export type UploadContactsResponse = ApiStateResponse;
export type CreateCampaignRequest = CreateCampaignInput;
export type CreateCampaignResponse = ApiActionResponse;
export type WalletTopUpResponse = ApiActionResponse;

export interface BackendWorkspaceUser extends User {
  id: string;
  workspaceId: string;
}

export interface BackendWorkspace {
  id: string;
  name: string;
  plan: "starter" | "growth" | "enterprise";
  currency: "INR";
  createdAt: string;
}

export interface BackendWhatsAppConnectionRecord {
  id: string;
  workspaceId: string;
  metaBusinessId: string | null;
  metaBusinessPortfolioId: string | null;
  wabaId: string | null;
  phoneNumberId: string | null;
  displayPhoneNumber: string;
  verifiedName: string | null;
  businessName: string;
  businessPortfolio: string;
  status: "connected" | "disconnected" | "pending";
  businessVerificationStatus: "unverified" | "in_review" | "verified";
  accountReviewStatus: "pending_review" | "in_review" | "approved" | "rejected";
  obaStatus: "not_applied" | "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface BackendWalletTransactionRecord {
  id: string;
  workspaceId: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  referenceType: "manual_topup" | "campaign_send" | "adjustment";
  referenceId: string | null;
  balanceAfter: number;
  createdAt: string;
}

export interface BackendContactRecord {
  id: string;
  workspaceId: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface BackendContactTagRecord {
  id: string;
  workspaceId: string;
  contactId: string;
  tag: string;
}

export interface BackendTemplateRecord {
  id: string;
  workspaceId: string;
  name: string;
  category: "marketing" | "utility";
  status: "approved" | "pending" | "rejected";
  language: string;
  body: string;
  createdAt: string;
}

export interface BackendCampaignRecord {
  id: string;
  workspaceId: string;
  templateId: string;
  name: string;
  status: "draft" | "scheduled" | "sending" | "delivered";
  estimatedCost: number;
  spent: number;
  scheduledFor: string | null;
  launchedAt: string | null;
  createdAt: string;
}

export interface BackendCampaignRecipientRecord {
  id: string;
  workspaceId: string;
  campaignId: string;
  contactId: string;
  status: "queued" | "sent" | "delivered" | "failed";
  cost: number;
  createdAt: string;
}

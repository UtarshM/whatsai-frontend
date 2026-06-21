import {
  apiRoutes,
  type ApiActionResponse,
  type ApiStateResponse,
  type ConnectWhatsAppRequest,
  type CreateCampaignRequest,
  type CreateContactRequest,
  type SignInRequest,
  type SignUpRequest,
  type WalletTopUpRequest,
} from "@/lib/api/contracts";
import type {
  ActionResult,
  AddContactInput,
  AddConversationNoteInput,
  AppState,
  ConnectWhatsAppInput,
  CreateCampaignInput,
  CreateTemplateInput,
  Partner,
  PartnerApplyInput,
  PartnerPublicApplyInput,
  PartnerDashboardStats,
  PartnerPayout,
  PartnerReferral,
  RetryFailedSendInput,
  UpdateTemplateInput,
  UpdateAutomationInput,
  UpdateConversationInput,
  UpdateLeadInput,
  User,
  UserRole,
  Branding,
} from "@/lib/api/types";
import type { AppApi } from "@/lib/api/mockApi";

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface HttpApiOptions {
  baseUrl: string;
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorBody = (await response.json()) as { message?: string };
      if (errorBody.message) {
        message = errorBody.message;
      }
    } catch {
      // Ignore JSON parsing failures for non-JSON error bodies.
    }
    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

export function createHttpApi({ baseUrl }: HttpApiOptions): AppApi {
  const request = async <TResponse>(path: string, init?: RequestInit) => {
    const response = await fetch(`${baseUrl}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      ...init,
    });

    return parseJson<TResponse>(response);
  };

  const getState = async (path: string, init?: RequestInit) => {
    const response = await request<ApiStateResponse>(path, init);
    return response.data;
  };

  const getAction = async (path: string, init?: RequestInit) => {
    const response = await request<ApiActionResponse>(path, init);
    return {
      state: response.data,
      result: response.result,
    };
  };

  return {
    getAppState: () => getState(apiRoutes.appState),
    signIn: (email: string, password: string) =>
      getState(apiRoutes.session, {
        method: "POST",
        body: JSON.stringify({ email, password } satisfies SignInRequest),
      }),
    signUp: (name: string, email: string, password: string) =>
      getState(apiRoutes.signup, {
        method: "POST",
        body: JSON.stringify({ name, email, password } satisfies SignUpRequest),
      }),
    signOut: () =>
      getState(apiRoutes.signout, {
        method: "POST",
      }),
    completeOnboarding: () =>
      getState(apiRoutes.onboarding, {
        method: "POST",
      }),
    connectWhatsApp: (input: ConnectWhatsAppInput) =>
      getState(apiRoutes.whatsappConnect, {
        method: "POST",
        body: JSON.stringify(input satisfies ConnectWhatsAppRequest),
      }),
    disconnectWhatsApp: async () => {
      const response = await request<ApiStateResponse>(apiRoutes.whatsappDisconnect, {
        method: "POST",
      });
      return response.data;
    },
    addWalletFunds: (amount: number, source?: string) =>
      getAction(apiRoutes.walletTopup, {
        method: "POST",
        body: JSON.stringify({ amount, source } satisfies WalletTopUpRequest),
      }),
    addContact: (input: AddContactInput) =>
      getState(apiRoutes.contacts, {
        method: "POST",
        body: JSON.stringify(input satisfies CreateContactRequest),
      }),
    uploadSampleContacts: () =>
      getState(apiRoutes.contactsUpload, {
        method: "POST",
      }),
    createCampaign: (input: CreateCampaignInput) =>
      getAction(apiRoutes.campaigns, {
        method: "POST",
        body: JSON.stringify(input satisfies CreateCampaignRequest),
      }),
    createTemplate: (input: CreateTemplateInput) =>
      getState("/templates", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    updateTemplate: (input: UpdateTemplateInput) =>
      getState(`/templates/${input.id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    updateConversation: async (input: UpdateConversationInput) => {
      const { id, ...body } = input;
      await request<{ data: unknown }>(`/conversations/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      return await getState(apiRoutes.appState);
    },
    addConversationNote: async (input: AddConversationNoteInput) => {
      const { conversationId, ...body } = input;
      await request<{ data: unknown }>(`/conversations/${conversationId}/notes`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      return await getState(apiRoutes.appState);
    },
    updateLead: async (input: UpdateLeadInput) => {
      const { id, ...body } = input;
      if (body.status) {
        await request<{ data: unknown }>(`/leads/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: body.status }),
        });
      }
      if (body.assignedTo !== undefined) {
        await request<{ data: unknown }>(`/leads/${id}/assign`, {
          method: "POST",
          body: JSON.stringify({ userId: body.assignedTo }),
        });
      }
      if (body.notes) {
        await request<{ data: unknown }>(`/leads/${id}/notes`, {
          method: "POST",
          body: JSON.stringify({ body: body.notes }),
        });
      }
      return await getState(apiRoutes.appState);
    },
    updateAutomation: async (input: UpdateAutomationInput) => {
      await request<{ result: unknown }>("/automation/definitions", {
        method: "POST",
        body: JSON.stringify({
          ruleType: input.type,
          name: input.type,
          enabled: input.enabled,
          config: input.config,
        }),
      });
      return await getState(apiRoutes.appState);
    },
    runAutomationSweep: async () => {
      const response = await request<{ result: unknown }>("/automation/process-reminders", {
        method: "POST",
      });
      const state = await getState(apiRoutes.appState);
      return { state, result: { ok: true, message: String(response.result ?? "Sweep completed") } };
    },
    retryFailedSend: (input: RetryFailedSendInput) =>
      getAction("/ops/retry-failed-send", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    getPartners: () =>
      request<Partner[]>(apiRoutes.partners, {
        method: "GET",
      }),
    getPartnerDashboard: () =>
      request<{ partner: Partner; stats: PartnerDashboardStats; referrals: PartnerReferral[]; payouts: PartnerPayout[] }>(
        apiRoutes.partnerDashboard,
        { method: "GET" }
      ),
    applyAsPartner: (input: PartnerApplyInput) =>
      request<ActionResult>(apiRoutes.partnerApply, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    applyAsPublicPartner: (input: PartnerPublicApplyInput) =>
      request<ActionResult>(apiRoutes.partnerPublicApply, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    approvePartner: (partnerId: string) =>
      request<ActionResult>(apiRoutes.partnerApprove.replace(":id", partnerId), {
        method: "POST",
      }),
    rejectPartner: (partnerId: string) =>
      request<ActionResult>(apiRoutes.partnerReject.replace(":id", partnerId), {
        method: "POST",
      }),
    getPartnerReferrals: (_partnerId?: string) =>
      request<PartnerReferral[]>(apiRoutes.partnerReferrals, {
        method: "GET",
      }),
    getPartnerPayouts: (_partnerId?: string) =>
      request<PartnerPayout[]>(apiRoutes.partnerPayouts, {
        method: "GET",
      }),
    requestPayout: (amount: number, paymentMethod: string, paymentDetails: Record<string, unknown>) =>
      request<ActionResult>(apiRoutes.partnerPayoutRequest, {
        method: "POST",
        body: JSON.stringify({ amount, paymentMethod, paymentDetails }),
      }),
    updatePartnerCommission: (partnerId: string, commissionRate: number) =>
      request<ActionResult>(apiRoutes.partnerCommission.replace(":id", partnerId), {
        method: "PATCH",
        body: JSON.stringify({ commissionRate }),
      }),
    getUsers: () =>
      request<User[]>("/admin/users", {
        method: "GET"
      }),
    updateUserRole: (userId: string, role: UserRole) =>
      request<User>(`/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role })
      }),
    deleteUser: (userId: string) =>
      request<void>(`/admin/users/${userId}`, {
        method: "DELETE"
      }),
    getBranding: (ref: string) =>
      request<Branding | null>(`/branding/${ref}`, {
        method: "GET"
      }),
  };
}

export { ApiError };

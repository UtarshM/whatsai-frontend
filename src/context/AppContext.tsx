import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { activeApiAdapter, api } from "@/lib/api";
import {
  COST_PER_MESSAGE,
  LOW_BALANCE_THRESHOLD,
  type ActionResult,
  type AddConversationNoteInput,
  type AddContactInput,
  type AppState,
  type Campaign,
  type ConnectWhatsAppInput,
  type CreateCampaignInput,
  type PartnerApplyInput,
  type RetryFailedSendInput,
  type Template,
  type UpdateAutomationInput,
  type UpdateConversationInput,
  type UpdateLeadInput,
} from "@/lib/api";
import { defaultAppState } from "@/lib/api/mockData";
import { readAppState } from "@/lib/api/mockApi";
import { supabase } from "@/lib/supabase/client";

interface AppContextValue extends AppState {
  isAuthenticated: boolean;
  isHydrating: boolean;
  costPerMessage: number;
  lowBalanceThreshold: number;
  approvedTemplates: Template[];
  totalContacts: number;
  activeCampaigns: number;
  signIn: (email: string, password: string) => Promise<AppState>;
  signUp: (name: string, email: string, password: string) => Promise<AppState>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<AppState>;
  connectWhatsApp: (input: ConnectWhatsAppInput) => Promise<void>;
  disconnectWhatsApp: () => Promise<void>;
  addWalletFunds: (amount: number, source?: string) => Promise<ActionResult>;
  addContact: (input: AddContactInput) => Promise<void>;
  uploadSampleContacts: () => Promise<void>;
  updateConversation: (input: UpdateConversationInput) => Promise<void>;
  addConversationNote: (input: AddConversationNoteInput) => Promise<void>;
  updateLead: (input: UpdateLeadInput) => Promise<void>;
  updateAutomation: (input: UpdateAutomationInput) => Promise<void>;
  runAutomationSweep: () => Promise<ActionResult>;
  retryFailedSend: (input: RetryFailedSendInput) => Promise<ActionResult>;
  createCampaign: (input: CreateCampaignInput) => Promise<ActionResult>;
  refreshAppState: () => Promise<void>;
  applyAsPartner: (input: PartnerApplyInput) => Promise<ActionResult>;
  approvePartner: (partnerId: string) => Promise<ActionResult>;
  rejectPartner: (partnerId: string) => Promise<ActionResult>;
  requestPayout: (amount: number, paymentMethod: string, paymentDetails: Record<string, unknown>) => Promise<ActionResult>;
  updatePartnerCommission: (partnerId: string, commissionRate: number) => Promise<ActionResult>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => (
    activeApiAdapter === "mock" ? readAppState() ?? defaultAppState : defaultAppState
  ));
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const syncState = async () => {
      try {
        const nextState = await api.getAppState();
        if (isMounted) {
          setState(nextState);
        }
      } catch (error) {
        console.error("Failed to hydrate app state", error);
      } finally {
        if (isMounted) {
          setIsHydrating(false);
        }
      }
    };

    void syncState();

    if (activeApiAdapter === "supabase" && supabase) {
      const { data } = supabase.auth.onAuthStateChange(() => {
        void syncState();
      });

      return () => {
        isMounted = false;
        data.subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AppContextValue>(() => ({
    ...state,
    isAuthenticated: Boolean(state.user),
    isHydrating,
    costPerMessage: COST_PER_MESSAGE,
    lowBalanceThreshold: LOW_BALANCE_THRESHOLD,
    approvedTemplates: state.templates.filter((template) => template.status === "Approved"),
    totalContacts: state.contacts.length,
    activeCampaigns: state.campaigns.filter((campaign: Campaign) =>
      ["Scheduled", "Sending"].includes(campaign.status),
    ).length,
    signIn: async (email: string, password: string) => {
      const nextState = await api.signIn(email, password);
      setState(nextState);
      return nextState;
    },
    signUp: async (name: string, email: string, password: string) => {
      const nextState = await api.signUp(name, email, password);
      setState(nextState);
      return nextState;
    },
    signOut: async () => {
      const nextState = await api.signOut();
      setState(nextState);
    },
    completeOnboarding: async () => {
      const nextState = await api.completeOnboarding();
      setState(nextState);
      return nextState;
    },
    connectWhatsApp: async (input: ConnectWhatsAppInput) => {
      const nextState = await api.connectWhatsApp(input);
      setState(nextState);
    },
    disconnectWhatsApp: async () => {
      const nextState = await api.disconnectWhatsApp();
      setState(nextState);
    },
    addWalletFunds: async (amount: number, source?: string) => {
      const { state: nextState, result } = await api.addWalletFunds(amount, source);
      setState(nextState);
      return result;
    },
    addContact: async (input: AddContactInput) => {
      const nextState = await api.addContact(input);
      setState(nextState);
    },
    uploadSampleContacts: async () => {
      const nextState = await api.uploadSampleContacts();
      setState(nextState);
    },
    updateConversation: async (input: UpdateConversationInput) => {
      const nextState = await api.updateConversation(input);
      setState(nextState);
    },
    addConversationNote: async (input: AddConversationNoteInput) => {
      const nextState = await api.addConversationNote(input);
      setState(nextState);
    },
    updateLead: async (input: UpdateLeadInput) => {
      const nextState = await api.updateLead(input);
      setState(nextState);
    },
    updateAutomation: async (input: UpdateAutomationInput) => {
      const nextState = await api.updateAutomation(input);
      setState(nextState);
    },
    runAutomationSweep: async () => {
      const { state: nextState, result } = await api.runAutomationSweep();
      setState(nextState);
      return result;
    },
    retryFailedSend: async (input: RetryFailedSendInput) => {
      const { state: nextState, result } = await api.retryFailedSend(input);
      setState(nextState);
      return result;
    },
    createCampaign: async (input: CreateCampaignInput) => {
      const { state: nextState, result } = await api.createCampaign(input);
      setState(nextState);
      return result;
    },
    refreshAppState: async () => {
      const nextState = await api.getAppState();
      setState(nextState);
    },
    applyAsPartner: async (input: PartnerApplyInput) => {
      const result = await api.applyAsPartner(input);
      if (result.ok) {
        const nextState = await api.getAppState();
        setState(nextState);
      }
      return result;
    },
    approvePartner: async (partnerId: string) => {
      const result = await api.approvePartner(partnerId);
      if (result.ok) {
        const nextState = await api.getAppState();
        setState(nextState);
      }
      return result;
    },
    rejectPartner: async (partnerId: string) => {
      const result = await api.rejectPartner(partnerId);
      if (result.ok) {
        const nextState = await api.getAppState();
        setState(nextState);
      }
      return result;
    },
    requestPayout: async (amount: number, paymentMethod: string, paymentDetails: Record<string, unknown>) => {
      const result = await api.requestPayout(amount, paymentMethod, paymentDetails);
      if (result.ok) {
        const nextState = await api.getAppState();
        setState(nextState);
      }
      return result;
    },
    updatePartnerCommission: async (partnerId: string, commissionRate: number) => {
      const result = await api.updatePartnerCommission(partnerId, commissionRate);
      if (result.ok) {
        const nextState = await api.getAppState();
        setState(nextState);
      }
      return result;
    },
  }), [isHydrating, state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }

  return context;
}

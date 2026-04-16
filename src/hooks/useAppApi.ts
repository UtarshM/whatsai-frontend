import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  AddContactInput,
  ConnectWhatsAppInput,
  CreateCampaignInput,
  PartnerApplyInput,
} from "@/lib/api";

export const appStateQueryKey = ["app-state"] as const;

export function useAppStateQuery() {
  return useQuery({
    queryKey: appStateQueryKey,
    queryFn: () => api.getAppState(),
    staleTime: Infinity,
  });
}

export function useSignInMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => api.signIn(email, password),
    onSuccess: (state) => queryClient.setQueryData(appStateQueryKey, state),
  });
}

export function useSignUpMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) =>
      api.signUp(name, email, password),
    onSuccess: (state) => queryClient.setQueryData(appStateQueryKey, state),
  });
}

export function useConnectWhatsAppMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ConnectWhatsAppInput) => api.connectWhatsApp(input),
    onSuccess: (state) => queryClient.setQueryData(appStateQueryKey, state),
  });
}

export function useAddWalletFundsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ amount, source }: { amount: number; source?: string }) => api.addWalletFunds(amount, source),
    onSuccess: ({ state }) => queryClient.setQueryData(appStateQueryKey, state),
  });
}

export function useAddContactMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddContactInput) => api.addContact(input),
    onSuccess: (state) => queryClient.setQueryData(appStateQueryKey, state),
  });
}

export function useCreateCampaignMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCampaignInput) => api.createCampaign(input),
    onSuccess: ({ state }) => queryClient.setQueryData(appStateQueryKey, state),
  });
}

// Partner queries
export function usePartnersListQuery() {
  return useQuery({
    queryKey: ["partners-list"],
    queryFn: () => api.getPartners(),
    staleTime: 30_000,
  });
}

export function usePartnerDashboardQuery() {
  return useQuery({
    queryKey: ["partner-dashboard"],
    queryFn: () => api.getPartnerDashboard(),
    staleTime: 30_000,
  });
}

export function usePartnerReferralsQuery(partnerId?: string) {
  return useQuery({
    queryKey: ["partner-referrals", partnerId],
    queryFn: () => api.getPartnerReferrals(partnerId),
    staleTime: 30_000,
  });
}

export function usePartnerPayoutsQuery(partnerId?: string) {
  return useQuery({
    queryKey: ["partner-payouts", partnerId],
    queryFn: () => api.getPartnerPayouts(partnerId),
    staleTime: 30_000,
  });
}

// Partner mutations
export function useApplyAsPartnerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PartnerApplyInput) => api.applyAsPartner(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners-list"] });
      queryClient.invalidateQueries({ queryKey: ["partner-dashboard"] });
    },
  });
}

export function useApprovePartnerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (partnerId: string) => api.approvePartner(partnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners-list"] });
    },
  });
}

export function useRejectPartnerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (partnerId: string) => api.rejectPartner(partnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners-list"] });
    },
  });
}

export function useRequestPayoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ amount, paymentMethod, paymentDetails }: { amount: number; paymentMethod: string; paymentDetails: Record<string, unknown> }) =>
      api.requestPayout(amount, paymentMethod, paymentDetails),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["partner-payouts"] });
    },
  });
}

export function useUpdatePartnerCommissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ partnerId, commissionRate }: { partnerId: string; commissionRate: number }) =>
      api.updatePartnerCommission(partnerId, commissionRate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners-list"] });
    },
  });
}

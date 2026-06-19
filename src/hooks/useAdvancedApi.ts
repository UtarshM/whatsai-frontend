import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  advancedApi,
  type CreateLinkInput,
  type CreateSegmentInput,
  type SegmentFilter,
} from "@/lib/api/advanced";

// ── Segments ──────────────────────────────────────────────────
export const segmentsQueryKey = ["segments"] as const;

export function useSegmentsQuery() {
  return useQuery({
    queryKey: segmentsQueryKey,
    queryFn: () => advancedApi.listSegments(),
    staleTime: 15_000,
  });
}

export function useCreateSegmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSegmentInput) => advancedApi.createSegment(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: segmentsQueryKey }),
  });
}

export function useUpdateSegmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateSegmentInput> }) =>
      advancedApi.updateSegment(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: segmentsQueryKey }),
  });
}

export function useDeleteSegmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => advancedApi.deleteSegment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: segmentsQueryKey }),
  });
}

export function usePreviewSegmentMutation() {
  return useMutation({
    mutationFn: ({ filters, sampleSize }: { filters: SegmentFilter; sampleSize?: number }) =>
      advancedApi.previewSegment(filters, sampleSize),
  });
}

// ── Tracked links ─────────────────────────────────────────────
export const linksQueryKey = ["tracked-links"] as const;

export function useLinksQuery() {
  return useQuery({
    queryKey: linksQueryKey,
    queryFn: () => advancedApi.listLinks(),
    staleTime: 15_000,
  });
}

export function useCreateLinkMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLinkInput) => advancedApi.createLink(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: linksQueryKey }),
  });
}

export function useLinkAnalyticsQuery(id: string | null) {
  return useQuery({
    queryKey: ["link-analytics", id],
    queryFn: () => advancedApi.linkAnalytics(id as string),
    enabled: Boolean(id),
    staleTime: 10_000,
  });
}

// ── Campaign analytics ────────────────────────────────────────
export function useCampaignAnalyticsQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["campaign-analytics", id],
    queryFn: () => advancedApi.campaignAnalytics(id as string),
    enabled: Boolean(id),
    staleTime: 10_000,
  });
}

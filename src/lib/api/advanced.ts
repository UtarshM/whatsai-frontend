/**
 * Phase 2 — Advanced Campaigns API client.
 *
 * Surfaces the backend's segments / tracked-links / campaign-analytics modules
 * and the audience-aware campaign create. Mirrors the adapter selection in
 * `@/lib/api/index.ts`: when `VITE_API_ADAPTER=http` (+ a base URL) it talks to
 * the real backend; otherwise it runs a localStorage-backed mock so the pages
 * stay usable in the default demo mode without a server.
 */
import { activeApiAdapter } from "@/lib/api";
import { readAppState } from "@/lib/api/mockApi";
import { COST_PER_MESSAGE } from "@/lib/api/types";

// ============================================================================
// Types (shaped to the backend module responses)
// ============================================================================

export type SegmentMatch = "all" | "any";

export interface SegmentTagCondition {
  field: "tag";
  op: "hasAny" | "hasAll" | "hasNone";
  value: string[];
}
export interface SegmentOptInCondition {
  field: "optInStatus";
  op: "eq" | "in";
  value: string | string[];
}
export interface SegmentTextCondition {
  field: "name" | "email" | "phone";
  op: "contains" | "eq";
  value: string;
}
export interface SegmentDateCondition {
  field: "createdAt" | "lastMessageAt";
  op: "before" | "after" | "between" | "exists" | "missing";
  value?: string | [string, string];
}
export interface SegmentAttributeCondition {
  field: "attribute";
  key: string;
  op: "eq" | "contains" | "exists" | "missing";
  value?: string;
}

export type SegmentCondition =
  | SegmentTagCondition
  | SegmentOptInCondition
  | SegmentTextCondition
  | SegmentDateCondition
  | SegmentAttributeCondition;

export interface SegmentFilter {
  match: SegmentMatch;
  conditions: SegmentCondition[];
}

export interface Segment {
  id: string;
  workspaceId?: string;
  name: string;
  description: string | null;
  filters: SegmentFilter;
  contactCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SegmentSampleContact {
  id: string;
  name: string;
  phone: string;
  optInStatus?: string;
}

export interface SegmentPreview {
  total: number;
  sample: SegmentSampleContact[];
}

export interface CreateSegmentInput {
  name: string;
  description?: string;
  filters: SegmentFilter;
}

export interface TrackedLink {
  id: string;
  code: string;
  originalUrl: string;
  title: string | null;
  campaignId: string | null;
  clickCount: number;
  shortUrl: string;
  createdAt: string;
}

export interface CreateLinkInput {
  originalUrl: string;
  title?: string;
  code?: string;
  campaignId?: string;
}

export interface LinkClickRecord {
  contactId: string | null;
  ipAddress: string | null;
  clickedAt: string;
}

export interface LinkAnalytics {
  link: TrackedLink;
  totalClicks: number;
  uniqueClicks: number;
  timeline: { date: string; count: number }[];
  recentClicks: LinkClickRecord[];
}

export interface CampaignAnalytics {
  campaign: {
    id: string;
    name: string;
    status: string;
    spent: number;
    estimatedCost: number;
    launchedAt: string | null;
  };
  funnel: { total: number; queued: number; sent: number; delivered: number; failed: number };
  rates: { deliveryRate: number; sentRate: number; failureRate: number; clickThroughRate: number };
  clicks: { total: number; unique: number; linkCount: number };
  timeline: { date: string; count: number }[];
}

export interface RecurrenceInput {
  freq: "daily" | "weekly" | "monthly";
  interval: number;
  until?: string;
}

export interface RetargetInput {
  fromCampaignId: string;
  statuses?: Array<"queued" | "sent" | "delivered" | "failed">;
  clicked?: boolean;
}

export interface CreateAdvancedCampaignInput {
  name: string;
  templateId: string;
  parameters?: Record<string, string>;
  recipients?: Array<{ contactId: string; parameters?: Record<string, string> }>;
  segmentId?: string;
  retarget?: RetargetInput;
  scheduledFor?: string;
  recurrence?: RecurrenceInput;
  sendNow: boolean;
}

export interface AdvancedActionResult {
  ok: boolean;
  message: string;
}

// ============================================================================
// HTTP transport
// ============================================================================

const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || "";
const useHttp = activeApiAdapter === "http" && Boolean(baseUrl);

async function httpRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(message);
  }
  // Backend wraps payloads in `{ data: ... }`.
  const body = (await response.json()) as { data: T };
  return body.data;
}

// ============================================================================
// Mock store (localStorage) + a small client-side filter matcher
// ============================================================================

const SEGMENTS_KEY = "wabiz_segments";
const LINKS_KEY = "wabiz_tracked_links";
const CLICKS_KEY = "wabiz_link_clicks";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeJson(key: string, value: unknown) {
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value));
}

interface MockContact {
  id: string;
  name: string;
  phone: string;
  tags: string[];
}

/**
 * Best-effort client-side evaluation of a segment filter against the mock
 * contacts (which only carry id/name/phone/tags). Conditions over fields the
 * mock doesn't model (email, dates, attributes, opt-in) are treated as matches
 * so previews stay meaningful in demo mode.
 */
function matchesFilter(contact: MockContact, filter: SegmentFilter): boolean {
  const conditions = filter.conditions ?? [];
  if (conditions.length === 0) return true;

  const test = (c: SegmentCondition): boolean => {
    switch (c.field) {
      case "tag": {
        const tags = contact.tags.map((t) => t.toLowerCase());
        const wanted = c.value.map((v) => v.toLowerCase());
        if (c.op === "hasAny") return wanted.some((t) => tags.includes(t));
        if (c.op === "hasAll") return wanted.every((t) => tags.includes(t));
        return !wanted.some((t) => tags.includes(t)); // hasNone
      }
      case "name":
      case "phone": {
        const haystack = (c.field === "name" ? contact.name : contact.phone).toLowerCase();
        const needle = c.value.toLowerCase();
        return c.op === "eq" ? haystack === needle : haystack.includes(needle);
      }
      default:
        return true; // email / dates / attributes / opt-in not modelled in mock
    }
  };

  return filter.match === "any" ? conditions.some(test) : conditions.every(test);
}

function mockContacts(): MockContact[] {
  return (readAppState().contacts ?? []) as MockContact[];
}

function mockSegments(): Segment[] {
  return readJson<Segment[]>(SEGMENTS_KEY, []);
}

function withCounts(segments: Segment[]): Segment[] {
  const contacts = mockContacts();
  return segments.map((s) => ({
    ...s,
    contactCount: contacts.filter((c) => matchesFilter(c, s.filters)).length,
  }));
}

function shortUrlFor(code: string): string {
  const base = baseUrl || "http://localhost:3001";
  return `${base}/t/${code}?wid=demo`;
}

// ============================================================================
// Public API
// ============================================================================

export const advancedApi = {
  // ----- Segments ---------------------------------------------------------
  async listSegments(): Promise<{ total: number; segments: Segment[] }> {
    if (useHttp) return httpRequest("/segments");
    const segments = withCounts(mockSegments());
    return { total: segments.length, segments };
  },

  async previewSegment(filters: SegmentFilter, sampleSize = 10): Promise<SegmentPreview> {
    if (useHttp) {
      return httpRequest("/segments/preview", {
        method: "POST",
        body: JSON.stringify({ filters, sampleSize }),
      });
    }
    const matched = mockContacts().filter((c) => matchesFilter(c, filters));
    return {
      total: matched.length,
      sample: matched.slice(0, sampleSize).map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        optInStatus: "opt_in",
      })),
    };
  },

  async createSegment(input: CreateSegmentInput): Promise<Segment> {
    if (useHttp) {
      return httpRequest("/segments", { method: "POST", body: JSON.stringify(input) });
    }
    const segments = mockSegments();
    if (segments.some((s) => s.name.toLowerCase() === input.name.toLowerCase())) {
      throw new Error(`Segment "${input.name}" already exists`);
    }
    const segment: Segment = {
      id: crypto.randomUUID(),
      name: input.name,
      description: input.description ?? null,
      filters: input.filters,
      createdAt: new Date().toISOString(),
    };
    writeJson(SEGMENTS_KEY, [segment, ...segments]);
    return segment;
  },

  async updateSegment(id: string, input: Partial<CreateSegmentInput>): Promise<Segment> {
    if (useHttp) {
      return httpRequest(`/segments/${id}`, { method: "PATCH", body: JSON.stringify(input) });
    }
    const segments = mockSegments();
    const next = segments.map((s) =>
      s.id === id
        ? {
            ...s,
            name: input.name ?? s.name,
            description: input.description ?? s.description,
            filters: input.filters ?? s.filters,
            updatedAt: new Date().toISOString(),
          }
        : s,
    );
    writeJson(SEGMENTS_KEY, next);
    const updated = next.find((s) => s.id === id);
    if (!updated) throw new Error("Segment not found");
    return updated;
  },

  async deleteSegment(id: string): Promise<{ deleted: boolean }> {
    if (useHttp) return httpRequest(`/segments/${id}`, { method: "DELETE" });
    writeJson(SEGMENTS_KEY, mockSegments().filter((s) => s.id !== id));
    return { deleted: true };
  },

  /** Resolve a saved segment to the contact ids it currently matches (mock only). */
  resolveSegmentContactIdsLocal(id: string): string[] {
    const segment = mockSegments().find((s) => s.id === id);
    if (!segment) return [];
    return mockContacts()
      .filter((c) => matchesFilter(c, segment.filters))
      .map((c) => c.id);
  },

  // ----- Tracked links ----------------------------------------------------
  async listLinks(): Promise<{ total: number; links: TrackedLink[] }> {
    if (useHttp) return httpRequest("/links");
    const links = readJson<TrackedLink[]>(LINKS_KEY, []);
    return { total: links.length, links };
  },

  async createLink(input: CreateLinkInput): Promise<TrackedLink> {
    if (useHttp) {
      return httpRequest("/links", { method: "POST", body: JSON.stringify(input) });
    }
    const links = readJson<TrackedLink[]>(LINKS_KEY, []);
    const code = input.code?.trim() || Math.random().toString(36).slice(2, 9);
    if (links.some((l) => l.code === code)) throw new Error(`Link code "${code}" already in use`);
    const link: TrackedLink = {
      id: crypto.randomUUID(),
      code,
      originalUrl: input.originalUrl,
      title: input.title ?? null,
      campaignId: input.campaignId ?? null,
      clickCount: 0,
      shortUrl: shortUrlFor(code),
      createdAt: new Date().toISOString(),
    };
    writeJson(LINKS_KEY, [link, ...links]);
    return link;
  },

  async linkAnalytics(id: string): Promise<LinkAnalytics> {
    if (useHttp) return httpRequest(`/links/${id}/analytics`);
    const link = readJson<TrackedLink[]>(LINKS_KEY, []).find((l) => l.id === id);
    if (!link) throw new Error("Tracked link not found");
    const clicks = readJson<Record<string, LinkClickRecord[]>>(CLICKS_KEY, {})[link.code] ?? [];
    const byDay: Record<string, number> = {};
    for (const c of clicks) {
      const day = c.clickedAt.slice(0, 10);
      byDay[day] = (byDay[day] ?? 0) + 1;
    }
    const unique = new Set(clicks.map((c) => c.contactId ?? c.ipAddress ?? "anon")).size;
    return {
      link,
      totalClicks: clicks.length,
      uniqueClicks: unique,
      timeline: Object.entries(byDay)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      recentClicks: clicks.slice(0, 20),
    };
  },

  // ----- Campaign analytics ----------------------------------------------
  async campaignAnalytics(id: string): Promise<CampaignAnalytics> {
    if (useHttp) return httpRequest(`/campaigns/${id}/analytics`);
    // Synthesize a plausible funnel from the mock campaign.
    const campaign = readAppState().campaigns.find((c) => c.id === id);
    if (!campaign) throw new Error("Campaign not found");
    const total = campaign.contactIds.length;
    const failed = campaign.status === "Draft" ? 0 : Math.round(total * 0.05);
    const reached = campaign.status === "Draft" || campaign.status === "Scheduled" ? 0 : total - failed;
    const delivered = Math.round(reached * 0.9);
    const sent = reached - delivered;
    const queued = total - reached - failed;
    const rate = (n: number) => (total ? Number((n / total).toFixed(4)) : 0);
    return {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status.toLowerCase(),
        spent: campaign.spent,
        estimatedCost: campaign.estimatedCost,
        launchedAt: campaign.status === "Draft" ? null : campaign.date,
      },
      funnel: { total, queued, sent, delivered, failed },
      rates: {
        deliveryRate: rate(delivered),
        sentRate: rate(reached),
        failureRate: rate(failed),
        clickThroughRate: reached ? Number((Math.round(reached * 0.22) / reached).toFixed(4)) : 0,
      },
      clicks: { total: Math.round(reached * 0.3), unique: Math.round(reached * 0.22), linkCount: 1 },
      timeline: reached ? [{ date: campaign.date, count: reached }] : [],
    };
  },

  // ----- Campaign create (audience-aware) --------------------------------
  /**
   * Create a campaign with the new audience model. On the http adapter this
   * posts the exact backend shape (recipients | segmentId | retarget, plus
   * recurrence). The mock path is handled by the caller (it resolves the
   * audience to contactIds and uses the existing context.createCampaign), so
   * this method is only invoked when talking to the real backend.
   */
  async createCampaign(input: CreateAdvancedCampaignInput): Promise<AdvancedActionResult> {
    await httpRequest("/campaigns", { method: "POST", body: JSON.stringify(input) });
    return {
      ok: true,
      message: input.sendNow
        ? "Campaign launched successfully."
        : input.scheduledFor
          ? "Campaign scheduled successfully."
          : "Draft saved successfully.",
    };
  },

  isHttp: useHttp,
  costPerMessage: COST_PER_MESSAGE,
};

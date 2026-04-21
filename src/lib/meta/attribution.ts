import type { Lead } from "@/lib/api";
import type { MetaLeadSourceMapping } from "@/lib/meta/sourceMappings";

export interface MetaAttributionIds {
  pageId: string | null;
  adId: string | null;
  formId: string | null;
}

export function extractMetaAttributionIds(text: string): MetaAttributionIds {
  const read = (label: string) => {
    const match = text.match(new RegExp(`${label}:\\s*([^\\n•|]+)`));
    return match?.[1]?.trim() || null;
  };

  return {
    pageId: read("Page ID"),
    adId: read("Ad ID"),
    formId: read("Form ID"),
  };
}

export function matchLeadToMetaMapping(lead: Lead, mappings: MetaLeadSourceMapping[]) {
  const ids = extractMetaAttributionIds(`${lead.sourceLabel}\n${lead.notes}`);
  const match = mappings.find((mapping) => (
    (!!mapping.form_id && mapping.form_id === ids.formId) ||
    (!!mapping.ad_id && mapping.ad_id === ids.adId) ||
    (!!mapping.page_id && mapping.page_id === ids.pageId)
  )) ?? null;

  return {
    ids,
    mapping: match,
  };
}

export function summarizeMappedLeadStatuses(leads: Lead[]) {
  return {
    total: leads.length,
    qualified: leads.filter((lead) => lead.status === "Qualified" || lead.status === "Won").length,
    won: leads.filter((lead) => lead.status === "Won").length,
  };
}

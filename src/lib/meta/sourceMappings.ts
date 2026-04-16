export interface MetaLeadSourceMapping {
  id: string;
  label: string;
  page_id: string | null;
  ad_id: string | null;
  form_id: string | null;
  created_at: string;
}

async function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
  };
}

function getBaseUrl() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!baseUrl) {
    throw new Error("VITE_API_BASE_URL is required for Meta source mappings.");
  }
  return baseUrl;
}

export async function fetchMetaSourceMappings() {
  const response = await fetch(`${getBaseUrl()}/meta/source-mappings`, {
    headers: await getAuthHeaders(),
  });

  const payload = await response.json() as { data?: MetaLeadSourceMapping[]; message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "Failed to load Meta source mappings.");
  }

  return payload.data ?? [];
}

export async function createMetaSourceMapping(input: {
  label: string;
  pageId?: string;
  adId?: string;
  formId?: string;
}) {
  const response = await fetch(`${getBaseUrl()}/meta/source-mappings`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(input),
  });

  const payload = await response.json() as { data?: MetaLeadSourceMapping; message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "Failed to save Meta source mapping.");
  }

  return payload.data;
}

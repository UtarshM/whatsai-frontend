import type { ConnectWhatsAppInput } from "@/lib/api/types";

interface MetaExchangeResponse {
  data: {
    authorization: {
      accessToken: string;
      tokenType: string | null;
    };
    candidate: ConnectWhatsAppInput;
    raw: {
      businesses: Array<{ id: string; name?: string }>;
      whatsappBusinesses: Array<{ id: string; name?: string }>;
    };
  };
}

export async function exchangeMetaCodeWithServer(code: string) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (!baseUrl) {
    throw new Error("VITE_API_BASE_URL is required to exchange Meta authorization codes.");
  }

  const response = await fetch(`${baseUrl}/meta/exchange-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
      redirectUri: `${window.location.origin}/connect`,
    }),
  });

  const payload = await response.json() as MetaExchangeResponse & { message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "Failed to exchange Meta authorization code.");
  }

  return payload.data;
}

export async function sendMetaTemplateWithServer(input: {
  to: string;
  templateName: string;
  languageCode: string;
  bodyParameters?: string[];
}) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!baseUrl) {
    throw new Error("VITE_API_BASE_URL is required to send WhatsApp templates via the backend.");
  }

  const response = await fetch(`${baseUrl}/meta/send-template`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = await response.json() as { data?: unknown; message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "Failed to send WhatsApp template.");
  }

  return payload.data;
}

export async function sendMetaCampaignWithServer(input: {
  templateId: string;
  contactIds: string[];
  bodyParameters?: string[];
}) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!baseUrl) {
    throw new Error("VITE_API_BASE_URL is required to send WhatsApp campaigns via the backend.");
  }

  const response = await fetch(`${baseUrl}/meta/send-campaign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = await response.json() as { data?: unknown; message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "Failed to send WhatsApp campaign.");
  }

  return payload.data;
}

export async function sendMetaReplyWithServer(input: {
  conversationId: string;
  to: string;
  body: string;
}) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!baseUrl) {
    throw new Error("VITE_API_BASE_URL is required to send WhatsApp inbox replies.");
  }

  const response = await fetch(`${baseUrl}/meta/send-reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = await response.json() as { data?: unknown; message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "Failed to send WhatsApp inbox reply.");
  }

  return payload.data;
}

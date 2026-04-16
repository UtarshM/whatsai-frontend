import type { ActionResult } from "@/lib/api/types";

async function getServerContext() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!baseUrl) {
    throw new Error("VITE_API_BASE_URL is required for operational reliability actions.");
  }

  return {
    baseUrl,
    headers: {
      "Content-Type": "application/json",
    },
  };
}

export async function retryFailedSendWithServer(failedSendLogId: string) {
  const { baseUrl, headers } = await getServerContext();
  const response = await fetch(`${baseUrl}/ops/retry-failed-send`, {
    method: "POST",
    headers,
    body: JSON.stringify({ failedSendLogId }),
  });

  const payload = await response.json() as { result?: ActionResult; message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "Failed to retry the failed send.");
  }

  return payload.result ?? { ok: true, message: "Retry initiated." };
}

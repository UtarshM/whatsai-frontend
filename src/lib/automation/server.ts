async function getAuthHeaders() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!baseUrl) {
    throw new Error("VITE_API_BASE_URL is required for automation actions.");
  }

  return {
    baseUrl,
    headers: {
      "Content-Type": "application/json",
    },
  };
}

export async function triggerAutomationReminderSweep() {
  const { baseUrl, headers } = await getAuthHeaders();
  const response = await fetch(`${baseUrl}/automation/process-reminders`, {
    method: "POST",
    headers,
  });

  const payload = await response.json() as { result?: { ok: boolean; message: string }; message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "Failed to run automation reminder sweep.");
  }

  return payload.result ?? { ok: true, message: "Automation reminder sweep completed." };
}

export async function triggerAutomationLeadContacted(leadId: string) {
  const { baseUrl, headers } = await getAuthHeaders();
  const response = await fetch(`${baseUrl}/automation/lead-contacted`, {
    method: "POST",
    headers,
    body: JSON.stringify({ leadId }),
  });

  const payload = await response.json() as { result?: { ok: boolean; message: string }; message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "Failed to trigger contacted-lead automation.");
  }

  return payload.result ?? { ok: true, message: "Contacted-lead automation processed." };
}

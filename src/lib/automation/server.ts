import type { ActionResult, AutomationFlowDefinition, SaveAutomationFlowInput } from "@/lib/api";

async function getServerContext() {
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

async function parseJson<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({})) as T & { message?: string; error?: string };
  if (!response.ok) {
    throw new Error(payload.message || payload.error || "Automation request failed.");
  }
  return payload;
}

export async function triggerAutomationReminderSweep() {
  const { baseUrl, headers } = await getServerContext();
  const response = await fetch(`${baseUrl}/automation/process-reminders`, {
    method: "POST",
    headers,
    credentials: "include",
  });

  const payload = await parseJson<{ result?: ActionResult }>(response);
  return payload.result ?? { ok: true, message: "Automation reminder sweep completed." };
}

export async function triggerAutomationLeadContacted(leadId: string) {
  const { baseUrl, headers } = await getServerContext();
  const response = await fetch(`${baseUrl}/automation/lead-contacted`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify({ leadId }),
  });

  const payload = await parseJson<{ result?: ActionResult }>(response);
  return payload.result ?? { ok: true, message: "Contacted-lead automation processed." };
}

export async function fetchAutomationFlowDefinitions() {
  const { baseUrl, headers } = await getServerContext();
  const response = await fetch(`${baseUrl}/automation/definitions`, {
    headers,
    credentials: "include",
  });
  return parseJson<AutomationFlowDefinition[]>(response);
}

export async function saveAutomationFlowDefinition(input: SaveAutomationFlowInput) {
  const { baseUrl, headers } = await getServerContext();
  const response = await fetch(`${baseUrl}/automation/definitions`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify({
      id: input.id,
      name: input.name,
      description: input.description,
      nodes: input.nodes,
      edges: input.edges,
      is_active: input.isActive,
    }),
  });
  return parseJson<AutomationFlowDefinition>(response);
}

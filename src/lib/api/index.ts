import { createHttpApi } from "@/lib/api/httpApi";
import { mockApi } from "@/lib/api/mockApi";
import { supabaseApi } from "@/lib/api/supabaseApi";
import { hasSupabaseEnv } from "@/lib/supabase/client";

export { mockApi } from "@/lib/api/mockApi";
export { createHttpApi, ApiError } from "@/lib/api/httpApi";
export { supabaseApi } from "@/lib/api/supabaseApi";
export type { AppApi } from "@/lib/api/mockApi";
export * from "@/lib/api/contracts";
export * from "@/lib/api/types";

const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const adapter = import.meta.env.VITE_API_ADAPTER?.trim() || "mock";

export const activeApiAdapter = adapter;

export const api = adapter === "http" && baseUrl
  ? createHttpApi({ baseUrl })
  : adapter === "supabase" && hasSupabaseEnv
    ? supabaseApi
    : mockApi;

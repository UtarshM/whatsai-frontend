/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_ADAPTER?: "mock" | "http" | "supabase";
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SUPABASE_REDIRECT_URL?: string;
  readonly VITE_META_APP_ID?: string;
  readonly VITE_META_CONFIG_ID?: string;
  readonly VITE_META_API_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

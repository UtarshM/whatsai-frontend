export interface MetaEmbeddedSignupConfig {
  appId: string;
  configId: string;
  apiVersion: string;
}

export function getMetaEmbeddedSignupConfig(): MetaEmbeddedSignupConfig | null {
  const appId = import.meta.env.VITE_META_APP_ID?.trim();
  const configId = import.meta.env.VITE_META_CONFIG_ID?.trim();
  const apiVersion = import.meta.env.VITE_META_API_VERSION?.trim() || "v22.0";

  if (!appId || !configId) {
    return null;
  }

  return {
    appId,
    configId,
    apiVersion,
  };
}

export const hasMetaEmbeddedSignupConfig = Boolean(getMetaEmbeddedSignupConfig());

export function buildMetaEmbeddedSignupUrl(state?: string) {
  const config = getMetaEmbeddedSignupConfig();

  if (!config) {
    return null;
  }

  const redirectUri = `${window.location.origin}/connect`;
  const params = new URLSearchParams({
    client_id: config.appId,
    config_id: config.configId,
    response_type: "code",
    override_default_response_type: "true",
    redirect_uri: redirectUri,
  });

  if (state) {
    params.set("state", state);
  }

  return `https://www.facebook.com/${config.apiVersion}/dialog/oauth?${params.toString()}`;
}

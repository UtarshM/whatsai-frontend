export function getAuthErrorMessage(error: unknown, fallback: string) {
  const message = extractErrorMessage(error).trim();

  if (!message) {
    return fallback;
  }

  if (/only request this after/i.test(message)) {
    return message;
  }

  if (/email not confirmed/i.test(message)) {
    return "Your email is not confirmed yet. Check your inbox, or disable email confirmation in Supabase while testing.";
  }

  if (/email confirmation is required/i.test(message)) {
    return "Your account was created, but Supabase requires email confirmation before sign-in. Check your inbox, then log in after confirming.";
  }

  if (/invalid login credentials/i.test(message)) {
    return "The email or password is incorrect.";
  }

  if (/user already registered/i.test(message)) {
    return "This email is already registered. Try signing in instead.";
  }

  if (/permission denied/i.test(message) || /row-level security/i.test(message)) {
    return "Supabase blocked the workspace query. This usually means a missing policy or incomplete SQL setup.";
  }

  if (/workspace_members/i.test(message) || /profiles/i.test(message)) {
    return "Your auth worked, but the workspace profile setup is incomplete in Supabase.";
  }

  if (/conversations/i.test(message) || /conversation_messages/i.test(message) || /leads/i.test(message)) {
    return "The new CRM tables are not fully set up in Supabase yet. Run the latest upgrade SQL and try again.";
  }

  return message || fallback;
}

function extractErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const message = "message" in error && typeof error.message === "string" ? error.message : "";
    const details = "details" in error && typeof error.details === "string" ? error.details : "";
    const hint = "hint" in error && typeof error.hint === "string" ? error.hint : "";
    const code = "code" in error && typeof error.code === "string" ? error.code : "";

    return [message, details, hint, code].filter(Boolean).join(" ");
  }

  return "";
}

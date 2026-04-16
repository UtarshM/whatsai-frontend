import type {
  WhatsAppAccountReviewStatus,
  WhatsAppAuthorizationStatus,
  WhatsAppBusinessVerificationStatus,
  WhatsAppConnectionStatus,
  WhatsAppObaStatus,
} from "@/lib/api/types";

export function getConnectionStatusLabel(status: WhatsAppConnectionStatus) {
  switch (status) {
    case "connected":
      return "Connected";
    case "disconnected":
      return "Disconnected";
    default:
      return "Pending";
  }
}

export function getBusinessVerificationLabel(status: WhatsAppBusinessVerificationStatus) {
  switch (status) {
    case "verified":
      return "Business verified";
    case "in_review":
      return "Verification in review";
    default:
      return "Business unverified";
  }
}

export function getAccountReviewLabel(status: WhatsAppAccountReviewStatus) {
  switch (status) {
    case "approved":
      return "Account review approved";
    case "in_review":
      return "Account review in progress";
    case "rejected":
      return "Account review rejected";
    default:
      return "Account review pending";
  }
}

export function getObaStatusLabel(status: WhatsAppObaStatus) {
  switch (status) {
    case "approved":
      return "Official Business Account";
    case "pending":
      return "Green tick under review";
    case "rejected":
      return "Green tick rejected";
    default:
      return "No green tick";
  }
}

export function getAuthorizationStatusLabel(status: WhatsAppAuthorizationStatus) {
  switch (status) {
    case "active":
      return "Authorization active";
    case "expiring_soon":
      return "Authorization expiring soon";
    case "expired":
      return "Authorization expired";
    default:
      return "Authorization missing";
  }
}

export function getStatusTone(status: string) {
  if (status === "connected" || status === "verified" || status === "approved" || status === "active") {
    return "bg-success/10 text-success";
  }

  if (status === "pending" || status === "in_review" || status === "pending_review" || status === "expiring_soon") {
    return "bg-warning/10 text-warning";
  }

  if (status === "rejected" || status === "disconnected" || status === "expired" || status === "missing") {
    return "bg-destructive/10 text-destructive";
  }

  return "bg-muted text-muted-foreground";
}

export const defaultSupabaseTemplates = [
  {
    name: "Order Confirmation",
    category: "utility",
    status: "approved",
    language: "English",
    body: "Hi {{1}}, your order #{{2}} has been confirmed! Track here: {{3}}",
  },
  {
    name: "Diwali Sale Offer",
    category: "marketing",
    status: "approved",
    language: "English",
    body: "Diwali Sale is LIVE! Get up to {{1}}% off on all products. Shop now: {{2}}",
  },
  {
    name: "Cart Reminder",
    category: "marketing",
    status: "pending",
    language: "English",
    body: "Hey {{1}}, you left items in your cart! Complete your purchase before they sell out.",
  },
  {
    name: "Shipping Update",
    category: "utility",
    status: "approved",
    language: "Hindi",
    body: "Hi {{1}}, your order has been shipped! Delivery by {{2}}. Track: {{3}}",
  },
] as const;

export const defaultSupabaseSampleContacts = [
  { name: "Kunal Mehta", phone: "+91 99887 77665", tags: ["CSV", "Shopify"] },
  { name: "Neha Kapoor", phone: "+91 90909 80808", tags: ["CSV", "VIP"] },
  { name: "Ritesh Jain", phone: "+91 93456 78123", tags: ["CSV", "Retail"] },
] as const;

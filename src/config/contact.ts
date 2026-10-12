// Topics offered by the contact form (stored with each message).
export const CONTACT_TOPICS = [
  "General question",
  "Product question",
  "Product sheet or user manual",
  "Inspection or other services",
  "Question about an order",
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];

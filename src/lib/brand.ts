/**
 * Centralised Kredix brand configuration.
 * All product name, tagline, colour, and link references should flow through this file
 * rather than being hard-coded across the app.
 */

export const brand = {
  name: "Kredix",
  legalName: "Kredix",
  domain: "kredix.ng",
  url: "https://kredix.ng",
  tagline: "Sell. Get paid. Grow.",
  primaryMessage: "Every sale you make builds your credit.",
  supportingMessage: "Open for business in minutes.",
  description:
    "Kredix helps Nigerian SMEs digitise their operations, organise financial records, understand performance, demonstrate financial credibility, and discover relevant financing opportunities.",
  principles: [
    {
      key: "digitise",
      title: "Digitise",
      copy: "Bring business information, products, sales, and essential operational records into one place.",
    },
    {
      key: "understand",
      title: "Understand",
      copy: "Transform recorded business activity into meaningful financial insights and reports.",
    },
    {
      key: "demonstrate",
      title: "Demonstrate",
      copy: "Build a clearer, evidence-backed picture of a business's financial health.",
    },
    {
      key: "connect",
      title: "Connect",
      copy: "Help businesses explore relevant financing opportunities and share authorised financial information with appropriate parties.",
    },
  ],
  social: {
    whatsappBusinessNumber: null as string | null,
    instagram: null as string | null,
    twitter: null as string | null,
  },
  logo: {
    wordmark: "/brand/kredix-wordmark.svg",
  },
  contact: {
    supportEmail: "support@kredix.ng",
  },
  legal: {
    disclaimer:
      "Kredix is not a lender. The Business Health Score and Financial Passport are informational tools, not a guarantee of credit approval, a regulated credit score, or a lending decision.",
  },
} as const;

export type Brand = typeof brand;

/** Semantic design tokens used across Tailwind config + CSS variables. See globals.css. */
export const colors = {
  deepViolet: "#4B1FA3",
  primaryViolet: "#5725B5",
  darkPlum: "#1C0B35",
  electricMint: "#27E3A6",
  white: "#FFFFFF",
  softLavender: "#BDA4FF",
  mutedLavenderText: "#D9CDEE",
  darkBackground: "#120A20",
} as const;

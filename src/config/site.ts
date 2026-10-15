/**
 * Everything Stack — site configuration.
 *
 * The `everything-stack` agent skill rewrites this file from your answers
 * (product name, pitch, features, plans). Edit it freely by hand too.
 */
export const site = {
  name: "Everything Stack",
  tagline: "Ship the whole SaaS, not the boilerplate.",
  description:
    "A production-grade starter with marketing site, auth, database, billing, analytics and an admin dashboard — provisioned by an AI agent in one go.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  supportEmail: "hello@example.com",
  features: [
    {
      title: "Auth that's already wired",
      body: "Sign-up, sign-in, sessions and user profiles out of the box, synced to your database.",
      icon: "shield",
    },
    {
      title: "Realtime database",
      body: "Type-safe queries and mutations that update every open tab instantly.",
      icon: "database",
    },
    {
      title: "Billing in test mode",
      body: "Plans, checkout, customer portal and webhooks — demo mode works before you connect a provider.",
      icon: "credit-card",
    },
    {
      title: "Analytics built in",
      body: "Cookie-less first-party analytics feed the admin dashboard from minute one.",
      icon: "chart",
    },
    {
      title: "Admin dashboard",
      body: "Users, roles, subscriptions, revenue and traffic in one place.",
      icon: "layout",
    },
    {
      title: "Agent-native",
      body: "Ships with skills, MCP servers and prompts so coding agents know exactly what to do.",
      icon: "sparkles",
    },
  ],
  faq: [
    {
      q: "Do I need accounts with every provider to try it?",
      a: "No. Auth runs on an accountless development app, the database runs locally, and billing starts in demo mode. Claim or connect real accounts when you're ready.",
    },
    {
      q: "Can I swap providers later?",
      a: "Yes. Each layer sits behind a small adapter and has its own agent skill describing how to switch.",
    },
    {
      q: "Where does it deploy?",
      a: "Vercel or Cloudflare, provisioned through Stripe Projects so credentials land in your environment automatically.",
    },
  ],
} as const;

export type Plan = {
  id: "free" | "pro" | "team";
  name: string;
  priceCents: number;
  currency: "usd" | "eur";
  interval: "month";
  blurb: string;
  features: string[];
  highlighted?: boolean;
};

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceCents: 0,
    currency: "usd",
    interval: "month",
    blurb: "Everything you need to kick the tyres.",
    features: ["Up to 5 items", "Community support", "Realtime sync"],
  },
  {
    id: "pro",
    name: "Pro",
    priceCents: 1900,
    currency: "usd",
    interval: "month",
    blurb: "For makers shipping real products.",
    features: ["Unlimited items", "Priority support", "All integrations"],
    highlighted: true,
  },
  {
    id: "team",
    name: "Team",
    priceCents: 4900,
    currency: "usd",
    interval: "month",
    blurb: "Collaborate with your whole crew.",
    features: ["Everything in Pro", "Team roles", "Audit-friendly admin"],
  },
];

export function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

import type { NextConfig } from "next";

// Kredix is a fully dynamic, session-authenticated app (dashboard, lender portal, admin,
// public storefronts) — Next.js 16's experimental Cache Components prerendering model adds
// friction without benefit here, so it is disabled in favour of standard per-request rendering.
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

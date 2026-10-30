import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const authEmulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST?.trim();
const authEmulatorUrl = authEmulatorHost
  ? (authEmulatorHost.startsWith("http://") ||
    authEmulatorHost.startsWith("https://")
      ? authEmulatorHost
      : `http://${authEmulatorHost}`
    ).replace(/\/$/, "")
  : undefined;

// Baseline response headers from the Next.js `headers` guide. No full CSP yet:
// Firebase Auth popups and the Google sign-in flow need a nonce-based policy.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async rewrites() {
    if (process.env.NODE_ENV !== "development" || !authEmulatorUrl) {
      return [];
    }

    return [
      {
        source: "/emulator/auth/:path*",
        destination: `${authEmulatorUrl}/emulator/auth/:path*`,
      },
      {
        source: "/identitytoolkit.googleapis.com/:path*",
        destination: `${authEmulatorUrl}/identitytoolkit.googleapis.com/:path*`,
      },
      {
        source: "/securetoken.googleapis.com/:path*",
        destination: `${authEmulatorUrl}/securetoken.googleapis.com/:path*`,
      },
    ];
  },
  typescript: {
    tsconfigPath: "tsconfig.build.json",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withNextIntl(nextConfig);

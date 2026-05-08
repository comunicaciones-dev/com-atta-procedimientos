import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // playwright-core y @sparticuz/chromium son binarios nativos: deben
  // resolverse desde node_modules en runtime, no bundlearse via webpack.
  serverExternalPackages: ["playwright-core", "@sparticuz/chromium"],
};

export default nextConfig;

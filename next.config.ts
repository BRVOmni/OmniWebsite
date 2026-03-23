import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security: ESLint and TypeScript checks enabled for production builds
  // This helps catch potential security issues and bugs before deployment
  eslint: {
    // Allow any types but catch other security issues
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Enable type checking to catch potential issues
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

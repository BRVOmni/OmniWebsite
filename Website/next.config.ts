import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

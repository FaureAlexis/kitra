import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Temporarily disable type checking during build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

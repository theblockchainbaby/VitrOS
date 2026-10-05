import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Keep production releases subject to the same type checks as local verification.
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

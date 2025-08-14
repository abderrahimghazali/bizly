import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Allow build to pass even if there are TypeScript errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

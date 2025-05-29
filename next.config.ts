import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['zfloos-production-storage.s3.eu-central-1.amazonaws.com'],
  },
};

export default nextConfig;

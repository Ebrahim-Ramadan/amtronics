import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    minimumCacheTTL: 2678400, // 31 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'zfloos-production-storage.s3.eu-central-1.amazonaws.com',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;

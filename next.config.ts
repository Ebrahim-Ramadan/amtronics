import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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

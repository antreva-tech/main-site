import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      /** Allow logo uploads up to 2MB; multipart overhead needs extra headroom. Redeploy required for change to apply. */
      bodySizeLimit: 3 * 1024 * 1024, // 3 MiB
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [384, 640, 750, 828, 1080, 1200],
    imageSizes: [96, 128, 176, 256, 384, 448],
    qualities: [75, 80, 82],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;

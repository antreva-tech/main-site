import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [384, 640, 750, 828, 1080, 1200],
    imageSizes: [96, 128, 176, 256, 384, 448],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;

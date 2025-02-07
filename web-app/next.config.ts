import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": require("path").resolve(__dirname, "src"),
    };
    return config;
  },
  env: {
    APP_BASE_URL: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
  },
};

module.exports = nextConfig;

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
    AUTH0_BASE_URL:
      process.env.AUTH0_BASE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"),
  },
};

module.exports = nextConfig;

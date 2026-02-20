// next.config.ts
import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // You can add other Next.js config options here if you have any
  // Example:
  // images: { domains: ['example.com'] },
  // reactStrictMode: true,
  turbopack: {},
};

export default withSerwist(nextConfig);
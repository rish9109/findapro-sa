// next.config.ts
import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",       // ← this is the fix: use "src/app/sw.ts"
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development", // good to keep
});

const nextConfig: NextConfig = {
  // add any other config here if you have
};

export default withSerwist(nextConfig);
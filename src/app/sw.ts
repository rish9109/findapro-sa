// app/sw.ts
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,      // ← auto-activate new version
  clientsClaim: true,     // ← immediately take control
  navigationPreload: true,
  runtimeCaching: defaultCache,   // smart "cache everything" + stale-while-revalidate
});

serwist.addEventListeners();
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Gives `next dev` the same D1 binding that the deployed Worker receives.
initOpenNextCloudflareForDev({ configPath: "./freebuff.wrangler.jsonc" });

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow the cloud preview hostname to request dev assets/HMR from this VM.
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "pv-b6c80bd45c28-367b0581-2e43-4bcf-bcd0-c326ec378083.style.dev",
  ],
};

export default nextConfig;

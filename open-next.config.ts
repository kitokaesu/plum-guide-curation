import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Minimal OpenNext configuration.
 *
 * Every page in this app is `force-dynamic`, so no incremental cache, tag cache
 * or revalidation queue is required to serve it correctly.
 */
export default defineCloudflareConfig({});

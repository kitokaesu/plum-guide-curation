import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * The subset of the Cloudflare D1 API this app uses. Declaring it locally keeps
 * the Worker types out of the app bundle while still type-checking every query.
 */
export type D1Meta = {
  changes: number;
  last_row_id?: number;
};

export type D1Result<T = Record<string, unknown>> = {
  results?: T[];
  success: boolean;
  meta: D1Meta;
};

export type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(column?: string): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
};

export type D1Database = {
  prepare(query: string): D1PreparedStatement;
  batch<T = Record<string, unknown>>(
    statements: D1PreparedStatement[]
  ): Promise<D1Result<T>[]>;
};

/**
 * Resolves the D1 binding for the current request. The binding is provided by
 * the Sites platform (or by Wrangler's local emulation during `next dev`), so
 * it is only available inside a request, never at module load time.
 */
export async function getD1(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  const db = (env as unknown as { DB?: D1Database }).DB;
  if (!db) {
    throw new Error(
      "The D1 database binding (DB) is not available. Run the app through Wrangler or deploy it to Freebuff Sites."
    );
  }
  return db;
}

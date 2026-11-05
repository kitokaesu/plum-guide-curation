import "server-only";

import type { PrismaClient as PrismaClientClass } from "@prisma/client";
// Imported by file path: the package's `import` condition points at a missing
// ESM shim, while the CommonJS file is the WASM-backed client we need inside a
// Worker (Prisma's node entry tries to read the query compiler from disk).
import prismaWasmModule from "@prisma/client/wasm.js";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getD1 } from "./d1";
import { ensureDatabase } from "./d1-bootstrap";

type PrismaClientConstructor = new (
  options: ConstructorParameters<typeof PrismaClientClass>[0]
) => PrismaClientClass;

const PrismaClient = (
  prismaWasmModule as unknown as { PrismaClient: PrismaClientConstructor }
).PrismaClient;

/**
 * Prisma talks to the Cloudflare D1 binding through its driver adapter. The
 * binding only exists inside a request, so the client is created lazily on the
 * first query and reused for the lifetime of the Worker isolate.
 */
let ready: Promise<PrismaClientClass> | null = null;

function getClient(): Promise<PrismaClientClass> {
  if (!ready) {
    ready = createClient().catch((error) => {
      ready = null;
      throw error;
    });
  }
  return ready;
}

async function createClient() {
  const db = await getD1();
  await ensureDatabase(db);
  const adapter = new PrismaD1(
    db as unknown as ConstructorParameters<typeof PrismaD1>[0]
  );

  // `next dev` runs in Node, where Prisma's Node client can read the query
  // compiler from node_modules. The deployed Worker must use the WASM client.
  const Client =
    process.env.NODE_ENV === "development"
      ? ((await import("@prisma/client")).PrismaClient as PrismaClientConstructor)
      : PrismaClient;

  return new Client({ adapter });
}

function lazyModel(model: string) {
  return new Proxy(
    {},
    {
      get(_target, method) {
        if (typeof method !== "string") return undefined;
        return (...args: unknown[]) =>
          getClient().then(
            (client) =>
              (
                client as unknown as Record<
                  string,
                  Record<string, (...params: unknown[]) => unknown>
                >
              )[model][method](...args)
          );
      },
    }
  );
}

/**
 * Behaves like a `PrismaClient` at every call site, but resolves the D1 binding
 * and bootstraps the database on first use instead of at module load.
 */
export const prisma: PrismaClientClass = new Proxy({} as PrismaClientClass, {
  get(_target, property) {
    if (property === "then" || typeof property !== "string") return undefined;
    if (property.startsWith("$")) {
      return (...args: unknown[]) =>
        getClient().then(
          (client) =>
            (
              client as unknown as Record<
                string,
                (...params: unknown[]) => unknown
              >
            )[property](...args)
        );
    }
    return lazyModel(property);
  },
});

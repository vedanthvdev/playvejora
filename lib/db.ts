export type SqlStatement = {
  bind(...values: unknown[]): SqlStatement;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
};

export type SqlDatabase = {
  prepare(sql: string): SqlStatement;
};

let injected: SqlDatabase | null = null;

/** Tests supply a SQLite-backed stand-in so they do not need the Workers runtime. */
export function useDatabase(db: SqlDatabase | null): void {
  injected = db;
}

export async function getDatabase(): Promise<SqlDatabase> {
  if (injected) {
    return injected;
  }
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const { env } = await getCloudflareContext({ async: true });
  const db = (env as unknown as { DB?: SqlDatabase }).DB;
  if (!db) {
    throw new Error("The D1 binding DB is missing. Check wrangler.jsonc.");
  }
  return db;
}

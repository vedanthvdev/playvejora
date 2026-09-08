import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import type { SqlDatabase, SqlStatement } from "@/lib/db";

/**
 * A D1-shaped database backed by in-memory SQLite, for tests that should not
 * need the Workers runtime. It loads the same migration D1 runs, so a schema
 * change that is not migrated fails the suite rather than production.
 */
export function createTestDatabase(): SqlDatabase & { close(): void } {
  const sqlite = new Database(":memory:");
  const migrations = path.join(process.cwd(), "migrations");
  for (const file of fs.readdirSync(migrations).sort()) {
    sqlite.exec(fs.readFileSync(path.join(migrations, file), "utf8"));
  }

  function statement(sql: string, values: unknown[]): SqlStatement {
    return {
      bind: (...next: unknown[]) => statement(sql, next),
      async first<T>() {
        return (sqlite.prepare(sql).get(...values) as T | undefined) ?? null;
      },
      async all<T>() {
        return { results: sqlite.prepare(sql).all(...values) as T[] };
      },
      async run() {
        return sqlite.prepare(sql).run(...values);
      },
    };
  }

  return {
    prepare: (sql: string) => statement(sql, []),
    close: () => sqlite.close(),
  };
}

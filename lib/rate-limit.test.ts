import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useDatabase } from "@/lib/db";
import {
  ADMIN_LOGIN_POLICY,
  adminLoginBucket,
  clearRateLimit,
  clientIp,
  consumeRateLimit,
  registerBucket,
  retryHint,
} from "@/lib/rate-limit";
import { createTestDatabase } from "@/lib/test-db";

const POLICY = { limit: 3, windowMs: 60_000 };
const START = 1_700_000_000_000;

describe("rate limit", () => {
  let db: ReturnType<typeof createTestDatabase>;

  beforeEach(() => {
    db = createTestDatabase();
    useDatabase(db);
  });

  afterEach(() => {
    useDatabase(null);
    db.close();
  });

  it("allows attempts up to the limit and then blocks with a retry time", async () => {
    for (let attempt = 1; attempt <= POLICY.limit; attempt += 1) {
      const verdict = await consumeRateLimit("login:1.2.3.4", POLICY, START);
      expect(verdict.allowed).toBe(true);
    }

    const blocked = await consumeRateLimit("login:1.2.3.4", POLICY, START);
    expect(blocked).toEqual({ allowed: false, retryAfterSeconds: 60 });
  });

  it("lets the caller back in once the window has passed", async () => {
    for (let attempt = 1; attempt <= POLICY.limit; attempt += 1) {
      await consumeRateLimit("login:1.2.3.4", POLICY, START);
    }
    expect(
      (await consumeRateLimit("login:1.2.3.4", POLICY, START + 30_000)).allowed,
    ).toBe(false);
    expect(
      (await consumeRateLimit("login:1.2.3.4", POLICY, START + 61_000)).allowed,
    ).toBe(true);
  });

  it("counts each bucket separately", async () => {
    for (let attempt = 1; attempt <= POLICY.limit; attempt += 1) {
      await consumeRateLimit(adminLoginBucket("1.2.3.4"), POLICY, START);
    }
    expect(
      (await consumeRateLimit(adminLoginBucket("1.2.3.4"), POLICY, START)).allowed,
    ).toBe(false);
    expect(
      (await consumeRateLimit(adminLoginBucket("5.6.7.8"), POLICY, START)).allowed,
    ).toBe(true);
    expect(
      (await consumeRateLimit(registerBucket("1.2.3.4"), POLICY, START)).allowed,
    ).toBe(true);
  });

  it("clears a bucket so a caller starts fresh", async () => {
    for (let attempt = 1; attempt <= POLICY.limit; attempt += 1) {
      await consumeRateLimit("login:1.2.3.4", POLICY, START);
    }
    await clearRateLimit("login:1.2.3.4");
    expect((await consumeRateLimit("login:1.2.3.4", POLICY, START)).allowed).toBe(
      true,
    );
  });

  it("keeps the shipped admin login policy tight enough to stop guessing", () => {
    expect(ADMIN_LOGIN_POLICY.limit).toBeLessThanOrEqual(10);
    expect(retryHint(600)).toBe("10 minutes");
    expect(retryHint(30)).toBe("a minute");
  });
});

describe("client ip", () => {
  function headers(values: Record<string, string>) {
    return { get: (name: string) => values[name] ?? null };
  }

  it("prefers the Cloudflare header, then the forwarded chain", () => {
    expect(clientIp(headers({ "cf-connecting-ip": "203.0.113.5" }))).toBe(
      "203.0.113.5",
    );
    expect(
      clientIp(headers({ "x-forwarded-for": "203.0.113.9, 70.41.3.18" })),
    ).toBe("203.0.113.9");
  });

  it("puts unattributable requests in one shared bucket", () => {
    expect(clientIp(headers({}))).toBe("unknown");
    expect(clientIp(headers({ "x-forwarded-for": "  " }))).toBe("unknown");
  });
});

import { getDatabase } from "@/lib/db";

export type RateLimitPolicy = {
  limit: number;
  windowMs: number;
};

export type RateLimitVerdict =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

const MINUTE = 60_000;

export const ADMIN_LOGIN_POLICY: RateLimitPolicy = {
  limit: 5,
  windowMs: 10 * MINUTE,
};

export const REGISTER_POLICY: RateLimitPolicy = {
  limit: 5,
  windowMs: 60 * MINUTE,
};

type HeaderSource = { get(name: string): string | null | undefined };

export function adminLoginBucket(ip: string): string {
  return `admin-login:${ip}`;
}

export function registerBucket(ip: string): string {
  return `register:${ip}`;
}

/**
 * Cloudflare sets cf-connecting-ip on every request it proxies. The forwarded
 * header is the local fallback, and an unattributable request shares one bucket
 * rather than escaping the limit.
 */
export function clientIp(headers: HeaderSource): string {
  const direct = headers.get("cf-connecting-ip")?.trim();
  if (direct) {
    return direct;
  }
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || "unknown";
}

export async function consumeRateLimit(
  bucket: string,
  policy: RateLimitPolicy,
  now: number = Date.now(),
): Promise<RateLimitVerdict> {
  const db = await getDatabase();
  await db
    .prepare(`DELETE FROM rate_limit_hits WHERE hit_at <= ?`)
    .bind(now - policy.windowMs)
    .run();

  const window = await db
    .prepare(
      `SELECT COUNT(*) AS hits, MIN(hit_at) AS oldest FROM rate_limit_hits WHERE bucket = ?`,
    )
    .bind(bucket)
    .first<{ hits: number; oldest: number | null }>();

  if (window && window.hits >= policy.limit) {
    const oldest = window.oldest ?? now;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((oldest + policy.windowMs - now) / 1000),
    );
    return { allowed: false, retryAfterSeconds };
  }

  await db
    .prepare(`INSERT INTO rate_limit_hits (bucket, hit_at) VALUES (?, ?)`)
    .bind(bucket, now)
    .run();
  return { allowed: true };
}

export async function clearRateLimit(bucket: string): Promise<void> {
  const db = await getDatabase();
  await db.prepare(`DELETE FROM rate_limit_hits WHERE bucket = ?`).bind(bucket).run();
}

export function retryHint(retryAfterSeconds: number): string {
  const minutes = Math.ceil(retryAfterSeconds / 60);
  return minutes <= 1 ? "a minute" : `${minutes} minutes`;
}

import { timingSafeEqual } from "node:crypto";
import { getDatabase } from "@/lib/db";
import {
  ADMIN_LOGIN_POLICY,
  adminLoginBucket,
  clearRateLimit,
  consumeRateLimit,
} from "@/lib/rate-limit";

const COOKIE = "playvejora_admin";
const SESSION_MS = 12 * 60 * 60 * 1000;

export const PRE_LAUNCH_PASSWORD = "playvejora-dev";

export type LoginOutcome =
  | { ok: true; token: string }
  | { ok: false; reason: "password" }
  | { ok: false; reason: "rate_limited"; retryAfterSeconds: number };

export function usingPreLaunchPassword(): boolean {
  return !process.env.ADMIN_PASSWORD && process.env.NODE_ENV !== "production";
}

function secret(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (password) {
    return password;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_PASSWORD must be set before deploying.");
  }
  return PRE_LAUNCH_PASSWORD;
}

function hex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function tokenHash(token: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return hex(new Uint8Array(digest));
}

export function passwordMatches(password: string): boolean {
  try {
    const expected = Buffer.from(secret());
    const actual = Buffer.from(password);
    if (expected.length !== actual.length) {
      return false;
    }
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

export async function createAdminSession(
  now: number = Date.now(),
): Promise<string> {
  const token = hex(crypto.getRandomValues(new Uint8Array(32)));
  const db = await getDatabase();
  await db
    .prepare(`DELETE FROM admin_sessions WHERE expires_at <= ?`)
    .bind(now)
    .run();
  await db
    .prepare(
      `INSERT INTO admin_sessions (token_hash, created_at, expires_at) VALUES (?, ?, ?)`,
    )
    .bind(await tokenHash(token), new Date(now).toISOString(), now + SESSION_MS)
    .run();
  return token;
}

export async function isValidSession(
  token: string | undefined,
  now: number = Date.now(),
): Promise<boolean> {
  if (!token) {
    return false;
  }
  const db = await getDatabase();
  const row = await db
    .prepare(`SELECT expires_at FROM admin_sessions WHERE token_hash = ?`)
    .bind(await tokenHash(token))
    .first<{ expires_at: number }>();
  return Boolean(row && row.expires_at > now);
}

export async function endAdminSession(token: string | undefined): Promise<void> {
  if (!token) {
    return;
  }
  const db = await getDatabase();
  await db
    .prepare(`DELETE FROM admin_sessions WHERE token_hash = ?`)
    .bind(await tokenHash(token))
    .run();
}

export type PasswordCheck =
  | { ok: true }
  | { ok: false; reason: "password" }
  | { ok: false; reason: "rate_limited"; retryAfterSeconds: number };

export async function confirmAdminPassword(
  password: string,
  ip: string,
): Promise<PasswordCheck> {
  const bucket = adminLoginBucket(ip);
  const verdict = await consumeRateLimit(bucket, ADMIN_LOGIN_POLICY);
  if (!verdict.allowed) {
    return {
      ok: false,
      reason: "rate_limited",
      retryAfterSeconds: verdict.retryAfterSeconds,
    };
  }
  if (!passwordMatches(password)) {
    return { ok: false, reason: "password" };
  }
  await clearRateLimit(bucket);
  return { ok: true };
}

export async function attemptAdminLogin(
  password: string,
  ip: string,
): Promise<LoginOutcome> {
  const check = await confirmAdminPassword(password, ip);
  if (!check.ok) {
    return check;
  }
  return { ok: true, token: await createAdminSession() };
}

export const ADMIN_COOKIE = COOKIE;
export const SESSION_MAX_AGE_SECONDS = SESSION_MS / 1000;

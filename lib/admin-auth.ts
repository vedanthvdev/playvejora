import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "playvejora_admin";

export const PRE_LAUNCH_PASSWORD = "playvejora-dev";

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

export function sessionToken(): string {
  return createHmac("sha256", secret()).update("organizer").digest("hex");
}

export function isValidSession(token: string | undefined): boolean {
  if (!token) {
    return false;
  }
  try {
    const expected = Buffer.from(sessionToken());
    const actual = Buffer.from(token);
    if (expected.length !== actual.length) {
      return false;
    }
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
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

export const ADMIN_COOKIE = COOKIE;

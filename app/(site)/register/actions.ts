"use server";

import { headers } from "next/headers";
import { submitTeam, type SubmitResult, type TeamInput } from "@/lib/registration";
import {
  REGISTER_POLICY,
  clientIp,
  consumeRateLimit,
  registerBucket,
  retryHint,
} from "@/lib/rate-limit";

export async function registerTeamAction(input: TeamInput): Promise<SubmitResult> {
  const verdict = await consumeRateLimit(
    registerBucket(clientIp(await headers())),
    REGISTER_POLICY,
  );
  if (!verdict.allowed) {
    return {
      ok: false,
      error: `That is a lot of registrations from one connection. Try again in ${retryHint(
        verdict.retryAfterSeconds,
      )}, or email the organizers.`,
    };
  }
  return submitTeam(input);
}

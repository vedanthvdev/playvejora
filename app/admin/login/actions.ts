"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  attemptAdminLogin,
} from "@/lib/admin-auth";
import { clientIp } from "@/lib/rate-limit";

export async function loginAdminAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const result = await attemptAdminLogin(password, clientIp(await headers()));
  if (!result.ok) {
    redirect(
      result.reason === "rate_limited"
        ? "/admin/login?error=rate"
        : "/admin/login?error=1",
    );
  }
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, result.token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  redirect("/admin");
}

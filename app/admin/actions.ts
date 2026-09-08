"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, endAdminSession } from "@/lib/admin-auth";

export async function logoutAdminAction() {
  const jar = await cookies();
  await endAdminSession(jar.get(ADMIN_COOKIE)?.value);
  jar.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE } from "@/lib/admin-auth";
import { deleteTeamForAdmin, updateTeamForAdmin } from "@/lib/admin-data";
import { clientIp } from "@/lib/rate-limit";
import type { TeamStatus } from "@/lib/registration";

function teamId(raw: FormDataEntryValue | null): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function updateTeamAction(formData: FormData) {
  const id = teamId(formData.get("id"));
  if (!id) {
    redirect("/admin");
  }
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const result = await updateTeamForAdmin(token, id, {
    teamName: String(formData.get("teamName") ?? ""),
    company: String(formData.get("company") ?? ""),
    friendsOrMixed: formData.get("friendsOrMixed") === "on",
    captainEmail: String(formData.get("captainEmail") ?? ""),
    playerNames: String(formData.get("playerNames") ?? "").split("\n"),
    status: String(formData.get("status") ?? "") as TeamStatus,
  });
  if (!result.ok && result.error === "session") {
    redirect("/admin/login");
  }
  if (!result.ok) {
    redirect(`/admin/${id}?error=${encodeURIComponent(result.error)}`);
  }
  redirect("/admin");
}

export async function deleteTeamAction(formData: FormData) {
  const id = teamId(formData.get("id"));
  if (!id) {
    redirect("/admin");
  }
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const result = await deleteTeamForAdmin(
    token,
    id,
    String(formData.get("password") ?? ""),
    clientIp(await headers()),
  );
  if (!result.ok && result.reason === "session") {
    redirect("/admin/login");
  }
  if (!result.ok && result.reason === "rate_limited") {
    redirect(`/admin/${id}/delete?error=rate`);
  }
  if (!result.ok && result.reason === "password") {
    redirect(`/admin/${id}/delete?error=1`);
  }
  if (!result.ok) {
    redirect("/admin");
  }
  redirect("/admin");
}

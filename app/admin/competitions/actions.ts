"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE } from "@/lib/admin-auth";
import {
  createCompetitionForAdmin,
  deleteCompetitionForAdmin,
  setCompetitionListedForAdmin,
} from "@/lib/admin-data";

export async function createCompetitionAction(formData: FormData) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const result = await createCompetitionForAdmin(token, {
    city: String(formData.get("city") ?? ""),
    sport: String(formData.get("sport") ?? ""),
    season: String(formData.get("season") ?? ""),
    leagueCap: Number(formData.get("leagueCap")),
  });
  if (!result.ok && result.error === "session") {
    redirect("/admin/login");
  }
  if (!result.ok) {
    redirect(`/admin/competitions?error=${encodeURIComponent(result.error)}`);
  }
  redirect("/admin/competitions");
}

export async function setListedAction(formData: FormData) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const publicId = String(formData.get("publicId") ?? "");
  const listed = String(formData.get("listed") ?? "") === "1";
  if (!(await setCompetitionListedForAdmin(token, publicId, listed))) {
    redirect("/admin/login");
  }
  redirect("/admin/competitions");
}

export async function deleteCompetitionAction(formData: FormData) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const result = await deleteCompetitionForAdmin(
    token,
    String(formData.get("publicId") ?? ""),
  );
  if (!result.ok && result.error === "session") {
    redirect("/admin/login");
  }
  if (!result.ok) {
    redirect(`/admin/competitions?error=${encodeURIComponent(result.error)}`);
  }
  redirect("/admin/competitions");
}

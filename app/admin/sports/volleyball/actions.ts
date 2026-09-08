"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE } from "@/lib/admin-auth";
import { deleteMatchForAdmin, recordVolleyballMatchForAdmin } from "@/lib/admin-data";
import type { ResultFormState } from "../football/actions";

export async function recordVolleyballMatchAction(
  _state: ResultFormState,
  formData: FormData,
): Promise<ResultFormState> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const homes = formData.getAll("setHome").map((value) => Number(value));
  const aways = formData.getAll("setAway").map((value) => Number(value));
  const sets = homes.map((home, index) => ({ home, away: aways[index] ?? 0 }));
  const result = await recordVolleyballMatchForAdmin(token, {
    competitionPublicId: String(formData.get("competitionPublicId") ?? ""),
    homeTeamId: Number(formData.get("homeTeamId")),
    awayTeamId: Number(formData.get("awayTeamId")),
    sets,
  });
  if (!result.ok && result.error === "session") {
    redirect("/admin/login");
  }
  // The posted sets stay on screen so an organizer can fix one number instead
  // of entering the whole match again.
  if (!result.ok) {
    return { error: result.error };
  }
  redirect("/admin/sports/volleyball");
}

export async function deleteVolleyballMatchAction(formData: FormData) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(await deleteMatchForAdmin(token, Number(formData.get("id"))))) {
    redirect("/admin/login");
  }
  redirect("/admin/sports/volleyball");
}

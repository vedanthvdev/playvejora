"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE } from "@/lib/admin-auth";
import { deleteMatchForAdmin, recordFootballMatchForAdmin } from "@/lib/admin-data";

export type ResultFormState = { error: string } | null;

function numbers(formData: FormData, name: string): number[] {
  return formData.getAll(name).map((value) => Number(value));
}

export async function recordFootballMatchAction(
  _state: ResultFormState,
  formData: FormData,
): Promise<ResultFormState> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const teamIds = numbers(formData, "scorerTeamId");
  const players = formData.getAll("scorerPlayer").map((value) => String(value));
  const goals = numbers(formData, "scorerGoals");
  const scorers = teamIds.map((teamId, index) => ({
    teamId,
    playerName: players[index] ?? "",
    goals: goals[index] ?? 0,
  }));
  const result = await recordFootballMatchForAdmin(token, {
    competitionPublicId: String(formData.get("competitionPublicId") ?? ""),
    homeTeamId: Number(formData.get("homeTeamId")),
    awayTeamId: Number(formData.get("awayTeamId")),
    homeGoals: Number(formData.get("homeGoals")),
    awayGoals: Number(formData.get("awayGoals")),
    scorers,
  });
  if (!result.ok && result.error === "session") {
    redirect("/admin/login");
  }
  // The entered result stays on screen so an organizer can correct one field
  // instead of retyping the match.
  if (!result.ok) {
    return { error: result.error };
  }
  redirect("/admin/sports/football");
}

export async function deleteFootballMatchAction(formData: FormData) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(await deleteMatchForAdmin(token, Number(formData.get("id"))))) {
    redirect("/admin/login");
  }
  redirect("/admin/sports/football");
}

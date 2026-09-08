"use server";

import { submitTeam, type TeamInput } from "@/lib/registration";

export async function registerTeamAction(input: TeamInput) {
  return submitTeam(input);
}

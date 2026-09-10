import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE } from "@/lib/admin-auth";
import { isValidSession } from "@/lib/admin-auth";
import { listCompetitions } from "@/lib/competitions";
import { listMatchesForSport } from "@/lib/matches";
import { listTeams } from "@/lib/registration";
import { VolleyballResultForm } from "./VolleyballResultForm";
import { deleteVolleyballMatchAction } from "./actions";

export const dynamic = "force-dynamic";

function setsLine(sets: { home: number; away: number }[] | null): string {
  if (!sets?.length) {
    return "No sets";
  }
  return sets.map((set) => `${set.home}-${set.away}`).join(", ");
}

export default async function VolleyballAdminPage() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(await isValidSession(token))) {
    redirect("/admin/login");
  }
  const competitions = (await listCompetitions()).filter((row) => row.sport === "volleyball");
  const teams = (await listTeams({ sport: "volleyball" })).map((team) => ({
    id: team.id,
    teamName: team.teamName,
    playerNames: team.playerNames,
    status: team.status,
    competitionPublicId: team.competitionPublicId,
  }));
  const matches = await listMatchesForSport("volleyball", false);

  return (
    <div className="wrap page-top">
      <div className="page-head">
        <span className="kicker">Organizers only</span>
        <h1>Volleyball results</h1>
        <p>
          Pick two in-league sides and post each set, for example 25-20. The winner
          is the side that takes more sets. That winner gets three points and the
          loser none. A set-count draw is one point each.
        </p>
      </div>

      <div className="panel">
        {competitions.length === 0 ? (
          <p>Add a volleyball competition first.</p>
        ) : (
          <VolleyballResultForm competitions={competitions} teams={teams} />
        )}
      </div>

      {matches.length > 0 ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Home</th>
                <th>Away</th>
                <th>Sets</th>
                <th>Winner</th>
                <th> </th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => (
                <tr key={match.id}>
                  <td className="strong">{match.homeTeamName}</td>
                  <td>{match.awayTeamName}</td>
                  <td>{setsLine(match.sets)}</td>
                  <td>
                    {match.winner === "draw"
                      ? "Draw"
                      : match.winner === "home"
                        ? match.homeTeamName
                        : match.awayTeamName}
                  </td>
                  <td className="row-actions">
                    <form action={deleteVolleyballMatchAction}>
                      <input type="hidden" name="id" value={match.id} />
                      <button className="btn btn-quiet btn-small" type="submit">
                        Remove
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

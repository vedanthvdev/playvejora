import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE } from "@/lib/admin-auth";
import { isValidSession } from "@/lib/admin-auth";
import { listCompetitions } from "@/lib/competitions";
import { listMatchesForSport } from "@/lib/matches";
import { listTeams } from "@/lib/registration";
import { FootballResultForm } from "./FootballResultForm";
import { deleteFootballMatchAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function FootballAdminPage() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(await isValidSession(token))) {
    redirect("/admin/login");
  }
  const competitions = (await listCompetitions()).filter((row) => row.sport === "football");
  const teams = (await listTeams({ sport: "football" })).map((team) => ({
    id: team.id,
    teamName: team.teamName,
    playerNames: team.playerNames,
    status: team.status,
    competitionPublicId: team.competitionPublicId,
  }));
  const matches = await listMatchesForSport("football", false);

  return (
    <div className="wrap page-top">
      <div className="page-head">
        <span className="kicker">Organizers only</span>
        <h1>Football results</h1>
        <p>
          Pick two in-league sides. The table uses three points for a win, one for a
          draw, and none for a loss. Scorers come from the registered player list.
        </p>
      </div>

      <div className="panel">
        {competitions.length === 0 ? (
          <p>Add a football competition first.</p>
        ) : (
          <FootballResultForm competitions={competitions} teams={teams} />
        )}
      </div>

      {matches.length > 0 ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Home</th>
                <th>Away</th>
                <th>Score</th>
                <th>City</th>
                <th> </th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => (
                <tr key={match.id}>
                  <td className="strong">{match.homeTeamName}</td>
                  <td>{match.awayTeamName}</td>
                  <td>
                    {match.homeGoals}–{match.awayGoals}
                  </td>
                  <td>{match.city}</td>
                  <td className="row-actions">
                    <form action={deleteFootballMatchAction}>
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

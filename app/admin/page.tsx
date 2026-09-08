import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE } from "@/lib/admin-auth";
import { teamsForAdmin } from "@/lib/admin-data";

export default async function AdminPage() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  const teams = teamsForAdmin(token);
  if (!teams) {
    redirect("/admin/login");
  }

  const inLeague = teams.filter((team) => team.status === "in_league").length;
  const waitlisted = teams.length - inLeague;

  return (
    <div className="wrap page-top section-tight">
      <div className="page-head">
        <span className="kicker">Organizers only</span>
        <h1>Team intake</h1>
        <p>Every registration for the Edinburgh season, newest last.</p>
      </div>

      <div className="summary-row">
        <span className="chip">{inLeague} of 5 league places taken</span>
        <span className="chip">{waitlisted} on the waitlist</span>
      </div>

      {teams.length === 0 ? (
        <div className="table-wrap">
          <p className="empty">No teams have registered yet.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th>Company</th>
                <th>Captain</th>
                <th>Players</th>
                <th>Waiver</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id}>
                  <td className="strong">{team.teamName}</td>
                  <td>
                    {team.company ||
                      (team.friendsOrMixed ? "Friends / mixed" : "—")}
                  </td>
                  <td>{team.captainEmail}</td>
                  <td>{team.playerNames.join(", ")}</td>
                  <td>{team.waiverAcceptedAt ? "Accepted" : "—"}</td>
                  <td>
                    <span
                      className={
                        team.status === "in_league" ? "pill in" : "pill wait"
                      }
                    >
                      {team.status === "in_league" ? "In league" : "Waitlist"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

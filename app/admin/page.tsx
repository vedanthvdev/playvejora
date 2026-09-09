import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ADMIN_COOKIE } from "@/lib/admin-auth";
import { teamsForAdmin } from "@/lib/admin-data";
import { listCompetitions } from "@/lib/competitions";
import { catalogueLabel } from "@/lib/catalogue";
import type { TeamStatus } from "@/lib/registration";

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; sport?: string; status?: string }>;
}) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const params = await searchParams;
  const city = params.city?.trim() ?? "";
  const sport = params.sport?.trim() ?? "";
  const status =
    params.status === "in_league" || params.status === "waitlist"
      ? (params.status as TeamStatus)
      : "";
  const teams = await teamsForAdmin(token, { city, sport, status });
  if (!teams) {
    redirect("/admin/login");
  }

  const competitions = await listCompetitions();
  const cities = unique(competitions.map((row) => row.city));
  const sports = unique(competitions.map((row) => row.sport));
  const inLeague = teams.filter((team) => team.status === "in_league").length;
  const waitlisted = teams.length - inLeague;

  return (
    <div className="wrap page-top">
      <div className="page-head">
        <span className="kicker">Organizers only</span>
        <h1>Team intake</h1>
        <p>Every registration for the live competitions, newest last.</p>
      </div>

      <form className="filter-bar" method="get">
        <label htmlFor="city">
          City
          <select id="city" name="city" defaultValue={city}>
            <option value="">All cities</option>
            {cities.map((value) => (
              <option key={value} value={value}>
                {catalogueLabel(value)}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="sport">
          Sport
          <select id="sport" name="sport" defaultValue={sport}>
            <option value="">All sports</option>
            {sports.map((value) => (
              <option key={value} value={value}>
                {catalogueLabel(value)}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="status">
          Status
          <select id="status" name="status" defaultValue={status}>
            <option value="">All statuses</option>
            <option value="in_league">In league</option>
            <option value="waitlist">Waitlist</option>
          </select>
        </label>
        <button className="btn btn-solid" type="submit">
          Filter
        </button>
      </form>

      <div className="summary-row">
        <span className="chip">{inLeague} in-league teams in this view</span>
        <span className="chip">{waitlisted} on the waitlist in this view</span>
      </div>

      {teams.length === 0 ? (
        <div className="table-wrap">
          <p className="empty">No teams match this filter.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ref</th>
                <th>Team</th>
                <th>City</th>
                <th>Sport</th>
                <th>Company</th>
                <th>Captain</th>
                <th>Players</th>
                <th>Waiver</th>
                <th>Status</th>
                <th> </th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id}>
                  <td className="mono">{team.publicId}</td>
                  <td className="strong">{team.teamName}</td>
                  <td>{catalogueLabel(team.city)}</td>
                  <td>{catalogueLabel(team.sport)}</td>
                  <td>
                    {team.company ||
                      (team.friendsOrMixed ? "Friends / mixed" : "Not given")}
                  </td>
                  <td>{team.captainEmail}</td>
                  <td className="clamp" title={team.playerNames.join(", ")}>
                    {team.playerNames.length} · {team.playerNames.join(", ")}
                  </td>
                  <td>{team.waiverAcceptedAt ? "Accepted" : "Not accepted"}</td>
                  <td>
                    <span
                      className={
                        team.status === "in_league" ? "pill in" : "pill wait"
                      }
                    >
                      {team.status === "in_league" ? "In league" : "Waitlist"}
                    </span>
                  </td>
                  <td className="row-actions">
                    <Link href={`/admin/${team.id}`}>Edit</Link>
                    <Link className="destructive" href={`/admin/${team.id}/delete`}>
                      Delete
                    </Link>
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

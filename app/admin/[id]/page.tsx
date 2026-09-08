import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ADMIN_COOKIE } from "@/lib/admin-auth";
import { teamForAdmin } from "@/lib/admin-data";
import { updateTeamAction } from "../team-actions";

export default async function EditTeamPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) {
    notFound();
  }
  const lookup = await teamForAdmin((await cookies()).get(ADMIN_COOKIE)?.value, id);
  if (!lookup.ok && lookup.reason === "session") {
    redirect("/admin/login");
  }
  if (!lookup.ok) {
    redirect("/admin");
  }
  const team = lookup.team;
  const error = (await searchParams).error;

  return (
    <div className="wrap page-top">
      <div className="page-head">
        <span className="kicker">Organizers only</span>
        <h1>Edit {team.teamName}</h1>
        <p>Change the registration, including whether this side is in the league.</p>
      </div>
      <div className="panel">
        <form className="form" action={updateTeamAction}>
          <input type="hidden" name="id" value={team.id} />
          {error ? <p className="error">{error}</p> : null}

          <label htmlFor="teamName">Team name</label>
          <input id="teamName" name="teamName" required defaultValue={team.teamName} />

          <label htmlFor="company">Company (optional)</label>
          <input id="company" name="company" defaultValue={team.company} />

          <label className="check">
            <input
              type="checkbox"
              name="friendsOrMixed"
              defaultChecked={team.friendsOrMixed}
            />
            <span>This is a friends or mixed side</span>
          </label>

          <label htmlFor="captainEmail">Captain email</label>
          <input
            id="captainEmail"
            name="captainEmail"
            type="email"
            required
            defaultValue={team.captainEmail}
          />

          <label htmlFor="playerNames">Players (one per line)</label>
          <textarea
            id="playerNames"
            name="playerNames"
            rows={Math.max(4, team.playerNames.length + 1)}
            defaultValue={team.playerNames.join("\n")}
            required
          />

          <label htmlFor="status">League place</label>
          <select id="status" name="status" defaultValue={team.status}>
            <option value="in_league">In league</option>
            <option value="waitlist">Waitlist</option>
          </select>
          <p className="hint">
            Changing this does not move anyone else. Deleting an in-league side
            also leaves the waitlist as it is.
          </p>

          <div className="form-actions">
            <button className="btn btn-solid" type="submit">
              Save changes
            </button>
            <Link className="btn btn-quiet" href="/admin">
              Cancel
            </Link>
            <Link className="btn btn-quiet" href={`/admin/${team.id}/delete`}>
              Delete this team
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

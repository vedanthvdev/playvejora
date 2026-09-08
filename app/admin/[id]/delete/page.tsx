import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ADMIN_COOKIE } from "@/lib/admin-auth";
import { teamForAdmin } from "@/lib/admin-data";
import { deleteTeamAction } from "../../team-actions";

export default async function DeleteTeamPage({
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
        <h1>Delete {team.teamName}?</h1>
        <p>
          This removes the registration. Re-enter the organizer password to
          confirm. Other sessions stay signed in.
        </p>
      </div>
      <div className="panel">
        <form className="form" action={deleteTeamAction}>
          <input type="hidden" name="id" value={team.id} />
          {error === "rate" ? (
            <p className="error">
              Too many attempts from this connection. Wait a few minutes and try
              again.
            </p>
          ) : error ? (
            <p className="error">That password did not match. The team is still listed.</p>
          ) : null}
          <p>
            {team.captainEmail}
            {team.status === "in_league" ? " · in league" : " · waitlist"}
          </p>
          <label htmlFor="password">Organizer password</label>
          <input id="password" name="password" type="password" required />
          <div className="form-actions">
            <button className="btn btn-solid" type="submit">
              Delete registration
            </button>
            <Link className="btn btn-quiet" href={`/admin/${team.id}`}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ADMIN_COOKIE } from "@/lib/admin-auth";
import { isValidSession } from "@/lib/admin-auth";
import { CITIES, SEASONS, SPORTS, catalogueLabel } from "@/lib/catalogue";
import { listCompetitions } from "@/lib/competitions";
import {
  createCompetitionAction,
  deleteCompetitionAction,
  setListedAction,
} from "./actions";

export default async function CompetitionsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(await isValidSession(token))) {
    redirect("/admin/login");
  }
  const competitions = await listCompetitions();
  const error = (await searchParams).error;

  return (
    <div className="wrap page-top">
      <div className="page-head">
        <span className="kicker">Organizers only</span>
        <h1>Competitions</h1>
        <p>
          Add a city and sport from the list, or hide one that should not take new
          teams. Hiding keeps existing registrations. Post match scores on the
          football and volleyball pages.
        </p>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <div className="comp-layout">
        <div className="panel">
          <h2 className="panel-title">Add a league</h2>
          <form className="form form-wide" action={createCompetitionAction}>
            <div className="form-grid">
              <label htmlFor="sport">
                Sport
                <select id="sport" name="sport" required defaultValue="">
                  <option value="">Choose a sport</option>
                  {SPORTS.map((row) => (
                    <option key={row.slug} value={row.slug}>
                      {row.label}
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor="city">
                City
                <select id="city" name="city" required defaultValue="">
                  <option value="">Choose a city</option>
                  {CITIES.map((row) => (
                    <option key={row.slug} value={row.slug}>
                      {row.label}
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor="season">
                Season
                <select id="season" name="season" required defaultValue={SEASONS[0]?.slug}>
                  {SEASONS.map((row) => (
                    <option key={row.slug} value={row.slug}>
                      {row.label}
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor="leagueCap">
                League teams allowed
                <input
                  id="leagueCap"
                  name="leagueCap"
                  type="number"
                  min={1}
                  required
                  defaultValue={5}
                />
              </label>
            </div>
            <div className="form-actions">
              <button className="btn btn-solid" type="submit">
                Add competition
              </button>
            </div>
          </form>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Sport</th>
                <th>City</th>
                <th>Teams allowed</th>
                <th>Open</th>
                <th> </th>
              </tr>
            </thead>
            <tbody>
              {competitions.map((competition) => (
                <tr key={competition.publicId}>
                  <td className="strong">{competition.name}</td>
                  <td>{catalogueLabel(competition.sport)}</td>
                  <td>{catalogueLabel(competition.city)}</td>
                  <td>{competition.leagueCap}</td>
                  <td>{competition.listed ? "Yes" : "Hidden"}</td>
                  <td className="row-actions">
                    <form action={setListedAction}>
                      <input type="hidden" name="publicId" value={competition.publicId} />
                      <input
                        type="hidden"
                        name="listed"
                        value={competition.listed ? "0" : "1"}
                      />
                      <button className="btn btn-quiet btn-small" type="submit">
                        {competition.listed ? "Hide" : "Unhide"}
                      </button>
                    </form>
                    <form action={deleteCompetitionAction}>
                      <input type="hidden" name="publicId" value={competition.publicId} />
                      <button className="btn btn-quiet btn-small destructive" type="submit">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p>
        <Link href="/admin">Back to team intake</Link>
      </p>
    </div>
  );
}

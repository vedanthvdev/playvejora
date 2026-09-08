import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { catalogueLabel, isSport } from "@/lib/catalogue";
import { citiesForSport, listOpenCompetitions } from "@/lib/competitions";
import { footballScorers, teamStandings } from "@/lib/matches";
import { stats as copy } from "@/lib/site-copy";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: string }>;
}): Promise<Metadata> {
  const sport = (await params).sport;
  if (!isSport(sport)) {
    return { title: "Stats" };
  }
  return {
    title: `${catalogueLabel(sport)} stats`,
    description: copy.lede,
    alternates: { canonical: `/stats/${sport}` },
  };
}

function groupByCity<T extends { city: string }>(rows: T[]): [string, T[]][] {
  const cities: string[] = [];
  const map = new Map<string, T[]>();
  for (const row of rows) {
    if (!map.has(row.city)) {
      cities.push(row.city);
      map.set(row.city, []);
    }
    map.get(row.city)?.push(row);
  }
  return cities.map((city) => [city, map.get(city) ?? []]);
}

export default async function SportStatsPage({
  params,
  searchParams,
}: {
  params: Promise<{ sport: string }>;
  searchParams: Promise<{ city?: string }>;
}) {
  const sport = (await params).sport;
  if (!isSport(sport)) {
    notFound();
  }
  const city = (await searchParams).city?.trim() ?? "";
  const competitions = (await listOpenCompetitions()).filter((row) => row.sport === sport);
  const cities = citiesForSport(competitions, sport);
  const cityFilter = city && cities.includes(city) ? city : "";
  const table = await teamStandings({
    sport,
    city: cityFilter || undefined,
  });
  const scorers =
    sport === "football"
      ? await footballScorers({ sport: "football", city: cityFilter || undefined })
      : [];
  const grouped = groupByCity(table);
  const forLabel = sport === "football" ? "GF" : "SF";
  const againstLabel = sport === "football" ? "GA" : "SA";

  return (
    <div className="wrap page-top">
      <div className="page-head">
        <span className="kicker">Results</span>
        <h1>{catalogueLabel(sport)}</h1>
        <p>
          {sport === "football"
            ? "Three points for a win, one for a draw, none for a loss. Ranked by points, then goal difference, then goals scored."
            : "The side that wins more sets takes three points. A set-count draw is one point each. Ranked by points, then set difference, then sets won."}
        </p>
      </div>

      {cities.length > 1 ? (
        <form className="filter-bar" method="get">
          <label htmlFor="city">
            Location
            <select id="city" name="city" defaultValue={cityFilter}>
              <option value="">All locations</option>
              {cities.map((value) => (
                <option key={value} value={value}>
                  {catalogueLabel(value)}
                </option>
              ))}
            </select>
          </label>
          <button className="btn btn-solid" type="submit">
            Filter
          </button>
        </form>
      ) : null}

      {grouped.length === 0 ? (
        <p className="empty">{copy.empty}</p>
      ) : (
        grouped.map(([groupCity, rows]) => (
          <section className="section" key={groupCity}>
            <div className="section-head">
              <h2>{catalogueLabel(groupCity)}</h2>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Team</th>
                    <th>P</th>
                    <th>W</th>
                    <th>D</th>
                    <th>L</th>
                    <th>{forLabel}</th>
                    <th>{againstLabel}</th>
                    <th>GD</th>
                    <th>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.teamId}>
                      <td>{index + 1}</td>
                      <td className="strong">{row.teamName}</td>
                      <td>{row.played}</td>
                      <td>{row.won}</td>
                      <td>{row.drawn}</td>
                      <td>{row.lost}</td>
                      <td>{row.gf}</td>
                      <td>{row.ga}</td>
                      <td>{row.gd}</td>
                      <td>{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}

      {sport === "football" ? (
        <section className="section">
          <div className="section-head">
            <h2>Top scorers</h2>
          </div>
          {scorers.length === 0 ? (
            <p className="empty">{copy.empty}</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Team</th>
                    <th>City</th>
                    <th>Goals</th>
                  </tr>
                </thead>
                <tbody>
                  {scorers.map((row) => (
                    <tr key={`${row.playerName}-${row.teamName}-${row.city}`}>
                      <td className="strong">{row.playerName}</td>
                      <td>{row.teamName}</td>
                      <td>{catalogueLabel(row.city)}</td>
                      <td>{row.goals}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}

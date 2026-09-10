import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { catalogueLabel, isSport } from "@/lib/catalogue";
import { citiesForSport, listOpenCompetitions } from "@/lib/competitions";
import { teamStandings } from "@/lib/matches";
import { stats as copy } from "@/lib/site-copy";
import { StandingsBoard } from "./StandingsBoard";
import { StatsShell } from "./StatsShell";

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
    title: `${catalogueLabel(sport)} table`,
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
  const table = await teamStandings({ sport, city: cityFilter || undefined });
  const grouped = groupByCity(table);

  const unitLabel = sport === "football" ? "Goals" : "Sets";
  const forLabel = sport === "football" ? "GF" : "SF";
  const againstLabel = sport === "football" ? "GA" : "SA";
  const diffLabel = sport === "football" ? "GD" : "SD";

  return (
    <StatsShell
      sport={sport}
      cities={cities}
      cityFilter={cityFilter}
      active="table"
      showScorers={sport === "football"}
    >
      <p className="wrap m-lede">
        {sport === "football"
          ? "Three points for a win, one for a draw, none for a loss. Ranked by points, then goal difference, then goals scored."
          : "The side that wins more sets takes three points. A set-count draw is one point each. Ranked by points, then set difference, then sets won."}
      </p>

      {grouped.length === 0 ? <p className="wrap m-empty">{copy.empty}</p> : null}

      {grouped.map(([groupCity, rows]) => (
        <section className="m-group" key={groupCity}>
          <h2 className="wrap m-group-title">{catalogueLabel(groupCity)}</h2>
          <StandingsBoard
            rows={rows}
            unitLabel={unitLabel}
            forLabel={forLabel}
            againstLabel={againstLabel}
            diffLabel={diffLabel}
          />
        </section>
      ))}
    </StatsShell>
  );
}

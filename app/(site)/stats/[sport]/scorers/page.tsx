import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { catalogueLabel, isSport } from "@/lib/catalogue";
import { citiesForSport, listOpenCompetitions } from "@/lib/competitions";
import { footballScorers } from "@/lib/matches";
import { stats as copy } from "@/lib/site-copy";
import { StatsShell } from "../StatsShell";
import { TopScorersLeaderboard } from "../TopScorersLeaderboard";

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
    title: `${catalogueLabel(sport)} top scorers`,
    description: copy.lede,
    alternates: { canonical: `/stats/${sport}/scorers` },
  };
}

export default async function SportScorersPage({
  params,
  searchParams,
}: {
  params: Promise<{ sport: string }>;
  searchParams: Promise<{ city?: string }>;
}) {
  const sport = (await params).sport;
  // Only football records who scored, so there is no honest scorers page for
  // any other sport rather than an empty tab.
  if (sport !== "football") {
    notFound();
  }
  const city = (await searchParams).city?.trim() ?? "";
  const competitions = (await listOpenCompetitions()).filter((row) => row.sport === sport);
  const cities = citiesForSport(competitions, sport);
  const cityFilter = city && cities.includes(city) ? city : "";
  const scorers = await footballScorers({ sport, city: cityFilter || undefined });

  return (
    <StatsShell
      sport={sport}
      cities={cities}
      cityFilter={cityFilter}
      active="scorers"
      showScorers
    >
      <p className="wrap m-lede">
        The three players with the most goals across listed leagues. Ties keep the order the table
        gives them.
      </p>

      {scorers.length === 0 ? (
        <p className="wrap m-empty">{copy.empty}</p>
      ) : (
        <TopScorersLeaderboard players={scorers} />
      )}
    </StatsShell>
  );
}

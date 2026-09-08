import type { Metadata } from "next";
import Link from "next/link";
import { catalogueLabel } from "@/lib/catalogue";
import { listOpenCompetitions, sportsOf } from "@/lib/competitions";
import { stats as copy } from "@/lib/site-copy";

export const metadata: Metadata = {
  title: "Stats",
  description: copy.lede,
  alternates: { canonical: "/stats" },
};

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const competitions = await listOpenCompetitions();
  const sports = sportsOf(competitions);

  return (
    <div className="wrap page-top">
      <div className="page-head">
        <span className="kicker">Results</span>
        <h1>{copy.title}</h1>
        <p>{copy.lede}</p>
      </div>

      {sports.length === 0 ? (
        <p className="empty">{copy.empty}</p>
      ) : (
        <div className="cards">
          {sports.map((sport) => (
            <article className="card" key={sport}>
              <h3>{catalogueLabel(sport)}</h3>
              <p>
                Tables and scores for listed {catalogueLabel(sport).toLowerCase()}{" "}
                leagues.
              </p>
              <Link className="btn btn-solid" href={`/stats/${sport}`}>
                Open {catalogueLabel(sport)} stats
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

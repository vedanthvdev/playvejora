import type { Metadata } from "next";
import Link from "next/link";
import { catalogueLabel } from "@/lib/catalogue";
import { listOpenCompetitions, sportsOf } from "@/lib/competitions";
import { stats as copy } from "@/lib/site-copy";
import { MarioWorld } from "./MarioWorld";
import { SportBall } from "./MarioSprites";

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
    <MarioWorld>
      {/* The header already marks Stats as the current section, so this page
          leads with the choice to make rather than repeating its own name. */}
      <div className="wrap m-head">
        <h1 className="m-title">Choose a sport</h1>
      </div>

      <div className="m-body">
        {sports.length === 0 ? (
          <p className="wrap m-empty">{copy.empty}</p>
        ) : (
          <ul className="m-picks">
            {sports.map((sport, index) => (
              <li key={sport} style={{ animationDelay: `${index * 90}ms` }}>
                <Link className="m-pick" href={`/stats/${sport}`}>
                  <span className="m-pick-art" aria-hidden="true">
                    <SportBall sport={sport} size={58} />
                  </span>
                  <span className="m-pick-name">{catalogueLabel(sport)}</span>
                  <span className="m-pick-go">Table and scores</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MarioWorld>
  );
}

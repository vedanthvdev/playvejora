import type { ReactNode } from "react";
import Link from "next/link";
import { catalogueLabel } from "@/lib/catalogue";
import { MarioWorld } from "../MarioWorld";

export type StatsTab = "table" | "scorers";

function tabHref(sport: string, tab: StatsTab, city: string): string {
  const base = tab === "table" ? `/stats/${sport}` : `/stats/${sport}/scorers`;
  return city ? `${base}?city=${encodeURIComponent(city)}` : base;
}

export function StatsShell({
  sport,
  cities,
  cityFilter,
  active,
  showScorers,
  children,
}: {
  sport: string;
  cities: string[];
  cityFilter: string;
  active: StatsTab;
  showScorers: boolean;
  children: ReactNode;
}) {
  const sportLabel = catalogueLabel(sport);

  return (
    <MarioWorld>
      <div className="wrap m-head">
        <p className="m-eyebrow">Results</p>
        <h1 className="m-title">{sportLabel}</h1>

        {/* Two sub-pages rather than one long page, so a captain looking for the
            table is not scrolled past a podium to reach it. */}
        <nav className="m-tabs" aria-label={`${sportLabel} stats sections`}>
          <Link
            className={active === "table" ? "m-tab m-tab-on" : "m-tab"}
            href={tabHref(sport, "table", cityFilter)}
            aria-current={active === "table" ? "page" : undefined}
          >
            League table
          </Link>
          {showScorers ? (
            <Link
              className={active === "scorers" ? "m-tab m-tab-on" : "m-tab"}
              href={tabHref(sport, "scorers", cityFilter)}
              aria-current={active === "scorers" ? "page" : undefined}
            >
              Top scorers
            </Link>
          ) : null}
        </nav>

        {cities.length > 1 ? (
          <form className="m-filter" method="get">
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
            <button className="m-btn" type="submit">
              Filter
            </button>
          </form>
        ) : null}
      </div>

      <div className="m-body">{children}</div>
    </MarioWorld>
  );
}

import type { StandingRow } from "@/lib/matches";
import { Coin, RankBlock } from "../MarioSprites";

/* The table carries every side, so rows stay one consistent size below the
   leader. Sizing each place separately would turn a twelve-team league into
   twelve slightly different designs. */
export function StandingsBoard({
  rows,
  unitLabel,
  forLabel,
  againstLabel,
  diffLabel,
}: {
  rows: StandingRow[];
  unitLabel: string;
  forLabel: string;
  againstLabel: string;
  diffLabel: string;
}) {
  return (
    <ol className="m-list">
      {rows.map((row, index) => (
        <li
          className={index === 0 ? "m-row m-row-lead" : "m-row"}
          key={row.teamId}
          style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
        >
          <RankBlock rank={index + 1} lead={index === 0} />

          <div className="m-plate">
            <span className="m-stripe" aria-hidden="true" />
            <div className="m-ident">
              <span className="m-name">{row.teamName}</span>
              <p className="m-meta">
                <span>
                  <abbr title="Played">P</abbr> <b>{row.played}</b>
                </span>
                <span>
                  <abbr title="Won">W</abbr> <b>{row.won}</b>
                </span>
                <span>
                  <abbr title="Drawn">D</abbr> <b>{row.drawn}</b>
                </span>
                <span>
                  <abbr title="Lost">L</abbr> <b>{row.lost}</b>
                </span>
                <span className="m-meta-extra">
                  <abbr title={`${unitLabel} for`}>{forLabel}</abbr> <b>{row.gf}</b>
                </span>
                <span className="m-meta-extra">
                  <abbr title={`${unitLabel} against`}>{againstLabel}</abbr> <b>{row.ga}</b>
                </span>
                <span>
                  <abbr title={`${unitLabel} difference`}>{diffLabel}</abbr> <b>{row.gd}</b>
                </span>
              </p>
            </div>

            <div className="m-score">
              <span className="m-coin" aria-hidden="true">
                <Coin size={index === 0 ? 30 : 24} />
              </span>
              <strong>{row.points}</strong>
              <span className="m-unit">pts</span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

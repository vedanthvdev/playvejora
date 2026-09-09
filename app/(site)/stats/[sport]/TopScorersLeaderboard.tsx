import { catalogueLabel } from "@/lib/catalogue";
import type { ScorerRow } from "@/lib/matches";
import { Buddy, Coin, Mushroom, RankBlock, Trophy } from "../MarioSprites";

/* Cap colours, one per place. Rank is still carried by the numeral in the
   block, so the order survives without them. */
const CAPS = ["#e52521", "#43b047", "#049cd8"];

/* Fixed spray. Randomising it would make the reveal look different on every
   load and impossible to compare against the previous one. */
const CONFETTI = [
  { dx: -58, dy: -46, rot: -220, tone: "#e52521" },
  { dx: -34, dy: -72, rot: 180, tone: "#fbd000" },
  { dx: -8, dy: -86, rot: -140, tone: "#049cd8" },
  { dx: 22, dy: -76, rot: 240, tone: "#fff3d6" },
  { dx: 52, dy: -58, rot: -190, tone: "#43b047" },
  { dx: 76, dy: -26, rot: 160, tone: "#fbd000" },
  { dx: 84, dy: 16, rot: -260, tone: "#e52521" },
  { dx: 64, dy: 50, rot: 200, tone: "#049cd8" },
  { dx: 30, dy: 70, rot: -170, tone: "#fbd000" },
  { dx: -6, dy: 78, rot: 230, tone: "#fff3d6" },
  { dx: -42, dy: 62, rot: -210, tone: "#43b047" },
  { dx: -70, dy: 30, rot: 150, tone: "#e52521" },
];

export function TopScorersLeaderboard({ players }: { players: ScorerRow[] }) {
  const topThree = players.slice(0, 3);
  if (topThree.length === 0) {
    return null;
  }

  return (
    <ol className="m-podium">
      {topThree.map((player, index) => {
        const lead = index === 0;
        return (
          <li
            className={lead ? "m-pod m-pod-lead" : "m-pod"}
            key={`${player.playerName}-${player.teamName}-${player.city}`}
            style={{ animationDelay: `${index * 150}ms` }}
          >
            {/* The block sits above the plate so the mushroom, stacked behind it
                here, stays hidden until it clears the lid and still passes over
                the plate on its run across. */}
            <span className="m-pod-slot">
              {lead ? (
                <span className="m-mushroom" aria-hidden="true">
                  <Mushroom size={62} />
                </span>
              ) : null}
              <RankBlock rank={index + 1} lead={lead} />
            </span>

            {lead ? (
              <span className="m-confetti" aria-hidden="true">
                {CONFETTI.map((bit, i) => (
                  <i
                    key={i}
                    style={
                      {
                        "--dx": `${bit.dx}px`,
                        "--dy": `${bit.dy}px`,
                        "--rot": `${bit.rot}deg`,
                        background: bit.tone,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </span>
            ) : null}

            <div className="m-plate">
              <span className="m-stripe" style={{ background: CAPS[index] }} aria-hidden="true" />
              <span className="m-buddy" aria-hidden="true">
                <Buddy initial={player.playerName.slice(0, 1)} colour={CAPS[index]} size={72} />
              </span>

              <div className="m-ident">
                <span className="m-name">{player.playerName}</span>
                <p className="m-meta">
                  <span>{player.teamName}</span>
                  <span>{catalogueLabel(player.city)}</span>
                </p>
              </div>

              <div className="m-score">
                <span className="m-coin" aria-hidden="true">
                  <Coin size={lead ? 34 : 28} />
                </span>
                <strong>{player.goals}</strong>
                <span className="m-unit">{player.goals === 1 ? "goal" : "goals"}</span>
              </div>
            </div>

            {lead ? (
              <span className="m-prize" aria-hidden="true">
                <Trophy size={62} />
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

import type { ReactNode } from "react";
import { Cloud } from "./MarioSprites";

/* Clouds are placed rather than randomised so the band looks the same on every
   render and one screenshot can be compared against the last. */
const CLOUDS = [
  { left: "4%", top: "14%", width: 132 },
  { left: "63%", top: "8%", width: 98 },
  { left: "34%", top: "52%", width: 74 },
];

/** Scenery shared by every published-results page, so the theme starts at the
    stats landing rather than only once a sport is chosen. */
export function MarioWorld({ children }: { children: ReactNode }) {
  return (
    <div className="m-world">
      <div className="m-sky" aria-hidden="true">
        {CLOUDS.map((cloud) => (
          <span key={cloud.left} className="m-cloud" style={{ left: cloud.left, top: cloud.top }}>
            <Cloud width={cloud.width} />
          </span>
        ))}
        <span className="m-hill m-hill-a" />
        <span className="m-hill m-hill-b" />
      </div>

      {children}

      <div className="m-ground" aria-hidden="true" />
    </div>
  );
}

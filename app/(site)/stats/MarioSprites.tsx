/* Sprites are drawn rather than sourced so the board needs no asset pipeline
   and stays crisp at any size. Each takes a pixel size because they sit beside
   text whose scale is set in the stylesheet. */

export function Mushroom({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" focusable="false">
      <path
        d="M4 34a28 26 0 0 1 56 0v3a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6Z"
        fill="#e52521"
        stroke="#17110a"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <circle cx="19" cy="24" r="7.5" fill="#fff3d6" stroke="#17110a" strokeWidth="3" />
      <circle cx="45" cy="24" r="7.5" fill="#fff3d6" stroke="#17110a" strokeWidth="3" />
      <circle cx="32" cy="14" r="5.5" fill="#fff3d6" stroke="#17110a" strokeWidth="3" />
      <path
        d="M14 43v7a12 10 0 0 0 36 0v-7Z"
        fill="#fff3d6"
        stroke="#17110a"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <ellipse cx="24" cy="50" rx="2.8" ry="4" fill="#17110a" />
      <ellipse cx="40" cy="50" rx="2.8" ry="4" fill="#17110a" />
    </svg>
  );
}

export function Coin({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" focusable="false">
      <ellipse cx="24" cy="24" rx="17" ry="21" fill="#fbd000" stroke="#17110a" strokeWidth="3.5" />
      <ellipse cx="24" cy="24" rx="8" ry="13" fill="none" stroke="#e39d25" strokeWidth="3" />
    </svg>
  );
}

export function Trophy({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" focusable="false">
      <path
        d="M16 8h32v18a16 18 0 0 1-32 0Z"
        fill="#fbd000"
        stroke="#17110a"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path d="M16 12H7v8a10 10 0 0 0 10 10" fill="none" stroke="#17110a" strokeWidth="3.5" />
      <path d="M48 12h9v8a10 10 0 0 1-10 10" fill="none" stroke="#17110a" strokeWidth="3.5" />
      <rect x="28" y="40" width="8" height="8" fill="#e39d25" stroke="#17110a" strokeWidth="3" />
      <rect x="18" y="48" width="28" height="8" rx="2" fill="#fbd000" stroke="#17110a" strokeWidth="3.5" />
    </svg>
  );
}

export function Cloud({ width }: { width: number }) {
  return (
    <svg
      viewBox="0 0 120 54"
      width={width}
      height={(width * 54) / 120}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M18 50a16 16 0 0 1 2-30 18 18 0 0 1 32-8 16 16 0 0 1 30 6 17 17 0 0 1 18 32Z"
        fill="#ffffff"
        stroke="#d6e6ff"
        strokeWidth="3"
      />
    </svg>
  );
}

/** The cap badge carries the competitor's own initial rather than a borrowed
    monogram, so the ornament shows real data. */
export function Buddy({ initial, colour, size }: { initial: string; colour: string; size: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" focusable="false">
      <circle cx="32" cy="40" r="19" fill="#f8c89b" stroke="#17110a" strokeWidth="3.5" />
      <ellipse cx="25" cy="37" rx="2.6" ry="3.6" fill="#17110a" />
      <ellipse cx="39" cy="37" rx="2.6" ry="3.6" fill="#17110a" />
      <path d="M20 48q6 6 12 1 6 5 12-1-6-4-12-2-6-2-12 2Z" fill="#17110a" />
      <path
        d="M11 30a21 21 0 0 1 42 0v2H11Z"
        fill={colour}
        stroke="#17110a"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <ellipse cx="45" cy="32" rx="15" ry="5.5" fill={colour} stroke="#17110a" strokeWidth="3.5" />
      <circle cx="30" cy="21" r="9" fill="#fff3d6" stroke="#17110a" strokeWidth="3" />
      <text
        x="30"
        y="25.5"
        textAnchor="middle"
        fontSize="11"
        fontWeight="900"
        fill={colour}
        fontFamily="inherit"
      >
        {initial}
      </text>
    </svg>
  );
}

/** Sport marker for the picker. Volleyball gets its seams, football its
    panels, so the two are told apart by shape rather than by label alone. */
export function SportBall({ sport, size }: { sport: string; size: number }) {
  if (sport === "volleyball") {
    return (
      <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" focusable="false">
        <circle cx="32" cy="32" r="26" fill="#fff3d6" stroke="#17110a" strokeWidth="4" />
        <path d="M12 20q20 10 20 42" fill="none" stroke="#17110a" strokeWidth="3.5" />
        <path d="M56 26q-22 2-33 26" fill="none" stroke="#17110a" strokeWidth="3.5" />
        <path d="M30 6q8 20 -2 34" fill="none" stroke="#17110a" strokeWidth="3.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" focusable="false">
      <circle cx="32" cy="32" r="26" fill="#fff3d6" stroke="#17110a" strokeWidth="4" />
      <path d="M32 18l9 6.5-3.5 10.5h-11L23 24.5Z" fill="#17110a" />
      <path d="M32 6v12M14 25l9 3M50 25l-9 3M22 52l4.5-11M42 52l-4.5-11" stroke="#17110a" strokeWidth="3.5" />
    </svg>
  );
}

/** Rank plate shaped like a question block. The numeral is real text so the
    ranking survives without colour or shape. */
export function RankBlock({ rank, lead }: { rank: number; lead?: boolean }) {
  return (
    <span className={lead ? "m-block m-block-lead" : "m-block"}>
      <i aria-hidden="true" />
      <i aria-hidden="true" />
      <i aria-hidden="true" />
      <i aria-hidden="true" />
      <b>{rank}</b>
    </span>
  );
}

"use client";

import { useActionState, useMemo, useState } from "react";
import { volleyballOutcome } from "@/lib/volleyball";
import type { ResultCompetition, ResultTeam } from "../result-types";
import { recordVolleyballMatchAction } from "./actions";

type SetEntry = { home: string; away: string };

export function VolleyballResultForm({
  competitions,
  teams,
}: {
  competitions: ResultCompetition[];
  teams: ResultTeam[];
}) {
  const [state, formAction] = useActionState(recordVolleyballMatchAction, null);
  const [competitionPublicId, setCompetitionPublicId] = useState(
    competitions[0]?.publicId ?? "",
  );
  const sides = useMemo(
    () =>
      teams.filter(
        (team) =>
          team.competitionPublicId === competitionPublicId && team.status === "in_league",
      ),
    [teams, competitionPublicId],
  );
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [sets, setSets] = useState<SetEntry[]>([{ home: "", away: "" }]);
  const [clientError, setClientError] = useState("");

  const homeOptions = sides.filter((team) => String(team.id) !== awayTeamId);
  const awayOptions = sides.filter((team) => String(team.id) !== homeTeamId);
  const message = clientError || state?.error || "";

  function validate(): string {
    if (!homeTeamId || !awayTeamId) {
      return "Pick a home and an away team.";
    }
    if (homeTeamId === awayTeamId) {
      return "Pick two different teams.";
    }
    const outcome = volleyballOutcome(
      sets.map((entry) => ({ home: Number(entry.home), away: Number(entry.away) })),
    );
    return outcome.ok ? "" : outcome.error;
  }

  function updateSet(index: number, side: keyof SetEntry, value: string) {
    setSets((current) =>
      current.map((entry, position) =>
        position === index ? { ...entry, [side]: value } : entry,
      ),
    );
  }

  return (
    <form
      className="form form-wide"
      action={formAction}
      onSubmit={(event) => {
        const problem = validate();
        setClientError(problem);
        if (problem) {
          event.preventDefault();
        }
      }}
    >
      {message ? <p className="error">{message}</p> : null}
      <div className="form-grid">
        <label htmlFor="competitionPublicId">
          Competition
          <select
            id="competitionPublicId"
            name="competitionPublicId"
            required
            value={competitionPublicId}
            onChange={(event) => {
              setCompetitionPublicId(event.target.value);
              setHomeTeamId("");
              setAwayTeamId("");
            }}
          >
            {competitions.map((competition) => (
              <option key={competition.publicId} value={competition.publicId}>
                {competition.name}
              </option>
            ))}
          </select>
        </label>
        <span />
        <label htmlFor="homeTeamId">
          Home team
          <select
            id="homeTeamId"
            name="homeTeamId"
            required
            value={homeTeamId}
            onChange={(event) => setHomeTeamId(event.target.value)}
          >
            <option value="">Choose a team</option>
            {homeOptions.map((team) => (
              <option key={team.id} value={team.id}>
                {team.teamName}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="awayTeamId">
          Away team
          <select
            id="awayTeamId"
            name="awayTeamId"
            required
            value={awayTeamId}
            onChange={(event) => setAwayTeamId(event.target.value)}
          >
            <option value="">Choose a team</option>
            {awayOptions.map((team) => (
              <option key={team.id} value={team.id}>
                {team.teamName}
              </option>
            ))}
          </select>
        </label>
      </div>

      {sets.map((entry, index) => (
        <div className="sets-row" key={index}>
          <label htmlFor={`setHome-${index}`}>
            Set {index + 1} home
            <input
              id={`setHome-${index}`}
              name="setHome"
              type="number"
              min={0}
              required
              value={entry.home}
              onChange={(event) => updateSet(index, "home", event.target.value)}
            />
          </label>
          <label htmlFor={`setAway-${index}`}>
            Set {index + 1} away
            <input
              id={`setAway-${index}`}
              name="setAway"
              type="number"
              min={0}
              required
              value={entry.away}
              onChange={(event) => updateSet(index, "away", event.target.value)}
            />
          </label>
        </div>
      ))}

      <div className="form-actions">
        <button
          className="btn btn-quiet"
          type="button"
          onClick={() => setSets((current) => [...current, { home: "", away: "" }])}
        >
          Add set
        </button>
        {sets.length > 1 ? (
          <button
            className="btn btn-quiet btn-small"
            type="button"
            onClick={() => setSets((current) => current.slice(0, -1))}
          >
            Remove set
          </button>
        ) : null}
        <button className="btn btn-solid" type="submit">
          Post result
        </button>
      </div>
    </form>
  );
}

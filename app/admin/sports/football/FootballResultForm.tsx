"use client";

import { Fragment, useActionState, useMemo, useState } from "react";
import type { ResultCompetition, ResultTeam } from "../result-types";
import { recordFootballMatchAction } from "./actions";

type Goals = Record<string, string>;

function scorerKey(teamId: number, playerName: string): string {
  return `${teamId}:${playerName}`;
}

function total(side: ResultTeam | undefined, goals: Goals): number {
  if (!side) {
    return 0;
  }
  return side.playerNames.reduce(
    (sum, name) => sum + (Number(goals[scorerKey(side.id, name)]) || 0),
    0,
  );
}

export function FootballResultForm({
  competitions,
  teams,
}: {
  competitions: ResultCompetition[];
  teams: ResultTeam[];
}) {
  const [state, formAction] = useActionState(recordFootballMatchAction, null);
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
  const [homeGoals, setHomeGoals] = useState("0");
  const [awayGoals, setAwayGoals] = useState("0");
  const [goals, setGoals] = useState<Goals>({});
  const [clientError, setClientError] = useState("");

  const home = sides.find((team) => String(team.id) === homeTeamId);
  const away = sides.find((team) => String(team.id) === awayTeamId);
  const homeOptions = sides.filter((team) => String(team.id) !== awayTeamId);
  const awayOptions = sides.filter((team) => String(team.id) !== homeTeamId);
  const scorers = [home, away]
    .filter((side): side is ResultTeam => Boolean(side))
    .flatMap((side) =>
      side.playerNames
        .map((name) => ({
          teamId: side.id,
          playerName: name,
          goals: Number(goals[scorerKey(side.id, name)]) || 0,
        }))
        .filter((row) => row.goals > 0),
    );
  const message = clientError || state?.error || "";

  function validate(): string {
    if (!home || !away) {
      return "Pick a home and an away team.";
    }
    if (home.id === away.id) {
      return "Pick two different teams.";
    }
    if (total(home, goals) !== Number(homeGoals) || total(away, goals) !== Number(awayGoals)) {
      return "Player goal totals must match each team's score.";
    }
    return "";
  }

  function scorerInputs(side: ResultTeam, prefix: string) {
    return side.playerNames.map((name) => {
      const key = scorerKey(side.id, name);
      return (
        <label key={key} htmlFor={`${prefix}-${name}`}>
          {name}
          <input
            id={`${prefix}-${name}`}
            type="number"
            min={0}
            value={goals[key] ?? "0"}
            onChange={(event) =>
              setGoals((current) => ({ ...current, [key]: event.target.value }))
            }
          />
        </label>
      );
    });
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
              setGoals({});
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
        <label htmlFor="homeGoals">
          Home goals
          <input
            id="homeGoals"
            name="homeGoals"
            type="number"
            min={0}
            required
            value={homeGoals}
            onChange={(event) => setHomeGoals(event.target.value)}
          />
        </label>
        <label htmlFor="awayGoals">
          Away goals
          <input
            id="awayGoals"
            name="awayGoals"
            type="number"
            min={0}
            required
            value={awayGoals}
            onChange={(event) => setAwayGoals(event.target.value)}
          />
        </label>
      </div>

      <div className="form-grid">
        <fieldset className="scorer-list">
          <legend>Home scorers</legend>
          {home ? (
            scorerInputs(home, "home")
          ) : (
            <p className="hint">Pick the home team to choose scorers from its registered list.</p>
          )}
        </fieldset>
        <fieldset className="scorer-list">
          <legend>Away scorers</legend>
          {away ? (
            scorerInputs(away, "away")
          ) : (
            <p className="hint">Pick the away team to choose scorers from its registered list.</p>
          )}
        </fieldset>
      </div>

      {scorers.map((row) => (
        <Fragment key={scorerKey(row.teamId, row.playerName)}>
          <input type="hidden" name="scorerTeamId" value={row.teamId} />
          <input type="hidden" name="scorerPlayer" value={row.playerName} />
          <input type="hidden" name="scorerGoals" value={row.goals} />
        </Fragment>
      ))}

      <div className="form-actions">
        <button className="btn btn-solid" type="submit">
          Post result
        </button>
      </div>
    </form>
  );
}

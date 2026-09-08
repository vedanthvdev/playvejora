"use client";

import { useMemo, useState } from "react";
import { catalogueLabel } from "@/lib/catalogue";
import { site } from "@/lib/site-copy";
import {
  citiesForSport,
  sportsOf,
  type Competition,
} from "@/lib/competitions";
import { registerTeamAction } from "./actions";

type Props = {
  waiverText: string;
  competitions: Competition[];
};

const STEPS = ["Team", "Players", "Waiver", "Done"] as const;

export function RegisterWizard({ waiverText, competitions }: Props) {
  const sports = sportsOf(competitions);
  const [sport, setSport] = useState(sports.length === 1 ? sports[0] : "");
  const cities = citiesForSport(competitions, sport);
  const [city, setCity] = useState(cities.length === 1 ? cities[0] : "");
  const chosen = competitions.find(
    (row) => row.sport === sport && row.city === city,
  );
  const needsChoice = sports.length > 1 || cities.length > 1;
  const [picking, setPicking] = useState(needsChoice);
  const [step, setStep] = useState(0);
  const [teamName, setTeamName] = useState("");
  const [company, setCompany] = useState("");
  const [friendsOrMixed, setFriendsOrMixed] = useState(false);
  const [captainEmail, setCaptainEmail] = useState("");
  const [players, setPlayers] = useState([""]);
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [error, setError] = useState("");
  const [outcome, setOutcome] = useState<"in_league" | "waitlist" | null>(null);
  const [publicId, setPublicId] = useState("");
  const [busy, setBusy] = useState(false);

  const namedPlayers = useMemo(
    () => players.map((name) => name.trim()).filter(Boolean),
    [players],
  );

  async function submit() {
    setError("");
    setBusy(true);
    const result = await registerTeamAction({
      teamName,
      company,
      friendsOrMixed,
      captainEmail,
      playerNames: players,
      waiverAccepted,
      competitionPublicId: chosen?.publicId,
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setOutcome(result.status);
    setPublicId(result.publicId);
    setStep(3);
  }

  if (competitions.length === 0) {
    return (
      <div className="panel">
        <p>No leagues are open for registration right now.</p>
      </div>
    );
  }

  return (
    <div>
      {picking ? (
        <div className="panel">
          <form
            className="form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!chosen) {
                setError("Pick a sport and city that are open.");
                return;
              }
              setError("");
              setPicking(false);
            }}
          >
            {sports.length > 1 ? (
              <>
                <label htmlFor="sport">Sport</label>
                <select
                  id="sport"
                  value={sport}
                  onChange={(event) => {
                    const next = event.target.value;
                    setSport(next);
                    const nextCities = citiesForSport(competitions, next);
                    setCity(nextCities.length === 1 ? nextCities[0] : "");
                  }}
                  required
                >
                  <option value="">Choose a sport</option>
                  {sports.map((value) => (
                    <option key={value} value={value}>
                      {catalogueLabel(value)}
                    </option>
                  ))}
                </select>
              </>
            ) : null}
            {sport && cities.length > 1 ? (
              <>
                <label htmlFor="city">City</label>
                <select
                  id="city"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  required
                >
                  <option value="">Choose a city</option>
                  {cities.map((value) => (
                    <option key={value} value={value}>
                      {catalogueLabel(value)}
                    </option>
                  ))}
                </select>
              </>
            ) : null}
            {error ? <p className="error">{error}</p> : null}
            <div className="form-actions">
              <button className="btn btn-solid" type="submit">
                Continue
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
      {chosen ? (
        <p className="competition-choice" aria-label="Selected competition">
          {catalogueLabel(chosen.sport)} · {catalogueLabel(chosen.city)}
        </p>
      ) : null}
      <ol className="progress">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={index === step ? "active" : index < step ? "done" : ""}
          >
            <span>{index < step ? "✓" : index + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      <div className="panel">
        {step === 0 ? (
          <form
            className="form"
            onSubmit={(event) => {
              event.preventDefault();
              setStep(1);
            }}
          >
            <label htmlFor="teamName">Team name</label>
            <input
              id="teamName"
              required
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
            />

            <label htmlFor="company">Company (optional)</label>
            <input
              id="company"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
            />
            <p className="hint">
              Leave this blank if you are a friends or mixed side.
            </p>

            <label className="check">
              <input
                type="checkbox"
                checked={friendsOrMixed}
                onChange={(event) => setFriendsOrMixed(event.target.checked)}
              />
              <span>This is a friends or mixed side</span>
            </label>

            <label htmlFor="captainEmail">Captain email</label>
            <input
              id="captainEmail"
              required
              type="email"
              value={captainEmail}
              onChange={(event) => setCaptainEmail(event.target.value)}
            />
            <p className="hint">Organizers use this to confirm your place.</p>

            <div className="form-actions">
              <button className="btn btn-solid" type="submit">
                Continue to players
              </button>
            </div>
          </form>
        ) : null}

        {step === 1 ? (
          <form
            className="form"
            onSubmit={(event) => {
              event.preventDefault();
              if (namedPlayers.length < 1) {
                setError("Add at least one player name.");
                return;
              }
              setError("");
              setStep(2);
            }}
          >
            <div className="player-rows">
              {players.map((name, index) => (
                <div className="player-row" key={index}>
                  <span className="idx">{index + 1}</span>
                  <input
                    aria-label={`Player ${index + 1}`}
                    value={name}
                    onChange={(event) => {
                      const next = [...players];
                      next[index] = event.target.value;
                      setPlayers(next);
                    }}
                  />
                  {players.length > 1 ? (
                    <button
                      className="btn btn-quiet btn-small"
                      type="button"
                      onClick={() =>
                        setPlayers(
                          players.filter((_, playerIndex) => playerIndex !== index),
                        )
                      }
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              ))}
            </div>

            <p className="hint">
              No fixed squad size while the match format is being confirmed.
            </p>

            {error ? <p className="error">{error}</p> : null}

            <div className="form-actions">
              <button
                className="btn btn-quiet"
                type="button"
                onClick={() => setPlayers([...players, ""])}
              >
                Add player
              </button>
              <button className="btn btn-solid" type="submit">
                Continue to waiver
              </button>
              <button
                className="btn btn-quiet btn-small"
                type="button"
                onClick={() => setStep(0)}
              >
                Back
              </button>
            </div>
          </form>
        ) : null}

        {step === 2 ? (
          <div className="form">
            <div className="waiver">{waiverText}</div>

            <label className="check">
              <input
                type="checkbox"
                checked={waiverAccepted}
                onChange={(event) => setWaiverAccepted(event.target.checked)}
              />
              <span>I accept this waiver on behalf of the listed team</span>
            </label>

            {error ? <p className="error">{error}</p> : null}

            <div className="form-actions">
              <button
                className="btn btn-solid"
                disabled={!waiverAccepted || busy}
                onClick={() => void submit()}
              >
                Submit registration
              </button>
              <button
                className="btn btn-quiet btn-small"
                type="button"
                onClick={() => setStep(1)}
              >
                Back
              </button>
            </div>
          </div>
        ) : null}

        {step === 3 && outcome === "in_league" ? (
          <div className="outcome">
            <span className="badge-xl in">You are in the league.</span>
            <h2>{teamName} has a place in this league.</h2>
            <p>
              Organizers will email {captainEmail} with the venue, the format, and
              your fixtures. Your reference is {publicId}.
            </p>
          </div>
        ) : null}

        {step === 3 && outcome === "waitlist" ? (
          <div className="outcome">
            <span className="badge-xl wait">You are on the waitlist.</span>
            <h2>{teamName} is in line for the next opening.</h2>
            <p>
              The league teams allowed are taken. Organizers will email{" "}
              {captainEmail} if a place frees up. Your reference is {publicId}.
            </p>
          </div>
        ) : null}

        {step === 3 ? (
          <p className="hint">
            Anything to ask before then? Email{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        ) : null}
      </div>
        </>
      )}
    </div>
  );
}

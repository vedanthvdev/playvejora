/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FootballResultForm } from "./FootballResultForm";

const recordAction = vi.fn();

vi.mock("./actions", () => ({
  recordFootballMatchAction: (...args: unknown[]) => recordAction(...args),
}));

const teams = [
  {
    id: 1,
    teamName: "Pitch FC",
    playerNames: ["Alex", "Sam"],
    status: "in_league" as const,
    competitionPublicId: "cmp_edn_football_s1",
  },
  {
    id: 2,
    teamName: "Dockside",
    playerNames: ["Ros"],
    status: "in_league" as const,
    competitionPublicId: "cmp_edn_football_s1",
  },
];

const competitions = [
  {
    publicId: "cmp_edn_football_s1",
    name: "Edinburgh football season one",
  },
];

function optionNames(select: HTMLElement): string[] {
  return [...select.querySelectorAll("option")]
    .map((option) => option.textContent ?? "")
    .filter((label) => label !== "Choose a team");
}

describe("FootballResultForm", () => {
  afterEach(() => {
    cleanup();
    recordAction.mockReset();
  });

  it("fills player lists from the selected registered sides", async () => {
    const user = userEvent.setup();
    render(<FootballResultForm competitions={competitions} teams={teams} />);
    await user.selectOptions(screen.getByLabelText("Home team"), "Pitch FC");
    await user.selectOptions(screen.getByLabelText("Away team"), "Dockside");
    expect(screen.getByLabelText("Alex")).toBeInTheDocument();
    expect(screen.getByLabelText("Sam")).toBeInTheDocument();
    expect(screen.getByLabelText("Ros")).toBeInTheDocument();
  });

  it("keeps the home side out of the away list so one team cannot play itself", async () => {
    const user = userEvent.setup();
    render(<FootballResultForm competitions={competitions} teams={teams} />);
    await user.selectOptions(screen.getByLabelText("Home team"), "Pitch FC");
    expect(optionNames(screen.getByLabelText("Away team"))).toEqual(["Dockside"]);
    await user.selectOptions(screen.getByLabelText("Away team"), "Dockside");
    expect(optionNames(screen.getByLabelText("Home team"))).toEqual(["Pitch FC"]);
  });

  it("reports mismatched player goals without clearing what was typed", async () => {
    const user = userEvent.setup();
    render(<FootballResultForm competitions={competitions} teams={teams} />);
    await user.selectOptions(screen.getByLabelText("Home team"), "Pitch FC");
    await user.selectOptions(screen.getByLabelText("Away team"), "Dockside");
    await user.clear(screen.getByLabelText("Home goals"));
    await user.type(screen.getByLabelText("Home goals"), "2");
    await user.clear(screen.getByLabelText("Alex"));
    await user.type(screen.getByLabelText("Alex"), "1");
    await user.click(screen.getByRole("button", { name: "Post result" }));

    expect(
      screen.getByText("Player goal totals must match each team's score."),
    ).toBeInTheDocument();
    expect(recordAction).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Home goals")).toHaveValue(2);
    expect(screen.getByLabelText("Alex")).toHaveValue(1);
    expect(screen.getByLabelText("Home team")).toHaveValue("1");
  });

  it("adds no layout rows to the form when a player is given goals", async () => {
    const user = userEvent.setup();
    render(<FootballResultForm competitions={competitions} teams={teams} />);
    await user.selectOptions(screen.getByLabelText("Home team"), "Pitch FC");
    await user.selectOptions(screen.getByLabelText("Away team"), "Dockside");
    const form = screen.getByRole("button", { name: "Post result" }).closest("form");
    const rendered = () =>
      [...(form?.children ?? [])].filter(
        (child) => !(child instanceof HTMLInputElement && child.type === "hidden"),
      ).length;
    const rowsBefore = rendered();

    await user.clear(screen.getByLabelText("Alex"));
    await user.type(screen.getByLabelText("Alex"), "2");

    // Scorer fields have to stay hidden inputs parented by the form. A wrapper
    // element would take a grid row and push the submit button down on each goal.
    expect(rendered()).toBe(rowsBefore);
    for (const hidden of form?.querySelectorAll('input[type="hidden"]') ?? []) {
      expect(hidden.parentElement).toBe(form);
    }
  });

  it("posts the result once the goals add up", async () => {
    const user = userEvent.setup();
    render(<FootballResultForm competitions={competitions} teams={teams} />);
    await user.selectOptions(screen.getByLabelText("Home team"), "Pitch FC");
    await user.selectOptions(screen.getByLabelText("Away team"), "Dockside");
    await user.clear(screen.getByLabelText("Home goals"));
    await user.type(screen.getByLabelText("Home goals"), "1");
    await user.clear(screen.getByLabelText("Alex"));
    await user.type(screen.getByLabelText("Alex"), "1");
    await user.click(screen.getByRole("button", { name: "Post result" }));
    expect(recordAction).toHaveBeenCalled();
  });
});

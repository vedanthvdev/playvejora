/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VolleyballResultForm } from "./VolleyballResultForm";

const recordAction = vi.fn();

vi.mock("./actions", () => ({
  recordVolleyballMatchAction: (...args: unknown[]) => recordAction(...args),
}));

const competitions = [
  { publicId: "cmp_mcr_vb_s1", name: "Manchester volleyball season one" },
];

const teams = [
  {
    id: 1,
    teamName: "Spike",
    playerNames: ["Alex"],
    status: "in_league" as const,
    competitionPublicId: "cmp_mcr_vb_s1",
  },
  {
    id: 2,
    teamName: "Block",
    playerNames: ["Ros"],
    status: "in_league" as const,
    competitionPublicId: "cmp_mcr_vb_s1",
  },
];

function optionNames(select: HTMLElement): string[] {
  return [...select.querySelectorAll("option")]
    .map((option) => option.textContent ?? "")
    .filter((label) => label !== "Choose a team");
}

describe("VolleyballResultForm", () => {
  afterEach(() => {
    cleanup();
    recordAction.mockReset();
  });

  it("lets the organizer pick registered sides and type set scores", async () => {
    const user = userEvent.setup();
    render(<VolleyballResultForm competitions={competitions} teams={teams} />);
    await user.selectOptions(screen.getByLabelText("Home team"), "Spike");
    await user.selectOptions(screen.getByLabelText("Away team"), "Block");
    expect(screen.getByLabelText("Set 1 home")).toBeInTheDocument();
    expect(screen.getByLabelText("Set 1 away")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add set" }));
    expect(screen.getByLabelText("Set 2 home")).toBeInTheDocument();
  });

  it("keeps the home side out of the away list so one team cannot play itself", async () => {
    const user = userEvent.setup();
    render(<VolleyballResultForm competitions={competitions} teams={teams} />);
    await user.selectOptions(screen.getByLabelText("Home team"), "Spike");
    expect(optionNames(screen.getByLabelText("Away team"))).toEqual(["Block"]);
  });

  it("reports a tied set without clearing the entered scores", async () => {
    const user = userEvent.setup();
    render(<VolleyballResultForm competitions={competitions} teams={teams} />);
    await user.selectOptions(screen.getByLabelText("Home team"), "Spike");
    await user.selectOptions(screen.getByLabelText("Away team"), "Block");
    await user.type(screen.getByLabelText("Set 1 home"), "25");
    await user.type(screen.getByLabelText("Set 1 away"), "25");
    await user.click(screen.getByRole("button", { name: "Post result" }));

    expect(screen.getByText("Each set needs a winner.")).toBeInTheDocument();
    expect(recordAction).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Set 1 home")).toHaveValue(25);
    expect(screen.getByLabelText("Set 1 away")).toHaveValue(25);
  });

  it("posts the result once every set has a winner", async () => {
    const user = userEvent.setup();
    render(<VolleyballResultForm competitions={competitions} teams={teams} />);
    await user.selectOptions(screen.getByLabelText("Home team"), "Spike");
    await user.selectOptions(screen.getByLabelText("Away team"), "Block");
    await user.type(screen.getByLabelText("Set 1 home"), "25");
    await user.type(screen.getByLabelText("Set 1 away"), "20");
    await user.click(screen.getByRole("button", { name: "Post result" }));
    expect(recordAction).toHaveBeenCalled();
  });
});

/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { site } from "@/lib/site-copy";
import type { Competition } from "@/lib/competitions";
import { RegisterWizard } from "./RegisterWizard";

const registerTeamAction = vi.fn();

vi.mock("./actions", () => ({
  registerTeamAction: (...args: unknown[]) => registerTeamAction(...args),
}));

function competition(overrides: Partial<Competition> = {}): Competition {
  return {
    id: 1,
    publicId: "cmp_edn_football_s1",
    name: "Edinburgh football season one",
    city: "edinburgh",
    sport: "football",
    season: "one",
    leagueCap: 5,
    paymentMode: "open",
    listed: true,
    ...overrides,
  };
}

const oneLeague = [competition()];

describe("RegisterWizard", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    registerTeamAction.mockReset();
    registerTeamAction.mockResolvedValue({
      ok: true,
      status: "in_league",
      publicId: "tm_aabbccddeeff0011",
    });
  });

  it("submits after waiver accept and shows in-league copy", async () => {
    const user = userEvent.setup();
    render(<RegisterWizard waiverText="Placeholder waiver body" competitions={oneLeague} />);
    await user.type(screen.getByLabelText("Team name"), "Pitch FC");
    await user.type(screen.getByLabelText("Captain email"), "cap@example.com");
    await user.click(screen.getByRole("button", { name: "Continue to players" }));
    await user.type(screen.getByLabelText("Player 1"), "Alex");
    await user.click(screen.getByRole("button", { name: "Continue to waiver" }));
    await user.click(
      screen.getByRole("checkbox", {
        name: /I accept this waiver on behalf of the listed team/i,
      }),
    );
    await user.click(screen.getByRole("button", { name: "Submit registration" }));
    expect(registerTeamAction).toHaveBeenCalled();
    expect(await screen.findByText("You are in the league.")).toBeInTheDocument();
    expect(screen.getByText(/Your reference is tm_aabbccddeeff0011/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: site.email })).toHaveAttribute(
      "href",
      `mailto:${site.email}`,
    );
  });

  it("keeps submit disabled until the waiver is accepted", async () => {
    const user = userEvent.setup();
    render(<RegisterWizard waiverText="Placeholder waiver body" competitions={oneLeague} />);
    await user.type(screen.getByLabelText("Team name"), "Pitch FC");
    await user.type(screen.getByLabelText("Captain email"), "cap@example.com");
    await user.click(screen.getByRole("button", { name: "Continue to players" }));
    await user.type(screen.getByLabelText("Player 1"), "Alex");
    await user.click(screen.getByRole("button", { name: "Continue to waiver" }));
    expect(screen.getByRole("button", { name: "Submit registration" })).toBeDisabled();
    expect(registerTeamAction).not.toHaveBeenCalled();
  });

  it("has no payment or Stripe step", () => {
    render(<RegisterWizard waiverText="Placeholder waiver body" competitions={oneLeague} />);
    expect(document.body.textContent).not.toMatch(/stripe/i);
    expect(document.body.textContent).not.toMatch(/\bpay\b/i);
    expect(document.body.textContent).not.toMatch(/checkout/i);
  });

  it("skips the picker when only one league is open", () => {
    render(
      <RegisterWizard waiverText="Placeholder waiver body" competitions={oneLeague} />,
    );
    expect(screen.queryByLabelText("Sport")).toBeNull();
    expect(screen.queryByLabelText("City")).toBeNull();
    expect(screen.getByText("Football · Edinburgh")).toBeInTheDocument();
    expect(screen.getByLabelText("Team name")).toBeInTheDocument();
  });

  it("asks for sport then city when more than one league is open", async () => {
    const user = userEvent.setup();
    render(
      <RegisterWizard
        waiverText="Placeholder waiver body"
        competitions={[
          competition(),
          competition({
            id: 2,
            publicId: "cmp_mcr_volleyball_s1",
            city: "manchester",
            sport: "volleyball",
          }),
        ]}
      />,
    );
    expect(screen.getByLabelText("Sport")).toBeInTheDocument();
    expect(screen.queryByLabelText("Team name")).toBeNull();

    await user.selectOptions(screen.getByLabelText("Sport"), "volleyball");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByLabelText("Team name")).toBeInTheDocument();
  });

  it("sends the chosen league with the registration", async () => {
    const user = userEvent.setup();
    render(
      <RegisterWizard
        waiverText="Placeholder waiver body"
        competitions={[
          competition(),
          competition({
            id: 2,
            publicId: "cmp_mcr_volleyball_s1",
            city: "manchester",
            sport: "volleyball",
          }),
        ]}
      />,
    );
    await user.selectOptions(screen.getByLabelText("Sport"), "volleyball");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.type(screen.getByLabelText("Team name"), "Pitch FC");
    await user.type(screen.getByLabelText("Captain email"), "cap@example.com");
    await user.click(screen.getByRole("button", { name: "Continue to players" }));
    await user.type(screen.getByLabelText("Player 1"), "Alex");
    await user.click(screen.getByRole("button", { name: "Continue to waiver" }));
    await user.click(
      screen.getByRole("checkbox", {
        name: /I accept this waiver on behalf of the listed team/i,
      }),
    );
    await user.click(screen.getByRole("button", { name: "Submit registration" }));
    expect(registerTeamAction).toHaveBeenCalledWith(
      expect.objectContaining({ competitionPublicId: "cmp_mcr_volleyball_s1" }),
    );
  });

  it("blocks continue when every player name is empty", async () => {
    const user = userEvent.setup();
    render(<RegisterWizard waiverText="Placeholder waiver body" competitions={oneLeague} />);
    await user.type(screen.getByLabelText("Team name"), "Pitch FC");
    await user.type(screen.getByLabelText("Captain email"), "cap@example.com");
    await user.click(screen.getByRole("button", { name: "Continue to players" }));
    await user.click(screen.getByRole("button", { name: "Continue to waiver" }));
    expect(screen.getByText("Add at least one player name.")).toBeInTheDocument();
  });
});

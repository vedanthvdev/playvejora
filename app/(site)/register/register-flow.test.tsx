/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { site } from "@/lib/site-copy";
import { RegisterWizard } from "./RegisterWizard";

const registerTeamAction = vi.fn();

vi.mock("./actions", () => ({
  registerTeamAction: (...args: unknown[]) => registerTeamAction(...args),
}));

describe("RegisterWizard", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    registerTeamAction.mockReset();
    registerTeamAction.mockResolvedValue({ ok: true, status: "in_league" });
  });

  it("submits after waiver accept and shows in-league copy", async () => {
    const user = userEvent.setup();
    render(<RegisterWizard waiverText="Placeholder waiver body" />);
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
    expect(screen.getByRole("link", { name: site.email })).toHaveAttribute(
      "href",
      `mailto:${site.email}`,
    );
  });

  it("keeps submit disabled until the waiver is accepted", async () => {
    const user = userEvent.setup();
    render(<RegisterWizard waiverText="Placeholder waiver body" />);
    await user.type(screen.getByLabelText("Team name"), "Pitch FC");
    await user.type(screen.getByLabelText("Captain email"), "cap@example.com");
    await user.click(screen.getByRole("button", { name: "Continue to players" }));
    await user.type(screen.getByLabelText("Player 1"), "Alex");
    await user.click(screen.getByRole("button", { name: "Continue to waiver" }));
    expect(screen.getByRole("button", { name: "Submit registration" })).toBeDisabled();
    expect(registerTeamAction).not.toHaveBeenCalled();
  });

  it("has no payment or Stripe step", () => {
    render(<RegisterWizard waiverText="Placeholder waiver body" />);
    expect(document.body.textContent).not.toMatch(/stripe/i);
    expect(document.body.textContent).not.toMatch(/\bpay\b/i);
    expect(document.body.textContent).not.toMatch(/checkout/i);
  });

  it("blocks continue when every player name is empty", async () => {
    const user = userEvent.setup();
    render(<RegisterWizard waiverText="Placeholder waiver body" />);
    await user.type(screen.getByLabelText("Team name"), "Pitch FC");
    await user.type(screen.getByLabelText("Captain email"), "cap@example.com");
    await user.click(screen.getByRole("button", { name: "Continue to players" }));
    await user.click(screen.getByRole("button", { name: "Continue to waiver" }));
    expect(screen.getByText("Add at least one player name.")).toBeInTheDocument();
  });
});

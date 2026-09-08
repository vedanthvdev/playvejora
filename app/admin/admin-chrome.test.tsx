/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminChrome } from "./AdminChrome";

vi.mock("./actions", () => ({
  logoutAdminAction: () => undefined,
}));

describe("admin chrome", () => {
  afterEach(() => {
    cleanup();
  });

  it("keeps public destinations off the organizer shell", () => {
    render(
      <AdminChrome loggedIn>
        <p>Team intake</p>
      </AdminChrome>,
    );
    expect(screen.queryByRole("link", { name: "Home" })).toBeNull();
    expect(screen.queryByRole("link", { name: "How it works" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Venue & rules" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Origin" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Register" })).toBeNull();
    expect(
      screen.getByRole("button", { name: "Log out" }),
    ).toBeInTheDocument();
  });

  it("hides log out on the login page", () => {
    render(
      <AdminChrome>
        <p>Organizer login</p>
      </AdminChrome>,
    );
    expect(screen.queryByRole("button", { name: "Log out" })).toBeNull();
  });
});

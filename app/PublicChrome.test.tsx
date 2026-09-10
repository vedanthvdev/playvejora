/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PublicChrome } from "./PublicChrome";

const usePathname = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
}));

describe("PublicChrome", () => {
  afterEach(() => {
    cleanup();
  });

  it("keeps Register in the top-right on the home page", () => {
    usePathname.mockReturnValue("/");
    render(
      <PublicChrome>
        <p>Home</p>
      </PublicChrome>,
    );
    expect(screen.getByRole("link", { name: "Register" })).toHaveAttribute(
      "href",
      "/register",
    );
  });

  it("keeps Register in the top-right on other public pages", () => {
    usePathname.mockReturnValue("/how-it-works");
    render(
      <PublicChrome>
        <p>How it works</p>
      </PublicChrome>,
    );
    expect(screen.getByRole("link", { name: "Register" })).toHaveAttribute(
      "href",
      "/register",
    );
  });

  it("marks the current section in the nav", () => {
    usePathname.mockReturnValue("/how-it-works");
    render(
      <PublicChrome>
        <p>How it works</p>
      </PublicChrome>,
    );
    expect(screen.getByRole("link", { name: "How it works" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Stats" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("keeps Stats marked on a sport sub-page", () => {
    usePathname.mockReturnValue("/stats/football/scorers");
    render(
      <PublicChrome>
        <p>Top scorers</p>
      </PublicChrome>,
    );
    expect(screen.getByRole("link", { name: "Stats" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("does not mark Home on every page", () => {
    usePathname.mockReturnValue("/origin");
    render(
      <PublicChrome>
        <p>Origin</p>
      </PublicChrome>,
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});

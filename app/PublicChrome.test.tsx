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
});

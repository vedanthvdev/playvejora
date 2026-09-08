import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REQUIRED_TOKENS = [
  "--pitch-950",
  "--pitch-900",
  "--pitch-800",
  "--pitch-700",
  "--pitch-600",
  "--pitch-500",
  "--lime-400",
  "--lime-300",
  "--canvas",
  "--surface",
  "--surface-subtle",
  "--ink",
  "--ink-secondary",
  "--ink-tertiary",
  "--border",
  "--border-strong",
  "--success-bg",
  "--success-ink",
  "--warning-bg",
  "--warning-ink",
  "--error-bg",
  "--error-ink",
  "--space-4",
  "--radius-card",
  "--shadow-md",
  "--rhythm",
  "--rhythm-sm",
];

describe("design system tokens", () => {
  it("exposes the documented CSS custom properties in :root", () => {
    const css = fs.readFileSync(
      path.join(process.cwd(), "app", "globals.css"),
      "utf8",
    );
    const root = css.slice(css.indexOf(":root"), css.indexOf("}", css.indexOf(":root")));
    for (const token of REQUIRED_TOKENS) {
      expect(root).toContain(`${token}:`);
    }
  });

  it("keeps the native system font stack and no webfont import", () => {
    const css = fs.readFileSync(
      path.join(process.cwd(), "app", "globals.css"),
      "utf8",
    );
    expect(css).toContain("ui-sans-serif");
    expect(css).toContain("-apple-system");
    expect(css).not.toMatch(/@import\s+url\(/);
    expect(css).not.toMatch(/fonts\.googleapis/);
  });
});

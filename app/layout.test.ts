import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const layout = fs.readFileSync(
  path.join(process.cwd(), "app", "layout.tsx"),
  "utf8",
);

describe("root layout", () => {
  it("tolerates browser extensions that add attributes to the html element", () => {
    expect(layout).toMatch(/<html[^>]*suppressHydrationWarning/);
  });

  it("renders nothing that differs between the server and the browser", () => {
    expect(layout).not.toMatch(/Date\.now|Math\.random|typeof window/);
  });
});

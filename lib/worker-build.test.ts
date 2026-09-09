import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function readJson(file: string): Record<string, never> {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

describe("worker build dependencies", () => {
  const pkg = readJson("package.json") as unknown as {
    devDependencies: Record<string, string>;
  };
  const lock = readJson("package-lock.json") as unknown as {
    packages: Record<string, unknown>;
  };

  // @opennextjs/cloudflare imports esbuild without declaring it, so the Worker
  // build only works while esbuild sits at the top of node_modules. Declaring
  // it here keeps that independent of how npm happens to hoist a transitive copy.
  it("declares esbuild, which the Worker build imports but opennextjs does not", () => {
    expect(pkg.devDependencies.esbuild).toBeDefined();
  });

  it("locks esbuild at the top level where opennextjs can resolve it", () => {
    expect(lock.packages["node_modules/esbuild"]).toBeDefined();
  });
});

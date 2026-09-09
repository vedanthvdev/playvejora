import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const workflows = path.join(process.cwd(), ".github", "workflows");

function readWorkflow(name: string): string {
  return fs.readFileSync(path.join(workflows, name), "utf8");
}

describe("release deploy", () => {
  it("ships the Worker after a version tag, including pending D1 migrations", () => {
    const deploy = readWorkflow("deploy.yml");
    expect(deploy).toMatch(/on:\s*\n\s*push:\s*\n\s*tags:\s*\n\s*- ["']v\*/);
    expect(deploy).toMatch(/workflow_dispatch/);
    expect(deploy).toMatch(/d1 migrations apply playvejora --remote/);
    expect(deploy).toMatch(/npm run deploy/);
    expect(deploy).toMatch(/CLOUDFLARE_API_TOKEN/);
    expect(deploy).toMatch(/CLOUDFLARE_ACCOUNT_ID/);
  });

  it("keeps the version job tagging so deploy has a v* event to follow", () => {
    const version = readWorkflow("version.yml");
    expect(version).toMatch(/git push --follow-tags origin HEAD:master/);
  });
});

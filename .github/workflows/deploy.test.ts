import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const workflows = path.join(process.cwd(), ".github", "workflows");

function readWorkflow(name: string): string {
  return fs.readFileSync(path.join(workflows, name), "utf8");
}

describe("release deploy", () => {
  const deploy = readWorkflow("deploy.yml");
  const version = readWorkflow("version.yml");

  it("applies pending D1 migrations before publishing the Worker", () => {
    const migrate = deploy.indexOf("d1 migrations apply playvejora --remote");
    const publish = deploy.indexOf("npm run deploy");
    expect(migrate).toBeGreaterThan(-1);
    expect(publish).toBeGreaterThan(migrate);
    expect(deploy).toMatch(/CLOUDFLARE_API_TOKEN/);
    expect(deploy).toMatch(/CLOUDFLARE_ACCOUNT_ID/);
  });

  it("can be called by another workflow and run by hand", () => {
    expect(deploy).toMatch(/workflow_call/);
    expect(deploy).toMatch(/workflow_dispatch/);
  });

  // GitHub ignores events created with the automatic GITHUB_TOKEN, so the tag
  // the version job pushes can never start a run of its own.
  it("does not wait for a tag push that the version job cannot trigger", () => {
    expect(deploy).not.toMatch(/^\s*tags:/m);
  });

  it("is called by the version job once the bump is tagged", () => {
    expect(version).toMatch(/git push --follow-tags origin HEAD:master/);
    expect(version).toMatch(/needs: bump/);
    expect(version).toMatch(/uses: \.\/\.github\/workflows\/deploy\.yml/);
    expect(version).toMatch(/secrets: inherit/);
  });

  it("ships the commit the version job pushed, not the merge commit", () => {
    expect(deploy).toMatch(/ref: master/);
  });
});

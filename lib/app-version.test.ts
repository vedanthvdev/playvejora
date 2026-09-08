import { describe, expect, it } from "vitest";
import { appVersion, versionInfoBody } from "@/lib/app-version";
import pkg from "../package.json";

describe("hosted version", () => {
  it("reads the same version as package.json", () => {
    expect(appVersion()).toBe(pkg.version);
    expect(versionInfoBody()).toBe(`${pkg.name} ${pkg.version}\n`);
  });
});

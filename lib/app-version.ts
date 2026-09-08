import fs from "node:fs";
import path from "node:path";

type PackageJson = {
  name: string;
  version: string;
};

function readPackage(): PackageJson {
  const raw = fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8");
  return JSON.parse(raw) as PackageJson;
}

export function appVersion(): string {
  return readPackage().version;
}

export function versionInfoBody(): string {
  const pkg = readPackage();
  return `${pkg.name} ${pkg.version}\n`;
}

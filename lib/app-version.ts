import pkg from "../package.json";

// Imported rather than read from disk so the value survives bundling into a
// Worker, where there is no filesystem to read package.json from.
export function appVersion(): string {
  return pkg.version;
}

export function versionInfoBody(): string {
  return `${pkg.name} ${pkg.version}\n`;
}

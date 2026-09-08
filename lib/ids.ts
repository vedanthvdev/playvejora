export function newPublicId(prefix: "tm" | "cmp"): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
  return `${prefix}_${hex}`;
}

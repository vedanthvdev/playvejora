export type CatalogueEntry = {
  slug: string;
  label: string;
};

export const SPORTS: CatalogueEntry[] = [
  { slug: "football", label: "Football" },
  { slug: "volleyball", label: "Volleyball" },
];

export const CITIES: CatalogueEntry[] = [
  { slug: "edinburgh", label: "Edinburgh" },
  { slug: "manchester", label: "Manchester" },
];

export const SEASONS: CatalogueEntry[] = [{ slug: "one", label: "Season one" }];

const bySlug = (rows: CatalogueEntry[], slug: string): CatalogueEntry | undefined =>
  rows.find((row) => row.slug === slug);

export function catalogueLabel(slug: string): string {
  const hit = bySlug(SPORTS, slug) ?? bySlug(CITIES, slug) ?? bySlug(SEASONS, slug);
  return hit?.label ?? slug;
}

export function isSport(slug: string): slug is "football" | "volleyball" {
  return Boolean(bySlug(SPORTS, slug));
}

export type CatalogueInput = {
  city: string;
  sport: string;
  season: string;
};

export type CatalogueResult =
  | { ok: true; city: string; sport: string; season: string }
  | { ok: false; error: string };

export function parseCatalogue(input: CatalogueInput): CatalogueResult {
  const city = input.city.trim().toLowerCase();
  const sport = input.sport.trim().toLowerCase();
  const season = input.season.trim().toLowerCase();
  if (!bySlug(CITIES, city)) {
    return { ok: false, error: "City must be Edinburgh or Manchester." };
  }
  if (!bySlug(SPORTS, sport)) {
    return { ok: false, error: "Sport must be football or volleyball." };
  }
  if (!bySlug(SEASONS, season)) {
    return { ok: false, error: "Season must be chosen from the list." };
  }
  return { ok: true, city, sport, season };
}

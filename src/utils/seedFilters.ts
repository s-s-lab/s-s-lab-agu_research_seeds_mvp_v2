import type { ResearchSeed } from "../types/researchSeed";

export type SeedFilters = {
  query: string;
  mainField: string;
  affiliation: string;
  researcherName: string;
  keyword: string;
  collaborationType: string;
  sdg: string;
  featuredOnly: boolean;
};

export const defaultFilters: SeedFilters = {
  query: "",
  mainField: "",
  affiliation: "",
  researcherName: "",
  keyword: "",
  collaborationType: "",
  sdg: "",
  featuredOnly: false,
};

export const normalizeSearchText = (value: string): string =>
  value.normalize("NFKC").toLowerCase().replace(/\s+/g, "");

const joinSearchValues = (seed: ResearchSeed): string =>
  [
    seed.title,
    seed.catchphrase,
    seed.summary,
    seed.researcherName,
    seed.researcherNameKana,
    seed.affiliation,
    seed.department,
    seed.position,
    seed.mainField,
    ...(seed.subFields ?? []),
    ...(seed.keywords ?? []),
    ...(seed.freeKeywords ?? []),
    ...(seed.expectedApplications ?? []),
    ...(seed.collaborationNeeds ?? []),
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ");

export const getPublishedSeeds = (seeds: ResearchSeed[]): ResearchSeed[] =>
  seeds.filter((seed) => seed.status === "published");

export const filterSeeds = (
  seeds: ResearchSeed[],
  filters: SeedFilters,
): ResearchSeed[] => {
  const normalizedQuery = normalizeSearchText(filters.query);

  return seeds.filter((seed) => {
    if (seed.status !== "published") {
      return false;
    }

    if (filters.featuredOnly && !seed.featured) {
      return false;
    }

    if (filters.mainField && seed.mainField !== filters.mainField) {
      return false;
    }

    if (filters.affiliation && seed.affiliation !== filters.affiliation) {
      return false;
    }

    if (filters.researcherName && seed.researcherName !== filters.researcherName) {
      return false;
    }

    if (
      filters.keyword &&
      ![...seed.keywords, ...(seed.freeKeywords ?? [])].includes(filters.keyword)
    ) {
      return false;
    }

    if (
      filters.collaborationType &&
      !(seed.collaborationTypes ?? []).includes(filters.collaborationType)
    ) {
      return false;
    }

    if (filters.sdg && !(seed.sdgs ?? []).includes(Number(filters.sdg))) {
      return false;
    }

    if (normalizedQuery) {
      const haystack = normalizeSearchText(joinSearchValues(seed));
      return haystack.includes(normalizedQuery);
    }

    return true;
  });
};

export const uniqueSorted = (values: string[]): string[] =>
  [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "ja"));

export const getFilterOptions = (seeds: ResearchSeed[]) => {
  const published = getPublishedSeeds(seeds);
  return {
    mainFields: uniqueSorted(published.map((seed) => seed.mainField)),
    affiliations: uniqueSorted(published.map((seed) => seed.affiliation)),
    researcherNames: uniqueSorted(published.map((seed) => seed.researcherName)),
    keywords: uniqueSorted(
      published.flatMap((seed) => [...seed.keywords, ...(seed.freeKeywords ?? [])]),
    ),
    collaborationTypes: uniqueSorted(
      published.flatMap((seed) => seed.collaborationTypes ?? []),
    ),
    sdgs: [...new Set(published.flatMap((seed) => seed.sdgs ?? []))].sort(
      (a, b) => a - b,
    ),
  };
};

export const getRelatedSeeds = (
  current: ResearchSeed,
  seeds: ResearchSeed[],
  limit = 3,
): ResearchSeed[] => {
  const currentKeywords = new Set(current.keywords);
  const currentSdgs = new Set(current.sdgs ?? []);
  const currentCollaborations = new Set(current.collaborationTypes ?? []);

  return getPublishedSeeds(seeds)
    .filter((seed) => seed.id !== current.id)
    .map((seed) => {
      const keywordScore = seed.keywords.filter((keyword) =>
        currentKeywords.has(keyword),
      ).length;
      const sdgScore = (seed.sdgs ?? []).filter((sdg) => currentSdgs.has(sdg)).length;
      const collaborationScore = (seed.collaborationTypes ?? []).filter((type) =>
        currentCollaborations.has(type),
      ).length;
      const fieldScore = seed.mainField === current.mainField ? 3 : 0;

      return {
        seed,
        score: fieldScore + keywordScore * 2 + sdgScore + collaborationScore,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.seed.title.localeCompare(b.seed.title, "ja"))
    .slice(0, limit)
    .map((item) => item.seed);
};

import type { ResearchSeed } from "../src/types/researchSeed";
import type { AISeedIndex, AISeedIndexItem } from "../src/types/aiSeedIndex";

const list = <T>(value?: T[]): T[] => value ?? [];

export const toAISeedIndexItem = (seed: ResearchSeed): AISeedIndexItem => ({
  id: seed.id,
  title: seed.title,
  catchphrase: seed.catchphrase,
  summary: seed.summary,
  ...(seed.background ? { background: seed.background } : {}),
  strengths: list(seed.strengths),
  expectedApplications: list(seed.expectedApplications),
  collaborationNeeds: list(seed.collaborationNeeds),
  researcherName: seed.researcherName,
  affiliation: seed.affiliation,
  mainField: seed.mainField,
  subFields: list(seed.subFields),
  keywords: list(seed.keywords),
  freeKeywords: list(seed.freeKeywords),
  collaborationTypes: list(seed.collaborationTypes),
  detailUrl: `#/seeds/${encodeURIComponent(seed.id)}`,
});

export const buildAISeedIndex = (seeds: ResearchSeed[]): AISeedIndex => {
  const publishedSeeds = seeds
    .filter((seed) => seed.status === "published")
    .sort((left, right) => left.id.localeCompare(right.id));

  return {
    version: 1,
    count: publishedSeeds.length,
    seeds: publishedSeeds.map(toAISeedIndexItem),
  };
};

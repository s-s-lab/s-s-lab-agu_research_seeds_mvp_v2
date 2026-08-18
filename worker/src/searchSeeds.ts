import type { SeedIndex, SeedIndexItem } from "./seedIndex";

export type SearchSeedsInput = {
  query: string;
  themes?: string[];
  industry?: string;
  limit?: number;
};

export type SeedSearchResult = {
  id: string;
  title: string;
  researcherName: string;
  affiliation: string;
  summary: string;
  mainField: string;
  keywords: string[];
  expectedApplications: string[];
  collaborationTypes: string[];
  score: number;
  matchEvidence: string[];
  detailUrl: string;
};

export type SearchSeedsOutput = {
  count: number;
  results: SeedSearchResult[];
};

const MIN_MATCH_SCORE = 3;

const STOP_TERMS = new Set([
  "研究",
  "技術",
  "活用",
  "課題",
  "企業",
  "組織",
  "検討",
  "実現",
  "可能",
  "対応",
  "相談",
]);

const normalizeText = (value: string): string =>
  value.normalize("NFKC").toLocaleLowerCase("ja-JP").trim();

const addTerm = (terms: Set<string>, value: string): void => {
  const normalized = normalizeText(value);
  if (normalized.length < 2 || STOP_TERMS.has(normalized)) {
    return;
  }
  terms.add(normalized);
};

const extractSearchTerms = (input: SearchSeedsInput): string[] => {
  const terms = new Set<string>();

  for (const part of input.query.split(/[\s、。,.!?！？・:：;；/／()（）【】{}「」『』"'`]+/u)) {
    addTerm(terms, part);

    const semanticParts = part.match(
      /[\p{Script=Han}]{2,}|[\p{Script=Katakana}ー]{2,}|[A-Za-z0-9][A-Za-z0-9+.#-]{1,}/gu,
    );
    semanticParts?.forEach((term) => addTerm(terms, term));
  }

  input.themes?.forEach((theme) => addTerm(terms, theme));
  if (input.industry) {
    addTerm(terms, input.industry);
  }

  return Array.from(terms).slice(0, 24);
};

type SearchField = {
  label: string;
  weight: number;
  values: string[];
};

const getSearchFields = (seed: SeedIndexItem): SearchField[] => [
  { label: "タイトル", weight: 6, values: [seed.title] },
  { label: "キャッチフレーズ", weight: 4, values: [seed.catchphrase] },
  { label: "概要", weight: 3, values: [seed.summary] },
  { label: "背景", weight: 1, values: seed.background ? [seed.background] : [] },
  { label: "強み", weight: 4, values: seed.strengths },
  { label: "想定用途", weight: 5, values: seed.expectedApplications },
  { label: "連携ニーズ", weight: 2, values: seed.collaborationNeeds },
  { label: "研究分野", weight: 4, values: [seed.mainField, ...seed.subFields] },
  { label: "キーワード", weight: 7, values: seed.keywords },
  { label: "自由キーワード", weight: 7, values: seed.freeKeywords },
  { label: "連携形態", weight: 2, values: seed.collaborationTypes },
];

const scoreSeed = (
  seed: SeedIndexItem,
  terms: string[],
): { score: number; evidence: string[] } => {
  let score = 0;
  const evidence = new Map<string, Set<string>>();

  for (const field of getSearchFields(seed)) {
    const normalizedValues = field.values.map(normalizeText);

    for (const term of terms) {
      const matchedValues = normalizedValues.filter((value) => value.includes(term));
      if (matchedValues.length === 0) {
        continue;
      }

      score += field.weight;

      if (
        (field.label === "キーワード" || field.label === "自由キーワード") &&
        normalizedValues.some((value) => value === term)
      ) {
        score += 2;
      }

      const fieldTerms = evidence.get(field.label) ?? new Set<string>();
      fieldTerms.add(term);
      evidence.set(field.label, fieldTerms);
    }
  }

  return {
    score,
    evidence: Array.from(evidence.entries())
      .sort(([, left], [, right]) => right.size - left.size)
      .slice(0, 5)
      .map(([label, matchedTerms]) =>
        `${label}: ${Array.from(matchedTerms).slice(0, 4).join("、")}`,
      ),
  };
};

export const searchSeeds = (
  index: SeedIndex,
  input: SearchSeedsInput,
): SearchSeedsOutput => {
  const terms = extractSearchTerms(input);
  const requestedLimit = Number.isInteger(input.limit) ? input.limit ?? 5 : 5;
  const limit = Math.min(10, Math.max(1, requestedLimit));

  if (terms.length === 0) {
    return { count: 0, results: [] };
  }

  const results = index.seeds
    .map((seed) => ({ seed, ...scoreSeed(seed, terms) }))
    .filter(({ score }) => score >= MIN_MATCH_SCORE)
    .sort(
      (left, right) =>
        right.score - left.score || left.seed.title.localeCompare(right.seed.title, "ja"),
    )
    .slice(0, limit)
    .map(({ seed, score, evidence }) => ({
      id: seed.id,
      title: seed.title,
      researcherName: seed.researcherName,
      affiliation: seed.affiliation,
      summary: seed.summary,
      mainField: seed.mainField,
      keywords: seed.keywords,
      expectedApplications: seed.expectedApplications,
      collaborationTypes: seed.collaborationTypes,
      score,
      matchEvidence: evidence,
      detailUrl: seed.detailUrl,
    }));

  return { count: results.length, results };
};

export const getSeedById = (
  index: SeedIndex,
  seedId: string,
): SeedIndexItem | undefined => index.seeds.find((seed) => seed.id === seedId);

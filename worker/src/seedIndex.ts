export type SeedIndexItem = {
  id: string;
  title: string;
  catchphrase: string;
  summary: string;
  background?: string;
  strengths: string[];
  expectedApplications: string[];
  collaborationNeeds: string[];
  researcherName: string;
  affiliation: string;
  mainField: string;
  subFields: string[];
  keywords: string[];
  freeKeywords: string[];
  collaborationTypes: string[];
  detailUrl: string;
};

export type SeedIndex = {
  version: 1;
  count: number;
  seeds: SeedIndexItem[];
};

const MAX_INDEX_BYTES = 2 * 1024 * 1024;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isSeedIndexItem = (value: unknown): value is SeedIndexItem => {
  if (!isRecord(value)) {
    return false;
  }

  const requiredStrings = [
    "id",
    "title",
    "catchphrase",
    "summary",
    "researcherName",
    "affiliation",
    "mainField",
    "detailUrl",
  ] as const;

  const requiredArrays = [
    "strengths",
    "expectedApplications",
    "collaborationNeeds",
    "subFields",
    "keywords",
    "freeKeywords",
    "collaborationTypes",
  ] as const;

  return (
    requiredStrings.every((key) => typeof value[key] === "string") &&
    requiredArrays.every((key) => isStringArray(value[key])) &&
    (value.background === undefined || typeof value.background === "string")
  );
};

export const parseSeedIndex = (value: unknown): SeedIndex => {
  if (!isRecord(value)) {
    throw new Error("Seed index must be an object.");
  }

  if (value.version !== 1 || typeof value.count !== "number") {
    throw new Error("Unsupported seed index metadata.");
  }

  if (!Array.isArray(value.seeds) || !value.seeds.every(isSeedIndexItem)) {
    throw new Error("Seed index contains invalid seed records.");
  }

  if (value.count !== value.seeds.length) {
    throw new Error("Seed index count does not match its records.");
  }

  return value as SeedIndex;
};

const readTextWithLimit = async (
  response: Response,
  maxBytes: number,
): Promise<string> => {
  const declaredLength = response.headers.get("content-length");
  if (declaredLength) {
    const parsedLength = Number(declaredLength);
    if (Number.isFinite(parsedLength) && parsedLength > maxBytes) {
      throw new Error("Seed index exceeds the maximum allowed size.");
    }
  }

  if (!response.body) {
    return "";
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel();
      throw new Error("Seed index exceeds the maximum allowed size.");
    }

    chunks.push(value);
  }

  const combined = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(combined);
};

export const loadSeedIndex = async (
  indexUrl: string,
  fetcher: typeof fetch = fetch,
): Promise<SeedIndex> => {
  const response = await fetcher(indexUrl, {
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Seed index request failed with status ${response.status}.`);
  }

  const text = await readTextWithLimit(response, MAX_INDEX_BYTES);

  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    throw new Error("Seed index is not valid JSON.");
  }

  return parseSeedIndex(parsed);
};

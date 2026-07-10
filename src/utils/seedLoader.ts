import type { ResearchSeed } from "../types/researchSeed";
import { validateSeedFiles } from "./validation";

const seedModules = import.meta.glob("../content/seeds/*.json", {
  eager: true,
  import: "default",
}) as Record<string, unknown>;

const seedFiles = Object.entries(seedModules).map(([path, data]) => ({
  fileName: path.split("/").pop() ?? path,
  data,
}));

const validationResult = validateSeedFiles(seedFiles);

export const allSeeds: ResearchSeed[] = validationResult.validSeeds.sort((a, b) =>
  (b.updatedAt ?? b.publishedAt ?? "").localeCompare(
    a.updatedAt ?? a.publishedAt ?? "",
  ),
);

export const dataIssues = validationResult.issues;

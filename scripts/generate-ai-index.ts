import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ResearchSeed } from "../src/types/researchSeed";
import { buildAISeedIndex } from "./ai-index";

const seedsDir = path.resolve("src/content/seeds");
const outputDir = path.resolve("public/data");
const outputPath = path.join(outputDir, "seeds-index.json");

const readResearchSeeds = async (): Promise<ResearchSeed[]> => {
  const fileNames = (await readdir(seedsDir))
    .filter((fileName) => fileName.endsWith(".json"))
    .sort();

  return Promise.all(
    fileNames.map(async (fileName) => {
      const filePath = path.join(seedsDir, fileName);
      const source = await readFile(filePath, "utf-8");

      try {
        return JSON.parse(source) as ResearchSeed;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`${fileName} のJSON解析に失敗しました: ${message}`);
      }
    }),
  );
};

const main = async () => {
  const seeds = await readResearchSeeds();
  const index = buildAISeedIndex(seeds);

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(index, null, 2)}\n`, "utf-8");

  console.log(`AI search index generated: ${index.count} published seeds -> ${outputPath}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

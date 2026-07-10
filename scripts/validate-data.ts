import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import {
  validateSeedFiles,
  type DataValidationIssue,
  type SeedFileInput,
} from "../src/utils/validation";

const projectRoot = process.cwd();
const seedDir = path.join(projectRoot, "src", "content", "seeds");
const mediaDir = path.join(projectRoot, "public", "media");

const walkFiles = (dir: string): string[] => {
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir).flatMap((entry) => {
    const fullPath = path.join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      return walkFiles(fullPath);
    }
    return [fullPath];
  });
};

const knownImagePaths = new Set(
  walkFiles(mediaDir).map((filePath) =>
    path.relative(path.join(projectRoot, "public"), filePath).replace(/\\/g, "/"),
  ),
);

const parseIssues: DataValidationIssue[] = [];
const seedFiles: SeedFileInput[] = existsSync(seedDir)
  ? readdirSync(seedDir)
      .filter((fileName) => fileName.endsWith(".json"))
      .sort()
      .map((fileName) => {
        const filePath = path.join(seedDir, fileName);
        try {
          return {
            fileName,
            data: JSON.parse(readFileSync(filePath, "utf-8")) as unknown,
          };
        } catch {
          parseIssues.push({
            fileName,
            field: "(json)",
            message: "JSONとして読み込めません。カンマや引用符を確認してください。",
          });
          return { fileName, data: null };
        }
      })
  : [];

if (seedFiles.length === 0) {
  parseIssues.push({
    fileName: "src/content/seeds",
    field: "(directory)",
    message: "研究シーズJSONが見つかりません。",
  });
}

const result = validateSeedFiles(seedFiles, { knownImagePaths });
const issues = [...parseIssues, ...result.issues];

if (issues.length > 0) {
  console.error("研究シーズデータの検証でエラーが見つかりました。");
  for (const issue of issues) {
    console.error(`- ${issue.fileName} / ${issue.field}: ${issue.message}`);
  }
  process.exit(1);
}

console.log(`研究シーズデータ検証OK: ${result.validSeeds.length}件`);

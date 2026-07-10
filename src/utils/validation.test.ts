import { describe, expect, it } from "vitest";
import type { ResearchSeed } from "../types/researchSeed";
import { validateResearchSeed, validateSeedFiles } from "./validation";

const validSeed: ResearchSeed = {
  id: "seed-test",
  status: "published",
  featured: false,
  title: "テスト研究シーズ",
  catchphrase: "検証用",
  summary: "検証用の概要です。",
  researcherName: "架空研究者",
  affiliation: "架空所属",
  mainField: "情報",
  keywords: ["検証"],
  sdgs: [4, 9],
  thumbnail: "media/seeds/seed-test/thumbnail.svg",
};

describe("validation", () => {
  it("必須項目の不足を検出する", () => {
    const issues = validateResearchSeed("missing.json", {
      ...validSeed,
      title: "",
      keywords: [],
    });

    expect(issues.some((issue) => issue.field === "title")).toBe(true);
    expect(issues.some((issue) => issue.field === "keywords")).toBe(true);
  });

  it("ID重複を検出する", () => {
    const result = validateSeedFiles([
      { fileName: "a.json", data: validSeed },
      { fileName: "b.json", data: { ...validSeed, title: "別タイトル" } },
    ]);

    expect(result.issues.some((issue) => issue.field === "id")).toBe(true);
  });

  it("不正なURL、SDGs番号、status、画像パスを検出する", () => {
    const issues = validateResearchSeed("invalid.json", {
      ...validSeed,
      status: "ready",
      profileUrl: "javascript:alert(1)",
      sdgs: [0, 18],
      thumbnail: "../secret.png",
    });

    expect(issues.some((issue) => issue.field === "status")).toBe(true);
    expect(issues.some((issue) => issue.field === "profileUrl")).toBe(true);
    expect(issues.some((issue) => issue.field === "sdgs")).toBe(true);
    expect(issues.some((issue) => issue.field === "thumbnail")).toBe(true);
  });
});

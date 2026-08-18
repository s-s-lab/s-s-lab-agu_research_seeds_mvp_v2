import { describe, expect, it } from "vitest";
import { parseSeedIndex } from "./seedIndex";

const validIndex = {
  version: 1,
  count: 1,
  seeds: [
    {
      id: "seed-001",
      title: "研究シーズ",
      catchphrase: "キャッチフレーズ",
      summary: "概要",
      strengths: ["強み"],
      expectedApplications: ["用途"],
      collaborationNeeds: ["連携ニーズ"],
      researcherName: "研究者",
      affiliation: "所属",
      mainField: "分野",
      subFields: [],
      keywords: ["キーワード"],
      freeKeywords: [],
      collaborationTypes: ["共同研究"],
      detailUrl: "#/seeds/seed-001",
    },
  ],
} as const;

describe("parseSeedIndex", () => {
  it("accepts the generated index shape", () => {
    const parsed = parseSeedIndex(validIndex);
    expect(parsed.count).toBe(1);
    expect(parsed.seeds[0]?.id).toBe("seed-001");
  });

  it("rejects a mismatched count", () => {
    expect(() => parseSeedIndex({ ...validIndex, count: 2 })).toThrow(
      "count does not match",
    );
  });

  it("rejects records missing required public fields", () => {
    const invalidSeed = { ...validIndex.seeds[0], keywords: undefined };
    expect(() =>
      parseSeedIndex({ ...validIndex, seeds: [invalidSeed] }),
    ).toThrow("invalid seed records");
  });
});

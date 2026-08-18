import { describe, expect, it } from "vitest";
import type { SeedIndex } from "./seedIndex";
import { getSeedById, searchSeeds } from "./searchSeeds";

const index: SeedIndex = {
  version: 1,
  count: 3,
  seeds: [
    {
      id: "seed-disaster",
      title: "地域防災のためのセンサーデータ統合",
      catchphrase: "複数センサーから地域の変化を捉える",
      summary: "IoTセンサーの情報を統合し、地域防災へ活用する研究です。",
      strengths: ["複数種類のセンサーデータ統合"],
      expectedApplications: ["災害時の状況把握", "自治体の防災計画"],
      collaborationNeeds: ["実証フィールド"],
      researcherName: "青山 太郎",
      affiliation: "理工学部",
      mainField: "情報工学",
      subFields: ["防災情報"],
      keywords: ["防災", "センサー", "IoT"],
      freeKeywords: ["地域安全"],
      collaborationTypes: ["共同研究"],
      detailUrl: "#/seeds/seed-disaster",
    },
    {
      id: "seed-energy",
      title: "未利用熱の回収とエネルギー最適化",
      catchphrase: "廃熱を地域・工場のエネルギーへ",
      summary: "製造工程などの未利用熱を回収し、省エネルギー化を検討します。",
      strengths: ["熱エネルギー評価"],
      expectedApplications: ["工場の廃熱利用", "CO2排出削減"],
      collaborationNeeds: ["設備データ"],
      researcherName: "青山 花子",
      affiliation: "理工学部",
      mainField: "熱工学",
      subFields: ["エネルギー工学"],
      keywords: ["廃熱", "省エネルギー", "熱回収"],
      freeKeywords: ["カーボンニュートラル"],
      collaborationTypes: ["技術相談"],
      detailUrl: "#/seeds/seed-energy",
    },
    {
      id: "seed-education",
      title: "学習データを活用した教育支援",
      catchphrase: "学びの状態をデータから理解する",
      summary: "教育現場の学習データ分析に関する研究です。",
      strengths: ["学習分析"],
      expectedApplications: ["授業改善"],
      collaborationNeeds: ["教育データ"],
      researcherName: "青山 次郎",
      affiliation: "教育人間科学部",
      mainField: "教育工学",
      subFields: ["学習分析"],
      keywords: ["教育", "データ分析"],
      freeKeywords: [],
      collaborationTypes: ["共同研究"],
      detailUrl: "#/seeds/seed-education",
    },
  ],
};

describe("searchSeeds", () => {
  it("ranks matching keyword and application fields first", () => {
    const output = searchSeeds(index, {
      query: "食品工場で発生する廃熱を回収してCO2を削減したい",
      themes: ["廃熱", "熱回収", "省エネルギー"],
      industry: "食品製造",
      limit: 3,
    });

    expect(output.results[0]?.id).toBe("seed-energy");
    expect(output.results[0]?.score).toBeGreaterThan(0);
    expect(output.results[0]?.matchEvidence.length).toBeGreaterThan(0);
  });

  it("extracts Japanese semantic chunks from a natural-language query", () => {
    const output = searchSeeds(index, {
      query: "地域の災害状況をセンサーで早く把握したい",
    });

    expect(output.results[0]?.id).toBe("seed-disaster");
  });

  it("returns no forced recommendation when nothing matches", () => {
    const output = searchSeeds(index, {
      query: "深海生物の遺伝子配列について相談したい",
    });

    expect(output).toEqual({ count: 0, results: [] });
  });

  it("does not treat collaboration intent alone as a research match", () => {
    const output = searchSeeds(index, {
      query: "共同研究について相談したい",
    });

    expect(output).toEqual({ count: 0, results: [] });
  });

  it("respects the requested result limit", () => {
    const output = searchSeeds(index, {
      query: "データ",
      limit: 1,
    });

    expect(output.count).toBe(1);
    expect(output.results).toHaveLength(1);
  });
});

describe("getSeedById", () => {
  it("returns only a seed present in the published index", () => {
    expect(getSeedById(index, "seed-energy")?.title).toContain("未利用熱");
    expect(getSeedById(index, "draft-secret")).toBeUndefined();
  });
});

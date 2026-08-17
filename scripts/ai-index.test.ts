import { describe, expect, it } from "vitest";
import type { ResearchSeed } from "../src/types/researchSeed";
import { buildAISeedIndex, toAISeedIndexItem } from "./ai-index";

const seed = (overrides: Partial<ResearchSeed> = {}): ResearchSeed => ({
  id: "seed-001",
  status: "published",
  featured: false,
  title: "テスト研究シーズ",
  catchphrase: "テスト用キャッチコピー",
  summary: "テスト用の研究概要です。",
  researcherName: "研究者A",
  affiliation: "青山学院大学",
  mainField: "情報・データサイエンス",
  keywords: ["AI", "データ"],
  thumbnail: "media/seeds/seed-001/thumbnail.svg",
  ...overrides,
});

describe("AI seed index", () => {
  it("公開中の研究シーズだけをインデックス化する", () => {
    const index = buildAISeedIndex([
      seed({ id: "seed-002", status: "draft" }),
      seed({ id: "seed-001", status: "published" }),
    ]);

    expect(index.version).toBe(1);
    expect(index.count).toBe(1);
    expect(index.seeds.map((item) => item.id)).toEqual(["seed-001"]);
  });

  it("未設定の配列項目を空配列として正規化する", () => {
    const item = toAISeedIndexItem(seed());

    expect(item.strengths).toEqual([]);
    expect(item.expectedApplications).toEqual([]);
    expect(item.collaborationNeeds).toEqual([]);
    expect(item.subFields).toEqual([]);
    expect(item.freeKeywords).toEqual([]);
    expect(item.collaborationTypes).toEqual([]);
    expect(item.detailUrl).toBe("#/seeds/seed-001");
  });
});

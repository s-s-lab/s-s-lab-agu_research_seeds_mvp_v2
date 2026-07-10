import { describe, expect, it } from "vitest";
import type { ResearchSeed } from "../types/researchSeed";
import {
  defaultFilters,
  filterSeeds,
  getPublishedSeeds,
  getRelatedSeeds,
} from "./seedFilters";

const seed = (overrides: Partial<ResearchSeed>): ResearchSeed => ({
  id: "seed-base",
  status: "published",
  featured: false,
  title: "防災データ基盤",
  catchphrase: "地域の判断を支える",
  summary: "センサデータを用いた避難判断支援",
  researcherName: "架空研究者",
  affiliation: "架空所属",
  mainField: "情報",
  keywords: ["防災", "センサ"],
  expectedApplications: ["避難支援"],
  collaborationNeeds: ["実証実験"],
  collaborationTypes: ["共同研究"],
  sdgs: [11],
  thumbnail: "media/seeds/seed-base/thumbnail.svg",
  ...overrides,
});

describe("seedFilters", () => {
  it("フリーワード検索でタイトル、概要、用途、連携ニーズを検索する", () => {
    const seeds = [
      seed({ id: "a", title: "観光分析", summary: "地域回遊を支援" }),
      seed({ id: "b", title: "材料評価", expectedApplications: ["軽量部材"] }),
    ];

    expect(filterSeeds(seeds, { ...defaultFilters, query: "軽量" })).toHaveLength(1);
    expect(filterSeeds(seeds, { ...defaultFilters, query: "地域 回遊" })).toHaveLength(1);
  });

  it("複数条件による絞り込みを行う", () => {
    const seeds = [
      seed({
        id: "a",
        mainField: "情報",
        affiliation: "A所属",
        keywords: ["防災"],
        collaborationTypes: ["実証実験"],
        sdgs: [11],
        featured: true,
      }),
      seed({
        id: "b",
        mainField: "生命科学",
        affiliation: "B所属",
        keywords: ["創薬"],
        collaborationTypes: ["データ解析"],
        sdgs: [3],
      }),
    ];

    const results = filterSeeds(seeds, {
      ...defaultFilters,
      mainField: "情報",
      affiliation: "A所属",
      keyword: "防災",
      collaborationType: "実証実験",
      sdg: "11",
      featuredOnly: true,
    });

    expect(results.map((item) => item.id)).toEqual(["a"]);
  });

  it("公開中データだけを返す", () => {
    const seeds = [
      seed({ id: "published", status: "published" }),
      seed({ id: "draft", status: "draft" }),
    ];

    expect(getPublishedSeeds(seeds).map((item) => item.id)).toEqual(["published"]);
    expect(filterSeeds(seeds, defaultFilters).map((item) => item.id)).toEqual([
      "published",
    ]);
  });

  it("関連シーズを分野、キーワード、SDGsから抽出する", () => {
    const current = seed({
      id: "current",
      mainField: "情報",
      keywords: ["防災", "センサ"],
      sdgs: [11],
    });
    const related = seed({
      id: "related",
      mainField: "情報",
      keywords: ["防災"],
      sdgs: [11],
    });
    const unrelated = seed({
      id: "unrelated",
      mainField: "人文",
      keywords: ["古典籍"],
      sdgs: [4],
      collaborationTypes: ["資料提供"],
    });

    expect(getRelatedSeeds(current, [current, unrelated, related])).toEqual([related]);
  });
});

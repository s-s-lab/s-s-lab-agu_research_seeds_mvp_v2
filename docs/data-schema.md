# データスキーマ

研究シーズJSONは`ResearchSeed`型に合わせます。

```ts
type ResearchSeed = {
  id: string;
  status: "published" | "draft";
  featured: boolean;
  title: string;
  catchphrase: string;
  summary: string;
  background?: string;
  strengths?: string[];
  expectedApplications?: string[];
  collaborationNeeds?: string[];
  researcherName: string;
  researcherNameKana?: string;
  affiliation: string;
  department?: string;
  position?: string;
  profileUrl?: string;
  mainField: string;
  subFields?: string[];
  keywords: string[];
  freeKeywords?: string[];
  sdgs?: number[];
  collaborationTypes?: string[];
  patentStatus?: string;
  intellectualProperty?: string;
  thumbnail: string;
  images?: { src: string; alt: string; caption?: string }[];
  videos?: { title: string; url: string; provider?: string }[];
  relatedLinks?: { label: string; url: string }[];
  contactLabel?: string;
  publishedAt?: string;
  updatedAt?: string;
};
```

## 検証内容

`npm run validate:data`では、必須項目、ID重複、URL、SDGs番号、status、画像パス、画像ファイルの存在を確認します。エラーはファイル名付きで表示されます。

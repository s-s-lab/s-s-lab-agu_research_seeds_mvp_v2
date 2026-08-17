export type AISeedIndexItem = {
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

export type AISeedIndex = {
  version: 1;
  count: number;
  seeds: AISeedIndexItem[];
};

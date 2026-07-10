export type SeedStatus = "published" | "draft";

export type ResearchSeedImage = {
  src: string;
  alt: string;
  caption?: string;
};

export type ResearchSeedVideo = {
  title: string;
  url: string;
  provider?: string;
};

export type ResearchSeedLink = {
  label: string;
  url: string;
};

export type ResearchSeed = {
  id: string;
  status: SeedStatus;
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
  images?: ResearchSeedImage[];
  videos?: ResearchSeedVideo[];
  relatedLinks?: ResearchSeedLink[];
  contactLabel?: string;
  publishedAt?: string;
  updatedAt?: string;
};

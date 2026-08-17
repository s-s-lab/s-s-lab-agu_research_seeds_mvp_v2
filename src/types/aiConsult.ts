export type NormalizedChallenge = {
  summary: string;
  industry?: string;
  goals: string[];
  themes: string[];
};

export type AIConsultRecommendation = {
  seedId: string;
  title: string;
  researcherName: string;
  affiliation: string;
  summary: string;
  reason: string;
  solutionIdea: string;
  detailUrl: string;
};

export type AIConsultResponse = {
  normalizedChallenge: NormalizedChallenge;
  recommendations: AIConsultRecommendation[];
  nextQuestions: string[];
  disclaimer: string;
};

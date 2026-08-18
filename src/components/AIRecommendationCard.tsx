import { ArrowRight, FlaskConical, Lightbulb, Link2 } from "lucide-react";
import type { AIConsultRecommendation } from "../types/aiConsult";

type AIRecommendationCardProps = {
  recommendation: AIConsultRecommendation;
};

export const AIRecommendationCard = ({
  recommendation,
}: AIRecommendationCardProps) => (
  <article className="ai-recommendation-card">
    <div className="ai-recommendation-heading">
      <span className="ai-recommendation-icon" aria-hidden="true">
        <FlaskConical size={20} />
      </span>
      <div>
        <p>{recommendation.affiliation}</p>
        <h3>{recommendation.title}</h3>
        <span>{recommendation.researcherName}</span>
      </div>
    </div>

    <p className="ai-recommendation-summary">{recommendation.summary}</p>

    <div className="ai-recommendation-insight">
      <div>
        <Link2 size={17} aria-hidden="true" />
        <strong>この課題との接点</strong>
      </div>
      <p>{recommendation.reason}</p>
    </div>

    <div className="ai-recommendation-insight idea">
      <div>
        <Lightbulb size={17} aria-hidden="true" />
        <strong>AIによる活用アイデア</strong>
      </div>
      <p>{recommendation.solutionIdea}</p>
    </div>

    <a className="text-link" href={recommendation.detailUrl}>
      研究シーズ詳細を見る
      <ArrowRight size={16} aria-hidden="true" />
    </a>
  </article>
);

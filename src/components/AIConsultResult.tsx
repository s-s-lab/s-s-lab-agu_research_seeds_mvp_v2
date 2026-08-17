import { ArrowRight, CheckCircle2, MessageSquareText } from "lucide-react";
import type { AIConsultResponse } from "../types/aiConsult";
import { AIRecommendationCard } from "./AIRecommendationCard";

type AIConsultResultProps = {
  response: AIConsultResponse;
};

export const AIConsultResult = ({ response }: AIConsultResultProps) => (
  <section className="ai-consult-result" aria-live="polite">
    <div className="ai-consult-result-header">
      <p className="eyebrow">Consultation Result</p>
      <h2>相談内容から見つかった研究シーズ</h2>
      <p>
        現在はPhase Aの画面確認用サンプルです。次の工程でOpenAIとMCPによる実際の研究シーズ検索へ接続します。
      </p>
    </div>

    <div className="ai-challenge-summary">
      <div>
        <MessageSquareText size={21} aria-hidden="true" />
        <h3>あなたの課題</h3>
      </div>
      <p>{response.normalizedChallenge.summary}</p>
      <div className="tag-list">
        {response.normalizedChallenge.themes.map((theme) => (
          <span key={theme}>{theme}</span>
        ))}
      </div>
    </div>

    <div className="ai-recommendation-grid">
      {response.recommendations.map((recommendation) => (
        <AIRecommendationCard
          key={recommendation.seedId}
          recommendation={recommendation}
        />
      ))}
    </div>

    <div className="ai-next-actions">
      <div>
        <p className="eyebrow">Next Step</p>
        <h3>次に確認するとよいこと</h3>
        <ul className="check-list">
          {response.nextQuestions.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ul>
      </div>
      <div className="ai-consult-contact">
        <CheckCircle2 size={26} aria-hidden="true" />
        <h3>大学へ相談する</h3>
        <p>
          関心のある研究シーズや課題が整理できたら、問い合わせ窓口からご相談いただけます。
        </p>
        <a className="button secondary" href="#/contact?source=ai-consult">
          この内容について相談する
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      </div>
    </div>

    <p className="ai-consult-disclaimer">{response.disclaimer}</p>
  </section>
);

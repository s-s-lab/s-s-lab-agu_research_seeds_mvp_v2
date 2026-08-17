import { useMemo, useState } from "react";
import { Bot, Search, Sparkles } from "lucide-react";
import type { ResearchSeed } from "../types/researchSeed";
import type { AIConsultResponse } from "../types/aiConsult";
import { AIConsultForm } from "../components/AIConsultForm";
import { AIConsultResult } from "../components/AIConsultResult";
import { getPublishedSeeds } from "../utils/seedFilters";

type AIConsultPageProps = {
  seeds: ResearchSeed[];
};

const createMockResponse = (
  challenge: string,
  seeds: ResearchSeed[],
): AIConsultResponse => {
  const candidates = seeds.slice(0, 3);
  const themes = Array.from(
    new Set(candidates.flatMap((seed) => [seed.mainField, ...(seed.subFields ?? [])])),
  ).slice(0, 4);

  return {
    normalizedChallenge: {
      summary: challenge.trim(),
      goals: ["課題を具体化する", "大学研究との接点を探す"],
      themes,
    },
    recommendations: candidates.map((seed) => ({
      seedId: seed.id,
      title: seed.title,
      researcherName: seed.researcherName,
      affiliation: seed.affiliation,
      summary: seed.summary,
      reason: `${seed.mainField}に関する研究であり、${
        seed.expectedApplications?.[0] ?? "関連分野での活用"
      }などの観点から、相談内容との接点を検討できる可能性があります。`,
      solutionIdea: `${
        seed.collaborationTypes?.[0] ?? "技術相談"
      }を入口に、課題条件を研究者と整理しながら、小規模な検証や適用可能性の確認につなげることが考えられます。`,
      detailUrl: `#/seeds/${seed.id}`,
    })),
    nextQuestions: [
      "現在の課題が発生している場面や対象を、もう少し具体化する",
      "実現したい成果と、許容できる期間・条件を整理する",
      "関心のある研究シーズを選び、大学への相談時に共有する",
    ],
    disclaimer:
      "表示内容は研究シーズ情報をもとにした検討支援であり、研究成果による課題解決や共同研究の成立を保証するものではありません。",
  };
};

export const AIConsultPage = ({ seeds }: AIConsultPageProps) => {
  const [challenge, setChallenge] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AIConsultResponse>();
  const publishedSeeds = useMemo(() => getPublishedSeeds(seeds), [seeds]);

  const handleSubmit = () => {
    if (challenge.trim().length < 20 || isLoading) {
      return;
    }

    setIsLoading(true);
    setResponse(undefined);

    window.setTimeout(() => {
      setResponse(createMockResponse(challenge, publishedSeeds));
      setIsLoading(false);
      window.setTimeout(() => {
        document
          .querySelector(".ai-consult-result")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }, 900);
  };

  return (
    <>
      <section className="section ai-consult-hero">
        <div className="ai-consult-intro">
          <p className="eyebrow">AI Research Consultation</p>
          <h1>解決したい課題から、大学の研究を探す。</h1>
          <p className="lead">
            研究分野や専門用語が分からなくても大丈夫です。御社・組織が抱える課題や、実現したいことを自由に入力してください。公開中の研究シーズから、関連する研究や連携の可能性を探します。
          </p>
          <div className="ai-consult-feature-list">
            <div>
              <Bot size={19} aria-hidden="true" />
              <span>自然な言葉で相談</span>
            </div>
            <div>
              <Search size={19} aria-hidden="true" />
              <span>公開シーズから探索</span>
            </div>
            <div>
              <Sparkles size={19} aria-hidden="true" />
              <span>活用イメージまで整理</span>
            </div>
          </div>
        </div>
        <div className="ai-consult-form-panel">
          <AIConsultForm
            value={challenge}
            isLoading={isLoading}
            onChange={setChallenge}
            onSubmit={handleSubmit}
          />
        </div>
      </section>

      {isLoading && (
        <section className="section narrow ai-consult-loading" aria-live="polite">
          <div className="ai-loading-mark" aria-hidden="true">
            <Sparkles size={24} />
          </div>
          <div>
            <strong>研究シーズを探しています</strong>
            <ol>
              <li>相談内容を整理しています</li>
              <li>関連する研究分野を探しています</li>
              <li>研究シーズを比較しています</li>
              <li>提案をまとめています</li>
            </ol>
          </div>
        </section>
      )}

      {response && (
        <section className="section">
          <AIConsultResult response={response} />
        </section>
      )}
    </>
  );
};

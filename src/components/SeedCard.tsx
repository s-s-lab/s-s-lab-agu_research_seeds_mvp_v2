import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import type { ResearchSeed } from "../types/researchSeed";
import { assetPath } from "../utils/assetPath";

type SeedCardProps = {
  seed: ResearchSeed;
  compact?: boolean;
};

export const SeedCard = ({ seed, compact = false }: SeedCardProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  const keywords = seed.keywords.slice(0, compact ? 3 : 4);

  return (
    <article className={`seed-card${compact ? " compact" : ""}`}>
      <div className="seed-card-image">
        {imageFailed ? (
          <div className="image-fallback" role="img" aria-label="画像なし">
            {seed.mainField.slice(0, 2)}
          </div>
        ) : (
          <img
            src={assetPath(seed.thumbnail)}
            alt={`${seed.title}のサムネイル`}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        )}
        <span className="field-badge">{seed.mainField}</span>
        {seed.featured ? (
          <span className="featured-badge">
            <Sparkles size={14} aria-hidden="true" />
            注目
          </span>
        ) : null}
      </div>
      <div className="seed-card-body">
        <p className="seed-card-kicker">
          {seed.researcherName} / {seed.affiliation}
        </p>
        <h3>{seed.title}</h3>
        <p className="catchphrase">{seed.catchphrase}</p>
        {!compact ? <p className="summary">{seed.summary}</p> : null}
        <div className="tag-list" aria-label="主要キーワード">
          {keywords.map((keyword) => (
            <span key={keyword}>{keyword}</span>
          ))}
        </div>
        <a className="text-link" href={`#/seeds/${seed.id}`}>
          詳細を見る
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
};

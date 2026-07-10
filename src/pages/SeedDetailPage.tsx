import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Mail,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";
import type { ResearchSeed } from "../types/researchSeed";
import { SeedCard } from "../components/SeedCard";
import { assetPath } from "../utils/assetPath";
import { getRelatedSeeds } from "../utils/seedFilters";
import { getYoutubeEmbedUrl } from "../utils/links";

type SeedDetailPageProps = {
  seed?: ResearchSeed;
  seeds: ResearchSeed[];
};

type DetailSectionProps = {
  title: string;
  children?: React.ReactNode;
};

const DetailSection = ({ title, children }: DetailSectionProps) => {
  if (!children) {
    return null;
  }

  return (
    <section className="detail-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
};

const BulletList = ({ items }: { items?: string[] }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <ul className="check-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
};

export const SeedDetailPage = ({ seed, seeds }: SeedDetailPageProps) => {
  const [mainImageFailed, setMainImageFailed] = useState(false);
  const relatedSeeds = useMemo(
    () => (seed ? getRelatedSeeds(seed, seeds, 3) : []),
    [seed, seeds],
  );

  if (!seed || seed.status !== "published") {
    return (
      <section className="section narrow">
        <a className="text-link" href="#/seeds">
          <ArrowLeft size={16} aria-hidden="true" />
          一覧へ戻る
        </a>
        <h1>研究シーズが見つかりません</h1>
        <p>公開中のデータに存在しないか、現在は下書き状態の研究シーズです。</p>
      </section>
    );
  }

  const mainImage = seed.images?.[0]?.src ?? seed.thumbnail;
  const gallery = seed.images ?? [
    { src: seed.thumbnail, alt: `${seed.title}のメイン画像` },
  ];

  return (
    <article className="section detail-page">
      <a className="text-link back-link" href="#/seeds">
        <ArrowLeft size={16} aria-hidden="true" />
        研究シーズ一覧へ戻る
      </a>

      <header className="detail-hero">
        <div>
          <p className="field-badge inline">{seed.mainField}</p>
          <h1>{seed.title}</h1>
          <p className="detail-catchphrase">{seed.catchphrase}</p>
          <div className="researcher-line">
            <strong>{seed.researcherName}</strong>
            <span>
              {seed.affiliation}
              {seed.position ? ` / ${seed.position}` : ""}
            </span>
          </div>
          <div className="detail-actions">
            <a className="button primary" href={`#/contact?seed=${seed.id}`}>
              <Mail size={16} aria-hidden="true" />
              この研究シーズについて問い合わせる
            </a>
            {seed.profileUrl ? (
              <a
                className="button ghost"
                href={seed.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                研究者プロフィール
                <ExternalLink size={16} aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>
        <div className="detail-main-image">
          {mainImageFailed ? (
            <div className="image-fallback large" role="img" aria-label="画像なし">
              {seed.mainField}
            </div>
          ) : (
            <img
              src={assetPath(mainImage)}
              alt={gallery[0]?.alt ?? `${seed.title}のメイン画像`}
              onError={() => setMainImageFailed(true)}
            />
          )}
        </div>
      </header>

      <div className="detail-layout">
        <div className="detail-main">
          <DetailSection title="研究概要">
            <p>{seed.summary}</p>
          </DetailSection>
          <DetailSection title="研究の背景">
            {seed.background ? <p>{seed.background}</p> : null}
          </DetailSection>
          <DetailSection title="技術・研究上の強み">
            <BulletList items={seed.strengths} />
          </DetailSection>
          <DetailSection title="想定される活用分野">
            <BulletList items={seed.expectedApplications} />
          </DetailSection>
          <DetailSection title="企業・自治体等に求める連携">
            <BulletList items={seed.collaborationNeeds} />
          </DetailSection>

          <DetailSection title="画像ギャラリー">
            <div className="gallery-grid">
              {gallery.map((image) => (
                <figure key={image.src}>
                  <img src={assetPath(image.src)} alt={image.alt} loading="lazy" />
                  {image.caption ? <figcaption>{image.caption}</figcaption> : null}
                </figure>
              ))}
            </div>
          </DetailSection>

          <DetailSection title="動画">
            {seed.videos && seed.videos.length > 0 ? (
              <div className="video-list">
                {seed.videos.map((video) => {
                  const embedUrl = getYoutubeEmbedUrl(video.url);
                  return (
                    <div className="video-item" key={video.url}>
                      <h3>
                        <PlayCircle size={18} aria-hidden="true" />
                        {video.title}
                      </h3>
                      {embedUrl ? (
                        <iframe
                          src={embedUrl}
                          title={video.title}
                          loading="lazy"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : (
                        <a
                          className="button ghost"
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          外部動画を開く
                          <ExternalLink size={16} aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </DetailSection>
        </div>

        <aside className="detail-side">
          <section>
            <h2>基本情報</h2>
            <dl className="meta-list">
              <div>
                <dt>研究分野</dt>
                <dd>
                  {[seed.mainField, ...(seed.subFields ?? [])].map((field) => (
                    <span key={field}>{field}</span>
                  ))}
                </dd>
              </div>
              <div>
                <dt>キーワード</dt>
                <dd>
                  {[...seed.keywords, ...(seed.freeKeywords ?? [])].map((keyword) => (
                    <span key={keyword}>{keyword}</span>
                  ))}
                </dd>
              </div>
              <div>
                <dt>SDGs</dt>
                <dd>
                  {(seed.sdgs ?? []).map((sdg) => (
                    <span key={sdg}>SDG {sdg}</span>
                  ))}
                </dd>
              </div>
              <div>
                <dt>連携種別</dt>
                <dd>
                  {(seed.collaborationTypes ?? []).map((type) => (
                    <span key={type}>{type}</span>
                  ))}
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <h2>
              <ShieldCheck size={18} aria-hidden="true" />
              知的財産・特許情報
            </h2>
            <p>{seed.patentStatus ?? "個別相談時に確認"}</p>
            {seed.intellectualProperty ? <p>{seed.intellectualProperty}</p> : null}
          </section>

          {seed.relatedLinks && seed.relatedLinks.length > 0 ? (
            <section>
              <h2>関連リンク</h2>
              <div className="link-list">
                {seed.relatedLinks.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                    <ExternalLink size={15} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>

      {relatedSeeds.length > 0 ? (
        <section className="related-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Related</p>
              <h2>関連する研究シーズ</h2>
            </div>
          </div>
          <div className="seed-grid">
            {relatedSeeds.map((related) => (
              <SeedCard key={related.id} seed={related} compact />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
};

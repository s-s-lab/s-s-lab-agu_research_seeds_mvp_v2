import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, Building2, Mail, Search, Sparkles } from "lucide-react";
import type { ResearchSeed } from "../types/researchSeed";
import { SeedCard } from "../components/SeedCard";
import { getFilterOptions, getPublishedSeeds } from "../utils/seedFilters";

type HomePageProps = {
  seeds: ResearchSeed[];
};

export const HomePage = ({ seeds }: HomePageProps) => {
  const [query, setQuery] = useState("");
  const publishedSeeds = useMemo(() => getPublishedSeeds(seeds), [seeds]);
  const options = useMemo(() => getFilterOptions(seeds), [seeds]);
  const featuredSeeds = publishedSeeds.filter((seed) => seed.featured).slice(0, 3);
  const recentSeeds = publishedSeeds.slice(0, 4);

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set("q", query.trim());
    }
    window.location.hash = `/seeds${params.toString() ? `?${params.toString()}` : ""}`;
  };

  return (
    <>
      <section className="hero section">
        <div className="hero-copy">
          <p className="eyebrow">Aoyama Gakuin University Research Seeds</p>
          <h1>研究成果・技術・知見を、連携のきっかけへ。</h1>
          <p>
            学外の企業、自治体、研究機関、一般利用者に向けて、研究シーズを検索・比較・詳細確認できるMVPです。
          </p>
          <form className="hero-search" onSubmit={onSearch} role="search">
            <label htmlFor="home-search">キーワード検索</label>
            <div>
              <Search size={19} aria-hidden="true" />
              <input
                id="home-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="研究テーマ、キーワード、活用分野を入力"
              />
              <button className="button primary" type="submit">
                検索
              </button>
            </div>
          </form>

          <div className="hero-ai-cta">
            <Sparkles size={24} aria-hidden="true" />
            <div>
              <strong>何を探せばよいか分からないときは、AI研究相談へ</strong>
              <span>解決したい課題を自然な言葉で入力すると、関連する研究シーズとの接点を探します。</span>
            </div>
            <a className="button secondary" href="#/consult">
              AIに相談する
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="hero-panel" aria-label="公開データ概要">
          <dl>
            <div>
              <dt>{publishedSeeds.length}</dt>
              <dd>公開中シーズ</dd>
            </div>
            <div>
              <dt>{options.mainFields.length}</dt>
              <dd>研究分野</dd>
            </div>
            <div>
              <dt>{featuredSeeds.length}</dt>
              <dd>注目シーズ</dd>
            </div>
          </dl>
          <a className="button secondary" href="#/seeds">
            一覧を見る
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="section compact-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Fields</p>
            <h2>分野から探す</h2>
          </div>
          <a className="text-link" href="#/seeds">
            すべての条件で探す
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
        <div className="field-chip-grid">
          {options.mainFields.map((field) => (
            <a key={field} href={`#/seeds?field=${encodeURIComponent(field)}`}>
              {field}
            </a>
          ))}
        </div>
      </section>

      <section className="section compact-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Featured</p>
            <h2>注目の研究シーズ</h2>
          </div>
        </div>
        <div className="seed-grid">
          {featuredSeeds.map((seed) => (
            <SeedCard key={seed.id} seed={seed} />
          ))}
        </div>
      </section>

      <section className="section two-column-band">
        <div>
          <p className="eyebrow">Recently Updated</p>
          <h2>新着・更新された研究シーズ</h2>
          <div className="recent-list">
            {recentSeeds.map((seed) => (
              <a key={seed.id} href={`#/seeds/${seed.id}`}>
                <span>{seed.mainField}</span>
                <strong>{seed.title}</strong>
                <small>{seed.updatedAt ?? seed.publishedAt}</small>
              </a>
            ))}
          </div>
        </div>
        <div className="partner-panel">
          <Building2 size={28} aria-hidden="true" />
          <h2>企業・自治体等の皆さまへ</h2>
          <p>
            共同研究、技術相談、実証実験、教育連携など、研究者との接点づくりに向けて研究シーズを探せます。
          </p>
          <a className="button secondary" href="#/contact">
            <Mail size={16} aria-hidden="true" />
            問い合わせへ
          </a>
        </div>
      </section>
    </>
  );
};

import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import type { ResearchSeed } from "../types/researchSeed";
import { FilterPanel } from "../components/FilterPanel";
import { SeedCard } from "../components/SeedCard";
import {
  defaultFilters,
  filterSeeds,
  getFilterOptions,
  type SeedFilters,
} from "../utils/seedFilters";

type SeedsPageProps = {
  seeds: ResearchSeed[];
  params: URLSearchParams;
};

const filtersFromParams = (params: URLSearchParams): SeedFilters => ({
  ...defaultFilters,
  query: params.get("q") ?? "",
  mainField: params.get("field") ?? "",
  keyword: params.get("keyword") ?? "",
});

export const SeedsPage = ({ seeds, params }: SeedsPageProps) => {
  const [filters, setFilters] = useState<SeedFilters>(() => filtersFromParams(params));
  const options = useMemo(() => getFilterOptions(seeds), [seeds]);
  const results = useMemo(() => filterSeeds(seeds, filters), [seeds, filters]);

  return (
    <section className="section">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">Search</p>
          <h1>研究シーズ一覧</h1>
          <p>フリーワード、分野、所属、研究者名、キーワード、連携希望内容、SDGsで絞り込めます。</p>
        </div>
        <div className="result-count" aria-live="polite">
          <strong>{results.length}</strong>
          <span>件表示</span>
        </div>
      </div>

      <FilterPanel
        filters={filters}
        options={options}
        onChange={setFilters}
        onClear={() => setFilters(defaultFilters)}
      />

      {results.length > 0 ? (
        <div className="seed-grid">
          {results.map((seed) => (
            <SeedCard key={seed.id} seed={seed} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <SearchX size={42} aria-hidden="true" />
          <h2>該当する研究シーズがありません</h2>
          <p>キーワードを短くする、分野やSDGsの条件を外すなど、検索条件を見直してください。</p>
          <button className="button secondary" type="button" onClick={() => setFilters(defaultFilters)}>
            条件をクリア
          </button>
        </div>
      )}
    </section>
  );
};

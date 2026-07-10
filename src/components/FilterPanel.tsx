import { RotateCcw, SlidersHorizontal } from "lucide-react";
import type { SeedFilters } from "../utils/seedFilters";

type FilterOptions = {
  mainFields: string[];
  affiliations: string[];
  researcherNames: string[];
  keywords: string[];
  collaborationTypes: string[];
  sdgs: number[];
};

type FilterPanelProps = {
  filters: SeedFilters;
  options: FilterOptions;
  onChange: (filters: SeedFilters) => void;
  onClear: () => void;
};

const sdgLabel = (sdg: number): string => `SDG ${sdg}`;

export const FilterPanel = ({
  filters,
  options,
  onChange,
  onClear,
}: FilterPanelProps) => {
  const update = <K extends keyof SeedFilters>(key: K, value: SeedFilters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const controls = (
    <div className="filters-grid">
      <label>
        <span>フリーワード</span>
        <input
          type="search"
          value={filters.query}
          onChange={(event) => update("query", event.target.value)}
          placeholder="例：AI 防災 共同研究"
        />
      </label>
      <label>
        <span>研究分野</span>
        <select
          value={filters.mainField}
          onChange={(event) => update("mainField", event.target.value)}
        >
          <option value="">すべて</option>
          {options.mainFields.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>所属</span>
        <select
          value={filters.affiliation}
          onChange={(event) => update("affiliation", event.target.value)}
        >
          <option value="">すべて</option>
          {options.affiliations.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>研究者名</span>
        <select
          value={filters.researcherName}
          onChange={(event) => update("researcherName", event.target.value)}
        >
          <option value="">すべて</option>
          {options.researcherNames.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>キーワード</span>
        <select
          value={filters.keyword}
          onChange={(event) => update("keyword", event.target.value)}
        >
          <option value="">すべて</option>
          {options.keywords.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>連携希望内容</span>
        <select
          value={filters.collaborationType}
          onChange={(event) => update("collaborationType", event.target.value)}
        >
          <option value="">すべて</option>
          {options.collaborationTypes.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>SDGs</span>
        <select value={filters.sdg} onChange={(event) => update("sdg", event.target.value)}>
          <option value="">すべて</option>
          {options.sdgs.map((value) => (
            <option key={value} value={String(value)}>
              {sdgLabel(value)}
            </option>
          ))}
        </select>
      </label>
      <label className="checkbox-field">
        <input
          type="checkbox"
          checked={filters.featuredOnly}
          onChange={(event) => update("featuredOnly", event.target.checked)}
        />
        <span>注目シーズのみ表示</span>
      </label>
      <button className="button ghost" type="button" onClick={onClear}>
        <RotateCcw size={16} aria-hidden="true" />
        条件をクリア
      </button>
    </div>
  );

  return (
    <aside className="filter-panel" aria-label="研究シーズ検索条件">
      <div className="filter-panel-desktop">{controls}</div>
      <details className="filter-panel-mobile">
        <summary>
          <SlidersHorizontal size={18} aria-hidden="true" />
          検索条件
        </summary>
        {controls}
      </details>
    </aside>
  );
};

import { ChangeEvent, useMemo, useState } from "react";
import { Download, FileJson, Plus, Upload } from "lucide-react";
import type { ResearchSeed } from "../types/researchSeed";
import { SeedCard } from "../components/SeedCard";
import { validateResearchSeed, type DataValidationIssue } from "../utils/validation";

type DataEditorPageProps = {
  seeds: ResearchSeed[];
};

type JsonArrayField = "images" | "videos" | "relatedLinks";

const blankSeed: ResearchSeed = {
  id: "seed-new",
  status: "draft",
  featured: false,
  title: "",
  catchphrase: "",
  summary: "",
  researcherName: "架空研究者（サンプル）",
  affiliation: "青山学院大学 サンプル所属（架空）",
  mainField: "",
  keywords: [],
  thumbnail: "media/seeds/seed-new/thumbnail.svg",
};

const cloneSeed = (seed: ResearchSeed): ResearchSeed =>
  JSON.parse(JSON.stringify(seed)) as ResearchSeed;

const listToText = (items?: string[]): string => (items ?? []).join("\n");

const textToList = (value: string): string[] =>
  value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const sdgsToText = (items?: number[]): string => (items ?? []).join(", ");

const textToSdgs = (value: string): number[] =>
  value
    .split(/\n|,/)
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item));

const fileNameForSeed = (id: string): string => {
  const safeId = id.trim().replace(/[^a-zA-Z0-9-_]/g, "-") || "seed-new";
  return `${safeId}.json`;
};

const formatSeedJson = (seed: ResearchSeed): string =>
  `${JSON.stringify(seed, null, 2)}\n`;

const parseJsonArray = (
  field: JsonArrayField,
  value: string,
): { value: unknown[] | undefined; issue?: DataValidationIssue } => {
  if (!value.trim()) {
    return { value: undefined };
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return {
        value: undefined,
        issue: {
          fileName: "編集中",
          field,
          message: "JSON配列として入力してください。",
        },
      };
    }
    return { value: parsed };
  } catch {
    return {
      value: undefined,
      issue: {
        fileName: "編集中",
        field,
        message: "JSONの形式を確認してください。",
      },
    };
  }
};

export const DataEditorPage = ({ seeds }: DataEditorPageProps) => {
  const [form, setForm] = useState<ResearchSeed>(() => cloneSeed(blankSeed));
  const [imagesJson, setImagesJson] = useState("[]");
  const [videosJson, setVideosJson] = useState("[]");
  const [linksJson, setLinksJson] = useState("[]");
  const [message, setMessage] = useState("");

  const applySeed = (seed: ResearchSeed) => {
    setForm(cloneSeed(seed));
    setImagesJson(JSON.stringify(seed.images ?? [], null, 2));
    setVideosJson(JSON.stringify(seed.videos ?? [], null, 2));
    setLinksJson(JSON.stringify(seed.relatedLinks ?? [], null, 2));
  };

  const updateField = <K extends keyof ResearchSeed>(
    field: K,
    value: ResearchSeed[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const draftSeed = useMemo(() => {
    const imageResult = parseJsonArray("images", imagesJson);
    const videoResult = parseJsonArray("videos", videosJson);
    const linkResult = parseJsonArray("relatedLinks", linksJson);
    const parseIssues = [
      imageResult.issue,
      videoResult.issue,
      linkResult.issue,
    ].filter((issue): issue is DataValidationIssue => Boolean(issue));

    const composed: ResearchSeed = {
      ...form,
      images: imageResult.value as ResearchSeed["images"],
      videos: videoResult.value as ResearchSeed["videos"],
      relatedLinks: linkResult.value as ResearchSeed["relatedLinks"],
    };

    return { seed: composed, parseIssues };
  }, [form, imagesJson, linksJson, videosJson]);

  const validationIssues = useMemo(
    () => [
      ...draftSeed.parseIssues,
      ...validateResearchSeed(fileNameForSeed(draftSeed.seed.id), draftSeed.seed),
    ],
    [draftSeed],
  );

  const requiredStatus = [
    ["id", "ID"],
    ["title", "研究シーズ名"],
    ["catchphrase", "キャッチコピー"],
    ["summary", "概要"],
    ["researcherName", "研究者名"],
    ["affiliation", "所属"],
    ["mainField", "主分野"],
    ["thumbnail", "サムネイル"],
  ].map(([field, label]) => ({
    field,
    label,
    ok: Boolean(draftSeed.seed[field as keyof ResearchSeed]),
  }));

  const downloadJson = () => {
    const blob = new Blob([formatSeedJson(draftSeed.seed)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileNameForSeed(draftSeed.seed.id);
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const onFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result ?? "")) as ResearchSeed;
        applySeed(parsed);
        setMessage(`${file.name}を読み込みました。`);
      } catch {
        setMessage("JSONファイルを読み込めませんでした。形式を確認してください。");
      }
    };
    reader.readAsText(file, "utf-8");
  };

  return (
    <section className="section data-editor-page">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">Data Helper</p>
          <h1>データ編集支援</h1>
          <p>
            この画面はデータ作成を支援するものです。生成したJSONファイルをGitHubリポジトリへ追加し、Pull Requestまたはコミットを行うことで公開サイトへ反映されます。
          </p>
        </div>
      </div>

      <div className="editor-notice" role="note">
        GitHubへ直接コミットする機能、管理者ログイン、ブラウザからのトークン入力は実装していません。
      </div>

      <div className="editor-layout">
        <div className="editor-form">
          <section className="editor-toolbar" aria-label="JSON読み込み">
            <label>
              <span>既存サンプルを読み込む</span>
              <select
                value=""
                onChange={(event) => {
                  const selected = seeds.find((seed) => seed.id === event.target.value);
                  if (selected) {
                    applySeed(selected);
                    setMessage(`${selected.title}を読み込みました。`);
                  }
                }}
              >
                <option value="">選択してください</option>
                {seeds.map((seed) => (
                  <option key={seed.id} value={seed.id}>
                    {seed.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="file-button">
              <Upload size={16} aria-hidden="true" />
              JSONを読み込む
              <input type="file" accept="application/json,.json" onChange={onFileSelected} />
            </label>
            <button
              className="button secondary"
              type="button"
              onClick={() => {
                applySeed(blankSeed);
                setMessage("新規登録用の入力欄を用意しました。");
              }}
            >
              <Plus size={16} aria-hidden="true" />
              新規登録
            </button>
          </section>

          {message ? <p className="editor-message" aria-live="polite">{message}</p> : null}

          <div className="form-grid">
            <label>
              <span>ID</span>
              <input value={form.id} onChange={(event) => updateField("id", event.target.value)} />
            </label>
            <label>
              <span>公開状態</span>
              <select
                value={form.status}
                onChange={(event) =>
                  updateField(
                    "status",
                    event.target.value === "published" ? "published" : "draft",
                  )
                }
              >
                <option value="draft">下書き</option>
                <option value="published">公開</option>
              </select>
            </label>
            <label className="checkbox-field align-end">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => updateField("featured", event.target.checked)}
              />
              <span>注目シーズ</span>
            </label>
            <label className="span-2">
              <span>研究シーズ名</span>
              <input
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
              />
            </label>
            <label className="span-2">
              <span>キャッチコピー</span>
              <input
                value={form.catchphrase}
                onChange={(event) => updateField("catchphrase", event.target.value)}
              />
            </label>
            <label className="span-2">
              <span>概要</span>
              <textarea
                rows={4}
                value={form.summary}
                onChange={(event) => updateField("summary", event.target.value)}
              />
            </label>
            <label className="span-2">
              <span>研究の背景</span>
              <textarea
                rows={3}
                value={form.background ?? ""}
                onChange={(event) => updateField("background", event.target.value)}
              />
            </label>
            <label>
              <span>研究者名</span>
              <input
                value={form.researcherName}
                onChange={(event) => updateField("researcherName", event.target.value)}
              />
            </label>
            <label>
              <span>研究者名かな</span>
              <input
                value={form.researcherNameKana ?? ""}
                onChange={(event) => updateField("researcherNameKana", event.target.value)}
              />
            </label>
            <label>
              <span>所属</span>
              <input
                value={form.affiliation}
                onChange={(event) => updateField("affiliation", event.target.value)}
              />
            </label>
            <label>
              <span>職位</span>
              <input
                value={form.position ?? ""}
                onChange={(event) => updateField("position", event.target.value)}
              />
            </label>
            <label>
              <span>主分野</span>
              <input
                value={form.mainField}
                onChange={(event) => updateField("mainField", event.target.value)}
              />
            </label>
            <label>
              <span>サブ分野</span>
              <textarea
                rows={3}
                value={listToText(form.subFields)}
                onChange={(event) => updateField("subFields", textToList(event.target.value))}
              />
            </label>
            <label>
              <span>キーワード</span>
              <textarea
                rows={3}
                value={listToText(form.keywords)}
                onChange={(event) => updateField("keywords", textToList(event.target.value))}
              />
            </label>
            <label>
              <span>自由キーワード</span>
              <textarea
                rows={3}
                value={listToText(form.freeKeywords)}
                onChange={(event) => updateField("freeKeywords", textToList(event.target.value))}
              />
            </label>
            <label>
              <span>SDGs番号</span>
              <input
                value={sdgsToText(form.sdgs)}
                onChange={(event) => updateField("sdgs", textToSdgs(event.target.value))}
                placeholder="例：9, 11, 13"
              />
            </label>
            <label>
              <span>連携種別</span>
              <textarea
                rows={3}
                value={listToText(form.collaborationTypes)}
                onChange={(event) =>
                  updateField("collaborationTypes", textToList(event.target.value))
                }
              />
            </label>
            <label className="span-2">
              <span>技術・研究上の強み</span>
              <textarea
                rows={3}
                value={listToText(form.strengths)}
                onChange={(event) => updateField("strengths", textToList(event.target.value))}
              />
            </label>
            <label className="span-2">
              <span>想定される活用分野</span>
              <textarea
                rows={3}
                value={listToText(form.expectedApplications)}
                onChange={(event) =>
                  updateField("expectedApplications", textToList(event.target.value))
                }
              />
            </label>
            <label className="span-2">
              <span>企業・自治体等に求める連携</span>
              <textarea
                rows={3}
                value={listToText(form.collaborationNeeds)}
                onChange={(event) =>
                  updateField("collaborationNeeds", textToList(event.target.value))
                }
              />
            </label>
            <label>
              <span>サムネイル画像パス</span>
              <input
                value={form.thumbnail}
                onChange={(event) => updateField("thumbnail", event.target.value)}
              />
            </label>
            <label>
              <span>研究者プロフィールURL</span>
              <input
                value={form.profileUrl ?? ""}
                onChange={(event) => updateField("profileUrl", event.target.value)}
              />
            </label>
            <label>
              <span>特許ステータス</span>
              <input
                value={form.patentStatus ?? ""}
                onChange={(event) => updateField("patentStatus", event.target.value)}
              />
            </label>
            <label>
              <span>知的財産情報</span>
              <input
                value={form.intellectualProperty ?? ""}
                onChange={(event) =>
                  updateField("intellectualProperty", event.target.value)
                }
              />
            </label>
            <label>
              <span>公開日</span>
              <input
                type="date"
                value={form.publishedAt ?? ""}
                onChange={(event) => updateField("publishedAt", event.target.value)}
              />
            </label>
            <label>
              <span>更新日</span>
              <input
                type="date"
                value={form.updatedAt ?? ""}
                onChange={(event) => updateField("updatedAt", event.target.value)}
              />
            </label>
            <label className="span-2">
              <span>画像ギャラリー JSON</span>
              <textarea rows={6} value={imagesJson} onChange={(event) => setImagesJson(event.target.value)} />
            </label>
            <label className="span-2">
              <span>動画 JSON</span>
              <textarea rows={5} value={videosJson} onChange={(event) => setVideosJson(event.target.value)} />
            </label>
            <label className="span-2">
              <span>関連リンク JSON</span>
              <textarea rows={5} value={linksJson} onChange={(event) => setLinksJson(event.target.value)} />
            </label>
          </div>
        </div>

        <aside className="editor-side">
          <section>
            <h2>必須項目</h2>
            <ul className="status-list">
              {requiredStatus.map((item) => (
                <li key={item.field} className={item.ok ? "ok" : "ng"}>
                  <span aria-hidden="true">{item.ok ? "OK" : "未"}</span>
                  {item.label}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>検証結果</h2>
            {validationIssues.length === 0 ? (
              <p className="success-text">入力内容は基本検証を通過しています。</p>
            ) : (
              <ul className="issue-list">
                {validationIssues.map((issue) => (
                  <li key={`${issue.field}-${issue.message}`}>
                    {issue.field}: {issue.message}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2>ファイル名候補</h2>
            <p className="file-name-suggestion">
              <FileJson size={17} aria-hidden="true" />
              {fileNameForSeed(draftSeed.seed.id)}
            </p>
            <button className="button primary full-width" type="button" onClick={downloadJson}>
              <Download size={16} aria-hidden="true" />
              JSONをダウンロード
            </button>
          </section>

          <section>
            <h2>簡易プレビュー</h2>
            <SeedCard seed={draftSeed.seed} compact />
          </section>

          <section>
            <h2>GitHubへの登録手順</h2>
            <ol className="step-list">
              <li>JSONをダウンロードします。</li>
              <li>
                <code>src/content/seeds/</code>にファイルを追加します。
              </li>
              <li>
                画像がある場合は<code>public/media/seeds/</code>に配置します。
              </li>
              <li>Pull Requestまたはコミットを作成します。</li>
              <li>GitHub Actionsのデータ検証とビルド結果を確認します。</li>
            </ol>
          </section>
        </aside>
      </div>
    </section>
  );
};

# 青山学院大学 研究シーズ公開サイト MVP

青山学院大学の研究シーズを、学外の企業、自治体、研究機関、一般利用者に向けて公開するためのMVPです。研究シーズはリポジトリ内のJSONファイルで管理し、公開画面はGitHub Pagesで提供します。

研究シーズデータの正本は引き続きGitHubです。AI研究相談に必要なサーバー側処理だけをCloudflare Workersへ分離します。Google Apps Script、Googleスプレッドシート、Google Drive、Firebase、外部CMS、外部データベースは使用しません。

## 使用技術

- React / TypeScript / Vite
- GitHub Pages
- GitHub Actions
- JSONによる研究シーズ管理
- Cloudflare Workers / Wrangler（AI研究相談バックエンド）
- Lucide Reactによるアイコン表示
- Vitestによるテスト

## ディレクトリ構成

```text
src/
  content/seeds/        研究シーズJSON
  types/                データ型
  utils/                検索・検証・URL処理
  pages/                画面
  components/           共通UI
scripts/
  generate-ai-index.ts  AI検索用インデックス生成
public/
  media/seeds/          研究シーズ画像
  data/                 ビルド時にAI検索用データを生成
worker/
  src/                  AI研究相談Worker
  wrangler.jsonc        Cloudflare Workers設定
  README.md             Worker開発手順
docs/                   運用ドキュメント
.github/workflows/      検証・GitHub Pagesデプロイ
```

## ローカル起動方法

フロントエンド：

```bash
npm install
npm run dev
```

`npm run dev`の前に、公開中の研究シーズJSONから`public/data/seeds-index.json`を自動生成します。

Worker：

```bash
cd worker
npm install
npm run cf-typegen
npm run typecheck
npm test
npm run dev
```

## 品質確認コマンド

フロントエンド：

```bash
npm run validate:data
npm run generate:ai-index
npm run lint
npm run test
npm run build
```

Worker：

```bash
cd worker
npm run typecheck
npm test
npm run check
```

## AI研究相談 PoC

`#/consult`にAI研究相談UIがあります。

### Phase A — UI

相談入力、サンプル課題、ローディング、推薦カード、問い合わせ導線を実装しています。現在の画面では公開中の研究シーズを使ったダミー推薦を表示します。

### Phase B — AI検索用データ

AI検索用データは`src/content/seeds/*.json`を正本として、`npm run generate:ai-index`で`public/data/seeds-index.json`へ生成します。対象は`status: "published"`の研究シーズのみです。生成ファイルはビルド成果物として扱い、Gitでは管理しません。

### Phase C — Cloudflare Worker基盤

`worker/`にサーバー側APIの土台を実装しています。

- `GET /health` — Worker稼働確認
- `POST /api/consult` — CORS、JSON、本文サイズ、相談文字数を検証
- 共通JSONエラー形式と`requestId`
- 構造化ログとCloudflare Observability

Phase C時点ではOpenAI Responses APIとMCPは未接続です。妥当な`/api/consult`リクエストには意図的に`501 AI_NOT_CONNECTED`を返し、AIが稼働しているように見せない設計としています。

詳細は[`worker/README.md`](worker/README.md)を参照してください。

## GitHub Pagesへの公開方法

`main`ブランチへ反映すると、`.github/workflows/deploy-pages.yml`が次を実行します。

1. フロントエンド依存関係のインストール
2. 研究シーズデータ検証
3. AI検索用インデックス生成
4. Frontend lint / test / build
5. Worker dependencies / typecheck / test / config check
6. GitHub Pagesへのデプロイ

Pull Requestでは1〜5までを実行し、GitHub Pagesへの本番デプロイは行いません。

リポジトリ設定のPagesで、SourceをGitHub Actionsにしてください。

## 研究シーズの追加方法

1. サイトの「データ編集支援」ページで新規JSONを作成します。
2. 生成したJSONを`src/content/seeds/seed-xxx.json`として追加します。
3. 画像を`public/media/seeds/seed-xxx/`に追加します。
4. `npm run validate:data`を実行します。
5. Pull Requestまたはコミットで反映します。

AI検索用インデックスは次回の`npm run dev`または`npm run build`で自動更新されます。

## 研究シーズの修正方法

対象の`src/content/seeds/*.json`を編集します。複数人が同時に編集しても競合しにくいよう、1研究シーズにつき1JSONファイルにしています。

## 画像の追加方法

画像は`public/media/seeds/{seed-id}/`配下に置きます。JSONには次のように相対パスで書きます。

```json
"thumbnail": "media/seeds/seed-001/thumbnail.svg"
```

## 動画URLの登録方法

`videos`にURLを登録します。YouTubeは詳細画面で埋め込み表示し、それ以外は外部リンクとして表示します。

## 問い合わせ先の変更方法

`src/config/site.ts`の`contact.email`と`contact.label`を変更してください。初期値は実在アドレスを推測しないため、`research-seeds@example.invalid`にしています。

## Pull Requestによる更新

PRテンプレートに沿って、画像、リンク、個人情報、表示、データ検証結果を確認してください。Issue Formは依頼受付用であり、Issueから自動的に公開データを書き換える処理はありません。

## 公開されない場合の確認事項

- GitHub PagesのSourceがGitHub Actionsになっているか
- ActionsでフロントエンドとWorkerの検証が成功しているか
- `vite.config.ts`の`base`がリポジトリ名と一致しているか
- 画像パスが`media/seeds/`配下を指しているか

## GitHub Pagesの制約と役割分担

GitHub Pagesは静的ホスティングです。OpenAI API Keyなどの秘密情報をブラウザへ安全に保持することはできないため、AI研究相談のサーバー側処理はCloudflare Workerへ分離します。

研究シーズの公開データ管理はGitHub、公開画面はGitHub Pages、AI API / MCPはCloudflare Workersという役割分担です。

また、GitHub Pages上のHashRouter構成では研究シーズ詳細ページごとの完全な動的OGP生成はできません。MVPでは静的OGPとページタイトル更新に対応しています。

## 運用ドキュメント

- [コンテンツ管理](docs/content-management.md)
- [デプロイ](docs/deployment.md)
- [データスキーマ](docs/data-schema.md)
- [デザインガイドライン](docs/design-guidelines.md)

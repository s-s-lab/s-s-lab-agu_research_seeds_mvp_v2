# 青山学院大学 研究シーズ公開サイト MVP

青山学院大学の研究シーズを、学外の企業、自治体、研究機関、一般利用者に向けて公開するためのMVPです。研究シーズはリポジトリ内のJSONファイルで管理し、GitHub Pagesで公開します。

このMVPはGoogle Apps Script、Googleスプレッドシート、Google Drive、Firebase、外部CMS、外部データベースを使用しません。

## 使用技術

- React / TypeScript / Vite
- GitHub Pages
- GitHub Actions
- JSONによる研究シーズ管理
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
docs/                   運用ドキュメント
.github/workflows/      GitHub Pagesデプロイ
```

## ローカル起動方法

```bash
npm install
npm run dev
```

`npm run dev`の前に、公開中の研究シーズJSONから`public/data/seeds-index.json`を自動生成します。

## 品質確認コマンド

```bash
npm run validate:data
npm run generate:ai-index
npm run lint
npm run test
npm run build
```

## AI研究相談 PoC

`#/consult`にAI研究相談のPhase A UIがあります。現段階の画面では公開中の研究シーズを使ったダミー推薦を表示し、OpenAI APIやMCPへの接続はまだ行いません。

AI検索用データは`src/content/seeds/*.json`を正本として、`npm run generate:ai-index`で`public/data/seeds-index.json`へ生成します。対象は`status: "published"`の研究シーズのみです。生成ファイルはビルド成果物として扱い、Gitでは管理しません。

## GitHub Pagesへの公開方法

`main`ブランチへ反映すると、`.github/workflows/deploy-pages.yml`が次を実行します。

1. 依存関係のインストール
2. データ検証
3. Lint
4. テスト
5. AI検索用インデックス生成を含む本番ビルド
6. GitHub Pagesへのデプロイ

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
- Actionsで`validate:data`、`lint`、`test`、`build`が成功しているか
- `vite.config.ts`の`base`がリポジトリ名と一致しているか
- 画像パスが`media/seeds/`配下を指しているか

## GitHub Pagesの制約

GitHub Pagesは静的ホスティングです。安全な管理者認証、サーバー側データベース更新、ブラウザからの安全なGitHubコミットは実現できません。そのため、本MVPでは管理画面を作らず、JSON作成を支援する「データ編集支援」ページのみ提供します。

また、GitHub Pages上のHashRouter構成では研究シーズ詳細ページごとの完全な動的OGP生成はできません。MVPでは静的OGPとページタイトル更新に対応しています。

## 運用ドキュメント

- [コンテンツ管理](docs/content-management.md)
- [デプロイ](docs/deployment.md)
- [データスキーマ](docs/data-schema.md)
- [デザインガイドライン](docs/design-guidelines.md)

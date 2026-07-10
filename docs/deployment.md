# デプロイ

## 公開方式

本サイトはGitHub Pagesのプロジェクトサイトとして公開します。Viteの`base`は次の値です。

```ts
base: "/s-s-lab-agu_research_seeds_mvp_v2/"
```

## GitHub Actions

`.github/workflows/deploy-pages.yml`で以下を実行します。

1. `npm install`
2. `npm run validate:data`
3. `npm run lint`
4. `npm run test`
5. `npm run build`
6. `actions/deploy-pages`で公開

## Pages設定

GitHubのリポジトリ設定で、PagesのSourceを`GitHub Actions`にします。`main`へpushすると自動公開されます。

## 直接アクセス対策

ルーティングはハッシュ方式です。`#/seeds/seed-001`のようなURLになるため、GitHub Pagesで直接アクセスしてもサーバー側ルーティングを必要としません。補助として`public/404.html`も配置しています。

# AI研究相談 Cloudflare Worker

研究シーズ公開サイトのAI研究相談機能で利用するサーバー側Workerです。

## Phase Cで提供するエンドポイント

- `GET /health` — Workerの稼働確認
- `POST /api/consult` — AI研究相談APIの入力検証と安定したAPI契約
- `OPTIONS` — 許可済みオリジン向けCORS preflight

現段階の`/api/consult`は、妥当な相談内容を受け付けた後に`501 AI_NOT_CONNECTED`を返します。OpenAI Responses APIやMCPをまだ接続していないことを明示するための意図的な挙動です。

## ローカル開発

```bash
cd worker
npm install
npm run cf-typegen
npm run typecheck
npm test
npm run dev
```

## 設定

`wrangler.jsonc`で非機密設定を管理します。

- `ALLOWED_ORIGINS` — カンマ区切りの許可オリジン
- `compatibility_date` — Worker runtime compatibility date
- `nodejs_compat` — npmライブラリ互換性のため有効化
- `observability` — Workerログ・可観測性を有効化

APIキー等の秘密情報は`wrangler.jsonc`へ書かず、今後Cloudflare Secretsとして登録します。

## API例

```bash
curl -X POST http://localhost:8787/api/consult \
  -H 'Content-Type: application/json' \
  -d '{"challenge":"食品工場で発生する廃熱を有効活用し、エネルギーコストとCO2排出量を削減したいです。"}'
```

Phase Cでは次の形式で返ります。

```json
{
  "error": {
    "code": "AI_NOT_CONNECTED",
    "message": "AI研究相談の検索・生成機能は次の実装フェーズで接続します。",
    "requestId": "..."
  }
}
```

## セキュリティ方針

- 相談本文はこのWorker自身では永続保存しません。
- Request bodyは8 KiBで打ち切り、無制限にメモリへ読み込みません。
- `challenge`は20〜2,000文字に制限します。
- CORSは許可オリジンを明示指定します。
- レスポンスは`Cache-Control: no-store`とします。
- 内部例外の詳細はクライアントへ返しません。

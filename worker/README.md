# AI研究相談 Cloudflare Worker

研究シーズ公開サイトのAI研究相談機能で利用するサーバー側Workerです。

## 現在のエンドポイント

- `GET /health` — Workerの稼働確認
- `POST /api/consult` — AI研究相談APIの入力検証と安定したAPI契約
- `/mcp` — Streamable HTTPによる公開研究シーズMCP Server
- `OPTIONS` — 許可済みオリジン向けCORS preflight

現段階の`/api/consult`は、妥当な相談内容を受け付けた後に`501 AI_NOT_CONNECTED`を返します。OpenAI Responses APIとの接続前であることを明示するための意図的な挙動です。

`/mcp`はPhase Dで実装済みで、`@modelcontextprotocol/server` v2とCloudflare Agents SDKの`createMcpHandler()`を使うステートレスなStreamable HTTPサーバーです。SSE、`McpAgent`、Durable Objectは使用しません。

## MCP tools

### `search_seeds`

公開中の研究シーズだけを対象に、企業・組織課題のキーワード、テーマ、業界から候補を検索します。

入力:

```json
{
  "query": "食品工場の廃熱を再利用したい",
  "themes": ["廃熱", "熱回収", "省エネルギー"],
  "industry": "食品製造",
  "limit": 5
}
```

返却する`score`は候補順位を決める内部検索スコアであり、適合率や成功確率ではありません。`matchEvidence`には一致した登録項目を返します。

### `get_seed`

`search_seeds`で得た公開研究シーズIDについて、AIマッチングに必要な詳細登録情報を返します。生成済み公開インデックスに存在しないIDは返しません。

両ツールとも読み取り専用です。

## 研究シーズデータ

MCPは`SEEDS_INDEX_URL`から公開用AI検索インデックスを取得します。既定値はGitHub Pages上の次の生成物です。

```text
https://s-s-lab.github.io/s-s-lab-agu_research_seeds_mvp_v2/data/seeds-index.json
```

このファイルは`src/content/seeds/*.json`からビルド時に生成され、`status: "published"`の研究シーズだけを含みます。Workerは取得データを2 MiBまでに制限し、構造検証後にツールへ渡します。

## ローカル開発

```bash
cd worker
npm install
npm run cf-typegen
npm run typecheck
npm test
npm run check
npm run dev
```

Remote MCPの動作確認にはMCP Inspector等のStreamable HTTP対応クライアントを使用し、`http://localhost:8787/mcp`へ接続します。

## 設定

`wrangler.jsonc`で非機密設定を管理します。

- `ALLOWED_ORIGINS` — WebサイトAPI用のカンマ区切り許可オリジン
- `SEEDS_INDEX_URL` — 公開AI検索インデックスURL
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

OpenAI未接続の現在は次の形式で返ります。

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
- Web APIのCORSは許可オリジンを明示指定します。
- MCPはCloudflareのStreamable HTTP handlerによるOrigin検証を利用します。
- MCP toolsは公開済みシーズの読み取り専用です。
- 研究シーズインデックス取得は2 MiBを上限とします。
- レスポンスは必要に応じて`Cache-Control: no-store`とします。
- 内部例外の詳細はクライアントへ返しません。

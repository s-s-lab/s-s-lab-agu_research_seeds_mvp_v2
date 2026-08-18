import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { loadSeedIndex } from "./seedIndex";
import { getSeedById, searchSeeds } from "./searchSeeds";

export type ResearchSeedsMcpConfig = {
  seedIndexUrl: string;
  fetcher?: typeof fetch;
};

const readOnlyAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

const toolError = (code: string, message: string) => ({
  isError: true as const,
  content: [
    {
      type: "text" as const,
      text: JSON.stringify({ error: { code, message } }),
    },
  ],
});

export const createResearchSeedsMcpServer = (
  config: ResearchSeedsMcpConfig,
): McpServer => {
  const server = new McpServer({
    name: "Aoyama Gakuin University Research Seeds",
    version: "0.1.0",
  });

  server.registerTool(
    "search_seeds",
    {
      title: "Search published research seeds",
      description:
        "Search only publicly published Aoyama Gakuin University research seeds. Use concise challenge keywords and, when possible, provide themes or an industry. Scores are ranking signals, not calibrated probabilities.",
      inputSchema: z.object({
        query: z.string().min(2).max(500),
        themes: z.array(z.string().min(2).max(100)).max(12).optional(),
        industry: z.string().min(2).max(100).optional(),
        limit: z.number().int().min(1).max(10).default(5),
      }),
      annotations: readOnlyAnnotations,
    },
    async ({ query, themes, industry, limit }) => {
      try {
        const index = await loadSeedIndex(config.seedIndexUrl, config.fetcher);
        const output = searchSeeds(index, { query, themes, industry, limit });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(output),
            },
          ],
          structuredContent: output,
        };
      } catch (error) {
        console.error(
          JSON.stringify({
            event: "mcp_seed_search_error",
            error: error instanceof Error ? error.message : "unknown error",
          }),
        );
        return toolError(
          "SEED_INDEX_UNAVAILABLE",
          "公開研究シーズ情報を取得できませんでした。",
        );
      }
    },
  );

  server.registerTool(
    "get_seed",
    {
      title: "Get a published research seed",
      description:
        "Get the detailed public matching data for one research seed returned by search_seeds. Only seed IDs present in the published index can be returned.",
      inputSchema: z.object({
        seedId: z.string().min(1).max(100),
      }),
      annotations: readOnlyAnnotations,
    },
    async ({ seedId }) => {
      try {
        const index = await loadSeedIndex(config.seedIndexUrl, config.fetcher);
        const seed = getSeedById(index, seedId);

        if (!seed) {
          return toolError(
            "SEED_NOT_FOUND",
            "指定された公開研究シーズは見つかりませんでした。",
          );
        }

        const output = { seed };
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(output),
            },
          ],
          structuredContent: output,
        };
      } catch (error) {
        console.error(
          JSON.stringify({
            event: "mcp_seed_fetch_error",
            error: error instanceof Error ? error.message : "unknown error",
          }),
        );
        return toolError(
          "SEED_INDEX_UNAVAILABLE",
          "公開研究シーズ情報を取得できませんでした。",
        );
      }
    },
  );

  return server;
};

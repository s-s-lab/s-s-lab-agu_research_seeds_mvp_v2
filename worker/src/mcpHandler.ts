import { createMcpHandler } from "agents/mcp/server";
import { createResearchSeedsMcpServer } from "./mcpServer";

export const handleMcpRequest = (
  request: Request,
  env: Cloudflare.Env,
  ctx: ExecutionContext,
): Promise<Response> => {
  const handler = createMcpHandler(
    () =>
      createResearchSeedsMcpServer({
        seedIndexUrl: env.SEEDS_INDEX_URL,
      }),
    {
      route: "/mcp",
      onerror(error) {
        console.error(
          JSON.stringify({
            event: "mcp_handler_error",
            error: error.message,
          }),
        );
      },
    },
  );

  return handler(request, env, ctx);
};

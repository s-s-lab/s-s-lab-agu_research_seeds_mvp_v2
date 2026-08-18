import { handleMcpRequest } from "./mcpHandler";
import { handleRequest } from "./router";

export { handleRequest } from "./router";

export default {
  fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/mcp") {
      return handleMcpRequest(request, env, ctx);
    }

    return handleRequest(request, {
      allowedOrigins: env.ALLOWED_ORIGINS,
    });
  },
} satisfies ExportedHandler<Cloudflare.Env>;

import { handleRequest } from "./router";

export { handleRequest } from "./router";

export default {
  fetch(request, env) {
    return handleRequest(request, {
      allowedOrigins: env.ALLOWED_ORIGINS,
    });
  },
} satisfies ExportedHandler<Cloudflare.Env>;

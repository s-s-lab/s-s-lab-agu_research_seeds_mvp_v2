import { handleConsult } from "./consult";
import {
  addCorsHeaders,
  apiError,
  corsPreflightResponse,
  isOriginAllowed,
  jsonResponse,
  parseAllowedOrigins,
} from "./http";

export type WorkerRuntimeConfig = {
  allowedOrigins: string;
};

const SERVICE_NAME = "agu-research-seeds-ai";
const SERVICE_VERSION = "0.1.0";

const methodNotAllowed = (
  requestId: string,
  allowedMethods: string,
): Response =>
  apiError(
    405,
    "METHOD_NOT_ALLOWED",
    "このHTTPメソッドは利用できません。",
    requestId,
    { allow: allowedMethods },
  );

export const handleRequest = async (
  request: Request,
  config: WorkerRuntimeConfig,
): Promise<Response> => {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const allowedOrigins = parseAllowedOrigins(config.allowedOrigins);

  let response: Response;

  try {
    if (!isOriginAllowed(origin, allowedOrigins)) {
      response = apiError(
        403,
        "CORS_FORBIDDEN",
        "このオリジンからのリクエストは許可されていません。",
        requestId,
      );
    } else if (request.method === "OPTIONS") {
      response = origin
        ? corsPreflightResponse(origin)
        : new Response(null, { status: 204 });
    } else if (url.pathname === "/health") {
      response =
        request.method === "GET"
          ? jsonResponse({
              status: "ok",
              service: SERVICE_NAME,
              version: SERVICE_VERSION,
              requestId,
            })
          : methodNotAllowed(requestId, "GET, OPTIONS");
    } else if (url.pathname === "/api/consult") {
      response =
        request.method === "POST"
          ? await handleConsult(request, requestId)
          : methodNotAllowed(requestId, "POST, OPTIONS");
    } else {
      response = apiError(
        404,
        "NOT_FOUND",
        "指定されたエンドポイントは存在しません。",
        requestId,
      );
    }
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "worker_error",
        requestId,
        method: request.method,
        path: url.pathname,
        error: error instanceof Error ? error.message : "unknown error",
      }),
    );

    response = apiError(
      500,
      "INTERNAL_ERROR",
      "サーバー内部でエラーが発生しました。",
      requestId,
    );
  }

  const finalResponse = addCorsHeaders(response, origin, allowedOrigins);

  console.log(
    JSON.stringify({
      event: "request_completed",
      requestId,
      method: request.method,
      path: url.pathname,
      status: finalResponse.status,
      durationMs: Date.now() - startedAt,
    }),
  );

  return finalResponse;
};

export type ApiErrorCode =
  | "CORS_FORBIDDEN"
  | "METHOD_NOT_ALLOWED"
  | "NOT_FOUND"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "PAYLOAD_TOO_LARGE"
  | "INVALID_JSON"
  | "INVALID_CHALLENGE"
  | "AI_NOT_CONNECTED"
  | "INTERNAL_ERROR";

export type ApiErrorBody = {
  error: {
    code: ApiErrorCode;
    message: string;
    requestId: string;
  };
};

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
} as const;

export const jsonResponse = (
  body: unknown,
  status = 200,
  headers?: HeadersInit,
): Response => {
  const responseHeaders = new Headers(jsonHeaders);
  if (headers) {
    new Headers(headers).forEach((value, key) => responseHeaders.set(key, value));
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders,
  });
};

export const apiError = (
  status: number,
  code: ApiErrorCode,
  message: string,
  requestId: string,
  headers?: HeadersInit,
): Response =>
  jsonResponse(
    {
      error: {
        code,
        message,
        requestId,
      },
    } satisfies ApiErrorBody,
    status,
    headers,
  );

export const parseAllowedOrigins = (value: string): Set<string> =>
  new Set(
    value
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

export const isOriginAllowed = (
  origin: string | null,
  allowedOrigins: Set<string>,
): boolean => origin === null || allowedOrigins.has(origin);

export const addCorsHeaders = (
  response: Response,
  origin: string | null,
  allowedOrigins: Set<string>,
): Response => {
  if (!origin || !allowedOrigins.has(origin)) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set("access-control-allow-origin", origin);
  headers.set("vary", "Origin");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export const corsPreflightResponse = (origin: string): Response =>
  new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "Content-Type",
      "access-control-max-age": "86400",
      vary: "Origin",
    },
  });

export class PayloadTooLargeError extends Error {
  constructor() {
    super("Request body is too large.");
    this.name = "PayloadTooLargeError";
  }
}

export class InvalidJsonError extends Error {
  constructor() {
    super("Request body is not valid JSON.");
    this.name = "InvalidJsonError";
  }
}

export const readJsonBody = async (
  request: Request,
  maxBytes: number,
): Promise<unknown> => {
  if (!request.body) {
    throw new InvalidJsonError();
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw new PayloadTooLargeError();
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder().decode(body)) as unknown;
  } catch {
    throw new InvalidJsonError();
  }
};

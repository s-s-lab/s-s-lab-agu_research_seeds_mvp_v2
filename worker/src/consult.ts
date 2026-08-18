import {
  InvalidJsonError,
  PayloadTooLargeError,
  apiError,
  readJsonBody,
} from "./http";

export const CONSULT_MIN_LENGTH = 20;
export const CONSULT_MAX_LENGTH = 2000;
export const CONSULT_MAX_BODY_BYTES = 8192;

export type ConsultRequestBody = {
  challenge: string;
};

type ValidationResult =
  | { ok: true; value: ConsultRequestBody }
  | { ok: false; response: Response };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const validateConsultRequest = async (
  request: Request,
  requestId: string,
): Promise<ValidationResult> => {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return {
      ok: false,
      response: apiError(
        415,
        "UNSUPPORTED_MEDIA_TYPE",
        "Content-Type は application/json を指定してください。",
        requestId,
      ),
    };
  }

  let body: unknown;
  try {
    body = await readJsonBody(request, CONSULT_MAX_BODY_BYTES);
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return {
        ok: false,
        response: apiError(
          413,
          "PAYLOAD_TOO_LARGE",
          "相談内容のリクエストサイズが上限を超えています。",
          requestId,
        ),
      };
    }

    if (error instanceof InvalidJsonError) {
      return {
        ok: false,
        response: apiError(
          400,
          "INVALID_JSON",
          "JSON形式を確認してください。",
          requestId,
        ),
      };
    }

    throw error;
  }

  if (!isRecord(body) || typeof body.challenge !== "string") {
    return {
      ok: false,
      response: apiError(
        400,
        "INVALID_CHALLENGE",
        "challenge に相談内容を文字列で指定してください。",
        requestId,
      ),
    };
  }

  const challenge = body.challenge.trim();
  if (
    challenge.length < CONSULT_MIN_LENGTH ||
    challenge.length > CONSULT_MAX_LENGTH
  ) {
    return {
      ok: false,
      response: apiError(
        400,
        "INVALID_CHALLENGE",
        `相談内容は${CONSULT_MIN_LENGTH}文字以上${CONSULT_MAX_LENGTH}文字以下で入力してください。`,
        requestId,
      ),
    };
  }

  return {
    ok: true,
    value: { challenge },
  };
};

export const handleConsult = async (
  request: Request,
  requestId: string,
): Promise<Response> => {
  const validation = await validateConsultRequest(request, requestId);
  if (!validation.ok) {
    return validation.response;
  }

  return apiError(
    501,
    "AI_NOT_CONNECTED",
    "AI研究相談の検索・生成機能は次の実装フェーズで接続します。",
    requestId,
  );
};

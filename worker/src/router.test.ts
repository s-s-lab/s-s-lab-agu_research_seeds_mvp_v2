import { describe, expect, it } from "vitest";
import { handleRequest } from "./router";

const allowedOrigins =
  "https://s-s-lab.github.io,http://localhost:5173,http://127.0.0.1:5173";

const run = (request: Request) =>
  handleRequest(request, {
    allowedOrigins,
  });

describe("AI consultation Worker", () => {
  it("returns health status", async () => {
    const response = await run(new Request("https://worker.example/health"));
    const body = (await response.json()) as { status: string; service: string };

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.service).toBe("agu-research-seeds-ai");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("accepts an allowed CORS preflight", async () => {
    const response = await run(
      new Request("https://worker.example/api/consult", {
        method: "OPTIONS",
        headers: { origin: "https://s-s-lab.github.io" },
      }),
    );

    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "https://s-s-lab.github.io",
    );
  });

  it("rejects a disallowed origin", async () => {
    const response = await run(
      new Request("https://worker.example/api/consult", {
        method: "POST",
        headers: {
          origin: "https://malicious.example",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          challenge: "工場設備のデータを活用して故障の兆候を早期に把握したいです。",
        }),
      }),
    );
    const body = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(403);
    expect(body.error.code).toBe("CORS_FORBIDDEN");
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("validates content type", async () => {
    const response = await run(
      new Request("https://worker.example/api/consult", {
        method: "POST",
        body: "plain text",
      }),
    );
    const body = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(415);
    expect(body.error.code).toBe("UNSUPPORTED_MEDIA_TYPE");
  });

  it("validates challenge length", async () => {
    const response = await run(
      new Request("https://worker.example/api/consult", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ challenge: "短すぎます" }),
      }),
    );
    const body = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("INVALID_CHALLENGE");
  });

  it("rejects oversized request bodies before parsing", async () => {
    const response = await run(
      new Request("https://worker.example/api/consult", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ challenge: "あ".repeat(9000) }),
      }),
    );
    const body = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(413);
    expect(body.error.code).toBe("PAYLOAD_TOO_LARGE");
  });

  it("returns the stable not-connected contract for a valid request", async () => {
    const response = await run(
      new Request("https://worker.example/api/consult", {
        method: "POST",
        headers: {
          origin: "https://s-s-lab.github.io",
          "content-type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          challenge:
            "食品工場で発生する廃熱を有効活用し、エネルギーコストとCO2排出量を削減したいです。",
        }),
      }),
    );
    const body = (await response.json()) as {
      error: { code: string; requestId: string };
    };

    expect(response.status).toBe(501);
    expect(body.error.code).toBe("AI_NOT_CONNECTED");
    expect(body.error.requestId.length).toBeGreaterThan(0);
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "https://s-s-lab.github.io",
    );
  });

  it("returns 404 for unknown endpoints", async () => {
    const response = await run(new Request("https://worker.example/unknown"));
    const body = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(404);
    expect(body.error.code).toBe("NOT_FOUND");
  });
});

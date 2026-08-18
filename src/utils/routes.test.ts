import { describe, expect, it } from "vitest";
import { parseHashRoute } from "./routes";

describe("parseHashRoute", () => {
  it("parses the AI consult route", () => {
    const route = parseHashRoute("#/consult");

    expect(route.name).toBe("consult");
  });

  it("preserves query parameters on the AI consult route", () => {
    const route = parseHashRoute("#/consult?source=home");

    expect(route.name).toBe("consult");
    expect(route.params.get("source")).toBe("home");
  });
});

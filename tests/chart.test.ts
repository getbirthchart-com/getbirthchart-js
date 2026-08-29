import { describe, expect, it } from "vitest";
import { ApiError } from "../src/errors";
import { GetBirthChart } from "../src/index";
import { knownChart } from "./fixtures/charts";
import { knownInput, mockFetch } from "./helpers";

describe("response boundary", () => {
  it("rejects malformed successful responses", async () => {
    const client = new GetBirthChart({ fetch: mockFetch({ nope: true }) });
    await expect(client.calculateBirthChart(knownInput)).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });

  it("does not fabricate a rising sign when the backend omits it", async () => {
    const response = { ...knownChart, angles: {} };
    const client = new GetBirthChart({ fetch: mockFetch(response) });
    await expect(client.getRisingSign(knownInput)).rejects.toBeInstanceOf(
      ApiError,
    );
  });
});

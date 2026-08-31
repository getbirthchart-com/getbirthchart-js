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

  it("accepts additive schema 1.x fields and preserves a full calculation hash", async () => {
    const calculationHash = `v2:${"a".repeat(64)}`;
    const response = {
      ...knownChart,
      calculationHash,
      futureField: { retained: true },
      meta: {
        ...knownChart.meta,
        calculationHash,
        futureProfile: "future-v1",
      },
    };
    const chart = await new GetBirthChart({
      fetch: mockFetch(response),
    }).calculateBirthChart(knownInput);
    expect(chart.metadata.calculationHash).toBe(calculationHash);
    expect(chart.raw?.futureField).toEqual({ retained: true });
  });

  it("fails closed for an incompatible major response schema", async () => {
    const client = new GetBirthChart({
      fetch: mockFetch({ ...knownChart, schemaVersion: "2.0.0" }),
    });
    await expect(client.calculateBirthChart(knownInput)).rejects.toMatchObject({
      code: "UNSUPPORTED_SCHEMA_VERSION",
    });
  });
});

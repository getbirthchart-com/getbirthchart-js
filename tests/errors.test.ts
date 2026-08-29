import { describe, expect, it } from "vitest";
import {
  AmbiguousLocationError,
  AuthenticationError,
  GetBirthChartError,
  LocationNotFoundError,
  TimeoutError,
  ValidationError,
} from "../src/errors";
import { ApiError } from "../src/errors";
import { GetBirthChart } from "../src/index";
import { knownInput, mockFetch } from "./helpers";

describe("typed errors", () => {
  it.each([
    [401, AuthenticationError],
    [403, AuthenticationError],
    [400, ValidationError],
  ] as const)("maps HTTP %s", async (status, ErrorType) => {
    const client = new GetBirthChart({
      fetch: mockFetch(
        { error: { code: "REQUEST_VALIDATION_ERROR", message: "bad input" } },
        status,
      ),
    });
    await expect(client.calculateBirthChart(knownInput)).rejects.toBeInstanceOf(
      ErrorType,
    );
  });

  it("maps rate limits and retry metadata", async () => {
    const client = new GetBirthChart({
      fetch: mockFetch(
        { error: { code: "RATE_LIMITED", message: "slow down" } },
        429,
        { "retry-after": "12" },
      ),
    });
    await expect(client.calculateBirthChart(knownInput)).rejects.toMatchObject({
      retryAfter: 12,
      code: "RATE_LIMIT_ERROR",
    });
  });

  it("maps location-specific backend codes", async () => {
    const notFound = new GetBirthChart({
      fetch: mockFetch(
        { error: { code: "LOCATION_NOT_FOUND", message: "missing" } },
        404,
      ),
    });
    const ambiguous = new GetBirthChart({
      fetch: mockFetch(
        { error: { code: "AMBIGUOUS_LOCATION", message: "choose" } },
        409,
      ),
    });
    await expect(
      notFound.calculateBirthChart(knownInput),
    ).rejects.toBeInstanceOf(LocationNotFoundError);
    await expect(
      ambiguous.calculateBirthChart(knownInput),
    ).rejects.toBeInstanceOf(AmbiguousLocationError);
  });

  it("keeps unexpected server failures as ApiError", async () => {
    const client = new GetBirthChart({
      fetch: mockFetch(
        { error: { code: "INTERNAL_ERROR", message: "temporary" } },
        503,
      ),
    });
    await expect(client.calculateBirthChart(knownInput)).rejects.toMatchObject({
      code: "INTERNAL_ERROR",
      status: 503,
    });
    await expect(client.calculateBirthChart(knownInput)).rejects.toBeInstanceOf(
      ApiError,
    );
  });

  it("maps timeout and never leaks the configured API key", async () => {
    const fetch = ((_: string, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          const error = new Error("aborted");
          error.name = "AbortError";
          reject(error);
        });
      })) as typeof globalThis.fetch;
    const client = new GetBirthChart({
      apiKey: "gbc_secret_should_not_leak",
      timeout: 5,
      fetch,
    });
    const error = await client
      .calculateBirthChart(knownInput)
      .catch((value: unknown) => value);
    expect(error).toBeInstanceOf(TimeoutError);
    expect(String(error)).not.toContain("gbc_secret_should_not_leak");
    expect(error).toBeInstanceOf(GetBirthChartError);
  });

  it("rejects malformed JSON", async () => {
    const fetch = (async () =>
      new Response("not-json", { status: 200 })) as typeof globalThis.fetch;
    const client = new GetBirthChart({ fetch });
    await expect(client.calculateBirthChart(knownInput)).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });
});

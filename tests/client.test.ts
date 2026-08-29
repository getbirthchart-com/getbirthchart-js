import { describe, expect, it } from "vitest";
import { ValidationError } from "../src/errors";
import { GetBirthChart } from "../src/index";
import { knownChart, synastryChart } from "./fixtures/charts";
import { knownInput, mockFetch, unknownInput } from "./helpers";

describe("GetBirthChart client", () => {
  it("uses the canonical natal endpoint and maps the response", async () => {
    const fetch = mockFetch(knownChart, 200, { "x-request-id": "req-123" });
    const client = new GetBirthChart({
      apiKey: "gbc_test",
      baseUrl: "https://staging.example.test/",
      fetch,
    });
    const chart = await client.calculateBirthChart(knownInput);
    expect(fetch).toHaveBeenCalledOnce();
    const [url, init] = fetch.mock.calls[0] ?? [];
    expect(url).toBe("https://staging.example.test/v1/charts/natal");
    expect(init?.method).toBe("POST");
    expect(init?.redirect).toBe("error");
    expect(init?.headers).toEqual(
      expect.objectContaining({ Authorization: "Bearer gbc_test" }),
    );
    expect(JSON.parse(String(init?.body))).toEqual({
      local_date: "1990-01-15",
      local_time: "12:00",
      unknown_time: false,
      timezone: "America/New_York",
      latitude: 40.7128,
      longitude: -74.006,
    });
    expect(chart.planets[0]?.planet).toBe("Sun");
    expect(chart.ascendant?.sign).toBe("Taurus");
    expect(chart.metadata.requestId).toBe("req-123");
  });

  it("allows localhost HTTP for development but rejects remote HTTP", () => {
    expect(
      () =>
        new GetBirthChart({
          baseUrl: "http://localhost:8000",
          fetch: mockFetch(knownChart),
        }),
    ).not.toThrow();
    expect(
      () =>
        new GetBirthChart({
          baseUrl: "http://attacker.example",
          fetch: mockFetch(knownChart),
        }),
    ).toThrow(ValidationError);
  });

  it("delegates sign, positions, aspects and Big Three to the natal API", async () => {
    const fetch = mockFetch(knownChart);
    const client = new GetBirthChart({ fetch });
    expect(
      (await client.getPlanetPositions(knownInput)).positions,
    ).toHaveLength(4);
    expect((await client.getSunSign(knownInput)).sign).toBe("Capricorn");
    expect((await client.getMoonSign(knownInput)).sign).toBe("Virgo");
    expect((await client.getRisingSign(knownInput)).sign).toBe("Taurus");
    expect((await client.getBigThree(knownInput)).rising?.sign).toBe("Taurus");
    expect(
      (await client.calculateAspects(knownInput)).aspects[0]?.applying,
    ).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(6);
  });

  it("maps synastry request names and server-owned cross aspects", async () => {
    const fetch = mockFetch(synastryChart);
    const client = new GetBirthChart({ fetch });
    const result = await client.calculateSynastry({
      personA: knownInput,
      personB: unknownInput,
    });
    const [url, init] = fetch.mock.calls[0] ?? [];
    expect(url).toBe("https://api.getbirthchart.com/v1/charts/synastry");
    const body = JSON.parse(String(init?.body));
    expect(body.chart_a.local_date).toBe("1990-01-15");
    expect(body.chart_b.local_time).toBeNull();
    expect(result.aspects[0]).toMatchObject({
      id: "cross-1",
      body1: "A.sun",
      body2: "B.moon",
      phase: "indeterminate",
    });
    expect(result.personB?.ascendant).toBeUndefined();
  });
});

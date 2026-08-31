import { describe, expect, it, vi } from "vitest";
import { ValidationError } from "../src/errors";
import { GetBirthChart } from "../src/index";
import {
  compositeChart,
  davisonChart,
  knownChart,
  synastryChart,
} from "./fixtures/charts";
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

  it("sends v1.13 calculation options without changing the legacy default payload", async () => {
    const fetch = mockFetch(knownChart);
    const client = new GetBirthChart({ fetch });
    await client.calculateBirthChart({
      ...knownInput,
      altitudeM: 12,
      houseSystem: "whole_sign",
      nodeType: "mean",
      aspectPreset: "custom",
      customAspectRules: [
        { type: "conjunction", exactAngle: 0, orb: 10 },
        { type: "square", exactAngle: 90, orb: 6 },
      ],
      additionalPoints: ["mean_lilith", "vertex"],
      fold: 1,
      zodiac: "sidereal",
      ayanamsa: "lahiri",
    });
    const body = JSON.parse(String(fetch.mock.calls[0]?.[1]?.body));
    expect(body).toEqual({
      local_date: "1990-01-15",
      local_time: "12:00",
      unknown_time: false,
      timezone: "America/New_York",
      latitude: 40.7128,
      longitude: -74.006,
      altitude_m: 12,
      house_system: "whole_sign",
      node_type: "mean",
      aspect_preset: "custom",
      custom_aspect_rules: [
        { type: "conjunction", exact_angle: 0, orb: 10 },
        { type: "square", exact_angle: 90, orb: 6 },
      ],
      additional_points: ["mean_lilith", "vertex"],
      fold: 1,
      zodiac: "sidereal",
      ayanamsa: "lahiri",
    });
  });

  it("maps composite and Davison schema-versioned responses", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(compositeChart), {
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(davisonChart), {
          headers: { "Content-Type": "application/json" },
        }),
      );
    const client = new GetBirthChart({ fetch });
    const composite = await client.calculateComposite({
      personA: knownInput,
      personB: knownInput,
    });
    const davison = await client.calculateDavison({
      personA: knownInput,
      personB: knownInput,
    });
    expect(composite.schemaVersion).toBe("1.3.0");
    expect(davison.schemaVersion).toBe("1.1.0");
    expect(davison.chart.birthTimeKnown).toBe(true);
  });

  it("rejects invalid option combinations before making a request", async () => {
    const fetch = mockFetch(knownChart);
    const client = new GetBirthChart({ fetch });
    await expect(
      client.calculateBirthChart({
        ...knownInput,
        aspectPreset: "custom",
      }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    await expect(
      client.calculateBirthChart({
        ...knownInput,
        zodiac: "sidereal",
      }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    await expect(
      client.calculateBirthChart({
        ...knownInput,
        customAspectRules: [{ type: "square", exactAngle: 90, orb: 6 }],
      }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    expect(fetch).not.toHaveBeenCalled();
  });
});

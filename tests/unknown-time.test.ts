import { describe, expect, it } from "vitest";
import { BirthTimeRequiredError, ValidationError } from "../src/errors";
import { GetBirthChart } from "../src/index";
import { unknownChart, unknownStableMoonChart } from "./fixtures/charts";
import { mockFetch, unknownInput } from "./helpers";

describe("unknown birth time", () => {
  it("sends null local_time and omits time-dependent values", async () => {
    const fetch = mockFetch(unknownChart);
    const client = new GetBirthChart({ fetch });
    const chart = await client.calculateBirthChart(unknownInput);
    const init = fetch.mock.calls[0]?.[1];
    expect(JSON.parse(String(init?.body))).toMatchObject({
      local_time: null,
      unknown_time: true,
    });
    expect(chart.ascendant).toBeUndefined();
    expect(chart.houses).toBeUndefined();
    expect(chart.uncertainty?.unavailableFields).toEqual([
      "ascendant",
      "houses",
    ]);
  });

  it("fails Rising requests before any network call", async () => {
    const fetch = mockFetch(unknownChart);
    const client = new GetBirthChart({ fetch });
    await expect(client.getRisingSign(unknownInput)).rejects.toBeInstanceOf(
      BirthTimeRequiredError,
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("does not turn the backend's unknown-time Moon position into a definite sign", async () => {
    const client = new GetBirthChart({ fetch: mockFetch(unknownChart) });
    const result = await client.getMoonSign(unknownInput);
    expect(result.sign).toBeUndefined();
    expect(result.uncertainty?.ambiguous).toBe(true);
  });

  it("preserves explicit server certainty for a stable unknown-time Moon", async () => {
    const client = new GetBirthChart({
      fetch: mockFetch(unknownStableMoonChart),
    });
    const result = await client.getMoonSign(unknownInput);
    expect(result.sign).toBe("Virgo");
    expect(result.uncertainty?.ambiguous).toBe(false);
  });

  it("rejects invented time and incomplete location input", async () => {
    const client = new GetBirthChart({ fetch: mockFetch(unknownChart) });
    await expect(
      client.calculateBirthChart({ ...unknownInput, time: "12:00" }),
    ).rejects.toBeInstanceOf(ValidationError);
    await expect(
      client.calculateBirthChart({
        date: "1990-01-15",
        time: "12:00",
        place: "New York",
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

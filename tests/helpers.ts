import { vi } from "vitest";

export function mockFetch(
  payload: unknown,
  status = 200,
  headers: Record<string, string> = {},
) {
  return vi.fn(
    async (..._args: Parameters<typeof fetch>) =>
      new Response(JSON.stringify(payload), {
        status,
        headers: { "Content-Type": "application/json", ...headers },
      }),
  );
}

export const knownInput = {
  date: "1990-01-15",
  time: "12:00",
  place: "New York, NY",
  latitude: 40.7128,
  longitude: -74.006,
  timezone: "America/New_York",
} as const;

export const unknownInput = {
  date: "1990-01-15",
  place: "New York, NY",
  unknownTime: true,
  latitude: 40.7128,
  longitude: -74.006,
  timezone: "America/New_York",
} as const;

import { ValidationError } from "./errors";
import type { GetBirthChartOptions } from "./types/common";

export const DEFAULT_BASE_URL = "https://api.getbirthchart.com";
export const DEFAULT_TIMEOUT_MS = 30_000;

export interface ResolvedConfig {
  apiKey?: string;
  baseUrl: string;
  timeout: number;
  fetch: typeof globalThis.fetch;
}

export function resolveConfig(
  options: GetBirthChartOptions = {},
): ResolvedConfig {
  const baseUrl = options.baseUrl?.trim() || DEFAULT_BASE_URL;
  let parsed: URL;
  try {
    parsed = new URL(baseUrl);
  } catch (error) {
    throw new ValidationError("baseUrl must be a valid absolute URL.", {
      cause: error,
    });
  }
  if (
    !/^https?:$/.test(parsed.protocol) ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash
  ) {
    throw new ValidationError(
      "baseUrl must be an HTTP(S) URL without credentials or query parameters.",
    );
  }

  const timeout = options.timeout ?? DEFAULT_TIMEOUT_MS;
  if (!Number.isFinite(timeout) || timeout <= 0) {
    throw new ValidationError("timeout must be a positive finite number.");
  }
  const fetchImpl = options.fetch ?? globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    throw new ValidationError(
      "A fetch implementation is required in this runtime.",
    );
  }

  const apiKey = options.apiKey?.trim();
  return {
    ...(apiKey ? { apiKey } : {}),
    baseUrl: baseUrl.replace(/\/+$/, ""),
    timeout,
    fetch: fetchImpl,
  };
}

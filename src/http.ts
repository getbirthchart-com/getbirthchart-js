import {
  AmbiguousLocationError,
  ApiError,
  AuthenticationError,
  BirthTimeRequiredError,
  GetBirthChartError,
  LocationNotFoundError,
  RateLimitError,
  TimeoutError,
  ValidationError,
} from "./errors";
import type { GetBirthChartErrorOptions } from "./errors";
import type { ResolvedConfig } from "./config";

interface HttpResult<T> {
  data: T;
  requestId?: string;
}

interface ApiErrorPayload {
  error: {
    code?: unknown;
    message?: unknown;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function errorPayload(value: unknown): ApiErrorPayload | undefined {
  if (!isRecord(value) || !isRecord(value.error)) return undefined;
  return { error: value.error };
}

function responseRequestId(response: Response): string | undefined {
  return (
    response.headers.get("x-request-id") ??
    response.headers.get("request-id") ??
    undefined
  );
}

function retryAfter(value: string | null): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return undefined;
  return Math.max(0, Math.ceil((timestamp - Date.now()) / 1000));
}

function safeMessage(message: string, secret?: string): string {
  if (!secret) return message;
  return message.split(secret).join("[redacted]");
}

function mapResponseError(
  status: number,
  payload: unknown,
  requestId: string | undefined,
  secret: string | undefined,
  response: Response,
): GetBirthChartError {
  const envelope = errorPayload(payload);
  const code =
    typeof envelope?.error.code === "string" ? envelope.error.code : undefined;
  const message = safeMessage(
    typeof envelope?.error.message === "string"
      ? envelope.error.message
      : "The API request failed.",
    secret,
  );
  const context: GetBirthChartErrorOptions = requestId
    ? { status, requestId }
    : { status };

  if (status === 401 || status === 403 || code === "UNAUTHORIZED") {
    return new AuthenticationError("The API key was rejected.", context);
  }
  if (
    status === 429 ||
    code === "RATE_LIMITED" ||
    code === "RATE_LIMIT_ERROR"
  ) {
    return new RateLimitError(
      message,
      retryAfter(response.headers.get("retry-after")),
      context,
    );
  }
  if (code === "BIRTH_TIME_REQUIRED" || code === "UNKNOWN_BIRTH_TIME") {
    return new BirthTimeRequiredError(message, context);
  }
  if (code === "LOCATION_NOT_FOUND")
    return new LocationNotFoundError(message, context);
  if (code === "AMBIGUOUS_LOCATION")
    return new AmbiguousLocationError(message, context);
  if (
    status === 400 ||
    status === 409 ||
    status === 422 ||
    code === "REQUEST_VALIDATION_ERROR"
  ) {
    return new ValidationError(message, context);
  }
  return new ApiError(message, { ...context, code: code ?? `HTTP_${status}` });
}

export class HttpClient {
  constructor(private readonly config: ResolvedConfig) {}

  async request<T>(
    method: "GET" | "POST",
    path: string,
    body?: unknown,
  ): Promise<HttpResult<T>> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeout);
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    if (this.config.apiKey)
      headers.Authorization = `Bearer ${this.config.apiKey}`;

    const init: RequestInit = {
      method,
      headers,
      signal: controller.signal,
      redirect: "error",
    };
    if (body !== undefined) init.body = JSON.stringify(body);

    try {
      const response = await this.config.fetch(
        `${this.config.baseUrl}${path}`,
        init,
      );
      const requestId = responseRequestId(response);
      let payload: unknown;
      try {
        payload = await response.json();
      } catch (error) {
        throw new ApiError(
          "The API returned malformed JSON.",
          requestId
            ? {
                status: response.status,
                requestId,
                code: "INVALID_RESPONSE",
                cause: error,
              }
            : {
                status: response.status,
                code: "INVALID_RESPONSE",
                cause: error,
              },
        );
      }

      if (!response.ok) {
        throw mapResponseError(
          response.status,
          payload,
          requestId,
          this.config.apiKey,
          response,
        );
      }
      return { data: payload as T, ...(requestId ? { requestId } : {}) };
    } catch (error) {
      if (error instanceof GetBirthChartError) throw error;
      if (error instanceof Error && error.name === "AbortError") {
        throw new TimeoutError();
      }
      throw new ApiError("The API request could not be completed.", {
        code: "NETWORK_ERROR",
        cause: error,
      });
    } finally {
      clearTimeout(timer);
    }
  }
}

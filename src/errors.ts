export interface GetBirthChartErrorOptions {
  code?: string;
  status?: number;
  requestId?: string;
  cause?: unknown;
}

export class GetBirthChartError extends Error {
  readonly code?: string;
  readonly status?: number;
  readonly requestId?: string;
  readonly cause?: unknown;

  constructor(message: string, options: GetBirthChartErrorOptions = {}) {
    super(
      message,
      options.cause === undefined ? undefined : { cause: options.cause },
    );
    this.name = new.target.name;
    if (options.code !== undefined) this.code = options.code;
    if (options.status !== undefined) this.status = options.status;
    if (options.requestId !== undefined) this.requestId = options.requestId;
    if (options.cause !== undefined) this.cause = options.cause;
  }
}

export class AuthenticationError extends GetBirthChartError {
  constructor(
    message = "The API key was rejected.",
    options: GetBirthChartErrorOptions = {},
  ) {
    super(message, { ...options, code: "AUTHENTICATION_ERROR" });
  }
}

export class RateLimitError extends GetBirthChartError {
  readonly retryAfter?: number;

  constructor(
    message = "The API rate limit was exceeded.",
    retryAfter?: number,
    options: GetBirthChartErrorOptions = {},
  ) {
    super(message, { ...options, code: "RATE_LIMIT_ERROR" });
    if (retryAfter !== undefined) this.retryAfter = retryAfter;
  }
}

export class ValidationError extends GetBirthChartError {
  constructor(message: string, options: GetBirthChartErrorOptions = {}) {
    super(message, { ...options, code: "VALIDATION_ERROR" });
  }
}

export class BirthTimeRequiredError extends GetBirthChartError {
  constructor(
    message = "This operation requires a precise birth time.",
    options: GetBirthChartErrorOptions = {},
  ) {
    super(message, { ...options, code: "BIRTH_TIME_REQUIRED" });
  }
}

export class LocationNotFoundError extends GetBirthChartError {
  constructor(
    message = "The requested birth location was not found.",
    options: GetBirthChartErrorOptions = {},
  ) {
    super(message, { ...options, code: "LOCATION_NOT_FOUND" });
  }
}

export class AmbiguousLocationError extends GetBirthChartError {
  constructor(
    message = "The birth location is ambiguous.",
    options: GetBirthChartErrorOptions = {},
  ) {
    super(message, { ...options, code: "AMBIGUOUS_LOCATION" });
  }
}

export class TimeoutError extends GetBirthChartError {
  constructor(
    message = "The request timed out.",
    options: GetBirthChartErrorOptions = {},
  ) {
    super(message, { ...options, code: "TIMEOUT" });
  }
}

export class ApiError extends GetBirthChartError {
  constructor(message: string, options: GetBirthChartErrorOptions = {}) {
    super(message, { ...options, code: options.code ?? "API_ERROR" });
  }
}

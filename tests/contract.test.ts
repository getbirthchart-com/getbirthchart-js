import { describe, expect, it } from "vitest";
import {
  CALCULATION_HASH_PATTERN,
  COMPOSITE_SCHEMA_VERSION,
  CORE_TAG_URL,
  CORE_VERSION,
  DAVISON_SCHEMA_VERSION,
  NATAL_SCHEMA_VERSION,
  OPENAPI_SOURCE_URL,
  SYNASTRY_SCHEMA_VERSION,
} from "../src/contract";

describe("core v1.13.0 contract", () => {
  it("keeps the deterministic public contract versions and source", () => {
    expect({
      CORE_VERSION,
      NATAL_SCHEMA_VERSION,
      SYNASTRY_SCHEMA_VERSION,
      COMPOSITE_SCHEMA_VERSION,
      DAVISON_SCHEMA_VERSION,
      CORE_TAG_URL,
      OPENAPI_SOURCE_URL,
    }).toEqual({
      CORE_VERSION: "1.13.0",
      NATAL_SCHEMA_VERSION: "1.9.0",
      SYNASTRY_SCHEMA_VERSION: "1.5.0",
      COMPOSITE_SCHEMA_VERSION: "1.3.0",
      DAVISON_SCHEMA_VERSION: "1.1.0",
      CORE_TAG_URL:
        "https://github.com/getbirthchart-com/gbc-astro-engine/tree/v1.13.0",
      OPENAPI_SOURCE_URL:
        "https://github.com/getbirthchart-com/gbc-astro-engine/blob/v1.13.0/src/gbc_astro/api/models.py",
    });
  });

  it("accepts only full v2 calculation hashes", () => {
    expect(CALCULATION_HASH_PATTERN.test(`v2:${"a".repeat(64)}`)).toBe(true);
    expect(CALCULATION_HASH_PATTERN.test(`v2:${"a".repeat(63)}`)).toBe(false);
    expect(CALCULATION_HASH_PATTERN.test(`v2:${"A".repeat(64)}`)).toBe(false);
  });
});

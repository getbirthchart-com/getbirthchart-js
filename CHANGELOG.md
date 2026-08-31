# Changelog

All notable changes to `@getbirthchart/sdk` will be documented in this file.

The project follows Semantic Versioning.

## [Unreleased]

### Added

- Initial repository and SDK specification.

## [0.2.0] - 2026-08-31

### Added

- `gbc-astro` 1.13.0 calculation options for house systems, node convention,
  aspect presets/custom rules, additional points, sidereal zodiac/ayanamsa,
  altitude, and PEP 495 fold.
- Schema-aware natal, synastry, composite, and Davison response types.
- `calculateComposite()` and `calculateDavison()` methods.
- Unknown-time assessment, derived points, requested/effective metadata, and
  additive response-field preservation.
- Fail-closed handling for incompatible response schema major versions.
- Full-length calculation hash preservation when returned by HTTP.

## [0.1.0] - 2026-08-29

### Added

- `GetBirthChart` client
- `calculateBirthChart()`
- `getPlanetPositions()`
- `getSunSign()`
- `getMoonSign()`
- `getRisingSign()`
- `getBigThree()`
- `calculateAspects()`
- `calculateSynastry()`
- TypeScript declarations
- structured SDK errors
- unknown birth-time semantics
- ESM package distribution
- CI test/build workflow
- npm publishing workflow

Implementation notes:

- The client maps the audited `gbc-astro` natal and synastry endpoints.
- `place` is not sent because the current backend does not provide geocoding.
- Unknown-time Moon results fail closed when the backend does not provide explicit certainty.

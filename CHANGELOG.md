# Changelog

All notable changes to `@getbirthchart/sdk` will be documented in this file.

The project follows Semantic Versioning.

## [Unreleased]

### Added

- Initial repository and SDK specification.

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

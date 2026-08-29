# Security Policy

## Reporting a vulnerability

Do not disclose exploitable security issues in a public GitHub issue.

Report vulnerabilities privately through the repository's
[GitHub Security Advisory form](https://github.com/getbirthchart-com/getbirthchart-js/security/advisories/new).
Include the affected version, a concise reproduction, impact, and a suggested
fix if available. Do not include live API keys or personal birth data in the
report. If the form is unavailable, configure GitHub private vulnerability
reporting before publishing the package; do not fall back to a public issue.

## SDK security principles

The SDK must:

- never log API keys
- never include API keys in URLs
- never persist API keys automatically
- avoid exposing authorization headers in errors
- avoid dynamic code evaluation
- avoid remote code execution patterns
- keep dependencies minimal
- validate untrusted API responses where needed
- use HTTPS for the default production API

## Birth data

Birth date, birth time and location can be personal information.

The SDK must not:

- log request payloads by default
- send data to unrelated third parties
- add analytics/telemetry without explicit design and disclosure
- persist birth data automatically

## Dependency security

Before releases:

- review direct dependency changes
- review npm audit output pragmatically
- avoid adding dependencies for trivial utilities
- keep lockfile committed

## Supported versions

Until `1.0.0`, security fixes should target the latest published minor line unless a separate support policy is announced.

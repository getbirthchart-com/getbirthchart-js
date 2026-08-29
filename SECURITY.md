# Security Policy

## Reporting a vulnerability

Do not disclose exploitable security issues in a public GitHub issue.

Use the official GetBirthChart security contact/process configured for the repository.

Before public release, replace this section with the exact reporting destination.

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

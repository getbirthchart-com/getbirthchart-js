# Repository Strategy

## Decision

Use a dedicated repository:

```text
getbirthchart-com/getbirthchart-js
```

for:

```text
@getbirthchart/sdk
```

## Why a separate repo

The JavaScript SDK has a different responsibility and release lifecycle from both the web product and the astrology engine.

### Web repository

Owns:

- website
- product UI
- account flows
- SEO pages
- consumer-facing app behavior

### Engine repository

Owns:

- Swiss Ephemeris integration
- calculation algorithms
- validation
- astrology computation correctness

### JavaScript SDK repository

Owns:

- developer-facing TypeScript API
- HTTP transport
- types
- errors
- npm publishing
- JavaScript examples
- SDK documentation

Keeping these boundaries separate prevents accidental coupling.

## Benefits

### npm identity

GitHub repo and npm package map cleanly:

```text
getbirthchart-com/getbirthchart-js
@getbirthchart/sdk
```

### Releases

SDK releases such as:

```text
v0.1.0
v0.1.1
v0.2.0
```

do not need to match web deployments or engine releases.

### Issues

SDK consumers can report:

- Node compatibility
- TypeScript type problems
- API mapping bugs
- package installation issues

without mixing them with web SEO/product issues.

### Provenance

A dedicated repository makes npm provenance and release workflow easier to understand and audit.

### Discoverability

The repository itself becomes another official GetBirthChart developer entity linking:

```text
GetBirthChart
↔ GitHub
↔ npm
↔ developer docs
↔ engine
↔ Python package
```

## Do not create a monorepo merely for convenience

A monorepo is justified only if the SDK becomes tightly coupled to a shared generated API client/schema workflow.

For v0.1, separate repository is the recommended choice.

## Naming

Recommended:

```text
Repository: getbirthchart-js
npm:       @getbirthchart/sdk
Class:     GetBirthChart
```

Avoid naming the repo simply `sdk`, because `getbirthchart-js` is clearer in GitHub search and ecosystem indexes.

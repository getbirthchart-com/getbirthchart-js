# Bootstrap Repository — `@getbirthchart/sdk`

This document defines how to create the JavaScript/TypeScript SDK repository from zero.

Target repository:

```text
getbirthchart-com/getbirthchart-js
```

Target npm package:

```text
@getbirthchart/sdk
```

Target initial version:

```text
0.1.0
```

---

# 1. Repository boundary

The SDK must live in a dedicated repository.

Do not create it inside:

```text
getbirthchart-web
gbc-astro-engine
gbc-astro
```

Recommended repository:

```text
getbirthchart-com/getbirthchart-js
```

The SDK has its own:

* source code
* package.json
* npm releases
* Git tags
* issues
* CI
* publishing workflow
* changelog
* version lifecycle

The SDK must remain independently releasable from the web application and calculation engine.

---

# 2. Before creating anything

First inspect the current working directory.

Run:

```bash
pwd
git status
git remote -v
```

Determine whether the current directory is already inside another GetBirthChart repository.

If currently inside another project, do not initialize the SDK inside that repository.

Move to the parent workspace first.

Example:

```bash
cd ..
```

Expected workspace:

```text
workspace/
├── getbirthchart-web/
├── gbc-astro-engine/
└── getbirthchart-js/
```

---

# 3. Create repository folder

Create:

```bash
mkdir getbirthchart-js
cd getbirthchart-js
```

Confirm:

```bash
pwd
```

The directory should now end with:

```text
/getbirthchart-js
```

---

# 4. Initialize Git

Run:

```bash
git init
git branch -M main
```

Verify:

```bash
git status
```

Expected branch:

```text
main
```

---

# 5. Create `.gitignore`

Create:

```text
.gitignore
```

with:

```gitignore
node_modules/
dist/
coverage/

.env
.env.*
!.env.example

.DS_Store

*.log

npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

.vscode/
.idea/

*.tgz
```

Do not commit:

* API keys
* npm tokens
* `.env`
* generated tarballs
* local build output
* coverage output

---

# 6. Initialize npm package

Run:

```bash
npm init -y
```

Then edit `package.json`.

Initial package identity:

```json
{
  "name": "@getbirthchart/sdk",
  "version": "0.1.0",
  "description": "Official TypeScript SDK for the GetBirthChart astrology calculation API.",
  "type": "module",
  "private": false,
  "license": "TBD",
  "homepage": "https://getbirthchart.com/developers",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/getbirthchart-com/getbirthchart-js.git"
  },
  "bugs": {
    "url": "https://github.com/getbirthchart-com/getbirthchart-js/issues"
  }
}
```

Do not publish while:

```json
"license": "TBD"
```

The license must be explicitly chosen before release.

---

# 7. Install development dependencies

Use Node.js 20 or newer.

Check:

```bash
node --version
npm --version
```

Recommended minimum:

```text
Node.js >= 20
```

Install tooling:

```bash
npm install -D \
  typescript \
  tsup \
  vitest \
  @vitest/coverage-v8 \
  eslint \
  @eslint/js \
  typescript-eslint \
  prettier \
  @types/node
```

Do not add runtime dependencies unless they are actually required.

The SDK should use native:

```ts
globalThis.fetch
```

instead of Axios.

---

# 8. Create directory structure

Create:

```bash
mkdir -p \
  src/types \
  tests/fixtures \
  examples \
  .github/workflows
```

Expected structure:

```text
getbirthchart-js/
├── src/
│   └── types/
├── tests/
│   └── fixtures/
├── examples/
├── .github/
│   └── workflows/
├── package.json
└── .gitignore
```

---

# 9. Create initial source files

Create:

```bash
touch \
  src/index.ts \
  src/client.ts \
  src/config.ts \
  src/http.ts \
  src/errors.ts
```

Create type files:

```bash
touch \
  src/types/index.ts \
  src/types/common.ts \
  src/types/chart.ts \
  src/types/planets.ts \
  src/types/aspects.ts \
  src/types/synastry.ts \
  src/types/uncertainty.ts
```

Create tests:

```bash
touch \
  tests/client.test.ts \
  tests/errors.test.ts \
  tests/chart.test.ts \
  tests/unknown-time.test.ts
```

Create examples:

```bash
touch \
  examples/birth-chart.ts \
  examples/big-three.ts \
  examples/unknown-birth-time.ts \
  examples/planetary-positions.ts \
  examples/synastry.ts
```

---

# 10. Copy specification documents

Add the following documentation files to repository root:

```text
README.md
IMPLEMENTATION_SPEC.md
API_CONTRACT.md
ERROR_MODEL.md
TESTING.md
PUBLISHING.md
RELEASE_CHECKLIST.md
REPOSITORY_STRATEGY.md
BOOTSTRAP_REPOSITORY.md
AI_IMPLEMENTATION_PROMPT.md
CONTRIBUTING.md
SECURITY.md
CHANGELOG.md
LICENSE
```

These files define the implementation contract.

AI coding agents must read them before changing SDK behavior.

---

# 11. Configure TypeScript

Create:

```text
tsconfig.json
```

Recommended baseline:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "resolveJsonModule": true,
    "types": ["node"]
  },
  "include": [
    "src",
    "tests",
    "examples",
    "tsup.config.ts"
  ]
}
```

Strict mode is mandatory.

Do not disable strict TypeScript checks merely to make compilation pass.

---

# 12. Configure build

Create:

```text
tsup.config.ts
```

Recommended initial configuration:

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  treeshake: true,
  target: "es2022",
});
```

Do not add CommonJS unless there is a concrete compatibility requirement.

---

# 13. Configure package exports

Update `package.json`:

```json
{
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE",
    "CHANGELOG.md"
  ],
  "sideEffects": false,
  "engines": {
    "node": ">=20"
  }
}
```

Do not export internal files directly in v0.1.

Consumers should primarily import from:

```ts
import {
  GetBirthChart,
  BirthTimeRequiredError,
} from "@getbirthchart/sdk";
```

Avoid requiring imports like:

```ts
@getbirthchart/sdk/dist/client
@getbirthchart/sdk/internal/http
```

---

# 14. Add npm scripts

Add:

```json
{
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "clean": "rm -rf dist coverage"
  }
}
```

Before release, the following must succeed:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

---

# 15. Configure Prettier

Create:

```text
.prettierrc
```

Recommended:

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all"
}
```

Create:

```text
.prettierignore
```

with:

```text
node_modules
dist
coverage
*.tgz
```

---

# 16. Configure ESLint

Create:

```text
eslint.config.js
```

Use the installed TypeScript ESLint tooling.

The exact config may follow the current supported flat-config format.

Rules should prioritize:

* TypeScript correctness
* unused imports/variables
* accidental `any`
* unsafe code
* maintainability

Do not configure hundreds of stylistic ESLint rules that overlap with Prettier.

---

# 17. Create initial public entry point

`src/index.ts` must become the only primary package entry point.

Eventually it should export:

```ts
export { GetBirthChart } from "./client";

export * from "./errors";
export * from "./types";
```

Do not expose:

```text
http.ts
internal request helpers
private normalization functions
```

unless deliberately part of the public SDK contract.

---

# 18. Do not implement API endpoints blindly

Before implementing `client.ts`, audit the existing GetBirthChart API.

Document:

```text
SDK method
→ backend endpoint
→ request schema
→ response schema
→ error schema
```

Example mapping table:

```text
calculateBirthChart
→ POST /...
→ BirthData payload
→ chart response

getMoonSign
→ POST /...
→ BirthData payload
→ Moon result
```

The exact endpoints must come from the real backend.

Do not invent endpoints from this documentation.

---

# 19. Required v0.1 public methods

Implement exactly:

```ts
calculateBirthChart()
getPlanetPositions()
getSunSign()
getMoonSign()
getRisingSign()
getBigThree()
calculateAspects()
calculateSynastry()
```

Do not expand scope during repository bootstrap.

---

# 20. Unknown birth-time contract

This is a release-blocking rule.

The SDK must never:

```text
unknown time
→ replace with 12:00
→ calculate houses
→ calculate Rising
```

Forbidden.

If:

```ts
unknownTime: true
```

then the SDK must preserve backend uncertainty behavior.

It must not synthesize missing fields.

For example:

```ts
chart.ascendant === undefined
chart.houses === undefined
```

is valid and expected when birth time is unknown.

For Rising-sign requests, prefer:

```ts
throw new BirthTimeRequiredError(...)
```

rather than returning a guess.

---

# 21. Add CI

Create:

```text
.github/workflows/ci.yml
```

The CI workflow must run on:

```text
pull_request
push to main
```

Required steps:

```text
checkout
setup Node 20
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

Do not publish from the normal CI workflow.

---

# 22. Add publishing workflow

Create:

```text
.github/workflows/publish.yml
```

Publishing must be separate from CI.

Do not enable automatic publishing until:

* npm scope ownership is confirmed
* trusted publishing/provenance is configured
* license is selected
* package tarball is verified
* v0.1 implementation passes release checklist

Prefer release trigger:

```text
GitHub Release published
```

or an explicitly approved version-tag workflow.

Never publish on every push to `main`.

---

# 23. Create GitHub repository

Preferred repository:

```text
getbirthchart-com/getbirthchart-js
```

If GitHub CLI is installed and authenticated:

```bash
gh auth status
```

Then repository creation may be performed with:

```bash
gh repo create getbirthchart-com/getbirthchart-js \
  --public \
  --source=. \
  --remote=origin
```

If repository already exists:

```bash
git remote add origin git@github.com:getbirthchart-com/getbirthchart-js.git
```

Verify:

```bash
git remote -v
```

Expected:

```text
origin  git@github.com:getbirthchart-com/getbirthchart-js.git
```

Do not create duplicate GitHub repositories if the target already exists.

---

# 24. Initial commit

Before committing:

```bash
git status
```

Review every file.

Confirm no secrets exist:

```bash
git diff --cached
```

Then:

```bash
git add .
git commit -m "chore: bootstrap TypeScript SDK"
```

Push:

```bash
git push -u origin main
```

---

# 25. Recommended first commits

Prefer clean commit boundaries.

Example:

```text
chore: bootstrap TypeScript SDK
docs: add SDK implementation specification
feat: add HTTP transport
feat: add birth chart client
feat: add sign helper methods
feat: add synastry client
test: cover unknown birth-time behavior
ci: add package validation workflow
ci: add npm publishing workflow
```

Do not put the entire project into one enormous opaque commit if practical.

---

# 26. npm scope preparation

Before publishing:

Confirm ownership of:

```text
@getbirthchart
```

on npm.

Desired package:

```text
@getbirthchart/sdk
```

Check:

```bash
npm whoami
```

Confirm npm registry:

```bash
npm config get registry
```

Expected official registry:

```text
https://registry.npmjs.org/
```

Do not store npm tokens inside repository files.

---

# 27. `.npmrc`

A repository-level `.npmrc` is optional.

If added, keep it non-secret.

Safe example:

```ini
access=public
provenance=true
```

Do not add:

```text
//registry.npmjs.org/:_authToken=...
```

to the repository.

Authentication belongs in npm trusted publishing or secure CI configuration.

---

# 28. Package keywords

Add a small, accurate set.

Example:

```json
{
  "keywords": [
    "astrology",
    "birth-chart",
    "natal-chart",
    "zodiac",
    "ephemeris",
    "synastry",
    "typescript",
    "sdk"
  ]
}
```

Do not keyword-spam unrelated terms.

---

# 29. Package author / organization metadata

Use official GetBirthChart identity consistently.

Do not mix:

```text
GetBirthChart
random personal branding
different project names
unrelated domains
```

unless intentionally required.

The goal is a coherent developer entity:

```text
GetBirthChart
├── getbirthchart.com
├── GitHub organization
├── npm scope
├── Python package
├── JavaScript SDK
└── open-source engine
```

---

# 30. Validate repository before implementation

At this point run:

```bash
git status
npm install
npm run typecheck
npm run build
```

It is acceptable for tests to be empty temporarily during bootstrap, but do not publish until required tests exist.

---

# 31. Final expected folder structure

Before implementing the API client, the repository should resemble:

```text
getbirthchart-js/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── publish.yml
│
├── examples/
│   ├── big-three.ts
│   ├── birth-chart.ts
│   ├── planetary-positions.ts
│   ├── synastry.ts
│   └── unknown-birth-time.ts
│
├── src/
│   ├── types/
│   │   ├── aspects.ts
│   │   ├── chart.ts
│   │   ├── common.ts
│   │   ├── index.ts
│   │   ├── planets.ts
│   │   ├── synastry.ts
│   │   └── uncertainty.ts
│   ├── client.ts
│   ├── config.ts
│   ├── errors.ts
│   ├── http.ts
│   └── index.ts
│
├── tests/
│   ├── fixtures/
│   ├── chart.test.ts
│   ├── client.test.ts
│   ├── errors.test.ts
│   └── unknown-time.test.ts
│
├── .gitignore
├── .npmrc
├── .prettierignore
├── .prettierrc
├── AI_IMPLEMENTATION_PROMPT.md
├── API_CONTRACT.md
├── BOOTSTRAP_REPOSITORY.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── ERROR_MODEL.md
├── IMPLEMENTATION_SPEC.md
├── LICENSE
├── package-lock.json
├── package.json
├── PUBLISHING.md
├── README.md
├── RELEASE_CHECKLIST.md
├── REPOSITORY_STRATEGY.md
├── SECURITY.md
├── TESTING.md
├── tsconfig.json
└── tsup.config.ts
```

---

# 32. AI coding agent bootstrap instruction

If an AI coding agent is responsible for creating this project, give it the following rule:

> Create `getbirthchart-js` as a standalone repository. Before initialization, run `pwd`, `git status`, and inspect the current workspace so the SDK is not accidentally created inside another repository. Bootstrap Node 20+, TypeScript, tsup, Vitest, ESLint and Prettier; create the folder structure defined in `BOOTSTRAP_REPOSITORY.md`; copy all specification documents into the repository; configure package identity as `@getbirthchart/sdk`; configure ESM and TypeScript declaration output; create CI scaffolding; then audit the actual GetBirthChart backend API before implementing any SDK methods. Do not invent endpoints and do not publish anything until the release checklist passes.

---

# 33. Bootstrap completion criteria

Repository bootstrap is complete when:

* [ ] dedicated `getbirthchart-js` directory exists
* [ ] directory is not nested inside another Git repository
* [ ] Git initialized on `main`
* [ ] remote points to official GitHub repository
* [ ] package name is `@getbirthchart/sdk`
* [ ] initial version is `0.1.0`
* [ ] Node requirement is `>=20`
* [ ] TypeScript strict mode enabled
* [ ] ESM build configured
* [ ] `.d.ts` generation configured
* [ ] source directories exist
* [ ] tests directory exists
* [ ] examples directory exists
* [ ] CI workflow scaffold exists
* [ ] publishing workflow scaffold exists
* [ ] specification files copied
* [ ] `.gitignore` exists
* [ ] no secrets committed
* [ ] package-lock.json committed
* [ ] initial build works
* [ ] initial commit created
* [ ] repository pushed to GitHub

Only after this checklist passes should implementation of the v0.1 API begin.

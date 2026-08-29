# Publishing Standard

## Goal

Publish `@getbirthchart/sdk` from the official repository with reproducible CI and provenance.

Avoid routine manual publishing from local developer machines.

## Prerequisites

Before the first release:

- npm organization/scope is controlled by GetBirthChart
- package name is available
- repository URL is final
- license is selected
- npm account uses strong authentication
- CI publishing permissions are minimal
- npm trusted publishing / provenance is configured when supported

## Release flow

1. All CI checks pass.
2. Update `CHANGELOG.md`.
3. Set package version.
4. Run:
   ```bash
   npm ci
   npm run lint
   npm run typecheck
   npm test
   npm run build
   ```
5. Run:
   ```bash
   npm pack --dry-run
   ```
6. Inspect package files.
7. Smoke-test the generated tarball.
8. Commit release changes.
9. Create matching Git tag:
   ```text
   v0.1.0
   ```
10. Publish through GitHub Actions.
11. Create GitHub Release.
12. Verify npm page metadata.
13. Verify provenance indicator when available.
14. Install the published version into a clean test project.

## npm package contents

Prefer a strict `files` allowlist in `package.json`.

Example:

```json
{
  "files": [
    "dist",
    "README.md",
    "LICENSE",
    "CHANGELOG.md"
  ]
}
```

Do not publish:

- tests
- local fixtures
- `.env`
- secrets
- internal planning docs
- source maps if not intended
- CI credentials

## Version tags

Use:

```text
latest
```

for stable releases.

Only introduce:

```text
next
beta
canary
```

when an actual prerelease workflow is needed.

## Provenance

Enable npm provenance / trusted publishing using the current official npm + GitHub Actions mechanism available at implementation time.

The implementation agent must verify current npm documentation before configuring this workflow because publishing authentication mechanisms can change.

The repository workflow uses GitHub Actions trusted publishing with OIDC. Configure the npm trusted publisher for `getbirthchart-com/getbirthchart-js` and `.github/workflows/publish.yml` before publishing. The workflow grants `id-token: write`, runs on Node 24, and publishes only after a GitHub Release is published. Current npm documentation requires npm CLI 11.5.1 or newer and Node 22.14.0 or newer for trusted publishing; the release workflow therefore uses Node 24 even though the SDK runtime supports Node 20.

## Rollback

Never reuse a published npm version.

If `0.1.0` is defective:

- deprecate it if needed
- fix code
- publish `0.1.1`

Do not delete versions casually.

# Release Checklist

## Code

- [ ] Public API matches `API_CONTRACT.md`
- [ ] No unapproved public methods
- [ ] No duplicated astrology calculation logic
- [ ] Unknown-time behavior reviewed
- [ ] Errors are typed
- [ ] API secrets never logged

## Quality

- [ ] `npm ci`
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] README examples compile
- [ ] `npm pack --dry-run`
- [ ] tarball manually inspected
- [ ] clean-project installation tested

## Documentation

- [ ] README updated
- [ ] CHANGELOG updated
- [ ] API contract updated if needed
- [ ] examples updated
- [ ] public types documented
- [ ] license correct

## Package metadata

- [ ] package name correct
- [ ] version correct
- [ ] description correct
- [ ] repository URL correct
- [ ] homepage correct
- [ ] bugs URL correct
- [ ] keywords reasonable
- [ ] Node engine requirement correct
- [ ] package `files` allowlist correct
- [ ] no private package flag

## Security

- [ ] no `.env`
- [ ] no tokens
- [ ] no API keys
- [ ] dependency audit reviewed
- [ ] GitHub publishing permissions minimal
- [ ] npm provenance/trusted publishing configured

## Release

- [ ] release commit created
- [ ] Git tag matches version
- [ ] CI green
- [ ] npm publish successful
- [ ] npm page verified
- [ ] provenance verified if supported
- [ ] GitHub Release created
- [ ] published package installed in clean project

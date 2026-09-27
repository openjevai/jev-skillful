# OpenJEV Support

This fork adds optional [OpenJEV](https://openjev.sh) support alongside the original
TypeSafe integration. OpenJEV is a free community gateway to the same Jev model.
TypeSafe remains the default; anyone with a TypeSafe key sees zero behaviour change.

## What was added

- `packages/cli/src/core/jev/types.ts` — OpenJEV constants (`OPENJEV_BASE_URL`,
  `OPENJEV_MODEL`, `OPENJEV_API_KEY_ENV`, `PROVIDER_ENV`), `JevProvider` type,
  and `resolveProvider` / `providerBaseUrl` / `providerModel` / `providerKeyEnv` helpers.
- `packages/cli/src/core/jev/client.ts` — provider-aware API key resolution,
  provider-aware default base URL and model, and HTTP 503 added to retryable statuses.
- `packages/cli/src/core/config/resolve.ts` — default `model` and `baseUrl` now
  follow the resolved provider instead of always defaulting to TypeSafe.
- `packages/cli/src/core/hooks/runner.ts` — the "no API key" check now reads the
  key env var for the resolved provider.
- `packages/cli/src/commands/doctor.ts` — reports the correct key env var for the
  active provider.
- `packages/cli/src/commands/route.ts` — degraded advice and key warnings reference
  the active provider's key env var.
- `packages/cli/src/core/index.ts` — re-exports the new OpenJEV constants and helpers.
- `packages/cli/src/cli.ts` — help text documents `OPENJEV_API_KEY`, `JEV_PROVIDER`,
  and `SKILLFUL_BASE_URL`.
- `.env.example` — documents `OPENJEV_API_KEY` and `JEV_PROVIDER`.
- `README.md` — short note after the intro crediting TypeSafe first.

## Provider selection rule

1. **Explicit choice wins:** `JEV_PROVIDER=openjev` or `JEV_PROVIDER=typesafe`.
2. **Otherwise, if `TYPESAFE_API_KEY` is set → TypeSafe** (unchanged default).
3. **Otherwise, if only `OPENJEV_API_KEY` is set → OpenJEV.**
4. Falls back to TypeSafe (the original default).

When OpenJEV is selected, the default base URL becomes `https://api.openjev.sh/v1/systemone`
and the default model becomes `openjev`. Explicit `SKILLFUL_BASE_URL` or `SKILLFUL_MODEL`
overrides still take precedence.

## How to configure

```bash
# Option A: auto-select OpenJEV (no TypeSafe key present)
export OPENJEV_API_KEY=your_openjev_key

# Option B: explicit provider choice
export JEV_PROVIDER=openjev
export OPENJEV_API_KEY=your_openjev_key

# Option C: keep TypeSafe (unchanged — zero behaviour change)
export TYPESAFE_API_KEY=your_typesafe_key
```

## How it was verified

- A live POST to `https://api.openjev.sh/v1/systemone` with model `openjev`,
  state `ping`, and one `noul` question returned HTTP 200.
- Re-grepped the codebase: no hardcoded `api.typesafe.ai` default remains that
  would override the provider-aware resolution. The `DEFAULT_BASE_URL` constant
  is still `https://api.typesafe.ai/v1/systemone` (TypeSafe stays the default);
  the new `OPENJEV_BASE_URL` constant provides the OpenJEV alternative.

## Upstream

Original project: https://github.com/bestagentkits/jev-skillful by @mrgoonie.

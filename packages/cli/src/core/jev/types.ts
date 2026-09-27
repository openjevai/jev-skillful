/**
 * Wire types for the TypeSafe System One endpoint.
 *
 * These mirror the published request and response shapes exactly. The distinction that
 * matters most for routing is that `noul` returns a bare probability with **no separate
 * confidence**, while `choice` returns a distribution plus a confidence. Runner-up
 * ranking therefore uses the `noul` value directly, and only the primary decision has a
 * confidence to report.
 */

/** Yes/no question. High means yes. */
export interface NoulQuestion {
  type: "noul";
  instructions: string;
  criteria?: { true: string; false: string };
}

export interface ChoiceQuestion {
  type: "choice";
  instructions: string;
  /** Option name to description. `null` when the option name is self-explanatory. */
  criteria: Record<string, string | null>;
}

export type Question = NoulQuestion | ChoiceQuestion;

export interface SystemOneRequest {
  /** The content to evaluate. A string or structured data. */
  state: unknown;
  /** Required by the API. `jev-latest` is the flagship alias. */
  model: string;
  questions: Record<string, Question>;
}

export interface NoulAnswer {
  type: "noul";
  noul: number;
}

export interface ChoiceAnswer {
  type: "choice";
  choice: string;
  probabilities: Record<string, number>;
  confidence: number;
}

export type Answer = NoulAnswer | ChoiceAnswer;

export interface SystemOneResponse {
  model: string;
  answers: Record<string, Answer>;
  usage?: { input_tokens?: number; output_tokens?: number };
}

/** Default model alias. Verified against the live API. */
export const DEFAULT_MODEL = "jev-latest";

export const DEFAULT_BASE_URL = "https://api.typesafe.ai/v1/systemone";

/** Environment variable read for the API key. Never accepted as a CLI flag. */
export const API_KEY_ENV = "TYPESAFE_API_KEY";

// ---------------------------------------------------------------------------
// OpenJEV — community gateway to the same Jev model (additive, TypeSafe stays default)
// ---------------------------------------------------------------------------

/** OpenJEV API endpoint. */
export const OPENJEV_BASE_URL = "https://api.openjev.sh/v1/systemone";

/** Model id on the OpenJEV gateway. */
export const OPENJEV_MODEL = "openjev";

/** Environment variable for the OpenJEV API key. */
export const OPENJEV_API_KEY_ENV = "OPENJEV_API_KEY";

/** Environment variable for explicit provider selection (`typesafe` or `openjev`). */
export const PROVIDER_ENV = "JEV_PROVIDER";

export type JevProvider = "typesafe" | "openjev";

/**
 * Resolve which provider to use.
 *
 * 1. An explicit `JEV_PROVIDER=openjev` or `JEV_PROVIDER=typesafe` wins.
 * 2. Otherwise, if `TYPESAFE_API_KEY` is set → TypeSafe (unchanged default).
 * 3. Otherwise, if only `OPENJEV_API_KEY` is set → OpenJEV.
 * 4. Falls back to TypeSafe (the original default).
 *
 * Anyone with a TypeSafe key sees zero behaviour change.
 */
export function resolveProvider(
  env: Readonly<Record<string, string | undefined>>,
): JevProvider {
  const explicit = env[PROVIDER_ENV]?.trim().toLowerCase();
  if (explicit === "openjev") return "openjev";
  if (explicit === "typesafe") return "typesafe";

  if (env[API_KEY_ENV]?.trim()) return "typesafe";
  if (env[OPENJEV_API_KEY_ENV]?.trim()) return "openjev";
  return "typesafe";
}

/** Default base URL for a given provider. */
export function providerBaseUrl(provider: JevProvider): string {
  return provider === "openjev" ? OPENJEV_BASE_URL : DEFAULT_BASE_URL;
}

/** Default model id for a given provider. */
export function providerModel(provider: JevProvider): string {
  return provider === "openjev" ? OPENJEV_MODEL : DEFAULT_MODEL;
}

/** API key environment variable name for a given provider. */
export function providerKeyEnv(provider: JevProvider): string {
  return provider === "openjev" ? OPENJEV_API_KEY_ENV : API_KEY_ENV;
}

export function isNoulAnswer(answer: Answer | undefined): answer is NoulAnswer {
  return answer !== undefined && answer.type === "noul";
}

export function isChoiceAnswer(answer: Answer | undefined): answer is ChoiceAnswer {
  return answer !== undefined && answer.type === "choice";
}

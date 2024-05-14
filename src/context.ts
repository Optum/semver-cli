import { SemVer } from "../deps/semver.ts";
import { patch, regexp, replace } from "./hooks/mod.ts";
import { FormatKind } from "./util/variant.ts";

export interface IContext {
  output?: string;
  config?: string;
  githubDir: string;
  hooks: {
    patch: (file: string, current: SemVer) => Promise<void>;
    replace: (
      file: string,
      previous: SemVer,
      current: SemVer,
    ) => Promise<void>;
    regexp: (
      file: string,
      current: SemVer,
      pattern: string,
      flags?: string,
      format?: FormatKind,
      prefix?: string,
    ) => Promise<void>;
  };
}

export function getContext(): IContext {
  const env = Deno.env.toObject();
  const githubDir = readString(env, "GITHUB_DIR", `${Deno.cwd()}/.github`);
  const output = readOptionalString(env, "GITHUB_OUTPUT");
  const config = readOptionalString(
    env,
    "VERSION_CONFIG",
  );
  return {
    ...output ? { output } : {},
    githubDir,
    config,
    hooks: {
      patch,
      replace,
      regexp,
    },
  };
}

function readString(
  env: Record<string, string>,
  key: string,
  defaultValue: string,
) {
  const value = env[key];
  if (value !== undefined) {
    return value;
  } else {
    return defaultValue;
  }
}

function readOptionalString(
  env: Record<string, string>,
  key: string,
): string | undefined {
  return env[key];
}

import { patch, regexp, replace } from "./hooks/mod.ts";

export interface IContext {
  output?: string;
  config: string;
  hooks: {
    patch: (file: string, version: string) => Promise<void>;
    replace: (
      file: string,
      previous: string,
      current: string,
    ) => Promise<void>;
    regexp: (
      file: string,
      current: string,
      pattern: string,
      flags?: string,
    ) => Promise<void>;
  };
}

export function getContext(): IContext {
  const env = Deno.env.toObject();
  const githubDir = readString(env, "GITHUB_DIR", `${Deno.cwd()}/.github`);
  const output = readOptionalString(env, "GITHUB_OUTPUT");
  const config = readString(
    env,
    "VERSION_CONFIG",
    `${githubDir}/version.yml`,
  );
  return {
    ...output ? { output } : {},
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

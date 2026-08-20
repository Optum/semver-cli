import * as YAML from "yaml";
import { HookError } from "../errors/mod.ts";
import { exists } from "../util/exists.ts";
import {
  HookWarning,
  PostHookKind,
  VersionConfig,
} from "./hooks.interfaces.ts";
import { IContext } from "../context.ts";
import { SemVer } from "semver";

// Post hooks are a set of per-repo configurable actions that can be taken
// after the version is updated.
// For example, the VERSION file is updated but you also need the new version
// to be set into your .csproj file, or directly into a code file as a constant string.
//
// See ../.github/version.yml for an example.
export async function postVersionHook(
  context: IContext,
  previous: SemVer,
  current: SemVer,
): Promise<HookWarning[]> {
  const warnings: HookWarning[] = [];
  const versionConfig = await getVersionConfig(context);
  if (versionConfig) {
    console.log(`Invoking post_version hook...`);
    const postHooks = versionConfig?.on?.post ?? [];
    if (!Array.isArray(postHooks)) {
      throw new HookError(
        "post_hook",
        `on.post is expected to be of type array but (${postHooks}) was found`,
      );
    }

    for (const hook of postHooks) {
      const { kind } = hook;
      try {
        switch (kind) {
          case PostHookKind.Replace:
            await context.hooks.replace(hook.file, previous, current);
            break;
          case PostHookKind.Patch:
            await context.hooks.patch(hook.file, current, hook.format);
            break;
          case PostHookKind.RegExp:
            await context.hooks.regexp(
              hook.file,
              current,
              hook.pattern,
              hook.flags,
              hook.format,
              hook.prefix,
            );
            break;
          default:
            throw new HookError(
              "post_hook",
              `unknown hook kind ${kind}`,
            );
        }
      } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
          const reason = err instanceof Error ? err.message : String(err);
          console.warn(
            `warning: post_version hook (${kind}) skipped, file not found: ${hook.file}`,
          );
          warnings.push({ kind, file: hook.file, reason });
        } else {
          throw err;
        }
      }
    }
  }
  return warnings;
}

async function getVersionConfig(context: IContext) {
  const { c: configShorthand, config, githubDir } = context;
  const configPath = config ?? configShorthand;
  const paths = configPath ? [configPath] : [
    [githubDir, "version.yml"].filter((p) => p).join("/"),
    [githubDir, "version.yaml"].filter((p) => p).join("/"),
  ];

  for (const p of paths) {
    if (await exists(p)) {
      const contents = await Deno.readTextFile(p);
      return YAML.parse(contents) as VersionConfig;
    }
  }
  return undefined;
}

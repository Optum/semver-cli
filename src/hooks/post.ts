import { YAML } from "../../deps/yaml.ts";
import { HookError } from "../errors/mod.ts";
import { exists } from "../util/exists.ts";
import { PostHookKind, VersionConfig } from "./hooks.interfaces.ts";
import { IContext } from "../context.ts";

// Post hooks are a set of per-repo configurable actions that can be taken
// after the version is updated.
// For example, the VERSION file is updated but you also need the new version
// to be set into your .csproj file, or directly into a code file as a constant string.
//
// See ../.github/version.yml for an example.
export async function postVersionHook(
  context: IContext,
  previous: string,
  current: string,
) {
  const { config } = context;
  if (await exists(config)) {
    console.log(`Invoking post_version hook...`);
    const contents = await Deno.readTextFile(config);
    const versionConfig = YAML.parse(contents) as VersionConfig;
    const postHooks = versionConfig?.on?.post ?? [];
    if (!Array.isArray(postHooks)) {
      throw new HookError(
        "post_hook",
        `on.post is expected to be of type array but (${postHooks}) was found`,
        1,
      );
    }

    for (const hook of postHooks) {
      const { kind } = hook;
      switch (kind) {
        case PostHookKind.Replace:
          await context.hooks.replace(hook.file, previous, current);
          break;
        case PostHookKind.Patch:
          await context.hooks.patch(hook.file, current);
          break;
        case PostHookKind.RegExp:
          await context.hooks.regexp(
            hook.file,
            current,
            hook.pattern,
            hook.flags,
          );
          break;
        default:
          throw new HookError(
            "post_hook",
            `unknown hook kind ${kind}`,
            1,
          );
      }
    }
  }
}

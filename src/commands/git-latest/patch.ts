import type { Arguments } from "yargs";
import { increment, IncrementKind } from "../../util/increment.ts";
import { printVersion, getVersionFromGitTags } from "../../util/version.ts";
import { IContext } from "../../context.ts";

export const patch = {
  command: "patch",
  describe: "A patch version increment",
  handler: async (args: Arguments & IContext) => {
    const { prerelease, build } = args;
    const version = await getVersionFromGitTags();
    const { current } = increment({
      version,
      kind: IncrementKind.Patch,
      prerelease,
      build,
    });
    await printVersion(args, current, args.json);
  },
};

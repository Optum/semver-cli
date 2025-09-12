import type { Arguments } from "yargs";
import { increment, IncrementKind } from "../../util/increment.ts";
import { printVersion, readVersionFile } from "../../util/version.ts";
import { IContext } from "../../context.ts";

export const minor = {
  command: "minor",
  describe: "A minor version increment",
  handler: async (args: Arguments & IContext) => {
    const { prerelease, build } = args;
    const version = await readVersionFile();
    const { current } = increment({
      version,
      kind: IncrementKind.Minor,
      prerelease,
      build,
    });
    await printVersion(args, current);
  },
};

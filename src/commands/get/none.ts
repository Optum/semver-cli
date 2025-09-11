import type { Arguments } from "yargs";
import { increment, IncrementKind } from "../../util/increment.ts";
import { printVersion, readVersionFile } from "../../util/version.ts";
import { IContext } from "../../context.ts";

export const none = {
  command: ["none", "$0"],
  describe: "Gets the version",
  handler: async (args: Arguments & IContext) => {
    const { pre, name, value, build } = args;
    const version = await readVersionFile();
    const { current } = increment({
      kind: IncrementKind.None,
      version,
      pre: pre ? name : undefined,
      value,
      build,
    });
    await printVersion(args, current);
  },
};

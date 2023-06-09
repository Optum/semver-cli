import { Arguments } from "../../../deps/yargs.ts";
import { increment, IncrementKind } from "../../util/increment.ts";
import { printVersion, readVersionFile } from "../../util/version.ts";
import { IContext } from "../../context.ts";

export const minor = {
  command: "minor",
  describe: "A minor version increment",
  handler: async (args: Arguments & IContext) => {
    const { pre, name, value, build } = args;
    const version = await readVersionFile();
    const { current } = increment({
      kind: IncrementKind.Minor,
      version,
      pre: pre ? name : undefined,
      value,
      build,
    });
    await printVersion(args, current);
  },
};

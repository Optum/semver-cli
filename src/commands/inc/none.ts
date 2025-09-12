import type { Arguments } from "yargs";
import { increment, IncrementKind } from "../../util/increment.ts";
import {
  printVersion,
  readVersionFile,
  writeVersionFile,
} from "../../util/version.ts";
import { postVersionHook } from "../../hooks/mod.ts";
import { IContext } from "../../context.ts";

export const none = {
  command: ["none", "$0"],
  describe: "A none version increment",
  handler: async (args: Arguments & IContext) => {
    const { prerelease, build } = args;
    const version = await readVersionFile();
    const { previous, current } = increment({
      version,
      kind: IncrementKind.None,
      prerelease,
      build,
    });
    await writeVersionFile(current);
    await postVersionHook(
      args,
      previous,
      current,
    );
    await printVersion(args, current);
  },
};

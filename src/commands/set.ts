import { Arguments, YargsInstance } from "../../deps/yargs.ts";
import { parse } from "../../deps/semver.ts";
import { increment, IncrementKind } from "../util/increment.ts";
import {
  printVersion,
  readVersionFile,
  writeVersionFile,
} from "../util/version.ts";
import { postVersionHook } from "../hooks/mod.ts";
import { InvalidVersionError } from "../errors/invalidVersion.error.ts";
import { IContext } from "../context.ts";

export const set = {
  command: "set <current>",
  describe: "Set the version",
  builder(yargs: YargsInstance) {
    return yargs
      .positional("current", {
        describe: "The version to set to",
      });
  },
  async handler(args: Arguments & IContext) {
    const previous = await readVersionFile();
    const value = args.current || previous || "0.1.0";
    const version = parse(value);
    if (!version) {
      throw new InvalidVersionError(value);
    }
    const { current } = increment({
      kind: IncrementKind.None,
      version: version,
    });
    await writeVersionFile(current);
    await postVersionHook(
      args,
      previous.format({ style: "full" }),
      current.format({ style: "full" }),
    );
    await printVersion(args, current);
  },
};

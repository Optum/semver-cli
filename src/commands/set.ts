import type { Arguments, YargsInstance } from "yargs";
import { parse } from "semver";
import {
  printVersion,
  readCurrentVersion,
  writeCurrentVersion,
} from "../util/version.ts";
import { postVersionHook } from "../hooks/mod.ts";
import { IContext } from "../context.ts";
import { config, json, output } from "./options.ts";

export const set = {
  command: "set <value>",
  describe: "Set the version",
  builder(yargs: YargsInstance) {
    return yargs
      .positional("value", {
        describe: "The version to set to",
      })
      .option("config", config)
      .option("output", output)
      .option("json", json);
  },
  async handler(args: Arguments & IContext) {
    const { value } = args;
    const previous = await readCurrentVersion(args);
    const version = value ? parse(value) : previous ? previous : parse("0.1.0");
    await writeCurrentVersion(args, version);
    const hookWarnings = await postVersionHook(
      args,
      previous,
      version,
    );
    await printVersion(args, version, args.json, hookWarnings);
  },
};

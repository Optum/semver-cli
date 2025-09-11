import { Arguments, YargsInstance } from "../../deps/yargs.ts";
import { compare as semverCompare, parse } from "../../deps/semver.ts";
import { InvalidVersionError } from "../errors/mod.ts";
import { IContext } from "../context.ts";
import { printComparison } from "../util/version.ts";
import { json, output } from "./options.ts";

export const compare = {
  command: "cmp <v1> <v2>",
  describe: "Compare v1 to v2 and return -1/0/1",
  builder(yargs: YargsInstance) {
    return yargs
      .positional("v1", {
        describe: "First version to compare",
        type: "string",
        demandOption: true,
      })
      .positional("v2", {
        describe: "Second version to compare",
        type: "string",
        demandOption: true,
      })
      .option("output", output)
      .option("json", json);
  },
  async handler(args: Arguments & IContext) {
    const { v1, v2, json: jsonOutput } = args;

    // Parse and validate that both versions are valid semver
    const version1 = parse(v1);
    if (!version1) {
      throw new InvalidVersionError(v1);
    }

    const version2 = parse(v2);
    if (!version2) {
      throw new InvalidVersionError(v2);
    }

    // Use parsed versions for comparison
    const result = semverCompare(version1, version2);
    const exitCode = await printComparison(
      args,
      v1,
      v2,
      result,
      "cmp",
      jsonOutput,
    );
    Deno.exit(exitCode);
  },
};

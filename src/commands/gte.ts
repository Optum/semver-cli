import { Arguments, YargsInstance } from "../../deps/yargs.ts";
import { parse, gte } from "../../deps/semver.ts";
import { InvalidVersionError } from "../errors/mod.ts";
import { IContext } from "../context.ts";

export const greaterOrEqual = {
  command: "gte <v1> <v2>",
  describe: "Return 1 if v1 is greater than or equal to v2, 0 otherwise",
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
      });
  },
  async handler(args: Arguments & IContext) {
    const { v1, v2 } = args;
    
    // Validate that both versions are valid semver
    const version1 = parse(v1);
    if (!version1) {
      throw new InvalidVersionError(v1);
    }
    
    const version2 = parse(v2);
    if (!version2) {
      throw new InvalidVersionError(v2);
    }
    
    // Use parsed versions for comparison
    const result = gte(version1, version2) ? 1 : 0;
    console.log(result);
  },
};
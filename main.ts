import { yargs } from "./deps/yargs.ts";
import { version } from "./src/info.ts";
import { 
  get, 
  inc, 
  parse, 
  set, 
  compare, 
  greater, 
  greaterOrEqual, 
  less, 
  lessOrEqual, 
  equal 
} from "./src/commands/mod.ts";
import { getContext } from "./src/context.ts";

const args = Deno.args
  .filter((arg) => arg?.trim())
  .filter((arg) => arg !== "--");

const context = getContext();
await yargs()
  .scriptName("semver")
  .command(get)
  .command(set)
  .command(inc)
  .command(parse)
  .command(compare)
  .command(greater)
  .command(greaterOrEqual)
  .command(less)
  .command(lessOrEqual)
  .command(equal)
  .strictCommands()
  .demandCommand(1)
  .version(version)
  .parse(args, context);

import yargs from "yargs";
import { version } from "./src/info.ts";
import {
  cmp,
  eq,
  get,
  gt,
  gte,
  inc,
  lt,
  lte,
  parse,
  set,
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
  .command(cmp)
  .command(gt)
  .command(gte)
  .command(lt)
  .command(lte)
  .command(eq)
  .strictOptions()
  .strictCommands()
  .demandCommand(1)
  .version(version)
  .parse(args, context);

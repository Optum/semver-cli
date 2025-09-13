import { brightRed } from "@std/fmt/colors";
import yargs, { YargsInstance } from "yargs";
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

try {
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
    .fail((msg: string, _err: unknown, _yargs: YargsInstance) => {
      if (msg) {
        console.error(`${brightRed("error")}: ${msg}`);
      }
    })
    .parse(args, context);
} catch (error) {
  if (error instanceof TypeError) {
    console.error(`${brightRed("error")}: ${error.message}`);
    Deno.exit(1);
  } else {
    console.error(error);
    Deno.exit(1);
  }
}

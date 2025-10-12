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
  sort,
} from "./src/commands/mod.ts";
import { getContext } from "./src/context.ts";
import { ApplicationError } from "./src/errors/application.error.ts";

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
    .command(sort)
    .strictOptions()
    .strictCommands()
    .demandCommand(1)
    .version(version)
    .fail((msg: string, _err: unknown, _yargs: YargsInstance) => {
      if (msg) {
        console.error(`${brightRed("error")}: ${msg}`);
        Deno.exit(1);
      }
    })
    .parse(args, context);
} catch (error) {
  if (error instanceof TypeError) {
    console.error(`${brightRed("error")}: ${error.message}`);
    Deno.exit(1);
  } else if (error instanceof ApplicationError) {
    const { exitCode, code, message, name } = error;
    console.error(`${brightRed("error")}: ${name} ${code} ${message}`);
    Deno.exit(exitCode);
  } else {
    console.error(error);
    Deno.exit(1);
  }
}

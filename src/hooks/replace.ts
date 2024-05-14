import { format, SemVer } from "../../deps/semver.ts";

export async function replace(
  file: string,
  previous: SemVer,
  current: SemVer,
) {
  console.log(`replacing ${previous} -> ${current} in ${file}`);
  const contents = await Deno.readTextFile(file);
  const previousString = format(previous);
  const currentString = format(current);
  const updated = contents.replaceAll(previousString, currentString);
  await Deno.writeTextFile(file, updated);
}

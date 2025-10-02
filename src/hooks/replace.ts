import { format, SemVer } from "semver";

export async function replace(
  file: string,
  previous: SemVer,
  current: SemVer,
) {
  const previousString = format(previous);
  const currentString = format(current);
  console.log(`replacing ${previousString} -> ${currentString} in ${file}`);
  const contents = await Deno.readTextFile(file);
  const updated = contents.replaceAll(previousString, currentString);
  await Deno.writeTextFile(file, updated);
}

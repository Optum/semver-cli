import { SemVer } from "../../deps/semver.ts";
import { FormatKind, semverFormatByKey } from "../util/variant.ts";

export async function regexp(
  file: string,
  current: SemVer,
  pattern: string,
  flags?: string,
  format?: FormatKind,
  prefix?: string,
) {
  const regexp = new RegExp(pattern, flags);
  const contents = await Deno.readTextFile(file);
  const match = contents.match(regexp);
  const applicableVersion = semverFormatByKey(current, prefix, format);
  console.log(
    `replacing [${match?.[0] || ""}] -> ${applicableVersion} in ${file}`,
  );
  const updated = contents.replace(regexp, applicableVersion);
  await Deno.writeTextFile(file, updated);
}

import { variantByKey } from "../util/version.ts";

export async function regexp(
  file: string,
  current: string,
  pattern: string,
  flags?: string,
  variant?: string
) {
  const regexp = new RegExp(pattern, flags);
  const contents = await Deno.readTextFile(file);
  const match = contents.match(regexp);
  const applicableVersion = variantByKey(current, variant || "version_default");
  console.log(`replacing [${match?.[0] || ""}] -> ${applicableVersion} in ${file}`);
  const updated = contents.replace(regexp, applicableVersion);
  await Deno.writeTextFile(file, updated);
}

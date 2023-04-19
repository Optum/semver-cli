export async function regexp(
  file: string,
  current: string,
  pattern: string,
  flags?: string,
) {
  const regexp = new RegExp(pattern, flags);
  const contents = await Deno.readTextFile(file);
  const match = contents.match(regexp);
  const updated = contents.replace(regexp, current);

  console.log(`replacing [${match?.[0] || ""}] -> ${current} in ${file}`);
  await Deno.writeTextFile(file, updated);
}

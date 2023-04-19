export async function replace(
  file: string,
  previous: string,
  current: string,
) {
  console.log(`replacing ${previous} -> ${current} in ${file}`);
  const contents = await Deno.readTextFile(file);
  const updated = contents.replaceAll(previous, current);
  await Deno.writeTextFile(file, updated);
}

export async function exists(file: string) {
  try {
    await Deno.stat(file);
    return true;
  } catch (err) {
    if (err.code === "ENOENT") {
      return false;
    } else {
      throw err;
    }
  }
}

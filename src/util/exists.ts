export async function exists(file: string) {
  try {
    await Deno.stat(file);
    return true;
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return false;
    } else {
      throw err;
    }
  }
}

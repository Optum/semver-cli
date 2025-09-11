import {
  assertEquals,
  describe,
  it,
} from "./deps/std.ts";

describe("main", () => {
  it("MAIN00 - filters empty arguments", () => {
    const args = ["get", "", "  ", "major"];
    const filtered = args
      .filter((arg) => arg?.trim())
      .filter((arg) => arg !== "--");
    assertEquals(filtered, ["get", "major"]);
  });

  it("MAIN01 - filters -- argument", () => {
    const args = ["get", "--", "major"];
    const filtered = args
      .filter((arg) => arg?.trim())
      .filter((arg) => arg !== "--");
    assertEquals(filtered, ["get", "major"]);
  });

  it("MAIN02 - preserves valid arguments", () => {
    const args = ["get", "major", "--json"];
    const filtered = args
      .filter((arg) => arg?.trim())
      .filter((arg) => arg !== "--");
    assertEquals(filtered, ["get", "major", "--json"]);
  });
});
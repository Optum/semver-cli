import { afterEach, beforeEach, Spy } from "../../deps/std.ts";

export function testContext<
  // deno-lint-ignore no-explicit-any
  T extends Spy<any, any[], any>,
  C extends Record<string, () => T>,
>(setup: C): Record<keyof C, T> {
  const context: { [key: string]: T } = {};
  beforeEach(() => {
    for (const [k, v] of Object.entries(setup)) {
      context[k] = v();
    }
  });
  afterEach(() => {
    for (const k of Object.keys(setup)) {
      context[k].restore();
    }
  });
  return context as Record<keyof C, T>;
}

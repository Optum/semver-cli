export * as path from "https://deno.land/std@0.152.0/path/mod.ts";
export * from "https://deno.land/std@0.152.0/testing/asserts.ts";
export {
  assertSpyCall,
  assertSpyCalls,
  resolvesNext,
  returnsNext,
  spy,
  stub,
} from "https://deno.land/std@0.152.0/testing/mock.ts";
export type { Spy, Stub } from "https://deno.land/std@0.152.0/testing/mock.ts";
export {
  afterEach,
  beforeEach,
  describe,
  it,
} from "https://deno.land/std@0.152.0/testing/bdd.ts";

import { FormatKind } from "../util/variant.ts";

export enum PostHookKind {
  Replace = "replace",
  Patch = "patch",
  RegExp = "regexp",
}

export type ReplacePostHook = {
  kind: PostHookKind.Replace;
  file: string;
};
export type PatchPostHook = {
  kind: PostHookKind.Patch;
  file: string;
};
export type RegExpPostHook = {
  kind: PostHookKind.RegExp;
  file: string;
  pattern: string;
  flags?: string;
  format?: FormatKind;
  prefix?: string;
};

export type PostHook =
  & { kind: PostHookKind }
  & (
    | ReplacePostHook
    | PatchPostHook
    | RegExpPostHook
  );

export type VersionConfig = {
  on?: {
    post?: PostHook[];
  };
};

import { xml2js as parse } from "https://deno.land/x/xml2js@1.0.0/mod.ts";
import { js2xml as stringify } from "https://deno.land/x/js2xml@1.0.4/mod.ts";

export interface Node extends Record<string, unknown> {
  elements: Element[];
}

export interface Element extends Node {
  type: "element" | "text";
  name: string;
  attributes: Record<string, string>;
}

export const xml = { parse, stringify };

import { mkdir, writeFile, copyFile } from "node:fs/promises";
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
const schemas = JSON.parse(await readFile("schemas/api-contract.json", "utf8"));
function type(s) {
  if (Array.isArray(s.type)) return s.type.map((t) => type({ ...s, type: t })).join(" | ");
  if ("const" in s) return JSON.stringify(s.const);
  if (s.enum) return s.enum.map((v) => JSON.stringify(v)).join(" | ");
  if (s.anyOf || s.oneOf) return (s.anyOf ?? s.oneOf).map(type).join(" | ");
  if (s.type === "object") return "{ " + Object.entries(s.properties ?? {}).map(([name, value]) => JSON.stringify(name) + ((s.required ?? []).includes(name) ? "" : "?") + ": " + type(value)).join("; ") + " }";
  if (s.type === "array") return "(" + type(s.items) + ")[]";
  return s.type === "integer" ? "number" : s.type ?? "unknown";
}
await mkdir("clients/typescript/dist", { recursive: true });
await writeFile("clients/typescript/src/types.ts", "// Generated from agent/contracts.ts. Do not edit.\n" + Object.entries(schemas).map(([name, s]) => `export type ${name} = ${type(s)};`).join("\n") + "\n");
await copyFile("LICENSE", "clients/typescript/LICENSE");
await build({ entryPoints: ["clients/typescript/src/client.ts", "clients/typescript/src/cli.ts"], outdir: "clients/typescript/dist", bundle: true, platform: "node", format: "esm", target: "node24" });
execFileSync("node", ["node_modules/typescript/bin/tsc", "--ignoreConfig", "--declaration", "--emitDeclarationOnly", "--module", "NodeNext", "--moduleResolution", "NodeNext", "--target", "ES2022", "--skipLibCheck", "--strict", "--outDir", "clients/typescript/dist", "clients/typescript/src/client.ts", "clients/typescript/src/types.ts"], { stdio: "inherit" });
await mkdir("artifacts", { recursive: true });
execFileSync("npm", ["pack", "./clients/typescript", "--pack-destination", "artifacts", "--cache", "/tmp/agam-pack-cache"], { stdio: "inherit" });
console.log("Built local package; no registry publication.");
const definitions = [];
function pyType(s, name) {
  if (Array.isArray(s.type)) return s.type.map((t, i) => pyType({ ...s, type: t }, name + i)).join(" | ");
  if (s.anyOf || s.oneOf) return (s.anyOf ?? s.oneOf).map((v, i) => pyType(v, name + i)).join(" | ");
  if (s.const !== void 0) return "Literal[" + JSON.stringify(s.const) + "]";
  if (s.enum) return "Literal[" + s.enum.map((v) => JSON.stringify(v)).join(", ") + "]";
  if (s.type === "array") return "list[" + pyType(s.items, name + "Item") + "]";
  if (s.type === "object") {
    const fields = Object.entries(s.properties ?? {}).map(([k, v]) => {
      const child = pyType(v, name + k.replace(/(^|_)([a-z])/g, (_a, _b, c) => c.toUpperCase()));
      return JSON.stringify(k) + ": " + ((s.required ?? []).includes(k) ? child : "NotRequired[" + child + "]");
    });
    definitions.push(name + " = TypedDict(" + JSON.stringify(name) + ", {" + fields.join(", ") + "})\n");
    return name;
  }
  return { string: "str", integer: "int", number: "float", boolean: "bool", null: "None" }[s.type] ?? "object";
}
for (const [name, schema] of Object.entries(schemas)) pyType(schema, name);
await writeFile("clients/python/agam_journal/types.py", "# Generated from the shared API contract.\nfrom typing import TypedDict, NotRequired, Literal\n\n" + definitions.join("\n"));
await copyFile("LICENSE", "clients/python/LICENSE");
execFileSync(process.env.READINESS_PYTHON ?? "python3", ["-m", "pip", "wheel", "./clients/python", "--no-deps", "--no-build-isolation", "--wheel-dir", "artifacts"], { stdio: "inherit" });

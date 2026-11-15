// Builds the shadcn registry: node scripts/build-registry.mjs [--out public/r]
// Name, namespace and URL come only from library.config.json; REGISTRY_URL overrides the URL (to build for another address).
// Items: the variables (registry/tokens/tokens.css -> item "tokens") plus one manifest per component in
// registry/items/<name>.json. Every component gets the tokens item as registry dependency automatically, and a
// registryDependencies entry that names one of our own items (["toggle"]) becomes that item's full URL; other names
// stay shadcn names. An optional "meta" (test hints such as meta.testAction) passes through untouched.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rel = (p) => path.join(root, p);
const config = JSON.parse(fs.readFileSync(rel("library.config.json"), "utf8"));
const pkg = JSON.parse(fs.readFileSync(rel("package.json"), "utf8"));
const url = (process.env.REGISTRY_URL || config.url).replace(/\/$/, "");
const outArg = process.argv.indexOf("--out");
const out = path.resolve(outArg > 0 ? process.argv[outArg + 1] : rel("public/r"));

// tokens.css -> cssVars + css. Anything the CLI cannot merge fails loudly instead of being dropped.
const css = postcss.parse(fs.readFileSync(rel("registry/tokens/tokens.css"), "utf8"));
const cssVars = {}, extra = {}, dependencies = [];
const vars = (rule) => Object.fromEntries(rule.nodes.filter((n) => n.type !== "comment").map((n) => {
  if (n.type !== "decl" || !n.prop.startsWith("--")) throw new Error(`tokens.css: only custom properties in ${rule.selector}`);
  return [n.prop.slice(2), n.value];
}));
const obj = (nodes) => {
  const o = {};
  for (const n of nodes) {
    if (n.type === "comment") continue;
    const key = n.type === "decl" ? n.prop : n.type === "rule" ? n.selector : `@${n.name} ${n.params}`.trim();
    if (n.type === "atrule" && n.name === "font-face") throw new Error("tokens.css: @font-face breaks the shadcn CLI, import a font package instead");
    if (n.type === "atrule" && n.name === "property") throw new Error("tokens.css: the shadcn CLI appends @property to globals.css again on every add, register it in the component (React <style href precedence>)");
    if (key in o) throw new Error(`tokens.css: duplicate block ${key}`);
    o[key] = n.type === "decl" ? n.value : obj(n.nodes ?? []);
  }
  return o;
};
for (const n of css.nodes) {
  if (n.type === "rule" && n.selector === ":root") cssVars.light = vars(n);
  else if (n.type === "rule" && n.selector === ".dark") cssVars.dark = vars(n);
  else if (n.type !== "comment") Object.assign(extra, obj([n]));
  if (n.type === "atrule" && n.name === "import") {
    const name = n.params.replace(/["']/g, "").split("/").slice(0, n.params.includes("@") ? 2 : 1).join("/");
    const version = pkg.dependencies?.[name];
    if (!version) throw new Error(`tokens.css imports ${name}, which is not in package.json dependencies`);
    if (!dependencies.some((d) => d.startsWith(`${name}@`))) dependencies.push(`${name}@${version.replace(/^\^|~/, "")}`);
  }
}

const tokens = {
  name: "tokens", type: "registry:theme", title: `${config.displayName} tokens`,
  description: `Colours, radius, shadows, sizes, motion and font of ${config.displayName}.`,
  dependencies, cssVars, css: extra, files: [],
};
const itemsDir = rel("registry/items");
const itemFiles = fs.existsSync(itemsDir) ? fs.readdirSync(itemsDir).filter((f) => f.endsWith(".json")).sort() : [];
const own = new Set(itemFiles.map((f) => path.basename(f, ".json")));
const items = itemFiles.map((f) => {
  const item = JSON.parse(fs.readFileSync(path.join(itemsDir, f), "utf8"));
  if (item.name !== path.basename(f, ".json")) throw new Error(`registry/items/${f}: name must equal the file name`);
  const deps = (item.registryDependencies ?? []).map((d) => (own.has(d) ? `${url}/r/${d}.json` : d));
  return { ...item, registryDependencies: [`${url}/r/tokens.json`, ...deps] };
});

const registry = { $schema: "https://ui.shadcn.com/schema/registry.json", name: config.name, homepage: url, items: [tokens, ...items] };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "plush-registry-"));
try {
  fs.writeFileSync(path.join(tmp, "registry.json"), JSON.stringify(registry, null, 2));
  execFileSync(process.execPath, [process.env.npm_execpath || (() => { throw new Error("Run the build through pnpm"); })(), "exec", "shadcn", "build", path.join(tmp, "registry.json"), "--output", out, "--cwd", root], { stdio: "inherit" });
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(`registry: ${registry.items.length} items -> ${path.relative(process.cwd(), out) || "."} (${url})`);

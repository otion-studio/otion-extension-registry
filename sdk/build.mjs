#!/usr/bin/env node
/** Offline deterministic release preparation. Never executes extension code. */
import { readFile, writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { createHash } from "node:crypto";
import { Script } from "node:vm";
const root = resolve(process.argv[2] || ".");
const manifestPath = resolve(root, "otion.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
if (!/^(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.js$/.test(manifest.entry)) throw new Error("Entry must be a relative JavaScript source file");
const sourcePath = resolve(root, manifest.entry);
if (!sourcePath.startsWith(root + sep)) throw new Error("Entry escapes the package");
const source = await readFile(sourcePath);
if (source.length > 512 * 1024) throw new Error("Source exceeds 512 KB");
new Script(source.toString("utf8"), { filename: manifest.entry });
manifest.build = null;
manifest.runtime = { api_version: 1, sha256: createHash("sha256").update(source).digest("hex") };
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Prepared ${manifest.name}@${manifest.version}: ${manifest.runtime.sha256}`);

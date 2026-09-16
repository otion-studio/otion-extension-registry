#!/usr/bin/env node
import { mkdir, writeFile, copyFile } from "node:fs/promises";
import { dirname, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
const destination = process.argv[2];
if (!destination) throw new Error("Usage: node sdk/create-extension.mjs path/to/my-extension");
const name = basename(resolve(destination));
if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name)) throw new Error("Directory name must be a lowercase extension identifier");
await mkdir(destination); // Deliberately refuses to overwrite an existing directory.
const sdk = dirname(fileURLToPath(import.meta.url));
await mkdir(resolve(destination, "sdk"));
for (const file of ["otion.d.ts", "build.mjs"]) await copyFile(resolve(sdk, file), resolve(destination, "sdk", file));
const source = `/// <reference path="sdk/otion.d.ts" />\notion.register({ widgets: { greeting: (_api, invocation) => ({ view: { type: "stack", children: [{type:"input",name:"name",label:"Your name",value:invocation.event?.values.name || ""},{type:"button",text:"Greet",action:"greet"},{type:"text",text:invocation.event ? "Hello, " + (invocation.event.values.name || "there") + "!" : "Enter a name."}] } }) } });\n`;
const manifest = { name, version: "0.1.0", description: "An isolated Otion extension", author: { name: "Your name", contact: "https://github.com/your-account" }, license: "MIT", repository: `https://github.com/your-account/${name}`, entry: "extension.js", build: null, dependencies: {}, permissions: [], min_host_version: "0.2.0", blocks: [], widgets: [{ id: "greeting", title: "Greeting" }], runtime: { api_version: 1, sha256: createHash("sha256").update(source).digest("hex") } };
await writeFile(resolve(destination, "extension.js"), source);
await writeFile(resolve(destination, "otion.json"), JSON.stringify(manifest, null, 2) + "\n");
await writeFile(resolve(destination, "README.md"), `# ${name}\n\nEdit extension.js, then run \`node sdk/build.mjs\` to validate JavaScript syntax and update its pinned digest. Open Otion Settings → Extensions → Preview local package to test the exact manifest and source without publishing. Publish the readable source repository and submit its commit to the registry.\n`);
console.log(`Created ${resolve(destination)}. See HOST_API.md in the SDK registry for the complete API.`);

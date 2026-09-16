import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(await readFile(resolve(root, "otion.json"), "utf8"));
const source = await readFile(resolve(root, manifest.entry), "utf8");
let extension;
runInNewContext(source, { otion: { register(value) { extension = value; } }, Date });
test("source digest and declared handlers match the distributable manifest", () => {
  assert.equal(createHash("sha256").update(source).digest("hex"), manifest.runtime.sha256);
  for (const [group, field] of [["commands", "id"], ["widgets", "id"], ["blocks", "type"]]) {
    for (const item of manifest[group] || []) assert.equal(typeof extension[group][item[field]], "function");
  }
});
test("page statistics uses the current document and reports task progress", async () => {
  const result = await extension.commands["page-statistics"]({ document: { read: async () => ({ text: "Hello world\n- [x] Done\n- [ ] Next", path: "Page.md", revision: "v1" }) } });
  assert.match(result.view.children[2].text, /1 of 2/);
  assert.match(result.view.children[1].text, /words/);
});
test("focus widget persists increments and resets across isolated invocations", async () => {
  let data = null; const api = { storage: { get: async () => data, set: async (_key, value) => { data = value; } } };
  await extension.widgets["focus-counter"](api, { event: { action: "increment" } });
  const result = await extension.widgets["focus-counter"](api, {});
  assert.match(result.view.children[1].text, /1 completed/);
  await extension.widgets["focus-counter"](api, { event: { action: "reset" } }); assert.equal(data.count, 0);
});
test("decision block returns a portable approved-state patch", () => {
  const result = extension.blocks.decisionCard({}, { values: { decision: "Ship it" }, event: { action: "approve" } });
  assert.equal(result.patch.status, "approved"); assert.match(result.view.children[1].text, /Ship it/);
});
test("author scaffold and offline build are deterministic and never overwrite a directory", async () => {
  const temp = await mkdtemp(resolve(tmpdir(), "otion-sdk-")); const target = resolve(temp, "test-extension");
  try {
    execFileSync(process.execPath, [resolve(root, "sdk/create-extension.mjs"), target]);
    execFileSync(process.execPath, [resolve(root, "sdk/build.mjs"), target]);
    const first = await readFile(resolve(target, "otion.json"), "utf8");
    execFileSync(process.execPath, [resolve(root, "sdk/build.mjs"), target]);
    assert.equal(await readFile(resolve(target, "otion.json"), "utf8"), first);
    assert.throws(() => execFileSync(process.execPath, [resolve(root, "sdk/create-extension.mjs"), target], { stdio: "pipe" }));
    const generated = JSON.parse(first), code = await readFile(resolve(target, generated.entry), "utf8");
    assert.equal(createHash("sha256").update(code).digest("hex"), generated.runtime.sha256);
    let plugin; runInNewContext(code, { otion: { register(value) { plugin = value; } } });
    assert.equal(plugin.widgets.greeting({}, { event: { values: { name: "Sam" } } }).view.children[2].text, "Hello, Sam!");
  } finally { await rm(temp, { recursive: true, force: true }); }
});

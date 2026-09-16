# Extension API 1

Otion 0.2 supports declarative packages and isolated executable packages. A package can contribute custom blocks, commands, sidebar widgets and portable external-agent guides. Existing declarative packages continue to work unchanged.

## Author a package

```sh
node sdk/create-extension.mjs ../my-extension
cd ../my-extension
# Edit extension.js and otion.json.
node sdk/build.mjs
```

The scaffold includes JavaScript types, an interactive widget and the deterministic offline build helper. The helper checks syntax and refreshes the SHA-256 digest; it never runs your code, downloads dependencies or rewrites readable source into an opaque bundle. The host accepts a single readable JavaScript entry and does not execute install commands. Use standard JavaScript; import/eval, DOM, arbitrary CSS and network APIs are unavailable.

To test before publishing, open Settings → Extensions → Preview local package and select `otion.json` and its JavaScript entry together. Review the displayed permissions, approve that exact revision, then run its contributions from the workspace Extensions panel. Update the digest after every source change. Development packages are clearly identified as local and unreviewed. A preview has the same sandbox, quotas and capability checks as a registry package.

Submit the readable repository at a full commit SHA to the registry. The host fetches approval again at install time, downloads the manifest and source from that exact revision, checks the source digest and shows the revision and requested access before executable installation. All source is cached in `.otion/extensions.json` for offline use. Executable trust is device-local and bound to workspace identity, complete manifest and revision. Sharing or editing workspace metadata never automatically grants execution on another device.

## Manifest

Executable packages use `entry: "extension.js"`, `build: null`, and `runtime: { "api_version": 1, "sha256": "<64 lowercase hex characters>" }`. Declare commands and widgets as arrays of `{ id, title, description? }`. Block declarations retain `{ type, title, description, fields }`, with string defaults. IDs must be unique; built-in blocks cannot be overridden. Every executable contribution must have a matching handler:

```js
otion.register({
  commands: {
    "reading-time": async (api) => {
      const page = await api.document.read();
      const minutes = Math.max(1, Math.ceil(page.text.split(/\s+/).length / 200));
      return { message: `${minutes} minutes to read` };
    }
  },
  widgets: { /* id: handler */ },
  blocks: { /* block type: handler */ }
});
```

Each invocation creates a fresh worker and ends it when the result arrives. Top-level state does not persist between actions. Use the optional storage API for state; commands are run explicitly and widgets/blocks have Open, Refresh, Cancel and retry controls.

Handlers receive `(api, invocation)`, where invocation contains `kind`, `id`, optional block `values`, and optional `event: { action, values, value? }` from a UI button. They return `{ view?, message?, patch? }` synchronously or asynchronously.

## Capability API

| Permission | API | Scope |
| --- | --- | --- |
| `document:read` | `await api.document.read()` | Active Markdown page as `{path,text,revision}`; the host flushes pending changes first. |
| `document:write` | `await api.document.write(text, expectedRevision)` | Replace only the active page with compare-and-swap conflict protection; returns its new revision. |
| `storage` | `await api.storage.get(key)` / `.set(key, JSONValue)` | 64 KB total per extension and workspace on this device; absent keys return null. |
| `clipboard:write` | `await api.clipboard.writeText(text)` | Write text through the host clipboard API, when available. |

Every request is checked by the host, even if code bypasses the SDK and forges messages. No network, arbitrary filesystem, clipboard read, child process, native API or ambient host object is exposed. Unsupported permission names are rejected at installation. Permissions are displayed before approving executable source; an update or changed manifest requires review again. Document writes must use a revision obtained from the current page; stale writes fail instead of replacing newer edits.

## Safe interactive views

The host renders JSON view trees as React text and controls, never as HTML:

- `{type:"text"|"heading", text}`
- `{type:"stack"|"row", children:[...]}`
- `{type:"button", text, action, value?}`
- `{type:"input", label, name, value, multiline?}`
- `{type:"progress", label, value, max}`

Button clicks invoke the same handler with all current input values. Custom block handlers may additionally return `patch` containing string values for declared fields; the host applies the patch through the editor. Unknown fields already stored in the marker are preserved. A command or widget cannot patch arbitrary blocks. Colors, fonts, focus behavior and accessibility come from the host. Extensions participate in the editor theme automatically; executable custom CSS is not accepted.

Declarative fields remain directly editable even if executable rendering fails, is cancelled or is not yet trusted. Missing/disabled/uninstalled packages preserve complete original markers and unknown fields. Guides under `skillsandtools/extensions/<name>/` are data for external agents, and updates preserve customized existing guides.

## Isolation and limits

Executable source runs in a Web Worker created inside a hidden sandbox iframe with only `allow-scripts`, no same-origin privilege. Only trusted bridge code executes in the iframe. Its CSP denies connections, frames, images, styles, forms and imported scripts. Blob workers inherit that CSP. A private transferred MessagePort connects host and trusted frame; the initial handshake checks its parent, and no global worker messages can call a native bridge.

Each task has a five-second deadline, at most 20 API calls, at most 512 KB per message and at most four concurrent tasks. Source is limited to 512 KB; views to 150 nodes, depth 8, and 20,000 characters per text field. Recursive workers and persistent worker storage are disabled. Deadline, cancellation, disable, uninstall and workspace switch terminate workers; malformed results fail locally with retry controls. JavaScript engine memory is browser-managed: this is not a hard operating-system memory quota. Registry review and readable source remain necessary.

Browser sandbox references: [iframe sandbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe), [worker CSP inheritance](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#content_security_policy).

## Verify and publish

Run `python3 scripts/validate.py` in the registry and `node --test sdk/sdk.test.mjs`. Host tests exercise pinned installs, upgrades, local previews, digest tampering, workspace trust isolation, real worker execution, capability denial, task cancellation/recovery, protocol budgets and portable custom block updates. Before submitting, test install, execute, save, restart, disable, enable, uninstall and reinstallation. Include a changelog and document every permission. Tag and approve the source commit; never pin a mutable branch.

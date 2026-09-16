# Otion Extension Registry

> Current host support: declarative blocks and portable agent guides, with no runtime permissions or builds. See [HOST_API.md](HOST_API.md). Rules about executable builds below describe a future host capability, not something the current installer runs.

This repository is the source of truth for which extensions are approved for the Otion Marketplace.

When you install an extension in Otion, the app checks this registry to confirm the extension has been reviewed and approved. Anything not listed here will not install through the marketplace.

## What's in this repo

| File | Purpose |
|---|---|
| [`RULES.md`](RULES.md) | The publishing rules. Every extension must follow these to be listed. |
| [`registry.json`](registry.json) | The list of approved extensions and their approved versions. |
| [`schemas/otion.schema.json`](schemas/otion.schema.json) | JSON Schema for `otion.json`, the manifest each extension ships with (RULES.md §2). |
| [`schemas/registry.schema.json`](schemas/registry.schema.json) | JSON Schema for `registry.json` itself. |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | How to submit a new extension or a new version of an existing one. |

## How approval works

1. An author writes an extension in their own public GitHub repository, following [`RULES.md`](RULES.md).
2. The author opens a pull request here that adds (or updates) an entry in `registry.json`.
3. A reviewer pulls the extension at the declared tag, walks through the rules, resolves the tag to a commit SHA, and either merges or rejects.
4. Once merged, the entry is live. Otion clients pick it up on their next registry refresh.

The registry is a plain text file in version control on purpose. Every change is a reviewable diff. Every approval has a reviewer and a commit SHA on the merge. There is no admin panel and no off-record state.

## How clients use it

Otion fetches `registry.json` from `main` over HTTPS. For each extension a user installs, the client:

1. Looks up the entry by `name` in `extensions[]`.
2. Selects `latest_version` and its approval from `versions[]`.
3. Downloads `otion.json` from the exact `commit_sha` URL, never a mutable branch or tag.
4. Validates identity, host compatibility, declarative fields and zero runtime permissions, then saves the package and agent guides. No source build or downloaded code execution occurs.

If the extension is no longer approved, the pinned download fails, or its manifest does not match the approved name/version and supported format, installation fails. The existing installed package remains active.

`registry.json` also contains an `examples[]` array. Clients ignore it — it's documentation so readers can see the shape of a complete entry. Do not put real listings there.

## Reporting a problem with a listed extension

Open an issue in this repository with the extension name and the problem. Security issues should follow the `SECURITY.md` of the extension's own repository; if the author is unreachable, escalate here and a maintainer will yank the version while it's investigated.

## License

The contents of this repository — rules, schemas, and metadata — are MIT licensed. Each listed extension is licensed independently; see its repository.

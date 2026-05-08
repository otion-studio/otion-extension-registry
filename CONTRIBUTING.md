# Contributing to the Otion Extension Registry

This repository decides which extensions are listed in the Otion Marketplace. Adding or updating a listing happens by pull request against [`registry.json`](registry.json).

Before you start, read [`RULES.md`](RULES.md) end to end. The checklist at the bottom is the fastest pre-flight.

## Submitting a new extension

1. Build your extension in its own public GitHub repository. The repo must satisfy [`RULES.md`](RULES.md) §1 (LICENSE, README, CHANGELOG, SECURITY, `otion.json`, `otion-marketplace` topic).
2. Tag a release. The tag must be `v<semver>` and must be signed (RULES.md §7.1).
3. Open a pull request here that appends an entry to `extensions[]` in `registry.json`.

A registry entry looks like this:

```json
{
  "name": "weather-widget",
  "description": "Sidebar widget showing the current local forecast.",
  "repository": "https://github.com/your-name/otion-weather-widget",
  "homepage": "https://your-name.dev/weather-widget",
  "categories": ["widgets"],
  "license": "MIT",
  "latest_version": "1.0.0",
  "min_host_version": "1.0.0",
  "versions": [
    {
      "version": "1.0.0",
      "tag": "v1.0.0",
      "commit_sha": "0000000000000000000000000000000000000000",
      "approved_at": "0000-00-00",
      "reviewer": ""
    }
  ]
}
```

Leave `commit_sha`, `approved_at`, and `reviewer` blank or stubbed in your PR. The reviewer fills those in during merge — do not invent values.

## Submitting a new version of an existing extension

1. Tag the new release in your repository.
2. Open a PR that appends a new object to that extension's `versions[]` array and updates `latest_version`.
3. Update `CHANGELOG.md` in your own repository for the new version. Reviewers compare diffs against the changelog (RULES.md §7.3).

If the new version adds permissions, it must be a major version bump (RULES.md §5.2). Users will be re-prompted to consent.

## Yanking a version

If a published version is found to be unsafe, open a PR that removes it from `versions[]` with an explanation in the PR description. Otion clients refuse to install versions that are no longer in the registry, so yanking is the rollback mechanism.

## Validation

`registry.json` validates against [`schemas/registry.schema.json`](schemas/registry.schema.json). Your `otion.json` validates against [`schemas/otion.schema.json`](schemas/otion.schema.json). Run any standard JSON Schema validator locally before opening a PR — CI rejects malformed entries.

## Reviewer notes

When reviewing a PR:

- Clone the extension at the declared tag.
- Verify the tag's signature.
- Resolve the tag to its commit SHA and put that SHA in the entry — never trust the tag alone, since tags can be force-pushed.
- Walk through the [`RULES.md`](RULES.md) checklist; a single rule violation is a rejection.
- Set `approved_at` to today's date and `reviewer` to your GitHub handle.
- Merge with a commit message that names the extension and the version (e.g. `weather-widget 1.0.0`).

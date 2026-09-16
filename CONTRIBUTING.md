# Contributing extensions

Read [HOST_API.md](HOST_API.md) and [RULES.md](RULES.md), then start from the SDK scaffold or the included package. Declarative and isolated executable packages are supported by the same registry.

1. Publish readable, licensed source with a README, changelog and security contact. Explain every permission and lifecycle behavior.
2. Run the offline SDK preparation helper, test a local package preview in Otion, and verify the manifest's source digest. Execute the extension's tests and registry validation.
3. Commit the tested source and create a `v<semver>` tag. Signed tags are recommended. Record the exact full source SHA; never use a branch name as the approval revision.
4. Open a pull request adding the package to `extensions` in `registry.json`. Include the repository URL, name, description, categories, license, latest version, minimum host version and version/tag/commit metadata. Do not invent a human review approval. The reviewer records the actual review identity and date after examining source and test evidence.
5. For updates, append a version record, update `latest_version`, document changes and any added capabilities, and review the diff from the previous approved source. Users review the exact executable revision and capabilities before installation.

Run `python3 -m pip install -r requirements.txt`, `python3 scripts/validate.py`, and `node --test sdk/sdk.test.mjs`. Source digests must match, contribution IDs must be unique, and placeholder SHAs are rejected.

If a release is unsafe, remove it from the registry with an explanation. New installations recheck live approval and refuse removed releases. Existing installations do not silently delete themselves: publish a clear advisory so users can disable/uninstall and inspect their data. Disabling or uninstalling preserves page content and customized external-agent guides.

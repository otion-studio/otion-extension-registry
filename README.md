# Otion extension registry and SDK

Approved, immutable extension releases for Otion. The host supports portable declarative blocks and isolated executable commands, widgets and custom block views. External-agent guidance is shared as Markdown; no embedded AI agent is involved.

The repository's `otion-note-cards` package includes decision/project brief cards, active-page statistics, a persistent focus-session widget and an executable decision approval action. Older declarative releases remain available in the version history.

- [Host API, authoring workflow and security model](HOST_API.md)
- [Publication rules](RULES.md)
- [Contribution process](CONTRIBUTING.md)
- [Manifest schema](schemas/otion.schema.json)

```sh
node sdk/create-extension.mjs ../my-extension
cd ../my-extension
node sdk/build.mjs
```

Preview unpublished packages in Otion Settings → Extensions by selecting their manifest and JavaScript entry and reviewing the declared capabilities. Publish readable source to GitHub, then submit a registry entry pinned to its reviewed full commit SHA. Registry installation rechecks approval and source digests, and executable grants stay local to the approving device.

Registry checks:

```sh
python3 -m pip install -r requirements.txt
python3 scripts/validate.py
node --test sdk/sdk.test.mjs
```

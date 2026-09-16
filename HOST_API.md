# Declarative extension API 1

Otion's first external extension format is data-only: JSON block definitions and Markdown guides for external agents. The host does not evaluate JavaScript, run install hooks, execute scripts, or grant filesystem/network access. Existing manifest fields remain for compatibility with the publishing format, but this host accepts only `build: null` and `permissions: []`. Packages needing executable entrypoints or additional capabilities are rejected explicitly.

`otion.json` is loaded from the exact approved commit in `registry.json`. Its `name` and `version` must match the approval. The bundled `otion-note-cards` package at this repository root is a complete example. No compilation is needed because the manifest is the source.

A `blocks` entry declares a unique `type` (letters, digits and underscores, starting with a lowercase letter), `title`, `description`, and `fields` mapping field names to string defaults. Built-in types cannot be replaced. The editor renders each field as an editable text area and serializes the original type as an Otion marker. Disabled or missing extensions render a preserved-content fallback and retain their original marker rather than discarding data. Installing/enabling a package updates generic block rendering and slash entries without rebuilding the document schema.

Optional `guides` maps safe `.md` filenames to their content. Installation places these under `skillsandtools/extensions/<name>/` for external agents. These documents are not executed. Uninstall removes the active package record, not page content or customized guides.

The per-workspace package store is `.otion/extensions.json`. Enable/disable/uninstall operate on that workspace. Updates re-fetch approval, verify the manifest, and keep old registration active until the new package has been checked and persisted. Failed fetches leave installed packages usable offline. Repository URLs are restricted to GitHub and source revision IDs must be full commit hashes.

## Author verification

1. Start from `otion.json` in this repository.
2. Run `python3 -m pip install -r requirements.txt` and `python3 scripts/validate.py` in the registry repository.
3. Test install, field edits, save, restart, disable, reopen, enable and uninstall in Otion.
4. Verify the marker and all fields survive every lifecycle transition.
5. Submit a registry entry pinned to the reviewed source commit. Never use a branch or mutable tag as the installation revision.

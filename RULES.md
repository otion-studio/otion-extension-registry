# Otion Marketplace — Publishing Rules

> Current host support: declarative blocks and portable agent guides, with no runtime permissions or builds. See [HOST_API.md](HOST_API.md). Rules about executable builds below describe a future host capability, not something the current installer runs.

These rules apply to every package submitted to the Otion Marketplace. They exist for one reason: **to make your package cheap and reliable to review.**

If your code is clean, declarative, and minimal in what it asks for, it will pass review quickly. If it's obfuscated, opaque, or asks for more than it needs, it will be rejected — even if it's not malicious. We don't have the resources to audit code that fights back.

All rules below are enforced through our review process. Submissions that violate any rule are rejected.

---

## 1. Repository Requirements

| Rule | Why |
|---|---|
| Repository must be **public** on GitHub | Reviewers and users must be able to inspect the code |
| Repository must have the topic `otion-marketplace` | How we discover packages |
| Repository must contain a valid `otion.json` at the root | Source of truth for metadata |
| `LICENSE` file present, must be an OSI-approved license | Legal clarity for users |
| `README.md` present with description, usage, and screenshots if applicable | Users need to know what they're installing |
| `CHANGELOG.md` present and updated for every release | Makes diff review tractable |
| `SECURITY.md` present with a private contact for vulnerability reports | So issues can be reported responsibly |

---

## 2. Manifest Requirements

The manifest file (`otion.json`) is the single source of truth for your package. It must contain:

- `name` — globally unique within the marketplace, lowercase, hyphen-separated
- `version` — strict semver (`MAJOR.MINOR.PATCH`)
- `description` — one-line summary, plain text
- `author` — name and contact
- `license` — SPDX identifier matching the `LICENSE` file
- `repository` — full GitHub URL
- `entry` — relative path to the entry point (after build, if any)
- `build` — build command Otion will run, or `null` if the package needs no build step
- `permissions` — explicit list of every capability the package requires (see §5)
- `dependencies` — full list of runtime dependencies with pinned versions
- `min_host_version` — minimum version of Otion required

Any field outside this schema must be in a namespaced `extra` object. Unknown top-level keys cause rejection.

---

## 3. Code Quality Rules

These are non-negotiable. Each one exists because violations make review unreliable.

### 3.1 No minified or obfuscated code
- Source files must be human-readable.
- No bundled, minified, or transpiled output committed without source.
- Identifier names must be meaningful (no single-letter names except loop counters and conventional `e`, `i`, `j`).
- Long lines and high-entropy identifiers across the codebase trigger rejection.
- Long, high-entropy string literals must be justified in a comment (e.g. cryptographic constants, test fixtures).

### 3.2 Source-only distribution
- Packages are distributed as source code only. No pre-built artifacts may be committed to the repository — no `dist/`, no `build/`, no bundled JavaScript generated from TypeScript, no compiled binaries.
- Otion builds your package from the tagged source on each user's machine.
- This means what you commit is what reviewers see and what users run. There is no "shipped artifact" that could differ from your source.

### 3.3 No dynamic code execution
The following are forbidden:
- `eval()`, `Function()` constructor (JS), `exec`/`compile` of dynamic strings (Python), or equivalents in other languages.
- Loading and executing code fetched at runtime from any URL.
- `import()` of remote URLs or non-declared local paths.
- Reading files and `eval`-ing their contents.

If your package legitimately needs to evaluate user-provided expressions (e.g. a calculator plugin), use a sandboxed expression evaluator from the approved list and declare it in your dependencies.

### 3.4 No install-time code execution
- **npm**: `package.json` must not define `preinstall`, `install`, `postinstall`, or `prepare` scripts. Otion runs your build via the declared build command (see §7.2), not via install hooks.
- **Python**: use `pyproject.toml` with a declarative build backend (`hatchling`, `setuptools` with declarative config, `flit`, `poetry-core`). Arbitrary code in `setup.py` is forbidden.
- **Other ecosystems**: equivalent install-time hooks are forbidden.

This rule exists because install-time scripts are the single largest supply-chain attack vector in the OSS ecosystem.

### 3.5 No telemetry without explicit opt-in
- No network requests on first run.
- Any telemetry must be off by default, declared in the manifest, with a clear opt-in flow visible to the user.
- "Anonymous usage statistics" still counts as telemetry.

### 3.6 No bundled secrets
- No API keys, tokens, credentials, or private keys in the repository.
- Submissions with detected secrets are rejected immediately and the secrets must be rotated before resubmission.

### 3.7 Reasonable size
- Total package size under **10 MB** unless justified.
- Binary blobs over **100 KB** must be justified in `JUSTIFICATIONS.md` with their checksum and origin.

---

## 4. Dependency Rules

### 4.1 Industry-standard dependencies only
A dependency qualifies as "industry-standard" if it meets at least one of:
- Over **100,000 weekly downloads** on its primary registry, OR
- Listed in our pre-approved dependency allowlist, OR
- Maintained by a recognized foundation (Apache, OpenJS, PSF, Eclipse, etc.).

Anything outside these categories must have an entry in `JUSTIFICATIONS.md` explaining:
- What the dependency does
- Why no industry-standard alternative works
- Who maintains it and why they're trustworthy
- Link to the source

### 4.2 Pinned versions only
- Exact versions in your manifest. No ranges (`^`, `~`, `>=`).
- Lockfile (`package-lock.json`, `poetry.lock`, `Cargo.lock`, etc.) committed to the repo.

### 4.3 No fetching dependencies at runtime
- All dependencies declared in the manifest at submission time.
- No `npm install`, `pip install`, or equivalents executed by the package after installation.

### 4.4 No deprecated or known-vulnerable versions
- Dependencies are checked against the relevant advisory database.
- Submissions with known-vulnerable dependencies are rejected.

---

## 5. Permissions & Capabilities

Every capability your package uses must be declared in the manifest under `permissions`. Declarations are shown to users at install time and used during review to verify that the permissions you request match what your code actually does. Mismatches are rejected.

Available permissions are:

- `network:<domain>` — outbound network to a specific domain. `network:*` is allowed but heavily scrutinized.
- `filesystem:read:<path>` — read access to a path or path glob.
- `filesystem:write:<path>` — write access to a path or path glob.
- `clipboard:read` / `clipboard:write`
- `notifications`
- `child_process` — spawning subprocesses. Heavily scrutinized.

### 5.1 Minimal access principle
You must request the *narrowest* permissions that allow your package to function. Examples:

- A markdown formatter requesting `filesystem:read:*` is wrong; it should request access only to the file being formatted.
- A weather widget needs `network:api.weather-provider.com`, not `network:*`.

If a reviewer cannot see why a permission is needed from reading the code, the submission is rejected. Justify non-obvious permissions in `JUSTIFICATIONS.md`.

### 5.2 Permission changes require a major version bump
Any update that adds a permission is a major version bump. Users will be re-prompted to consent.

---

## 6. Forbidden Patterns

These are immediate-rejection patterns.

- `curl ... | sh` or `wget ... | sh` anywhere
- Base64 blobs over 1KB without a comment explaining their purpose
- String concatenation that builds executable code (`'ev' + 'al'`-style obfuscation)
- Reflection used to access otherwise-forbidden APIs
- Network calls to IP addresses (must be domain names, declared in `permissions`)
- Cryptocurrency mining code, regardless of opt-in claims
- Code that disables, intercepts, or modifies Otion's security features
- Code that reads files outside its declared filesystem permissions, including via symlinks

---

## 7. Build & Release Rules

### 7.1 Releases via git tags
- Each release must correspond to a git tag named `v<semver>`.
- The tag must be signed (GPG or Sigstore) by a key associated with the author's GitHub account.
- The marketplace installs from the tagged commit SHA, never from `main` or a branch.

### 7.2 Deterministic builds
- Otion builds your package from source on each user's machine. The build must be deterministic — same source plus same lockfile must produce the same output, regardless of which user runs it.
- The build command must be declared in `otion.json` (`build` field) and documented in `BUILD.md`.
- The build must complete without network access. All dependencies must be resolvable from the committed lockfile; any build step that fetches code or data over the network at build time is rejected.
- Builds must finish in a reasonable time on a typical user machine. Long, heavyweight build chains will be rejected.

### 7.3 Changelog discipline
- Every release tag must have a corresponding `CHANGELOG.md` entry.
- Each entry lists, at minimum: added, changed, removed, fixed, security.
- The changelog is compared against the diff during review. Significant undocumented changes are rejected.

---

## 8. Documentation Rules

These exist so reviewers (and users) can understand the package without running it.

- `README.md`: description, install instructions, basic usage, screenshots/recordings if there's UI.
- `JUSTIFICATIONS.md`: required if you have non-standard dependencies, non-obvious permissions, or binary blobs.
- `BUILD.md`: required if there's a build step.
- `SECURITY.md`: how to report vulnerabilities privately.
- Inline comments on any non-obvious code, especially anything cryptographic, anything touching permissions, and anything loading data from external sources.

---

## 9. Review Process

Every submission goes through review before being listed in the marketplace. Updates go through the same review process, with the diff and changelog examined together — small, well-documented changes pass quickly, large undocumented changes are rejected.

If your submission is rejected, you'll receive a report explaining which rules were violated. Fix the issues and resubmit. Disputes about a rule itself go through a public issue on the marketplace meta-repo.

---

## 10. What This Doesn't Promise

We want to be honest with both authors and users:

- **Passing review is not a guarantee of safety.** It means the package follows the rules and looked clean to our reviewers. Sophisticated attacks can still slip through any review process.
- **You are trusting the package author when you install.** The permissions a package declares tell you what it intends to do, but until you read the source (or trust someone who has), there's no substitute for the author's reputation and your own judgment.

The rules above exist to make review *useful*, not infallible. Clean code requirements, declared permissions, and reviewer attention together protect users better than any single layer would on its own.

---

## 11. Quick Checklist for Authors

Before submitting:

- [ ] Repository is public and tagged with `otion-marketplace`
- [ ] `otion.json` is complete and validates against the schema
- [ ] LICENSE, README, CHANGELOG, SECURITY files all present
- [ ] No minified or obfuscated code anywhere
- [ ] No pre-built artifacts committed (no `dist/`, `build/`, or bundled output)
- [ ] No `eval`, no dynamic code loading, no install scripts
- [ ] All dependencies pinned, lockfile committed, all justified if non-standard
- [ ] Permissions declared and minimal
- [ ] Release tagged with signed git tag, build command declared, build is deterministic and offline
- [ ] No secrets in the repo

If everything on this list is true, your submission will most likely pass review on the first try.
# Extension publication rules

These rules apply to the executable and declarative API 1 host described in [HOST_API.md](HOST_API.md).

1. Publish complete, readable source with a license, README, changelog and security contact. Explain every command, widget, block and requested permission. Do not include secrets, hidden telemetry, obfuscated source, downloaded runtime dependencies or install scripts.
2. Validate `otion.json` against `schemas/otion.schema.json`. Use globally unique package names, unique contribution IDs, and block types that do not replace built-ins. Keep document data portable; missing packages must not require code to recover text.
3. Executable packages contain one readable JavaScript source entry, `build: null`, API version 1 and its exact SHA-256 digest. The SDK build helper only checks syntax and updates the digest. Submit every executable source file to review; the host never builds, runs package managers, imports modules or resolves dependencies.
4. Request only supported minimal permissions: `document:read`, `document:write`, `storage`, `clipboard:write`. No network, native, arbitrary filesystem or process access is available. Do not attempt to bypass the sandbox, forge host capabilities or access data outside the documented contract.
5. Return validated JSON view trees. Do not use HTML, DOM APIs, arbitrary CSS, dynamic evaluation or browser-owned persistent storage. Respect per-task deadlines, API quotas, message limits and storage bounds. Do not spawn workers or attempt background computation.
6. Use optimistic document revisions for writes and preserve unrecognized document data. Custom blocks may update only their declared fields. Do not silently overwrite user guides or delete content during disable/uninstall.
7. Test all lifecycle transitions and error paths. Include reproducible tests for claimed functionality and permission use. Run the SDK checks and registry validation before submission.
8. Every registry release is tied to a full immutable Git commit, a version and review record. Review updates and permission changes just as new installations. Approval is not a guarantee of safety; executable trust remains explicit on each device. Do not describe declarations alone as a security sandbox.

The host enforces isolation, capability checks and budgets, but browser memory is not capped by an operating-system quota. Authors and reviewers must reject abusive resource allocation as well as malicious code.

# Security reporting

Report suspected sandbox bypasses or malicious registry packages through [GitHub's private vulnerability reporting](https://github.com/otion-studio/otion-extension-registry/security/advisories/new) when available. If private reporting is unavailable, open an issue requesting a private contact without including exploit details or user data.

Include the package/version/source commit, host version, operating system and minimal reproduction. Permission declarations alone are not trusted: the host checks capabilities, source digests and task budgets and isolates code in an opaque-origin worker sandbox. See HOST_API.md for the actual limits. Registry review does not guarantee safety.

# Agam integrations repository

This public repository contains only read clients, one site-usage skill, and a portable plugin for the keyless Agam journal. The private application and household source records are not included.

Read README.md before changing a client or install workflow. Treat the published OpenAPI and packaged schemas as the contract. Keep site/list/search/read operation IDs, exact money, source precision, unknown values and public-only permissions consistent across clients. Never add mutation, arbitrary URL fetch, filesystem or command execution to the MCP configuration.

Run npm ci and npm test for the typed client, plugin/schema validation and synthetic fixture tests. Run python3 -m unittest discover -s tests -p 'test_*.py' for Python fixtures. npm run build packages clients; no registry publication occurs during tests or builds. Use synthetic content only in fixtures. Edit source files, regenerate contract types with npm run build, and review generated diffs. Do not embed household records, addresses, worker identities, tokens, telemetry, or private source paths in examples or logs.

The skill tells agents when to search the live public journal, read a returned ID, and cite its provenance. AGENTS.md guides coding; it is separate from the site's public /agents.md. Plugin changes must validate against the pinned Agent Plugins 1.0.0 schemas and preserve the remote keyless endpoint. Publishing and signing credentials belong in protected CI/owner storage, never source or CLI arguments.

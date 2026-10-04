# Agam integrations

Official public clients, one retrieval skill and a portable Agent Plugins 1.0.0 plugin for [Agam](https://home.ashwingopalsamy.in), a personal construction journal. The application repository and household evidence are private. This export contains schemas and synthetic fixtures only.

## First public read

```sh
curl -H 'Accept: application/json' https://home.ashwingopalsamy.in/api/v1/site
```

All four GET interfaces are free and keyless: `/api/v1/site`, `/api/v1/content`, `/api/v1/content/{id}` and `/api/v1/search?q=roof`. Read the [developer guide](https://home.ashwingopalsamy.in/developers/), [auth walkthrough](https://home.ashwingopalsamy.in/auth.md), [OpenAPI](https://home.ashwingopalsamy.in/openapi.json), [limits and version policy](https://home.ashwingopalsamy.in/versions.md), and [agent guide](https://home.ashwingopalsamy.in/agents.md). No writes, checkout, user registration or private records are available.

## Local clients and CLI

Node 24+, Python 3.11+ and pip are required. Use a virtual environment for Python builds.

```sh
python3 -m venv .venv
.venv/bin/python -m pip install setuptools==80.9.0 wheel==0.45.1
npm ci
READINESS_PYTHON=.venv/bin/python npm test
npm install ./artifacts/agam-journal-client-1.0.0.tgz
.venv/bin/python -m pip install ./artifacts/agam_journal-1.0.0-py3-none-any.whl
npx agam-journal search roof
.venv/bin/agam-journal-py read journal-summary
```

`npm run build` generates typed clients from the public contract and packages both clients without publishing. Tests use synthetic loopback fixtures. Registry publication is separate: the build is not an npm/PyPI listing. Downloadable release artifacts support clean installation while package-owner authentication is pending.

Both clients implement site/list/search/read, JSON errors, 15-second timeouts and at most two read-only retries. Retry-After above five seconds stops automatic retries; no endless retry loop. Follow next_cursor with identical filters/limit; a cursor expires after an hour and changing the snapshot requires restarting. Money is exact integer paise plus decimal INR; missing dates and attendance remain unknown.

## MCP and plugin

Connect an MCP client supporting protocol **2026-07-28** and Streamable HTTP to `https://home.ashwingopalsamy.in/mcp`. Initialize before listing/calling tools. Use `search_content` and then `get_content`, cite canonical sources and retain uncertainty. The service uses SDK 2.0.0 and needs no credential. `mcp.json` is the portable remote-server configuration; `plugin.json` and the `skills/` directory implement Agent Plugins 1.0.0. A platform must support that manifest format; no universal client compatibility is claimed.

Install the focused skill with a supported skills CLI:

```sh
npx skills add ashwingopalsamy/agam-integrations --skill agam-journal
```

The [published skill discovery index](https://home.ashwingopalsamy.in/.well-known/agent-skills/index.json) lists its exact SHA-256. No manufactured installs or endorsements are reported.

## Publisher integrity

`verification/trust.ts` is the published validator for Agam publisher-integrity profile 1.0.0. It verifies `did:web:home.ashwingopalsamy.in`, detached ES256 JWS over RFC 8785 canonical entries, and exact artifact SHA-256 digests. Fetch a fresh DID document and catalog for each verification, as key rotation revokes the previous identifier. These signatures prove publisher control and artifact integrity, not factual accuracy, independent review or browser-bot authentication. See [trust and rotation](https://home.ashwingopalsamy.in/trust.md).

## Licensing and privacy

MIT applies to client/plugin source. Public journal content is governed by the site's own permitted-use guidance. Do not copy private application files, construction records, worker identities, addresses, analytics code, tokens or private keys into this repository. The export allowlist is recorded in `export-manifest.json`. Synthetic fixtures do not describe the real household.

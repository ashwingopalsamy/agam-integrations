# Agam TypeScript read client

Install `artifacts/agam-journal-client-1.0.0.tgz` using `npm install /absolute/path/to/artifact.tgz` in a clean Node 24 project. Run `agam-journal --help`, `agam-journal site`, `agam-journal search roof` or `agam-journal read journal-summary`. Output is JSON; exit codes are 0 success, 1 request failure, 2 invalid usage. Use `--base-url http://127.0.0.1:8787` for local fixtures or `AGAM_JOURNAL_BASE_URL`.

Import `JournalClient` from `agam-journal-client`. The `site`, `list`, `search` and `get` methods use generated contract types. Follow `next_cursor` with unchanged filters and limit. Public reads need no credentials. Typed errors expose HTTP status and problem details. GET retries are bounded to two; waits longer than five seconds are returned for caller scheduling. Each attempt times out after 15 seconds.

Official documentation: https://home.ashwingopalsamy.in/developers/ . Source: https://github.com/ashwingopalsamy/agam-integrations . Artifact installation does not imply npm publication; check release evidence in the source repository.

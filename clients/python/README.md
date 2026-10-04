# Agam Python read client

Install the built wheel with `python -m pip install artifacts/agam_journal-1.0.0-py3-none-any.whl`. Run `agam-journal-py --help`, `agam-journal-py site`, `agam-journal-py search roof` or `agam-journal-py read journal-summary`. All output is JSON. Exit codes are 0 success, 1 request failure and 2 invalid usage. Use `--base-url http://127.0.0.1:8787` for local fixtures, or set `AGAM_JOURNAL_BASE_URL`.

Import `JournalClient` from `agam_journal`; call `site`, `list`, `search` and `get`. Types derive from the published API's shared contract and ship with `py.typed`. Public reads require no key, token or cookie. Do not place credentials in URLs. Retries apply only to GET throttling, stop after two retries, and defer waits longer than five seconds to the caller. Each attempt has a 15-second timeout. Follow `next_cursor` with unchanged filters. Source precision and unknown values retain their API meanings.

Official documentation: https://home.ashwingopalsamy.in/developers/ . Source: https://github.com/ashwingopalsamy/agam-integrations . Wheel installation is distinct from PyPI publication; consult the repository release evidence for actual publication status.

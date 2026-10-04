"""Agam's keyless, read-only API. No cookies, tokens, or mutable operations."""
import json
import random
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from .types import Content, ContentPage, Site, Problem
__version__ = '1.0.0'
class JournalError(Exception):
    def __init__(self, status: int, problem: Problem | None):
        self.status, self.problem = status, problem
        super().__init__((problem or {}).get('detail', f'Journal request failed (HTTP {status}).'))
class JournalClient:
    def __init__(self, base_url: str = 'https://home.ashwingopalsamy.in'):
        parsed = urllib.parse.urlsplit(base_url)
        local = parsed.scheme == 'http' and parsed.hostname in ('localhost', '127.0.0.1', '::1')
        if (parsed.scheme != 'https' and not local) or parsed.username or parsed.password or parsed.query or parsed.fragment or parsed.path not in ('', '/'):
            raise ValueError('Use an HTTPS origin or localhost HTTP. Credentials and query parameters are not accepted.')
        self.base_url = base_url.rstrip('/')
    def _read(self, path: str, **params):
        url = self.base_url + path
        if params: url += '?' + urllib.parse.urlencode({k:v for k,v in params.items() if v is not None})
        for attempt in range(3):
            request = urllib.request.Request(url, headers={'Accept':'application/json', 'User-Agent':'agam-journal-python/1.0.0'})
            try:
                with urllib.request.urlopen(request, timeout=15) as response:
                    if not response.headers.get('Content-Type','').startswith('application/json'):
                        raise ValueError('Expected JSON from journal endpoint.')
                    return json.load(response)
            except urllib.error.HTTPError as error:
                try: problem = json.loads(error.read())
                except (ValueError, UnicodeError): problem = None
                if error.code == 429 and attempt < 2:
                    try: delay = float(error.headers.get('Retry-After','1'))
                    except ValueError: delay = 60
                    if 0 <= delay <= 5:
                        time.sleep(delay + random.uniform(0, .2)); continue
                raise JournalError(error.code, problem) from None
        raise RuntimeError('Read retry limit exceeded.')
    def site(self) -> Site: return self._read('/api/v1/site')
    def list(self, *, kind: str | None = None, limit: int = 20, cursor: str | None = None) -> ContentPage:
        return self._read('/api/v1/content', kind=kind, limit=limit, cursor=cursor)
    def search(self, q: str, *, kind: str | None = None, limit: int = 20, cursor: str | None = None) -> ContentPage:
        return self._read('/api/v1/search', q=q, kind=kind, limit=limit, cursor=cursor)
    def get(self, id: str) -> Content:
        if not re.fullmatch('[a-z0-9][a-z0-9-]{0,119}', id): raise ValueError('Invalid public record ID.')
        return self._read('/api/v1/content/' + id)

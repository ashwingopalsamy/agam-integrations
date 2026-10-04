import argparse
import json
import os
import sys
from . import JournalClient, JournalError, __version__
def main():
    parser = argparse.ArgumentParser(description='Agam keyless public reads; outputs JSON.')
    parser.add_argument('--version', action='version', version=__version__)
    parser.add_argument('--base-url', default=os.environ.get('AGAM_JOURNAL_BASE_URL','https://home.ashwingopalsamy.in'))
    commands = parser.add_subparsers(dest='command', required=True)
    commands.add_parser('site')
    commands.add_parser('list').add_argument('--limit', type=int, default=20)
    commands.add_parser('search').add_argument('query')
    commands.add_parser('read').add_argument('id')
    args = parser.parse_args()
    try:
        client = JournalClient(args.base_url)
        result = client.site() if args.command == 'site' else client.list(limit=args.limit) if args.command == 'list' else client.search(args.query) if args.command == 'search' else client.get(args.id)
        print(json.dumps(result, ensure_ascii=False)); return 0
    except Exception as error:
        detail = {'message':str(error)}
        if isinstance(error, JournalError): detail.update(status=error.status, code=(error.problem or {}).get('code'))
        print(json.dumps(detail), file=sys.stderr); return 1
if __name__ == '__main__': sys.exit(main())

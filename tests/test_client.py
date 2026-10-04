import unittest, sys, json, threading
from pathlib import Path
from http.server import BaseHTTPRequestHandler, HTTPServer
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'clients/python'))
from agam_journal import JournalClient, JournalError
class Handler(BaseHTTPRequestHandler):
 def do_GET(self):
  good=self.path in ['/api/v1/site','/api/v1/content','/api/v1/content/fixture-record'] or self.path.startswith('/api/v1/search?') or self.path.startswith('/api/v1/content?')
  value={'name':'Agam'} if self.path=='/api/v1/site' else {'id':'fixture-record','visibility':'public'} if self.path=='/api/v1/content/fixture-record' else {'items':[], 'next_cursor':None} if good else {'status':404,'detail':'Synthetic missing record','code':'not_found'}
  self.send_response(200 if good else 404);self.send_header('Content-Type','application/json' if good else 'application/problem+json');self.end_headers();self.wfile.write(json.dumps(value).encode())
 def log_message(self,*args): pass
class Reads(unittest.TestCase):
 def test_reads(self):
  with HTTPServer(('127.0.0.1',0),Handler) as server:
   thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start();c=JournalClient('http://127.0.0.1:'+str(server.server_port))
   try:
    self.assertEqual(c.site()['name'],'Agam');self.assertEqual(c.list()['items'],[]);self.assertEqual(c.search('roof')['items'],[]);self.assertEqual(c.get('fixture-record')['id'],'fixture-record')
    with self.assertRaises(JournalError) as caught:c.get('unknown')
    self.assertEqual(caught.exception.status,404)
   finally:server.shutdown();thread.join()

#!/usr/bin/env python3
import http.server
import socketserver
import threading
import time
import urllib.request
import json
import os
import sys

PORT = 8001
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'site'))

class ServerThread(threading.Thread):
    def run(self):
        os.chdir(ROOT)
        handler = http.server.SimpleHTTPRequestHandler
        with socketserver.TCPServer(('', PORT), handler) as httpd:
            self.httpd = httpd
            httpd.serve_forever()

def test_manifest_and_index():
    server = ServerThread()
    server.daemon = True
    server.start()
    time.sleep(0.3)

    try:
        resp = urllib.request.urlopen(f'http://127.0.0.1:{PORT}/')
        assert resp.status == 200

        j = urllib.request.urlopen(f'http://127.0.0.1:{PORT}/data/sections.json')
        assert j.status == 200
        data = json.loads(j.read().decode())
        # Ensure known categories exist
        assert 'dnc' in data
        assert 'frack-county' in data
        # At least one image in DNC or frack-county
        assert len(data.get('dnc', [])) + len(data.get('frack-county', [])) > 0
        # Ensure each category has exactly one hero marker (or at least one)
        for cat in ['dnc', 'frack-county']:
            items = data.get(cat, [])
            if items:
                assert any(it.get('hero') for it in items), f"No hero found in {cat}"
    finally:
        if hasattr(server, 'httpd'):
            server.httpd.shutdown()

if __name__ == '__main__':
    try:
        test_manifest_and_index()
        print('OK')
    except AssertionError:
        print('Tests failed', file=sys.stderr)
        sys.exit(1)

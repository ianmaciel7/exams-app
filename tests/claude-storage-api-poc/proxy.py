#!/usr/bin/env python3
"""Opt-in, local proof of concept for the private, unsupported Claude Artifact DB API.

No public interface and no credentials in browser responses. Not a production sync service.
"""

import http.server
import json
import re
import sys
import urllib.parse

# Import exclusively from the explicitly installed environment, not random uv cache archives.
from claude_artifact_cli import api, auth

HOST = "127.0.0.1"
PORT = 8766
DEFAULT_SLUG = "34cd390a-738f-4dfc-8ae2-6c4f90794d74"
ALLOWED_ORIGINS = ["http://localhost:8765", "http://127.0.0.1:8765"]
ALLOWED_COLLECTION = "bridge-poc"
ALLOWED_HOST = f"{HOST}:{PORT}"
DOC_ID = re.compile(r"[A-Za-z0-9_-]{1,96}\Z")

# Inicializa cliente Anthropic autenticado
try:
    token = auth.get_token()
    client = api.FrameClient(token)
except Exception:
    print("[Proxy Init Error] Install/authenticate claude-artifact-cli and retry.", file=sys.stderr)
    sys.exit(1)


class SecureStorageProxyHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        # Paths and upstream diagnostics may contain credentials or private document IDs.
        sys.stderr.write(f"[Artifact POC Proxy] {self.command} request processed\n")

    def send_cors_headers(self):
        origin = self.headers.get("Origin", "")
        self.send_header("Vary", "Origin")
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")

    def do_OPTIONS(self):
        if not self.authorized():
            return
        slug, collection, _ = self.parse_path()
        if not slug or not self.validate_scope(slug, collection):
            return self.send_json(403, {"error": "DISALLOWED_SCOPE"})
        self.send_response(204)
        self.send_cors_headers()
        self.end_headers()

    def send_json(self, status_code, data):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_cors_headers()
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def authorized(self):
        # CORS is not authentication: enforce trusted Origin AND loopback Host on every method.
        if self.headers.get("Host") != ALLOWED_HOST or self.headers.get("Origin") not in ALLOWED_ORIGINS:
            self.send_json(403, {"error": "REQUEST_ORIGIN_FORBIDDEN"})
            return False
        return True

    def parse_path(self):
        parsed = urllib.parse.urlsplit(self.path)
        if parsed.query or parsed.fragment:
            return None, None, None
        parts = [urllib.parse.unquote(p) for p in parsed.path.split("/") if p]
        if len(parts) not in (4, 5) or parts[:2] != ["api", "storage"]:
            return None, None, None
        slug, collection = parts[2:4]
        doc = parts[4] if len(parts) == 5 else None
        if doc is not None and not DOC_ID.fullmatch(doc):
            return None, None, None
        if any("/" in segment or "\\" in segment or ".." in segment for segment in (slug, collection)):
            return None, None, None
        return slug, collection, doc

    def validate_scope(self, slug, collection):
        return slug == DEFAULT_SLUG and collection == ALLOWED_COLLECTION

    def upstream(self, verb, arguments):
        try:
            return self.send_json(200, client.db(DEFAULT_SLUG, verb, arguments))
        except Exception:
            # Never relay exception strings that could contain OAuth details or paths.
            return self.send_json(502, {"error": "UPSTREAM_UNAVAILABLE"})

    def do_GET(self):
        if not self.authorized():
            return
        slug, collection, doc = self.parse_path()
        if not slug or not collection:
            return self.send_json(400, {"error": "INVALID_ROUTE", "message": "Rota invalida"})

        if not self.validate_scope(slug, collection):
            return self.send_json(403, {"error": "DISALLOWED_SCOPE", "message": f"Colecao restrita: {collection}"})

        if doc:
            return self.upstream("get", {"path": f"{collection}/{doc}"})
        return self.upstream("list", {"collection": collection})

    def do_POST(self):
        if not self.authorized():
            return
        slug, collection, doc = self.parse_path()
        if not slug or not collection or not doc:
            return self.send_json(400, {"error": "INVALID_ROUTE", "message": "Rota requer :slug/:collection/:doc"})

        if not self.validate_scope(slug, collection):
            return self.send_json(403, {"error": "DISALLOWED_SCOPE", "message": f"Colecao restrita: {collection}"})

        if self.headers.get("Content-Type", "").split(";", 1)[0].strip().lower() != "application/json":
            return self.send_json(415, {"error": "JSON_CONTENT_TYPE_REQUIRED"})
        if self.headers.get("Transfer-Encoding"):
            return self.send_json(400, {"error": "UNSUPPORTED_ENCODING"})
        try:
            content_length = int(self.headers.get("Content-Length", ""))
        except ValueError:
            return self.send_json(411, {"error": "CONTENT_LENGTH_REQUIRED"})
        if content_length < 1 or content_length > 1024 * 1024:
            return self.send_json(413, {"error": "INVALID_BODY_SIZE"})
        try:
            body = json.loads(self.rfile.read(content_length))
        except (ValueError, UnicodeError):
            return self.send_json(400, {"error": "INVALID_JSON"})
        if not isinstance(body, dict):
            return self.send_json(400, {"error": "JSON_OBJECT_REQUIRED"})
        return self.upstream("set", {"path": f"{collection}/{doc}", "data": body})

    def do_DELETE(self):
        if not self.authorized():
            return
        slug, collection, doc = self.parse_path()
        if not slug or not collection or not doc:
            return self.send_json(400, {"error": "INVALID_ROUTE", "message": "Rota requer :slug/:collection/:doc"})

        if not self.validate_scope(slug, collection):
            return self.send_json(403, {"error": "DISALLOWED_SCOPE", "message": f"Colecao restrita: {collection}"})

        return self.upstream("delete", {"path": f"{collection}/{doc}"})


def main():
    server_address = (HOST, PORT)
    with http.server.ThreadingHTTPServer(server_address, SecureStorageProxyHandler) as httpd:
        print(f"[Proxy] Servidor iniciado estritamente em http://{HOST}:{PORT}")
        httpd.serve_forever()


if __name__ == "__main__":
    main()

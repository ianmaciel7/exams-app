#!/usr/bin/env python3
"""Proxy Local Seguro para Claude Pro Frame Database.

Escuta ESTRITAMENTE em 127.0.0.1.
Permite exclusivamente operacoes sobre documentos e colecoes com prefixo 'bridge-poc'.
Nunca expoe tokens de autenticacao para o cliente nem nos logs.
"""

import http.server
import json
import os
import re
import socketserver
import sys
import urllib.parse
from pathlib import Path

# Adiciona o pacote claude_artifact_cli caso disponivel no cache uv
uv_cache = Path(os.environ.get("LOCALAPPDATA", "")) / "uv" / "cache" / "archive-v0"
for p in uv_cache.glob("*/Lib/site-packages"):
    if (p / "claude_artifact_cli").is_dir():
        sys.path.insert(0, str(p))
        break

from claude_artifact_cli import api, auth

HOST = "127.0.0.1"
PORT = 8766
DEFAULT_SLUG = "34cd390a-738f-4dfc-8ae2-6c4f90794d74"
ALLOWED_ORIGINS = ["http://localhost:8765", "http://127.0.0.1:8765"]
ALLOWED_COLLECTION_PREFIX = "bridge-poc"

# Inicializa cliente Anthropic autenticado
try:
    token = auth.get_token()
    client = api.FrameClient(token)
except Exception as e:
    print(f"[Proxy Init Error] Nao foi possivel carregar credenciais: {e}", file=sys.stderr)
    sys.exit(1)


class SecureStorageProxyHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Sanitizacao de logs: nunca exibe tokens ou payloads sensiveis
        clean_args = [re.sub(r'Bearer\s+[A-Za-z0-9_\-\.]+', 'Bearer [REDACTED]', str(a)) for a in args]
        sys.stderr.write(f"[Proxy 127.0.0.1:{PORT}] {format % tuple(clean_args)}\n")

    def send_cors_headers(self):
        origin = self.headers.get("Origin", "")
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
        else:
            self.send_header("Access-Control-Allow-Origin", ALLOWED_ORIGINS[0])
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Type", "application/json; charset=utf-8")

    def do_OPTIONS(self):
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

    def parse_path(self):
        # Rotas esperadas:
        # /api/storage/:slug/:collection/:doc
        # /api/storage/:slug/:collection
        parsed = urllib.parse.urlparse(self.path)
        parts = [p for p in parsed.path.split("/") if p]
        if len(parts) >= 3 and parts[0] == "api" and parts[1] == "storage":
            slug = parts[2]
            collection = parts[3] if len(parts) > 3 else ""
            doc = parts[4] if len(parts) > 4 else None
            return slug, collection, doc
        return None, None, None

    def validate_scope(self, collection):
        if not collection or not collection.startswith(ALLOWED_COLLECTION_PREFIX):
            return False
        return True

    def do_GET(self):
        slug, collection, doc = self.parse_path()
        if not slug or not collection:
            return self.send_json(400, {"error": "INVALID_ROUTE", "message": "Rota invalida"})

        if not self.validate_scope(collection):
            return self.send_json(403, {"error": "DISALLOWED_SCOPE", "message": f"Colecao restrita: {collection}"})

        try:
            if doc:
                # Obter um documento
                res = client.db(slug, "get", {"path": f"{collection}/{doc}"})
                return self.send_json(200, res)
            else:
                # Listar documentos na colecao
                res = client.db(slug, "list", {"collection": collection})
                return self.send_json(200, res)
        except Exception as e:
            return self.send_json(500, {"error": "ANTHROPIC_API_ERROR", "message": str(e)})

    def do_POST(self):
        slug, collection, doc = self.parse_path()
        if not slug or not collection or not doc:
            return self.send_json(400, {"error": "INVALID_ROUTE", "message": "Rota requer :slug/:collection/:doc"})

        if not self.validate_scope(collection):
            return self.send_json(403, {"error": "DISALLOWED_SCOPE", "message": f"Colecao restrita: {collection}"})

        content_length = int(self.headers.get("Content-Length", 0))
        if content_length > 1024 * 1024: # Cap de 1 MB
            return self.send_json(413, {"error": "PAYLOAD_TOO_LARGE"})

        raw_body = self.rfile.read(content_length)
        try:
            body = json.loads(raw_body)
        except Exception:
            return self.send_json(400, {"error": "INVALID_JSON"})

        try:
            res = client.db(slug, "set", {"path": f"{collection}/{doc}", "data": body})
            return self.send_json(200, res)
        except Exception as e:
            return self.send_json(500, {"error": "ANTHROPIC_API_ERROR", "message": str(e)})

    def do_DELETE(self):
        slug, collection, doc = self.parse_path()
        if not slug or not collection or not doc:
            return self.send_json(400, {"error": "INVALID_ROUTE", "message": "Rota requer :slug/:collection/:doc"})

        if not self.validate_scope(collection):
            return self.send_json(403, {"error": "DISALLOWED_SCOPE", "message": f"Colecao restrita: {collection}"})

        try:
            res = client.db(slug, "delete", {"path": f"{collection}/{doc}"})
            return self.send_json(200, res)
        except Exception as e:
            return self.send_json(500, {"error": "ANTHROPIC_API_ERROR", "message": str(e)})


def main():
    server_address = (HOST, PORT)
    with socketserver.TCPServer(server_address, SecureStorageProxyHandler) as httpd:
        print(f"[Proxy] Servidor iniciado estritamente em http://{HOST}:{PORT}")
        httpd.serve_forever()


if __name__ == "__main__":
    main()

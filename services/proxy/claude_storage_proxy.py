#!/usr/bin/env python3
"""Proxy Local Seguro e Blindado para Claude Pro Frame Database.

Escuta ESTRITAMENTE em 127.0.0.1:8766.
Implementa:
- Protecao contra DNS Rebinding (validacao estrita do header Host).
- CORS estrito com rejeicao imediata de origens nao autorizadas (HTTP 403).
- Validacao estrita por Regex de slugs, colecoes e IDs de documento contra Path Traversal / Injection.
- Allowlist de colecoes autorizadas para o Exam App.
- Limite maximo de payload (512 KB) e rejeicao de requisicoes sem Content-Length.
- Renovacao e recarregamento automatico de credenciais OAuth se o token expirar.
- Sanitizacao total de logs e respostas de erro (zero vazamento de tokens ou dados de sessao).
- Endpoint de diagnostico e integridade /api/health.
"""

import http.server
import json
import os
import re
import socketserver
import sys
import time
import urllib.parse
from pathlib import Path

# Localizacao dinamica do pacote claude_artifact_cli no cache do uv
uv_cache = Path(os.environ.get("LOCALAPPDATA", "")) / "uv" / "cache" / "archive-v0"
for p in uv_cache.glob("*/Lib/site-packages"):
    if (p / "claude_artifact_cli").is_dir():
        sys.path.insert(0, str(p))
        break

try:
    from claude_artifact_cli import api, auth
except ImportError:
    print("[Proxy Fatal] modulo 'claude_artifact_cli' nao encontrado no ambiente.", file=sys.stderr)
    sys.exit(1)

HOST = "127.0.0.1"
PORT = 8766
MAX_PAYLOAD_BYTES = 512 * 1024  # 512 KB

# Validacao de Seguranca
ALLOWED_HOSTS = {"127.0.0.1:8766", "localhost:8766"}
ALLOWED_ORIGINS = {"http://localhost:8765", "http://127.0.0.1:8765"}
ALLOWED_COLLECTIONS = {
    "bridge-poc",
    "exam_app_study",
    "exam_app_attempts",
    "exam_app_errors",
    "exam_app_spaces",
    "exam_app_state"
}

# Regex estritas para prevencao de Path Traversal e Injections
RE_SLUG = re.compile(r"^[A-Za-z0-9_-]{1,64}$")
RE_COLLECTION = re.compile(r"^[A-Za-z0-9_-]{1,32}$")
RE_DOC_ID = re.compile(r"^[A-Za-z0-9_.:-]{1,96}$")


class TokenManager:
    """Gerencia o token OAuth com deteccao de expiracao e recarregamento sob demanda."""

    def __init__(self):
        self._token = None
        self._client = None
        self._last_loaded = 0

    def get_client(self, force_refresh=False) -> api.FrameClient:
        now = time.time()
        # Recarregar se forcado ou se passaram mais de 5 minutos
        if force_refresh or self._client is None or (now - self._last_loaded > 300):
            token = auth.get_token()
            self._token = token
            self._client = api.FrameClient(token)
            self._last_loaded = now
        return self._client


token_mgr = TokenManager()


class HardenedStorageProxyHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Sanitizacao segura de log preservando formatacao nativa do http.server
        try:
            line = format % args
            line = re.sub(r'Bearer\s+[A-Za-z0-9_\-\.]+', 'Bearer [REDACTED]', line)
            line = re.sub(r'token=[A-Za-z0-9_\-\.]+', 'token=[REDACTED]', line)
            sys.stderr.write(f"[Proxy 127.0.0.1:{PORT}] {line}\n")
        except Exception:
            sys.stderr.write(f"[Proxy 127.0.0.1:{PORT}] {format}\n")

    def validate_host_header(self) -> bool:
        host = self.headers.get("Host", "").strip()
        # Se contiver porta, compara diretamente
        return host in ALLOWED_HOSTS

    def validate_origin(self) -> str | None:
        origin = self.headers.get("Origin")
        if not origin:
            # Requisicoes sem Origin (ex: chamadas diretas ou curl local)
            return "http://localhost:8765"
        if origin in ALLOWED_ORIGINS:
            return origin
        return None

    def send_json(self, status_code: int, data: dict, allowed_origin: str = "http://localhost:8765"):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Access-Control-Allow-Origin", allowed_origin)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        if not self.validate_host_header():
            return self.send_json(403, {"error": "INVALID_HOST", "message": "Host header rejeitado"})
        origin = self.validate_origin()
        if not origin:
            return self.send_json(403, {"error": "INVALID_ORIGIN", "message": "Origem nao autorizada"})

        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Max-Age", "86400")
        self.end_headers()

    def parse_and_validate_path(self):
        """Valida e extrai (slug, collection, doc_id) com regex estrita."""
        parsed = urllib.parse.urlparse(self.path)
        parts = [urllib.parse.unquote(p) for p in parsed.path.split("/") if p]

        # Rota de healthcheck
        if len(parts) == 2 and parts[0] == "api" and parts[1] == "health":
            return "HEALTH", None, None

        if len(parts) < 4 or parts[0] != "api" or parts[1] != "storage":
            return None, None, None

        slug = parts[2]
        collection = parts[3]
        doc_id = parts[4] if len(parts) > 4 else None

        if not RE_SLUG.match(slug):
            return "INVALID_SLUG", None, None

        if not RE_COLLECTION.match(collection) or collection not in ALLOWED_COLLECTIONS:
            return "DISALLOWED_COLLECTION", None, None

        if doc_id is not None and not RE_DOC_ID.match(doc_id):
            return "INVALID_DOC_ID", None, None

        return slug, collection, doc_id

    def execute_anthropic_call(self, slug: str, verb: str, args: dict):
        """Executa chamada para Anthropic com retry automatico em caso de 401."""
        client = token_mgr.get_client()
        try:
            return client.db(slug, verb, args)
        except api.ApiError as err:
            if err.status == 401:
                # Token pode ter sido renovado no disco pelo Claude Code
                client = token_mgr.get_client(force_refresh=True)
                return client.db(slug, verb, args)
            raise

    def do_GET(self):
        if not self.validate_host_header():
            return self.send_json(403, {"error": "INVALID_HOST", "message": "Host header rejeitado"})
        origin = self.validate_origin()
        if not origin:
            return self.send_json(403, {"error": "INVALID_ORIGIN", "message": "Origem nao autorizada"})

        slug, collection, doc_id = self.parse_and_validate_path()

        if slug == "HEALTH":
            try:
                client = token_mgr.get_client()
                return self.send_json(200, {
                    "status": "ok",
                    "authenticated": True,
                    "proxy": "HardenedStorageProxy",
                    "time": int(time.time())
                }, origin)
            except Exception:
                return self.send_json(500, {
                    "status": "error",
                    "authenticated": False,
                    "message": "Falha na autenticacao do Claude Code"
                }, origin)

        if slug == "DISALLOWED_COLLECTION":
            return self.send_json(403, {"error": "DISALLOWED_COLLECTION", "message": "Colecao restrita ou nao permitida"}, origin)
        if slug in ("INVALID_SLUG", "INVALID_DOC_ID") or slug is None:
            return self.send_json(400, {"error": "INVALID_PATH", "message": "Caminho invalido ou rejeitado pela politica de seguranca"}, origin)

        try:
            if doc_id:
                res = self.execute_anthropic_call(slug, "get", {"path": f"{collection}/{doc_id}"})
                return self.send_json(200, res, origin)
            else:
                res = self.execute_anthropic_call(slug, "list", {"collection": collection})
                return self.send_json(200, res, origin)
        except Exception as e:
            code = getattr(e, "status", 500)
            return self.send_json(code, {"error": "UPSTREAM_ERROR", "message": "Falha na comunicacao com Claude Pro DB"}, origin)

    def drain_body(self):
        try:
            cl = int(self.headers.get("Content-Length", 0))
            if cl > 0:
                # Drena até 2 MB com segurança
                remaining = min(cl, 2 * 1024 * 1024)
                while remaining > 0:
                    chunk = self.rfile.read(min(remaining, 65536))
                    if not chunk:
                        break
                    remaining -= len(chunk)
        except Exception:
            pass

    def do_POST(self):
        if not self.validate_host_header():
            self.drain_body()
            return self.send_json(403, {"error": "INVALID_HOST", "message": "Host header rejeitado"})
        origin = self.validate_origin()
        if not origin:
            self.drain_body()
            return self.send_json(403, {"error": "INVALID_ORIGIN", "message": "Origem nao autorizada"})

        slug, collection, doc_id = self.parse_and_validate_path()
        if slug == "DISALLOWED_COLLECTION":
            self.drain_body()
            return self.send_json(403, {"error": "DISALLOWED_COLLECTION", "message": "Colecao restrita"}, origin)
        if slug in ("INVALID_SLUG", "INVALID_DOC_ID") or slug is None or doc_id is None:
            self.drain_body()
            return self.send_json(400, {"error": "INVALID_PATH", "message": "Operacao POST exige :slug/:collection/:doc_id validos"}, origin)

        cl_header = self.headers.get("Content-Length")
        if not cl_header:
            return self.send_json(411, {"error": "LENGTH_REQUIRED", "message": "Content-Length obrigatorio"}, origin)

        try:
            content_length = int(cl_header)
        except ValueError:
            return self.send_json(400, {"error": "INVALID_CONTENT_LENGTH"}, origin)

        if content_length > MAX_PAYLOAD_BYTES:
            self.drain_body()
            return self.send_json(413, {"error": "PAYLOAD_TOO_LARGE", "message": f"Limite maximo de {MAX_PAYLOAD_BYTES} bytes excedido"}, origin)

        raw_body = self.rfile.read(content_length)
        try:
            body = json.loads(raw_body)
            if not isinstance(body, dict):
                return self.send_json(400, {"error": "INVALID_JSON_BODY", "message": "Corpo deve ser um objeto JSON"}, origin)
        except Exception:
            return self.send_json(400, {"error": "MALFORMED_JSON", "message": "JSON invalido"}, origin)

        try:
            res = self.execute_anthropic_call(slug, "set", {"path": f"{collection}/{doc_id}", "data": body})
            return self.send_json(200, res, origin)
        except Exception as e:
            code = getattr(e, "status", 500)
            return self.send_json(code, {"error": "UPSTREAM_ERROR", "message": "Falha ao gravar no Claude Pro DB"}, origin)

    def do_DELETE(self):
        if not self.validate_host_header():
            return self.send_json(403, {"error": "INVALID_HOST", "message": "Host header rejeitado"})
        origin = self.validate_origin()
        if not origin:
            return self.send_json(403, {"error": "INVALID_ORIGIN", "message": "Origem nao autorizada"})

        slug, collection, doc_id = self.parse_and_validate_path()
        if slug == "DISALLOWED_COLLECTION":
            return self.send_json(403, {"error": "DISALLOWED_COLLECTION", "message": "Colecao restrita"}, origin)
        if slug in ("INVALID_SLUG", "INVALID_DOC_ID") or slug is None or doc_id is None:
            return self.send_json(400, {"error": "INVALID_PATH", "message": "Operacao DELETE exige :slug/:collection/:doc_id validos"}, origin)

        try:
            res = self.execute_anthropic_call(slug, "delete", {"path": f"{collection}/{doc_id}"})
            return self.send_json(200, res, origin)
        except Exception as e:
            code = getattr(e, "status", 500)
            return self.send_json(code, {"error": "UPSTREAM_ERROR", "message": "Falha ao excluir no Claude Pro DB"}, origin)


def main():
    server_address = (HOST, PORT)
    with socketserver.TCPServer(server_address, HardenedStorageProxyHandler) as httpd:
        print(f"[HardenedProxy] Servidor iniciado e blindado em http://{HOST}:{PORT}")
        httpd.serve_forever()


if __name__ == "__main__":
    main()

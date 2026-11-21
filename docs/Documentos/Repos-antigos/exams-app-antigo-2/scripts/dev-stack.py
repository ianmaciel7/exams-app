#!/usr/bin/env python3
"""Runner do Stack Completo do Exam App (Modo Local compatível com Claude Artifacts).

Inicia em conjunto:
1. Servidor HTTP dos protótipos na porta 8765.
2. Proxy blindado do Claude Pro Frame Database na porta 8766.
3. (Opcional) Abre o navegador padrão na URL do protótipo (--open).
"""

import os
import signal
import subprocess
import sys
import time
import webbrowser
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
PORT_HTTP = 8765
PORT_PROXY = 8766
URL_APP = f"http://localhost:{PORT_HTTP}/exam-app-0.1.1__index.html"
URL_BOARD = f"http://localhost:{PORT_HTTP}/board-exam-app__index.html"

def log(msg=""):
    print(msg, flush=True)

def main():
    should_open = "--open" in sys.argv or "-o" in sys.argv
    log("=" * 66)
    log("  EXAM APP - STACK COMPLETO (COMPORTAMENTO CLAUDE ARTIFACT)")
    log("=" * 66)
    log(f"  [1] Servidor HTTP:       http://localhost:{PORT_HTTP}")
    log(f"  [2] Claude Storage DB:   http://127.0.0.1:{PORT_PROXY}")
    log(f"  [3] Protótipo Ativo:     {URL_APP}")
    log(f"  [4] Planning Board:      {URL_BOARD}")
    log("=" * 66)
    log("Iniciando serviços...")

    py_exe = sys.executable
    env = os.environ.copy()
    env["PYTHONUNBUFFERED"] = "1"

    # 1. Servidor HTTP
    http_proc = subprocess.Popen(
        [py_exe, "-m", "http.server", str(PORT_HTTP), "--directory", "prototype"],
        cwd=str(REPO_ROOT),
        env=env
    )

    # 2. Proxy Claude Storage
    proxy_script = REPO_ROOT / "services" / "proxy" / "claude_storage_proxy.py"
    proxy_proc = subprocess.Popen(
        [py_exe, str(proxy_script)],
        cwd=str(REPO_ROOT),
        env=env
    )

    processes = [http_proc, proxy_proc]

    def cleanup(signum=None, frame=None):
        log("\nEncerrando serviços do Exam App...")
        for p in processes:
            if p.poll() is None:
                p.terminate()
        for p in processes:
            try:
                p.wait(timeout=2)
            except Exception:
                p.kill()
        log("Serviços finalizados com sucesso.")
        sys.exit(0)

    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    log("\n✓ Stack ativo e sincronizado com Claude Cloud Storage. Pressione Ctrl+C para parar.\n")

    # Aguarda 1 segundo e abre o navegador se solicitado
    if should_open:
        time.sleep(1)
        log(f"Abrindo navegador em {URL_APP} ...")
        webbrowser.open(URL_APP)

    try:
        while True:
            time.sleep(0.5)
            for p in processes:
                code = p.poll()
                if code is not None:
                    log(f"Aviso: Processo PID {p.pid} finalizou com código {code}.")
                    cleanup()
    except KeyboardInterrupt:
        cleanup()

if __name__ == "__main__":
    main()

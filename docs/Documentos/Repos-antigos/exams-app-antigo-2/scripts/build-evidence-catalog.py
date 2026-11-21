#!/usr/bin/env python3
"""Gera o catálogo central de evidências do repositório.

Saídas (em prototype/):
  - catalog.json  : fonte estruturada (ids estáveis, vínculos, classificações)
  - CATALOG.md    : índice navegável em Markdown
  - gallery.html  : galeria com miniaturas, ampliação e comparação antes/depois

Princípios:
  - Nenhum arquivo é copiado: o catálogo aponta para o caminho original.
  - O id é derivado do caminho original (sha256[:8]), logo é estável enquanto o arquivo não muda de lugar.
  - Vínculos com funcionalidade são heurísticos (regra por nome de arquivo) e ficam marcados como tais.
  - Não edita board.json nem BOARD.md.

Uso: python3 scripts/build-evidence-catalog.py   (a partir da raiz do repositório)
"""
import hashlib
import html
import json
import os
import re
import subprocess
from collections import defaultdict
from datetime import datetime, timezone

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OUT = os.path.join(ROOT, 'prototype')
REPO_URL = 'https://github.com/ianmaciel7/exams-app'
MEDIA_RE = re.compile(r'\.(png|jpe?g|gif|webp)$', re.I)
SKIP_DIRS = {'.git', 'node_modules'}

# Diretórios escaneados (relativos à raiz). Assets do board e arquivos arquivados.
SCAN_DIRS = ['prototype']

PESQUISA = {
    'capacities': ('Pesquisa Capacities', 'prototype/capacities-issue-32-2026-11-15.md'),
    'qconcursos': ('Pesquisa QConcursos', 'prototype/qconcursos-issue-31-2026-11-15.md'),
    'examtopics': ('Pesquisa ExamTopics', 'prototype/examtopics-inventory.md'),
    'readwise': ('Dossiê Readwise', 'prototype/READWISE_DOSSIER.md'),
    'notes-app-old': ('Catálogo de versões arquivadas', 'prototype/docs__archives__README.md'),
    'exams-app-old': ('Catálogo de versões arquivadas', 'prototype/docs__archives__README.md'),
}

FUNCAO_RULES = [
    (r'simulado', 'Simulados'),
    (r'graph|grafo|local_graph|global_graph', 'Grafo e relacionamentos'),
    (r'srs', 'Revisão espaçada'),
    (r'pdf|reader|highlight|marginalia|doc2|issue77|paragraph|notebook', 'PDF Reader'),
    (r'qconcursos|examtopics|question|questao|cloze|issue(70|75|76|82|100|68)|dock|filter', 'Questões e filtros'),
    (r'right_panel|panel|issue(54|55|66)|tabs', 'Abas e painéis'),
    (r'cargo|\btype|issue(139|140|227)|collection|tipo', 'Tipos de objeto e propriedades'),
    (r'claude|storage|sync|evidence-', 'Sincronização com Claude'),
    (r'lowchrome|sidebar|collapsed|responsive|issue(128|132|136|138)|1366|390|768|1024|320', 'Workspace e navegação'),
    (r'issue120|(^|_)(dark|light)(_|\.|$)|\btema', 'Tema claro/escuro'),
    (r'notes_app|notes-app|exams-app-old|archive', 'Versões arquivadas'),
]

ORIGEM = [
    (r'^prototype/[0-9a-f]{32}\.png$', 'Board: upload embutido (hash)'),
    (r'^prototype/inline-e\d+\.jpg$', 'Board: imagem inline do elemento'),
    (r'^prototype/board-exam-app__assets__claude-storage-bridge__', 'Teste: ponte de armazenamento Claude'),
    (r'^prototype/board-exam-app__assets__', 'Board: captura de assets'),
    (r'^prototype/exam-app-0\.1\.\d__', 'Protótipo: versão publicada'),
    (r'^prototype/docs__archives__', 'Arquivo: versão histórica'),
    (r'^prototype/docs__', 'Documentação'),
]


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


def git(*args):
    return subprocess.run(['git', *args], cwd=ROOT, capture_output=True, text=True, check=False).stdout


def last_commit_dates():
    """Data do último commit por arquivo, em uma única chamada ao git."""
    dates, current = {}, None
    for line in git('log', '--format=__%cI', '--name-only', '--', *SCAN_DIRS).splitlines():
        if line.startswith('__'):
            current = line[2:]
        elif line.strip() and current:
            dates.setdefault(line.strip(), current[:10])
    return dates


def previous_catalog_dates():
    """Keep original evidence dates stable across squash merges and rebases.

    A Git squash rewrites the latest commit for every migrated asset, even when
    its bytes are unchanged. Cached dates are used only for identical media
    content (path + sha256). Test journals retain their recorded catalog date.
    """
    try:
        with open(os.path.join(OUT, 'catalog.json'), encoding='utf-8') as f:
            old = json.load(f)
    except (OSError, ValueError):
        return {}, {}
    media = {e['caminho']: e for e in old.get('evidencias', [])
             if isinstance(e, dict) and e.get('caminho')}
    tests = {e['caminho']: e.get('data') for e in old.get('testes', [])
             if isinstance(e, dict) and e.get('caminho')}
    return media, tests


def evidence_date(path, sha, prior, git_dates):
    """Refresh dates only when a new image path/content is introduced."""
    old = prior.get(path, {})
    if old.get('sha256') == sha and old.get('data'):
        return old['data']
    return git_dates.get(path)


def stable_id(path):
    if path.startswith('prototype/'):
        path = 'prototypes/' + path[len('prototype/'):]
    return 'EV-' + hashlib.sha256(path.encode()).hexdigest()[:8].upper()


def pick(rules, text, default):
    for pattern, value in rules:
        if re.search(pattern, text, re.I):
            return value
    return default


def classify_tipo(path):
    name = os.path.basename(path).lower()
    if path.startswith('prototype/docs__archives__') or re.match(r'(capacities|qconcursos|examtopics|readwise|archive_|notes_app)', name):
        return 'evidência externa'
    if re.match(r'(lowchrome_97|pdf112|issue120_e2e)', name) or path.startswith('prototype/board-exam-app__assets__claude-storage-bridge__'):
        return 'teste executado'
    if re.match(r'audit2026', name):
        return 'inspeção técnica'
    if re.match(r'(issue\d+|bug_|claude-artifact|evidence-)', name):
        return 'captura do protótipo'
    if re.match(r'inline-e\d+|[0-9a-f]{32}\.png', name):
        return 'a classificar'
    return 'a classificar'


def classify_ambiente(path):
    name = os.path.basename(path).lower()
    m = re.search(r'(1366|1280|1024|768|390|320)', name)
    viewport = f'{m.group(1)}px' if m else None
    if re.match(r'(capacities|qconcursos|examtopics|readwise|archive_|notes_app)', name):
        origem = name.split('_')[0]
        return f'referência externa ({origem})' + (f', viewport {viewport}' if viewport else '')
    if 'dark' in name or 'light' in name:
        tema = 'escuro' if 'dark' in name else 'claro'
    else:
        tema = None
    partes = ['protótipo']
    if viewport:
        partes.append(f'viewport {viewport}')
    if tema:
        partes.append(f'tema {tema}')
    return ', '.join(partes)


def estado_momento(path):
    name = os.path.basename(path).lower()
    if re.search(r'before', name):
        return 'antes'
    if re.search(r'after', name):
        return 'depois'
    return None


def issue_from(path):
    m = re.search(r'issue(\d+)', os.path.basename(path), re.I)
    return int(m.group(1)) if m else None


def pesquisa_from(path):
    name = os.path.basename(path).lower()
    for key, (label, target) in PESQUISA.items():
        if name.startswith(key):
            return {'titulo': label, 'caminho': target}
    return None


def descricao(path):
    base = os.path.splitext(os.path.basename(path))[0]
    if re.fullmatch(r'[0-9a-f]{32}', base) or re.fullmatch(r'inline-e\d+', base):
        return 'Imagem embutida no Board (nome gerado, contexto não documentado).'
    texto = re.sub(r'[_-]+', ' ', base)
    return texto[0].upper() + texto[1:] + '.'


def referencias_textuais(path, corpus):
    """Quais arquivos de texto citam o nome do arquivo (rastreabilidade)."""
    name = os.path.basename(path)
    return sorted(p for p, t in corpus.items() if name in t and p != path)[:20]


IMG_REF = re.compile(r'([\w./~-]*?[\w-]+\.(?:png|jpe?g|gif|webp|svg))')


TRACKED = set(git('ls-files').splitlines())


def referencias_quebradas(corpus):
    """Imagens citadas em texto/código que não existem no repositório (exclui URLs externas)."""
    quebradas = []
    for rel, text in corpus.items():
        if rel == 'prototype/board.json':
            continue
        for ref in sorted(set(IMG_REF.findall(text))):
            if len(ref) > 120 or ref.startswith('data:') or '//' in ref or ref.startswith('.'):
                continue
            base = os.path.dirname(os.path.join(ROOT, rel))
            candidatos = [os.path.relpath(os.path.join(base, ref), ROOT), ref,
                          'prototype/' + os.path.basename(ref), 'prototype/board-exam-app__assets__' + os.path.basename(ref)]
            # Só arquivos rastreados: o resultado não pode depender de arquivos locais ignorados.
            if not any(c.replace(os.sep, '/') in TRACKED for c in candidatos):
                quebradas.append({'arquivo': rel, 'referencia': ref})
    return quebradas


def load_corpus():
    corpus = {}
    for base in ['prototype', 'scripts', 'tests', '.github']:
        for dirpath, dirnames, filenames in os.walk(os.path.join(ROOT, base)):
            dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and d != 'assets']
            for fn in filenames:
                # #278: the navigation indexes list planned paths, not actual
                # uses of images. Counting them as references changes orphan
                # status and silently corrupts the evidence catalog.
                relative_dir = os.path.relpath(dirpath, ROOT).replace(os.sep, '/')
                if fn == 'phase2-navigation-map.json':
                    continue
                if fn == 'README.md' and (
                    relative_dir.startswith('prototype/boards')
                    or relative_dir in {
                        'prototype/archive', 'prototype/tools', 'prototype/app'
                    }
                ):
                    continue
                if os.path.relpath(dirpath, ROOT).replace(os.sep, '/') == 'prototype' and fn in {'CATALOG.md', 'gallery.html', 'catalog.json', 'BOARD.md', 'board-mestre.md', 'feature-links.json', 'issue278-inventory.json', 'issue278-dependencies.json', 'issue278-baseline.json', 'issue278-coverage-baseline.json', 'issue278-rename-receipt.json', 'issue278-before-rename.json'}:
                    continue  # índices/manifestos gerados não demonstram uso visual da mídia
                if re.search(r'\.(md|json|html|py|mjs|js|yml)$', fn):
                    p = os.path.join(dirpath, fn)
                    try:
                        with open(p, encoding='utf-8', errors='ignore') as source:
                            corpus[os.path.relpath(p, ROOT).replace(os.sep, '/')] = source.read()
                    except OSError:
                        pass
    return corpus


def build():
    dates = last_commit_dates()
    previous_media, previous_tests = previous_catalog_dates()
    corpus = load_corpus()
    board_json = open(os.path.join(ROOT, 'prototype/board.json'), encoding='utf-8').read()

    items = []
    for scan in SCAN_DIRS:
        base = os.path.join(ROOT, scan)
        if not os.path.isdir(base):
            continue
        for dirpath, dirnames, filenames in os.walk(base):
            dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
            for fn in sorted(filenames):
                if MEDIA_RE.search(fn):
                    items.append(os.path.relpath(os.path.join(dirpath, fn), ROOT).replace(os.sep, '/'))

    entries = []
    by_sha = defaultdict(list)
    for path in sorted(items):
        full = os.path.join(ROOT, path)
        sha = sha256_file(full)
        by_sha[sha].append(path)
        name_ref = referencias_textuais(path, corpus)
        in_board = os.path.basename(path) in board_json
        entries.append({
            'id': stable_id(path),
            'caminho': path,
            'sha256': sha,
            'bytes': os.path.getsize(full),
            'data': evidence_date(path, sha, previous_media, dates),
            'origem': pick(ORIGEM, path, 'Repositório'),
            'tipo': classify_tipo(path),
            'ambiente': classify_ambiente(path),
            'estado_momento': estado_momento(path),
            'funcionalidade': pick(FUNCAO_RULES, os.path.basename(path), 'Não classificado'),
            'contexto': descricao(path),
            'finalidade': 'Documentar comportamento visual para revisão' if estado_momento(path) else 'Registrar captura para referência ou validação',
            'vinculos': {
                'issue': issue_from(path),
                'issue_url': f'{REPO_URL}/issues/{issue_from(path)}' if issue_from(path) else None,
                'pesquisa': pesquisa_from(path),
                'decisao': None,
                'pr': None,
                'board_elemento': None,
            },
            'referenciado_em': name_ref,
            'no_board_json': in_board,
            'status_integridade': None,
        })

    # Duplicatas: mesmo conteúdo em caminhos diferentes. Mantém todos; marca a canônica.
    for e in entries:
        group = by_sha[e['sha256']]
        if len(group) > 1:
            outros = [p for p in group if p != e['caminho']]
            e['duplicatas'] = outros
            e['canonica'] = e['caminho'] == sorted(group, key=lambda p: (not p.startswith('prototype/board-exam-app__assets__'), p))[0]
        else:
            e['duplicatas'] = []
            e['canonica'] = True
        # Órfão: nenhum texto cita o arquivo e ele não está no board.json
        e['orfao'] = not e['referenciado_em'] and not e['no_board_json']
        if e['orfao']:
            e['status_integridade'] = 'órfão'
        elif e['duplicatas'] and not e['canonica']:
            e['status_integridade'] = 'duplicata'
        else:
            e['status_integridade'] = 'ok'

    # Pares antes/depois pelo mesmo stem.
    pares = defaultdict(dict)
    for e in entries:
        name = os.path.basename(e['caminho'])
        if e['estado_momento']:
            stem = re.sub(r'(before|after)', 'X', name.lower())
            pares[stem][e['estado_momento']] = e['id']
    antes_depois = [{'antes': v['antes'], 'depois': v['depois']} for v in pares.values() if 'antes' in v and 'depois' in v]
    for e in entries:
        e['par_antes_depois'] = next((p for p in antes_depois if e['id'] in (p['antes'], p['depois'])), None)

    # Evidências em arquivos de teste (JSON): inventário separado.
    testes = []
    for path in sorted(git('ls-files', 'prototype/*.json').splitlines()):
        if re.search(r'(_e2e|manifest|diagnostic|execution-log)\.json$', path):
            testes.append({'id': stable_id(path), 'caminho': path, 'tipo': 'teste executado', 'data': previous_tests.get(path) or dates.get(path)})

    orfaos = [e['caminho'] for e in entries if e['orfao']]
    quebradas = referencias_quebradas(corpus)
    duplicatas = [{'canonica': g[0], 'duplicatas': g[1:]} for g in by_sha.values() if len(g) > 1 for g in [sorted(g, key=lambda p: (not p.startswith('prototype/board-exam-app__assets__'), p))]]

    catalogo = {
        'versao_schema': 1,
        'gerado_em': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'resumo': {
            'midias': len(entries),
            'orfaos': len(orfaos),
            'duplicatas_grupos': len(duplicatas),
            'testes_json': len(testes),
            'pares_antes_depois': len(antes_depois),
        },
        'evidencias': entries,
        'testes': testes,
        'orfaos': orfaos,
        'referencias_quebradas': quebradas,
        'duplicatas': duplicatas,
        'externas_fora_do_repositorio': [
            {'caminho': '/mnt/project-files/prints/redesign-paginas-objeto/' + n,
             'tipo': 'captura do protótipo', 'nota': 'Sem cópia no repositório; disponível só na pasta do projeto.'}
            for n in ['antes-depois-cargo.png', 'antes-depois-concurso.png', 'antes-depois-edicao.png', 'antes-depois-tipo-pdf.png']
        ],
    }
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, 'catalog.json'), 'w', encoding='utf-8') as f:
        json.dump(catalogo, f, ensure_ascii=False, indent=2)
        f.write('\n')
    write_markdown(catalogo)
    write_gallery(catalogo)
    return catalogo


def rel_img(path):
    return os.path.relpath(os.path.join(ROOT, path), OUT).replace(os.sep, '/')


def write_markdown(c):
    lines = [
        '# Catálogo de evidências',
        '',
        f'Gerado por `scripts/build-evidence-catalog.py` em {c["gerado_em"]}. Não edite à mão: rode o script de novo.',
        '',
        f'- Mídias catalogadas: **{c["resumo"]["midias"]}**',
        f'- Órfãs (nenhum texto cita o arquivo): **{c["resumo"]["orfaos"]}**',
        f'- Grupos de duplicatas (mesmo conteúdo): **{c["resumo"]["duplicatas_grupos"]}**',
        f'- Pares antes/depois: **{c["resumo"]["pares_antes_depois"]}**',
        f'- Resultados de teste em JSON: **{c["resumo"]["testes_json"]}**',
        '',
        'Galeria visual: `prototype/gallery.html` (abra o arquivo localmente; o GitHub mostra o código-fonte HTML).',
        '',
        '## Como ler',
        '',
        '- **Tipo**: evidência externa (produto de referência), captura do protótipo, inspeção técnica, teste executado ou a classificar.',
        '- **Funcionalidade**: inferida pelo nome do arquivo. É uma heurística e precisa de revisão.',
        '- **Vínculo a issue**: vem do número no nome do arquivo. O link `/issues/N` redireciona para a PR quando o número for de PR.',
        '- **Pesquisa**: documento de pesquisa correspondente ao concorrente citado no nome do arquivo.',
        '- **Decisão e PR**: as ADRs são referenciadas por documentos achatados; os vínculos de decisão e PR ficam vazios até haver registro.',
        '',
        '## Índice por funcionalidade',
        '',
    ]
    grupos = defaultdict(list)
    for e in c['evidencias']:
        grupos[e['funcionalidade']].append(e)
    for func in sorted(grupos):
        lines.append(f'### {func} ({len(grupos[func])})')
        lines.append('')
        lines.append('| Id | Miniatura | Arquivo | Tipo | Estado | Issue | Data | Integridade |')
        lines.append('|---|---|---|---|---|---|---|---|')
        for e in grupos[func]:
            img = f'![]({rel_img(e["caminho"])})' if e['tipo'] != 'x' else ''
            issue = f'[#{e["vinculos"]["issue"]}]({e["vinculos"]["issue_url"]})' if e['vinculos']['issue'] else '—'
            estado = e['estado_momento'] or '—'
            lines.append(f'| {e["id"]} | {img} | `{e["caminho"]}` | {e["tipo"]} | {estado} | {issue} | {e["data"] or "—"} | {e["status_integridade"]} |')
        lines.append('')
    lines += ['## Órfãos', '']
    lines += [f'- `{p}`' for p in c['orfaos']] or ['Nenhum.']
    lines += ['', '## Duplicatas (conteúdo idêntico, nenhum arquivo removido)', '']
    for d in c['duplicatas']:
        lines.append(f'- Canônica `{d["canonica"]}`')
        lines += [f'  - duplicata: `{p}`' for p in d['duplicatas']]
    lines += ['', '## Testes e diagnósticos em JSON', '']
    lines += [f'- {t["id"]} `{t["caminho"]}` ({t["data"] or "—"})' for t in c['testes']]
    lines += ['', '## Fora do repositório', '']
    lines += [f'- `{x["caminho"]}`: {x["nota"]}' for x in c['externas_fora_do_repositorio']]
    lines.append('')
    with open(os.path.join(OUT, 'CATALOG.md'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))


def write_gallery(c):
    cards = []
    for e in c['evidencias']:
        if e['status_integridade'] == 'duplicata':
            continue
        cards.append(
            f'<figure class="card" data-func="{html.escape(e["funcionalidade"])}" data-tipo="{html.escape(e["tipo"])}" '
            f'data-search="{html.escape((e["caminho"] + " " + e["contexto"] + " " + e["funcionalidade"]).lower())}">'
            f'<button class="thumb" data-full="{html.escape(rel_img(e["caminho"]))}" data-caption="{html.escape(e["id"] + " · " + e["caminho"])}">'
            f'<img loading="lazy" src="{html.escape(rel_img(e["caminho"]))}" alt="{html.escape(e["contexto"])}"></button>'
            f'<figcaption><strong>{html.escape(e["id"])}</strong> · {html.escape(e["tipo"])}'
            f'<br><span class="muted">{html.escape(e["funcionalidade"])} · {html.escape(e["data"] or "sem data")}</span>'
            f'<br><code>{html.escape(e["caminho"])}</code></figcaption></figure>')
    funcs = sorted({e['funcionalidade'] for e in c['evidencias']})
    chips = ''.join(f'<button class="chip" data-f="{html.escape(f)}">{html.escape(f)}</button>' for f in funcs)
    pares = []
    byid = {e['id']: e for e in c['evidencias']}
    for p in c['evidencias']:
        pa = p.get('par_antes_depois')
        if pa and p['estado_momento'] == 'antes':
            a, b = byid[pa['antes']], byid[pa['depois']]
            pares.append(
                f'<div class="pair"><p><strong>{html.escape(a["funcionalidade"])}</strong> · antes / depois · <code>{html.escape(a["caminho"])}</code></p>'
                f'<div class="pair-row"><img loading="lazy" src="{html.escape(rel_img(a["caminho"]))}" alt="Antes">'
                f'<img loading="lazy" src="{html.escape(rel_img(b["caminho"]))}" alt="Depois"></div></div>')
    doc = f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Catálogo de evidências</title>
<style>
:root {{ --bg:#fafafa; --fg:#1b1b1f; --muted:#5f6370; --line:#dcdde3; --accent:#2b5bd7; }}
:root[data-theme="dark"], :root:not([data-theme="light"]) {{}}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{ --bg:#15161a; --fg:#ededf1; --muted:#9a9eab; --line:#2c2f38; --accent:#7aa2ff; }} }}
:root[data-theme="dark"] {{ --bg:#15161a; --fg:#ededf1; --muted:#9a9eab; --line:#2c2f38; --accent:#7aa2ff; }}
body {{ margin:0; background:var(--bg); color:var(--fg); font:15px/1.5 system-ui,sans-serif; }}
header, main {{ padding:16px; max-width:1200px; margin:0 auto; }}
input[type=search] {{ width:100%; box-sizing:border-box; padding:10px 12px; border:1px solid var(--line); border-radius:8px; background:transparent; color:var(--fg); font:inherit; min-height:44px; }}
.chips {{ display:flex; flex-wrap:wrap; gap:8px; margin:12px 0; }}
.chip {{ border:1px solid var(--line); background:transparent; color:var(--fg); border-radius:999px; padding:6px 12px; min-height:36px; cursor:pointer; font:inherit; }}
.chip[aria-pressed="true"] {{ border-color:var(--accent); color:var(--accent); }}
.grid {{ display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:14px; }}
.card {{ margin:0; border:1px solid var(--line); border-radius:10px; overflow:hidden; background:var(--bg); }}
.thumb {{ display:block; width:100%; height:150px; padding:0; border:0; background:var(--line); cursor:zoom-in; }}
.thumb img {{ width:100%; height:100%; object-fit:cover; object-position:top; display:block; }}
figcaption {{ padding:8px 10px; font-size:13px; word-break:break-all; }}
.muted {{ color:var(--muted); }}
code {{ font-size:12px; }}
.pair {{ border:1px solid var(--line); border-radius:10px; padding:12px; margin:12px 0; }}
.pair-row {{ display:grid; grid-template-columns:1fr 1fr; gap:8px; }}
.pair-row img {{ width:100%; border:1px solid var(--line); border-radius:6px; }}
dialog {{ border:0; padding:0; max-width:96vw; max-height:94vh; background:var(--bg); color:var(--fg); }}
dialog::backdrop {{ background:rgba(0,0,0,.7); }}
dialog img {{ display:block; max-width:96vw; max-height:84vh; }}
dialog .bar {{ display:flex; justify-content:space-between; gap:12px; padding:10px 12px; align-items:center; }}
dialog button {{ min-height:44px; min-width:44px; border:1px solid var(--line); background:transparent; color:var(--fg); border-radius:8px; cursor:pointer; font:inherit; padding:0 12px; }}
</style>
</head>
<body>
<header>
<h1>Catálogo de evidências</h1>
<nav aria-label="Dossiês de evidências"><a href="evidencias-examtopics-2026-11-17.md">ExamTopics — 57 evidências, 16 fontes e 5 capturas históricas</a></nav>
<p class="muted">{c["resumo"]["midias"]} mídias · gerado em {c["gerado_em"]} · os arquivos ficam no caminho original, sem cópias.</p>
<input type="search" id="q" placeholder="Buscar por arquivo, funcionalidade ou contexto" aria-label="Buscar evidências">
<div class="chips" id="chips"><button class="chip" data-f="" aria-pressed="true">Todas</button>{chips}</div>
</header>
<main>
<h2>Comparações antes/depois</h2>
{''.join(pares) or '<p class="muted">Nenhum par.</p>'}
<h2>Todas as evidências</h2>
<div class="grid" id="grid">{''.join(cards)}</div>
</main>
<dialog id="dlg" aria-label="Evidência ampliada">
<div class="bar"><span id="cap"></span><button id="close">Fechar</button></div>
<img id="full" alt="">
</dialog>
<script>
const q=document.getElementById('q'); const cards=[...document.querySelectorAll('.card')];
let func='';
function apply(){{ const t=q.value.trim().toLowerCase(); cards.forEach(c=>{{ const ok=(!func||c.dataset.func===func)&&(!t||c.dataset.search.includes(t)); c.hidden=!ok; }}); }}
q.addEventListener('input',apply);
document.getElementById('chips').addEventListener('click',e=>{{ const b=e.target.closest('.chip'); if(!b) return; func=b.dataset.f; document.querySelectorAll('.chip').forEach(x=>x.setAttribute('aria-pressed',x===b)); apply(); }});
const dlg=document.getElementById('dlg');
document.querySelectorAll('.thumb').forEach(b=>b.addEventListener('click',()=>{{ document.getElementById('full').src=b.dataset.full; document.getElementById('cap').textContent=b.dataset.caption; dlg.showModal(); }}));
document.getElementById('close').addEventListener('click',()=>dlg.close());
dlg.addEventListener('click',e=>{{ if(e.target===dlg) dlg.close(); }});
</script>
</body>
</html>
'''
    with open(os.path.join(OUT, 'gallery.html'), 'w', encoding='utf-8') as f:
        f.write(doc)


if __name__ == '__main__':
    result = build()
    print(json.dumps(result['resumo'], ensure_ascii=False, indent=2))

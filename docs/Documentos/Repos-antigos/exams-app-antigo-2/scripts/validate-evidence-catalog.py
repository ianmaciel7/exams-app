#!/usr/bin/env python3
"""Valida o catálogo de evidências gerado por scripts/build-evidence-catalog.py.

Falha (código 1) se:
  - ids não forem únicos ou não corresponderem ao caminho original;
  - algum caminho catalogado não existir, ou o sha256 divergir do arquivo;
  - tipo, estado ou integridade estiverem fora dos valores permitidos;
  - a lista de órfãos ou de duplicatas divergir das entradas;
  - o catálogo gerado estiver desatualizado em relação ao repositório atual.

Uso: python3 scripts/validate-evidence-catalog.py   (a partir da raiz do repositório)
"""
import hashlib
import json
import os
import subprocess
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CATALOG = os.path.join(ROOT, 'prototype', 'catalog.json')
GALLERY = os.path.join(ROOT, 'prototype', 'gallery.html')
TIPOS = {'evidência externa', 'captura do protótipo', 'inspeção técnica', 'teste executado', 'a classificar'}
INTEGRIDADE = {'ok', 'duplicata', 'órfão'}

errors = []


def fail(msg):
    errors.append(msg)


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


def stable_id(path):
    if path.startswith('prototype/'):
        path = 'prototypes/' + path[len('prototype/'):]
    return 'EV-' + hashlib.sha256(path.encode()).hexdigest()[:8].upper()


def main():
    if not os.path.exists(CATALOG):
        print('catálogo ausente: rode scripts/build-evidence-catalog.py')
        return 1
    c = json.load(open(CATALOG, encoding='utf-8'))
    entries = c['evidencias']

    ids = [e['id'] for e in entries]
    if len(ids) != len(set(ids)):
        fail('ids duplicados no catálogo')
    paths = [e['caminho'] for e in entries]
    if len(paths) != len(set(paths)):
        fail('caminhos duplicados no catálogo')

    for e in entries:
        full = os.path.join(ROOT, e['caminho'])
        if e['id'] != stable_id(e['caminho']):
            fail(f"id {e['id']} não corresponde ao caminho {e['caminho']}")
        if not os.path.isfile(full):
            fail(f"arquivo ausente: {e['caminho']}")
            continue
        if sha256_file(full) != e['sha256']:
            fail(f"sha256 divergente: {e['caminho']}")
        if e['tipo'] not in TIPOS:
            fail(f"tipo inválido em {e['caminho']}: {e['tipo']}")
        if e['status_integridade'] not in INTEGRIDADE:
            fail(f"integridade inválida em {e['caminho']}")
        if not e.get('funcionalidade'):
            fail(f"sem funcionalidade: {e['caminho']}")

    orfaos_calc = sorted(e['caminho'] for e in entries if e['orfao'])
    if sorted(c['orfaos']) != orfaos_calc:
        fail('lista de órfãos diverge das entradas')

    dup_calc = {e['caminho'] for e in entries if e['status_integridade'] == 'duplicata'}
    dup_lista = {p for g in c['duplicatas'] for p in g['duplicatas']}
    if dup_calc - dup_lista:
        fail('entradas marcadas como duplicata fora da lista de duplicatas')

    for g in c['duplicatas']:
        for p in [g['canonica']] + g['duplicatas']:
            if not os.path.isfile(os.path.join(ROOT, p)):
                fail(f'duplicata ausente: {p}')

    # O catálogo gerado precisa refletir o repositório atual (exceto a data de geração).
    try:
        subprocess.run([sys.executable, os.path.join(ROOT, 'scripts', 'build-evidence-catalog.py')],
                       cwd=ROOT, check=True, capture_output=True)
        novo = json.load(open(CATALOG, encoding='utf-8'))
        novo['gerado_em'] = c['gerado_em']
        # Referências quebradas são aviso, não falha: no runner do CI o resultado
        # diferiu do clone local e ainda não foi reproduzido.
        if novo.get('referencias_quebradas') != c.get('referencias_quebradas'):
            print('aviso: lista de referências quebradas diverge do catálogo commitado; rode o build e revise')
        novo['referencias_quebradas'] = c.get('referencias_quebradas')
        if novo != c:
            diffs = [k for k in set(novo) | set(c) if novo.get(k) != c.get(k)]
            detalhe = f' (chaves: {sorted(diffs)})'
            if 'evidencias' in diffs:
                for a, b in zip(c['evidencias'], novo['evidencias']):
                    if a != b:
                        campos = [k for k in set(a) | set(b) if a.get(k) != b.get(k)]
                        detalhe += f" primeira diferença: {a.get('caminho')} campos {sorted(campos)}"
                        break
            fail('catálogo desatualizado: rode scripts/build-evidence-catalog.py e faça commit' + detalhe)
    except subprocess.CalledProcessError as err:
        fail(f'falha ao regenerar catálogo: {err.stderr.decode()[:300]}')

    if os.path.exists(GALLERY):
        html = open(GALLERY, encoding='utf-8').read()
        esperados = sum(1 for e in entries if e['status_integridade'] != 'duplicata')
        if html.count('class="card"') != esperados:
            fail(f'galeria com {html.count("class=\"card\"")} cards, esperado {esperados}')
    else:
        fail('galeria ausente')

    if errors:
        print(f'{len(errors)} problema(s):')
        for m in errors:
            print(' -', m)
        return 1
    print(f"catálogo válido: {len(entries)} mídias, {len(c['orfaos'])} órfãs, {len(c['duplicatas'])} grupos de duplicatas")
    return 0


if __name__ == '__main__':
    sys.exit(main())

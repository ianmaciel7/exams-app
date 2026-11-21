#!/usr/bin/env python3
"""Inventory immutable Git bytes before #278; verify the baseline without rewriting it.

snapshot --ref SHA --output FILE records every tracked file, including binary files.
verify --manifest FILE checks sources (pre-move) or destinations (--after).
The destination map is a proposal, not permission to run a bulk move.
"""
import argparse
import collections
import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys
import tarfile

ROOT = Path(__file__).resolve().parents[1]
BOARDS = ['01-produto','02-design','03-estudos','04-arquitetura','05-pesquisas','06-evidencias','07-releases-historico']
ENTRY_BOARDS = dict(zip(['01-produto-e-dominio.md','02-workspace-e-ux.md','03-fluxos-de-estudo.md','04-arquitetura-tecnica.md','05-pesquisa-e-decisoes.md','06-evidencias-e-qualidade.md','07-entrega-e-arquivo.md'], BOARDS))
PRODUCT = {'dominio.md','modelos.md','tipos-propriedades.md'}
STUDY = {'questoes.md','simulados.md','revisao.md','pdf-reader.md'}
ARCH = {'c4.md','claude-storage.md','CLAUDE_STORAGE_API_INTEGRATION.md','CLAUDE_STORAGE_BRIDGE_INVESTIGATION.md'}
RELEASE = {'estado-atual.md','template-release.md'}
META = {'board.json','board-mestre.json','feature-links.json','features-index.json','board-coverage.json','section-layout-map.json','section28-id-map.json','meta.json'}
PROVENANCE = {'MIGRATION-MAP.md','REUSE-MAP.md','FONTES.md','RELATORIO-REESTRUTURACAO.md','PR_DESCRIPTION.md'}


def destination(path):
    if not path.startswith('prototypes/'):
        return path, 'root-integration-retained'
    n = path.split('/', 1)[1]
    if '/' in n:
        raise ValueError('Source no longer flat: re-audit classification: ' + path)
    base = 'prototype/'
    if n in ENTRY_BOARDS:
        return base+'boards/'+ENTRY_BOARDS[n]+'/index.md', 'board-entry'
    if n == 'mestre.html': return base+'boards/index.html', 'master-entry'
    if n == 'board-exam-app__index.html': return base+'boards/canvas/index.html', 'canvas-entry'
    if n.startswith(('exam-app-0.1.0__','exam-app-0.1.1__')):
        version = '0.1.0' if n.startswith('exam-app-0.1.0__') else '0.1.1'
        # Preserve exact basename; do not reconstruct paths blindly from '__'.
        return base+'archive/claude/'+version+'/'+n, 'unapproved-historical-app'
    if n.startswith('notes-app-old'): return base+'archive/backups/notes-app/'+n, 'historical-backup'
    if n.startswith('exams-app-old'): return base+'archive/backups/exams-app/'+n, 'historical-backup'
    if n in META: return base+'boards/data/'+n, 'board-data'
    if n in PROVENANCE: return base+'boards/06-evidencias/relatorios/'+n, 'provenance'
    if n in {'catalog.json','CATALOG.md'}: return base+'boards/06-evidencias/catalogo/'+n, 'evidence-catalog'
    if n == 'gallery.html': return base+'boards/06-evidencias/galerias/'+n, 'gallery-entry'
    if PurePosixPath(n).suffix.lower() in {'.png','.jpg','.jpeg','.gif','.svg','.ico','.webp'}:
        return base+'boards/06-evidencias/capturas/'+n, 'evidence-media'
    if n.endswith('.py'): return base+'tools/scripts/'+n, 'prototype-tool'
    if n in PRODUCT: area='01-produto/dominio'
    elif n in STUDY: area='03-estudos/'+PurePosixPath(n).stem
    elif n.startswith('000') or n in ARCH: area='04-arquitetura/adr' if n.startswith('000') else '04-arquitetura/integracoes'
    elif n in RELEASE: area='07-releases-historico'
    elif n.endswith('.md') and any(x in n.lower() for x in ['pesquisa','readwise','examtopics','qconcursos','capacities','gran-questoes','skills','estrategia']):
        area='05-pesquisas'
    elif n.endswith('.md') and any(x in n.lower() for x in ['ux','ui','motion','workspace','component','visualization','grafo']):
        area='02-design'
    elif n.endswith('.md'): area='06-evidencias/relatorios'
    elif n in {'mestre-features.js','mermaid-11.4.1.min.js'}: area='canvas'
    else: area='06-evidencias/relatorios'
    return base+'boards/'+area+'/'+n, 'classified-by-explicit-rule-review-required'


def git_bytes(ref):
    # archive streams exact committed bytes without checking out or invoking hooks.
    proc = subprocess.Popen(['git','-c','core.autocrlf=false','archive',ref],cwd=ROOT,stdout=subprocess.PIPE)
    with tarfile.open(fileobj=proc.stdout,mode='r|') as archive:
        for item in archive:
            if item.isfile():
                yield item.name, archive.extractfile(item).read(), item.mode
            elif item.issym():
                yield item.name, item.linkname.encode(), item.mode
    proc.stdout.close()
    if proc.wait(): raise RuntimeError('git archive failed')


def snapshot(ref):
    sha = subprocess.check_output(['git','rev-parse',ref+'^{commit}'],cwd=ROOT,text=True).strip()
    entries=[]; texts={}
    for path, data, mode in git_bytes(sha):
        target, category=destination(path)
        entry={'source':path,'destination':target,'category':category,'bytes':len(data),
               'sha256':hashlib.sha256(data).hexdigest(),'mode':oct(mode),
               'type':PurePosixPath(path).suffix.lower() or 'extensionless',
               'origin':{'git_commit':sha,'git_path':path},
               'transformation':'not-started','reference_files':[]}
        entries.append(entry)
        try:
            value=data.decode('utf-8')
            if '\0' not in value: texts[path]=value
        except UnicodeDecodeError: pass
    # A lexical reference inventory includes code, documentation and provenance;
    # it deliberately does not claim to resolve dynamic URLs or external assets.
    for entry in entries:
        name=PurePosixPath(entry['source']).name
        entry['reference_files']=[p for p,t in texts.items() if p!=entry['source'] and (entry['source'] in t or name in t)]
    prior_origins=collections.defaultdict(list)
    for original,current in re.findall(r"^\| `([^`]+)` \| `([^`]+)` \|",texts.get('prototypes/MIGRATION-MAP.md',''),re.M):
        prior_origins[current].append(original)
    for entry in entries:
        entry['origin']['prior_paths_from_migration_map']=sorted(set(prior_origins[entry['source']]))
    count=collections.Counter(e['destination'].casefold() for e in entries)
    collisions=[p for p,n in count.items() if n>1]
    if collisions: raise ValueError('Case-insensitive destination collisions: '+repr(collisions))
    external=[]
    for path,t in texts.items():
        for value in sorted(set(re.findall(r'/mnt/project-files/[^\s<>"\x60)]+',t))):
            external.append({'source_document':path,'reference':value,'status':'external-not-in-git-not-recovered'})
    return {'schema_version':1,'issue':278,'baseline_commit':sha,'state':'pre-migration-proposal',
            'scope':'all tracked repository files; no untracked files or recovered external originals',
            'reference_method':'literal full-path or basename mentions; dynamic references need runtime tests',
            'counts':{'repository':len(entries),'prototypes':sum(e['source'].startswith('prototypes/') for e in entries)},
            'external_references':external,'files':sorted(entries,key=lambda e:e['source'])}


def verify(manifest, root, after=False):
    errors=[]; counts=collections.Counter()
    sources=[e['source'] for e in manifest['files']]
    if len(sources)!=len(set(sources)): errors.append('Duplicate source entries')
    targets=[e['destination'].casefold() for e in manifest['files']]
    if len(targets)!=len(set(targets)): errors.append('Destination collision (case-insensitive)')
    for e in manifest['files']:
        relative=e['destination'] if after else e['source']
        pp=PurePosixPath(relative)
        if pp.is_absolute() or '..' in pp.parts:
            errors.append('Unsafe path: '+relative); continue
        p=root/relative
        if not p.is_file():
            counts['missing']+=1; errors.append('Missing: '+relative); continue
        digest=hashlib.sha256(p.read_bytes()).hexdigest()
        if digest==e['sha256']:
            counts['preserved' if relative==e['source'] else 'moved']+=1
        else:
            counts['changed']+=1; errors.append('Content changed (review and transformation receipt required): '+relative)
    return dict(counts),errors


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    sub=parser.add_subparsers(dest='command',required=True)
    s=sub.add_parser('snapshot'); s.add_argument('--ref',required=True); s.add_argument('--output',type=Path,required=True)
    v=sub.add_parser('verify'); v.add_argument('--manifest',type=Path,required=True); v.add_argument('--after',action='store_true')
    args=parser.parse_args()
    if args.command=='snapshot':
        data=snapshot(args.ref); args.output.parent.mkdir(parents=True,exist_ok=True)
        args.output.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        print(json.dumps(data['counts'])); return 0
    manifest=json.loads(args.manifest.read_text(encoding='utf-8'))
    counts,errors=verify(manifest,ROOT,args.after)
    print(json.dumps({'counts':counts,'errors':errors},ensure_ascii=False,indent=2))
    return bool(errors)

if __name__=='__main__': sys.exit(main())

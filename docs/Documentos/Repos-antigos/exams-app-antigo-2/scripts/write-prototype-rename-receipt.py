#!/usr/bin/env python3
"""Record reviewed phase-1 path/content changes against the immutable phase-0 tree.

Run after generators, review the resulting diff, then verify with the migration suite.
Does not move files, update Git refs, publish, or accept missing/binary changes.
"""
import hashlib
import json
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'prototype/issue278-before-rename.json'
manifest=json.loads(BASE.read_text(encoding='utf-8'))
# Current hashes in the old docs map are derived metadata. Origin hashes and
# the entire previous map remain available at the baseline commit and receipt.
p=ROOT/'prototype/MIGRATION-MAP.md'
row=re.compile(r'^(\| `[^`]+` \| `([^`]+)` \| `[^`]+` \| `)([0-9a-f]{16})(` \|.*)$',re.M)
def update(match):
    path=ROOT/match[2]
    if not path.is_file():raise RuntimeError('Missing map target: '+match[2])
    return match[1]+hashlib.sha256(path.read_bytes()).hexdigest()[:16]+match[4]
p.write_text(row.sub(update,p.read_text(encoding='utf-8')),encoding='utf-8')
files=[]
for before in manifest['files']:
    source=before['source']
    if not source.startswith('prototypes/'):continue
    dest='prototype/'+source[len('prototypes/'):]
    path=ROOT/dest
    if not path.is_file():raise RuntimeError('Source lost: '+source)
    data=path.read_bytes(); after=hashlib.sha256(data).hexdigest()
    try:data.decode('utf-8');textual=b'\0' not in data
    except UnicodeDecodeError:textual=False
    if not textual and after!=before['sha256']:raise RuntimeError('Binary changed: '+source)
    files.append({'source':source,'destination':dest,'before_sha256':before['sha256'],
                  'after_sha256':after,'after_lf_sha256':hashlib.sha256(data.replace(b'\r\n',b'\n')).hexdigest() if textual else after,
                  'before_bytes':before['bytes'],'after_bytes':len(data),'text_utf8':textual,
                  'classification':'moved' if after==before['sha256'] else 'intentionally-transformed',
                  'reason':'directory rename only' if after==before['sha256'] else 'current path references, generated indexes/hashes or migration report updated; review Git diff'})
if len({e['destination'].casefold() for e in files})!=len(files):raise RuntimeError('Destination collision')
receipt={'schema_version':1,'baseline_commit':manifest['baseline_commit'],'source_count':len(files),
         'scope':'phase 1 directory prefix rename; thematic internal organization remains pending',
         'summary':{key:sum(e['classification']==key for e in files) for key in ['moved','intentionally-transformed']},'files':files}
(ROOT/'prototype/issue278-rename-receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'source_count':len(files),**receipt['summary']}))

from pathlib import Path
import re, json, sys
root=Path(__file__).resolve().parents[1]
errors=[]; warnings=[]
idx=(root/'index.html').read_text(encoding='utf-8')
# local script/css/src references
for attr,pattern in [('script',r'<script[^>]+src="([^"]+)"'),('css',r'<link[^>]+href="([^"]+\.css[^\"]*)"'),('img',r'<img[^>]+src="([^"]+)"')]:
    for ref in re.findall(pattern,idx):
        if ref.startswith(('http://','https://','data:')): continue
        p=root/ref.split('?')[0].lstrip('/')
        if not p.exists(): errors.append(f'missing {attr}: {ref}')
# canonical route
if '#profile' in idx: errors.append('obsolete #profile route remains in index')
if (root/'core/modules/runtime/auth-core.js').exists(): errors.append('duplicate auth-core file remains')
# SW references
sw=(root/'sw.js').read_text(encoding='utf-8')
for ref in re.findall(r"'([^']+)'",sw):
    if ref.startswith('/') and not ref.startswith('//'):
        p=root/ref.split('?')[0].lstrip('/')
        if not p.exists(): errors.append(f'SW missing shell asset: {ref}')
# static match data
idxd=json.loads((root/'data/matches/index.json').read_text())
mand=json.loads((root/'data/matches/manifest.json').read_text())
if idxd.get('version') not in ('1180','1197') or mand.get('version') not in ('1180','1197'): errors.append('match manifest version mismatch')
if idxd.get('totalMatches')!=mand.get('totalMatches'): errors.append('match totals mismatch')
if int(idxd.get('totalMatches') or 0) <= 0: errors.append('match data is empty: totalMatches must be > 0')
bridge=root/'core/modules/runtime/game-bridge.js'
if not bridge.exists(): errors.append('missing canonical Mini-Game Bridge')
else:
    bs=bridge.read_text(encoding='utf-8')
    for token in ('postMessage','zivo:game:ready','zivo:game:result','allowedOrigin'):
        if token not in bs: errors.append(f'game bridge missing protocol token: {token}')
for f in mand.get('days',[]):
    p=root/'data/matches'/f
    if not p.exists(): errors.append(f'missing match day {f}')
# syntax is delegated to node in runner
print('ZIVOZONE V1197 RELEASE QA')
print('local scripts checked:', len(re.findall(r'<script[^>]+src=',idx)))
print('match snapshots:', len(mand.get('days',[])), 'matches:', idxd.get('totalMatches'))
if warnings: print('WARN', *warnings, sep='\n- ')
if errors:
    print('FAIL')
    print('\n'.join('- '+e for e in errors))
    sys.exit(1)
print('PASS')

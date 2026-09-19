import json, pathlib, re, subprocess, sys
ROOT=pathlib.Path('/tmp/zivoqa')
passc=[]; warn=[]; fail=[]
def ok(x): passc.append(x)
def wa(x): warn.append(x)
def no(x): fail.append(x)
# JS syntax
for p in ROOT.rglob('*.js'):
    r=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
    if r.returncode: no(f'JS syntax: {p.relative_to(ROOT)}')
    else: ok(f'JS syntax: {p.relative_to(ROOT)}')
# registry
m=json.loads((ROOT/'games/manifest.json').read_text())
for g in m.get('games',[]):
    for k in ['gameId','room','type','enabled']:
        if k not in g: no(f'Registry missing {k}: {g}')
    if g.get('type')=='flash':
        if g.get('engine') not in ('ruffle','adapter'): no(f'Flash without compatibility engine: {g}')
        else: ok(f'SWF compatibility registry: {g["gameId"]}')
# match data
idx=json.loads((ROOT/'data/matches/index.json').read_text())
for f in idx.get('snapshots',[]):
    p=ROOT/'data/matches'/f
    if not p.exists(): no(f'Match snapshot missing: {f}'); continue
    d=json.loads(p.read_text())
    for x in d.get('matches',[]):
        if 'homeTeam' not in x or 'awayTeam' not in x: no(f'Match team fields missing: {f}')
        if 'homeScore' in x and 'awayScore' in x:
            ok(f'Match score schema: {f}')
# required modules
for rel in ['core/modules/runtime/game-bridge.js','core/modules/runtime/game-registry.js','core/modules/runtime/game-loader.js','core/modules/runtime/game-session.js','core/modules/runtime/game-validator.js','core/modules/runtime/game-platform.js','core/modules/forensic-case-core.js','core/modules/beauty-room.js','core/modules/challenges.js']:
    if (ROOT/rel).exists(): ok(f'Required module: {rel}')
    else: no(f'Required module missing: {rel}')
# one bridge/platform/registry heuristic
files=[str(p) for p in ROOT.rglob('*.js')]
text='\n'.join(pathlib.Path(p).read_text(errors='ignore') for p in files)
for pat,label in [(r'GameBridge\s*=','canonical GameBridge'),(r'GameRegistry\s*=','canonical GameRegistry')]:
    n=len(re.findall(pat,text))
    if n==1: ok(f'One {label}')
    else: no(f'{label} count={n}')
# protocol security
bridge=(ROOT/'core/modules/runtime/game-bridge.js').read_text()
for needle,label in [('e.source!==s.iframe?.contentWindow','iframe source validation'),('e.origin!==s.allowedOrigin','origin validation'),('d.sessionId','session validation'),("d.type==='zivo:game:result'",'result protocol')]:
    ok(label) if needle in bridge else no(label)
# economy direct wallet warning
rules=(ROOT/'firestore.rules').read_text()
if 'perfectClaim()' in rules and 'validatedSessionId is string' in rules: wa('Reward claim authenticity remains client-asserted; true anti-cheat requires trusted backend/attestation.')
# legacy flash plugin
runtime_text='\n'.join(p.read_text(errors='ignore') for p in [*ROOT.rglob('*.js'),*ROOT.rglob('*.html')])
legacy=re.findall(r'(?i)flash\.player|shockwave|activexobject', runtime_text)
if legacy: no('Legacy Flash runtime references remain')
else: ok('No Adobe/legacy Flash runtime references')
print(json.dumps({'pass':len(passc),'fail':len(fail),'warn':len(warn),'failures':fail[:20],'warnings':warn},ensure_ascii=False,indent=2))

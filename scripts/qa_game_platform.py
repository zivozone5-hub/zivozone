#!/usr/bin/env python3
"""Static functional-contract QA for the V1197.1 Unified Game Platform.
This complements browser/E2E tests; PASS here means the required contract exists and is internally consistent.
"""
from pathlib import Path
import json,re,sys
ROOT=Path(__file__).resolve().parents[1]
checks=[]
def check(name,ok,detail=''):
    checks.append((name,bool(ok),detail))

required=[
 'core/modules/runtime/game-registry.js','core/modules/runtime/game-session.js',
 'core/modules/runtime/game-validator.js','core/modules/runtime/game-telemetry.js',
 'core/modules/runtime/game-adapters.js','core/modules/runtime/game-loader.js',
 'core/modules/runtime/game-platform.js','core/modules/runtime/game-bridge.js',
 'games/manifest.json','firestore.rules']
for f in required: check(f, (ROOT/f).exists(), 'exists' if (ROOT/f).exists() else 'missing')

m=json.loads((ROOT/'games/manifest.json').read_text(encoding='utf8'))
games=m.get('games',[])
ids=[g.get('gameId') for g in games]
check('unique game ids',len(ids)==len(set(ids)),str(ids))
check('flash entries use ruffle',all(g.get('engine')!='flash' for g in games), 'Adobe Flash engine forbidden')
check('disabled missing flash asset is allowed',all(g.get('type')!='flash' or not g.get('enabled') or (ROOT/g.get('asset','').lstrip('/')).exists() for g in games))

html=(ROOT/'index.html').read_text(encoding='utf8')
# V1229.4: these modules used to each have their own <script src> tag; they now ship inside
# dist/app.bundle.js (see scripts/build_bundle.py). "Loaded" means either a literal tag OR the
# bundle is present AND was built from a manifest that includes the file.
bundle_path = ROOT / 'dist/app.bundle.js'
manifest_path = ROOT / 'scripts/bundle_manifest.txt'
manifest = set((manifest_path.read_text(encoding='utf8').splitlines() if manifest_path.exists() else []))
bundle_ok = bundle_path.exists() and 'dist/app.bundle.js' in html
for token in ['game-registry.js','game-session.js','game-validator.js','game-adapters.js','game-loader.js','game-bridge.js','game-platform.js']:
    in_tag = token in html
    in_bundle = bundle_ok and any(m.endswith('/' + token) or m.endswith(token) for m in manifest)
    check(f'index loads {token}', in_tag or in_bundle, 'not in a <script> tag and not in the bundle manifest' if not (in_tag or in_bundle) else '')

bridge=(ROOT/'core/modules/runtime/game-bridge.js').read_text(encoding='utf8')
for token in ['e.source!==s.iframe?.contentWindow','e.origin!==s.allowedOrigin','GameResultValidator.validate','zivo:game:result']:
    check(f'bridge contract {token}',token in bridge)

econ=(ROOT/'core/modules/economy.js').read_text(encoding='utf8')
for token in ['validatedResult','source: type === \'challenge_reward\' ? \'game-platform\'','validatedSessionId']:
    check(f'economy contract {token}',token in econ)

rules=(ROOT/'firestore.rules').read_text(encoding='utf8')
for token in ["request.resource.data.source == 'game-platform'","request.resource.data.validated == true","request.resource.data.validatedSessionId is string"]:
    check(f'firestore reward guard {token}',token in rules)

passed=sum(ok for _,ok,_ in checks)
print(f'QA checks: {passed}/{len(checks)} PASS')
for n,ok,d in checks:
    print(('PASS' if ok else 'FAIL').ljust(5), n, ('— '+d if d else ''))
sys.exit(0 if passed==len(checks) else 1)

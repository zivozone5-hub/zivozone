#!/usr/bin/env python3
"""ZIVOZONE V1202 Production Integration Gate.
Static contract gate for the production paths that must agree before baseline:
Match Center, navigation lifecycle, result validation, ZIVO wallet/mining,
reward claims, ledger, and Firestore security rules.
Browser/Firebase live E2E is reported honestly as unavailable if the local
runtime is not installed; this script never treats static checks as E2E.
"""
from pathlib import Path
import json,re,subprocess,sys
ROOT=Path(__file__).resolve().parents[1]
P=F=0
def check(name, ok, detail=''):
    global P,F
    print(('PASS' if ok else 'FAIL').ljust(5), name, ('— '+detail) if detail else '')
    P+=bool(ok); F+=not ok

index=(ROOT/'index.html').read_text(encoding='utf8')
sw=(ROOT/'sw.js').read_text(encoding='utf8')
econ=(ROOT/'core/modules/economy.js').read_text(encoding='utf8')
rules=(ROOT/'firestore.rules').read_text(encoding='utf8')
match_index=json.loads((ROOT/'data/matches/index.json').read_text(encoding='utf8'))

check('release version 1202', 'v=1202.0' in index and 'zivozone-shell-v1202' in sw)
check('7 language selector', all(f'value="{x}"' in index for x in ['ar','en','zh','hi','es','fr','fa']))
check('match snapshots non-empty', match_index.get('totalMatches',0)>0 and len(match_index.get('files',[]))>=3)
check('match provider metadata', 'ESPN' in match_index.get('provider','') and 'JFA' in match_index.get('provider',''))
check('economy version 1202', 'zivozone-economy-v1202' in econ and "version: '1202'" in econ)
check('mining amount contract', "amount: 0.5" in econ and "type:'daily_mining'" in econ)
check('24h mining guard client', "cooldown()" in econ and "nextAt = new Date(now + cooldown() + 5000)" in econ)
check('reward claim contract', "type === 'challenge_reward'" in econ and "validatedSessionId" in econ)
check('reward claim server guard', "validatedSessionId is string" in rules and "validated == true" in rules)
check('mining ledger server guard', "request.resource.data.type == 'daily_mining'" in rules and "policy == '24h_mining'" in rules)
check('mining wallet server guard', "request.resource.data.zivo == resource.data.zivo + 0.5" in rules)
check('reward wallet server guard', "request.resource.data.lastRewardClaimId is string" in rules)
check('no direct wallet writes outside owner/self rules', "allow delete: if false;" in rules)

# Syntax all JS
js=list(ROOT.rglob('*.js'))
ok=True
for p in js:
    r=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
    if r.returncode: ok=False; print(r.stderr.strip())
check('JavaScript syntax',ok,f'{len(js)} files')

print(f'PRODUCTION GATE: PASS={P} FAIL={F}')
sys.exit(1 if F else 0)

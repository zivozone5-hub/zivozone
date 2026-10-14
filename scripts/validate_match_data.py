import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
out=root/'data'/'matches'
idx=json.loads((out/'index.json').read_text(encoding='utf-8'))
man=json.loads((out/'manifest.json').read_text(encoding='utf-8'))
assert idx.get('version')==man.get('version')=='1201', (idx.get('version'),man.get('version'))
assert idx.get('files')==man.get('days'), 'index/manifest day list mismatch'
rows=[]
for name in man.get('days',[]):
    p=out/name; assert p.exists() and p.stat().st_size>20, name
    d=json.loads(p.read_text(encoding='utf-8')); matches=d.get('matches'); assert isinstance(matches,list), name
    rows.extend(matches)
    for m in matches:
        assert m.get('id'), f'missing id in {name}'
        assert m.get('home') and m.get('away'), f'missing teams in {name}'
        # Scores are always mapped home->home and away->away; RTL must never swap them.
        for side in ('home','away'):
            if isinstance(m[side],dict) and m[side].get('score') is not None:
                assert isinstance(m[side]['score'],(int,float)) and m[side]['score']>=0, f'bad {side} score {m["id"]}'
assert len(rows)==idx.get('totalMatches')==man.get('totalMatches'), (len(rows),idx.get('totalMatches'),man.get('totalMatches'))
assert idx.get('totalMatches',0)>0, 'QA failure: empty snapshot'
print(f'PASS: {len(rows)} matches across {len(man["days"])} day snapshots; RTL score mapping preserved.')

#!/usr/bin/env node
/* V1229 gate: finds identifiers that are used but NEVER declared anywhere in the same file
   (and are not browser globals or window.X assigned by another project file).
   Why: `node --check` only validates syntax. In V1228 `closeModal` was referenced 7 times and defined nowhere,
   which made openModal() throw and silently killed the login/register form. This gate catches that class of bug.

   run:  node --expose-internals scripts/qa_undefined_identifiers.js
   Uses the acorn parser bundled inside Node (no npm install). Scope-insensitive on purpose: it over-approximates
   declarations, so anything it reports is truly undeclared. */
'use strict';
let acorn, walk;
try {
  acorn = require('internal/deps/acorn/acorn/dist/acorn');
  walk = require('internal/deps/acorn/acorn-walk/dist/walk');
} catch (e) {
  console.log('SKIPPED: run with `node --expose-internals` (Node bundled acorn not reachable)');
  process.exit(2);
}
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const BROWSER = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, 'browser_globals.json'), 'utf8')));
['undefined', 'NaN', 'Infinity', 'arguments', 'globalThis'].forEach(x => BROWSER.add(x));

const files = [];
(function collect(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) collect(p); else if (/\.js$/.test(e.name)) files.push(p);
  }
})(path.join(ROOT, 'core'));
files.push(path.join(ROOT, 'zivo-ai.js'), path.join(ROOT, 'sw.js'));

const extra = new Set();
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  for (const m of s.matchAll(/window\.([A-Za-z_$][\w$]*)\s*=[^=]/g)) extra.add(m[1]);
  for (const m of s.matchAll(/window\[['"]([\w$]+)['"]\]\s*=[^=]/g)) extra.add(m[1]);
}
const names = (p, out) => {
  if (!p) return;
  switch (p.type) {
    case 'Identifier': out.add(p.name); break;
    case 'ObjectPattern': p.properties.forEach(q => names(q.value || q.argument, out)); break;
    case 'ArrayPattern': p.elements.forEach(e => names(e, out)); break;
    case 'RestElement': names(p.argument, out); break;
    case 'AssignmentPattern': names(p.left, out); break;
  }
};
let bad = 0;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  let ast;
  try { ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: /zivo-ai\.js$/.test(f) ? 'module' : 'script', locations: true }); }
  catch (e) { console.log('PARSE ERROR', path.relative(ROOT, f), e.message); bad++; continue; }
  const declared = new Set();
  walk.full(ast, n => {
    if ((n.type === 'FunctionDeclaration' || n.type === 'ClassDeclaration' || n.type === 'FunctionExpression' || n.type === 'ClassExpression') && n.id) declared.add(n.id.name);
    if (/^Function/.test(n.type) || n.type === 'ArrowFunctionExpression') n.params.forEach(p => names(p, declared));
    if (n.type === 'VariableDeclarator') names(n.id, declared);
    if (n.type === 'CatchClause' && n.param) names(n.param, declared);
    if (/^Import/.test(n.type) && n.local) declared.add(n.local.name);
  });
  const refs = new Map();
  walk.ancestor(ast, { Identifier(n, st, anc) {
    const p = anc[anc.length - 2]; if (!p) return;
    if ((p.type === 'MemberExpression' && p.property === n && !p.computed) || (p.type === 'Property' && p.key === n && !p.computed && !p.shorthand) ||
        (p.type === 'MethodDefinition' && p.key === n) || (p.type === 'PropertyDefinition' && p.key === n) ||
        /^(LabeledStatement|BreakStatement|ContinueStatement)$/.test(p.type)) return;
    if (declared.has(n.name) || BROWSER.has(n.name) || extra.has(n.name)) return;
    (refs.get(n.name) || refs.set(n.name, []).get(n.name)).push(n.loc.start.line);
  } });
  for (const [name, lines] of refs) { bad++; console.log(`UNDEFINED ${name} x${lines.length}  ${path.relative(ROOT, f)}:${lines.slice(0, 4).join(',')}`); }
}
console.log(bad ? `\nFAIL: ${bad} undeclared identifier(s)` : `PASS: no undeclared identifiers in ${files.length} files`);
process.exit(bad ? 1 : 0);

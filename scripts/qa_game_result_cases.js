const fs = require('fs');
const vm = require('vm');
const src = fs.readFileSync('core/modules/runtime/game-validator.js','utf8');
const events = [];
const context = {
  window: {
    ZIVOZONE: {},
    dispatchEvent: e => events.push(e)
  },
  CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } }
};
vm.createContext(context);
vm.runInContext(src, context);
const V = context.window.ZIVOZONE.GameResultValidator;
const game = {gameId:'qa-game', room:'puzzle', version:'1.0.0'};
const base = {sessionId:'s1', gameId:'qa-game', room:'puzzle', score:10, correct:10, total:10, duration:1000, completed:true, timedOut:false, version:'1.0.0'};
const session = {sessionId:'s1'};
let pass=0, fail=0;
function expectReject(name, fn){try{fn(); console.error('FAIL',name); fail++;}catch{console.log('PASS',name); pass++;}}
function expectPass(name, fn){try{fn(); console.log('PASS',name); pass++;}catch(e){console.error('FAIL',name,e.message); fail++;}}
expectPass('valid result accepted', ()=>V.validate(base,session,game));
expectReject('duplicate result rejected', ()=>V.validate(base,session,game));
V.forget('s1');
expectReject('NaN score rejected', ()=>V.validate({...base,score:NaN,sessionId:'s2'}, {...session,sessionId:'s2'}, game));
V.forget('s2');
expectReject('Infinity duration rejected', ()=>V.validate({...base,duration:Infinity,sessionId:'s3'}, {...session,sessionId:'s3'}, game));
V.forget('s3');
expectReject('negative score rejected', ()=>V.validate({...base,score:-1,sessionId:'s4'}, {...session,sessionId:'s4'}, game));
V.forget('s4');
expectReject('wrong game rejected', ()=>V.validate({...base,gameId:'other',sessionId:'s5'}, {...session,sessionId:'s5'}, game));
V.forget('s5');
expectReject('timeout+completed rejected', ()=>V.validate({...base,timedOut:true,sessionId:'s6'}, {...session,sessionId:'s6'}, game));
console.log(`RESULT pass=${pass} fail=${fail}`);
process.exitCode = fail ? 1 : 0;

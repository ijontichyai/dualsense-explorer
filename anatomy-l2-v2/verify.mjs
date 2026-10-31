import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import * as k from './kit/iso-kit.mjs';import * as G from './kit/lathe.mjs';import * as A from './kit/audit.mjs';
import {makeScene} from './scene.mjs';import {model,PERIOD,toe} from './model.mjs';
const HERE=fileURLToPath(new URL('.',import.meta.url));
const html=readFileSync(HERE+'../anatomy-l2-v2.html','utf8'),code=html.match(/<script>([\s\S]*)<\/script>/)[1];
new vm.Script(code);const prefix=code.slice(0,code.indexOf("(()=>{'use strict';"));
const context=vm.createContext({console});vm.runInContext(prefix+';this.testScene=makeScene(k,G).scene;this.testModel=model;',context);
assert.equal(context.testScene(context.testModel(0)).items.length,93);
assert(!/<script[^>]*src=|<link[^>]*href=/.test(html));
const scene=makeScene(k,G,A).scene,rest=scene(model(0));A.settle(rest.R,rest.P);rest.R.items.sort((a,b)=>a.key-b.key);
const order=new Map(rest.R.items.map((it,i)=>[it.name,i]));
let fail=0;const logs=['Node syntax and inlined original kit: PASS','Standalone external dependency check: PASS','93 real recorded solids; shared geometry in build and runtime.'];
for(let t=0;t<=PERIOD;t+=.5){
 const state=model(t),pose=scene(state);for(const it of pose.R.items)it.key=order.get(it.name);
 const result=A.audit(pose.R,pose.P);const report=A.report(result);const bad=A.failures(result)>0;
 if(bad){fail++;logs.push('t='+t+'\n'+report);console.log('FAIL',t,report);}else console.log('pose',t,'PASS');
}
for(let t=0;t<24;t+=.01){const s=model(t);assert(s.trigger>=0&&s.trigger<=14);assert(Math.abs(s.motor+20*s.wheel)<1e-8);assert(Math.abs(model(t+24).trigger-s.trigger)<1e-8);}
const s=model(16),p=toe(s),a=s.arm*Math.PI/180;assert(Math.hypot(p[0]-(33+36.33450651595567*Math.cos(a)),p[2]-(58+36.33450651595567*Math.sin(a)))<1e-8);
logs.push('Kinematics, periodicity, 20:1 relation, contact point: PASS','49 sampled poses at 0.5 s: '+(fail?'FAIL ('+fail+')':'PASS'),'Browser capture and lines: NOT RUN — no Chrome binary; browser download blocked/truncated.','Safari/iPad hardware: not available in this environment.');
writeFileSync(HERE+'VALIDATION.txt',logs.join('\n')+'\n');if(fail)process.exitCode=1;

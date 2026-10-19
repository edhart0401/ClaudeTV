import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {nextFocus} from '../compat/navigation.js';
test('only requested streaming services are present, using actual TV IDs',async()=>{
 const apps=JSON.parse(await readFile('compat/shortcuts.json','utf8'));
 assert.deepEqual(apps.map(a=>a.id),['netflix','lovefilm','bbc.iplayer.3.0','youtube.leanback.v4','com.disney.disneyplus-prod','space.nuvio.native.legacy']);
});
test('remote reaches every service, PS4 and both corner controls',()=>{
 const seen=new Set([2]),queue=[2];
 while(queue.length){const i=queue.shift();for(const key of ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight']){const n=nextFocus(i,key);assert.ok(n>=0&&n<=8);if(!seen.has(n)){seen.add(n);queue.push(n);}}}
 assert.equal(seen.size,9);
 assert.equal(nextFocus(4,'ArrowRight'),8);
 assert.equal(nextFocus(7,'ArrowRight'),8);
 assert.equal(nextFocus(8,'ArrowUp'),1);
 assert.equal(nextFocus(2,'ArrowUp'),0);
});
test('packaged Art Deco background resolves relative to the CSS file',async()=>{
 const {readdir}=await import('node:fs/promises');
 const {resolve,dirname}=await import('node:path');
 const cssName=(await readdir('dist-legacy/assets')).find(n=>n.endsWith('.css'));
 const cssFile=resolve('dist-legacy/assets',cssName);
 const css=await readFile(cssFile,'utf8');
 const match=css.match(/url\(['"]?([^)'" ]*art-deco\.svg)['"]?\)/);
 assert.ok(match,'Background must be included in packaged stylesheet');
 const svg=await readFile(resolve(dirname(cssFile),match[1]),'utf8');
 assert.match(svg,/<pattern/);
});

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
test('clock formatting works on Chrome 38 without String.padStart',async()=>{
 const {clockParts}=await import('../compat/navigation.js');
 assert.deepEqual(clockParts(0,7),['00','07']);
 assert.deepEqual(clockParts(23,59),['23','59']);
});

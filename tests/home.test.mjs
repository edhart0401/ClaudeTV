import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('only requested streaming services are present, using actual TV IDs',async()=>{
 const apps=JSON.parse(await readFile('compat/shortcuts.json','utf8'));
 assert.deepEqual(apps.map(a=>a.id),['netflix','lovefilm','bbc.iplayer.3.0','youtube.leanback.v4','com.disney.disneyplus-prod','space.nuvio.native.legacy']);
});
test('packaged Art Deco background resolves relative to the CSS file',async()=>{
 const {readdir}=await import('node:fs/promises');
 const {resolve,dirname}=await import('node:path');
 const cssName=(await readdir('dist-legacy/assets')).find(n=>n.endsWith('.css'));
 const cssFile=resolve('dist-legacy/assets',cssName);
 const css=await readFile(cssFile,'utf8');
 const match=css.match(/url\(['"]?([^)'" ]*art-deco-reference\.webp)['"]?\)/);
 assert.ok(match,'Background must be included in packaged stylesheet');
 const actual=await readFile(resolve(dirname(cssFile),match[1]));
 assert.deepEqual(actual,await readFile('public/backgrounds/art-deco-reference.webp'));
});
test('all supplied logos are packaged byte-for-byte',async()=>{
 for(const file of ['Netflix.jpg','Prime.jpg','BBC.png','Youtube.png','Disney.webp','Nuvio.png','PS4.jpg']){
  assert.deepEqual(await readFile('dist-legacy/logos/'+file),await readFile('public/logos/'+file));
 }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('only requested streaming services are present, using actual TV IDs',async()=>{
 const apps=JSON.parse(await readFile('compat/shortcuts.json','utf8'));
 assert.deepEqual(apps.map(a=>a.id),['netflix','lovefilm','bbc.iplayer.3.0','youtube.leanback.v4','com.disney.disneyplus-prod','space.nuvio.native.legacy']);
});
test('all supplied logos are packaged byte-for-byte',async()=>{
 for(const file of ['Netflix.jpg','Prime.jpg','BBC.png','Youtube.png','Disney.webp','Nuvio.png','PS4.jpg']){
  assert.deepEqual(await readFile('dist-legacy/logos/'+file),await readFile('public/logos/'+file));
 }
});

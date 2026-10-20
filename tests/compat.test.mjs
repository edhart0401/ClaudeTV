import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {parse} from 'acorn';
import {build} from 'esbuild';
async function loadModule(entry) {
 const result=await build({entryPoints:[entry],bundle:true,write:false,platform:'node',format:'esm'});
 return import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
}
test('legacy artifact is ES5, classic-script and standalone with no root provider',async()=>{
 const script=await readFile('dist-legacy/assets/app.js','utf8');
 assert.doesNotThrow(()=>parse(script,{ecmaVersion:5}));
 const html=await readFile('dist-legacy/index.html','utf8');
 const awaitedPolyfills=await readFile('dist-legacy/assets/polyfills.js','utf8');
 assert.doesNotMatch(html,/type="module"/);
 assert.ok(html.indexOf('polyfills.js') >= 0 && html.indexOf('polyfills.js') < html.indexOf('assets/app.js'));
 assert.doesNotThrow(()=>parse(awaitedPolyfills,{ecmaVersion:5}));
 assert.doesNotMatch(script,/org\.webosbrew\.hbchannel\.service|listLaunchPoints|getAppLoadStatus/);
 const app=JSON.parse(await readFile('dist-legacy/appinfo.json','utf8'));
 assert.equal(app.id,'dev.ed.partridge.launcher');
 assert.equal(app.type,'web');
 assert.equal(app.main,'index.html');
});
test('legacy CSS resolves tokens and replaces grid without variable font',async()=>{
 const names=await readdir('dist-legacy/assets');
 const css=(await Promise.all(names.filter(n=>n.endsWith('.css')).map(n=>readFile('dist-legacy/assets/'+n,'utf8')))).join('');
 assert.doesNotMatch(css,/var\(--|display:\s*grid|@font-face/);
 assert.match(css,/flex-wrap:\s*wrap/);
 assert.match(css,/1920px/);
});
test('explicit shortcuts work without any installed-app API',async()=>{
 const {listApps}=await loadModule('compat/apps.js');
 const result=await listApps(false);
 assert.ok(result.apps.some(a=>a.id==='space.nuvio.native.legacy'));
 assert.equal(result.source,'catalog');
 assert.equal(new Set(result.apps.map(a=>a.id)).size,result.apps.length);
});
test('webOS 3 activate field and API-provided input IDs survive normalization',async()=>{
 const {normalizeInputs}=await loadModule('compat/inputs.js');
 const inputs=normalizeInputs({devices:[{id:'AV_1',appId:'com.webos.app.externalinput.av1',label:'AV',port:1,activate:false},{id:'HDMI_2',appId:'com.webos.app.hdmi2',label:'Console',port:2,activate:true}]});
 assert.equal(inputs[0].appId,'com.webos.app.livetv');
 assert.equal(inputs[1].appId,'com.webos.app.externalinput.av1');
 assert.equal(inputs[1].connected,false);
 assert.equal(inputs[2].connected,true);
 assert.throws(()=>normalizeInputs({returnValue:true}),/devices array/);
});
test('shortcuts initialize when Object.getOwnPropertyDescriptors is absent (Chrome 38 regression)',async()=>{
 const {createContext,runInContext}=await import('node:vm');
 const {transformAsync}=await import('@babel/core');
 const bundle=await build({stdin:{contents:"import {listApps} from './compat/apps.js'; listApps().then(r=>window.apps=r.apps)",resolveDir:process.cwd()},bundle:true,write:false,format:'iife',target:'es2015'});
 const legacy=await transformAsync(bundle.outputFiles[0].text,{babelrc:false,configFile:false,presets:[['@babel/preset-env',{targets:{chrome:'38'},modules:false}]]});
 const context=createContext({window:{},setTimeout,clearTimeout});
 runInContext('Object.getOwnPropertyDescriptors=undefined;String.prototype.endsWith=undefined;Object.assign=undefined;',context);
 runInContext(await readFile('dist-legacy/assets/polyfills.js','utf8'),context);
 runInContext(legacy.code,context);
 await new Promise(resolve=>setTimeout(resolve,0));
 assert.ok(context.window.apps.some(a=>a.id==='space.nuvio.native.legacy'));
});
test('legacy exit closes only this app instead of launching a nonexistent LG Home ID',async()=>{
 const previous=globalThis.window;
 let closed=false;
 globalThis.window={close:()=>{closed=true}};
 try {
  const {launchLgHome}=await loadModule('compat/launch.js');
  await launchLgHome();
  assert.equal(closed,true);
 } finally {globalThis.window=previous;}
});

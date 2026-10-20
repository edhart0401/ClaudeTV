import {build} from 'vite';
import {build as bundleJavaScript} from 'esbuild';
import preact from '@preact/preset-vite';
import {transformAsync} from '@babel/core';
import postcss from 'postcss';
import customProperties from 'postcss-custom-properties';
import autoprefixer from 'autoprefixer';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {COLOR,FONT,LAYOUT,MOTION} from '../src/theme/tokens.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const groups={color:COLOR,font:FONT,layout:LAYOUT,motion:MOTION};
let variables=':root {';
for(const [group,values] of Object.entries(groups)) for(const [key,value] of Object.entries(values)) {
 const unit=typeof value==='number' && !/scale|opacity|columns/i.test(key) ? key.endsWith('Ms')?'ms':'px' : '';
 variables+=`--${group}-${key.replace(/([A-Z])/g,'-$1').toLowerCase()}:${value}${unit};`;
}
variables+='}';
const css=await readFile(path.join(root,'src/theme/global.css'),'utf8');
const legacyCss=css.replace(/@font-face\s*\{[^}]*\}/g,'');
const fallback=await readFile(path.join(root,'compat/legacy.css'),'utf8');
await mkdir(path.join(root,'compat/generated'),{recursive:true});
const processed=await postcss([customProperties({preserve:false}),autoprefixer({overrideBrowserslist:['Chrome 38']})]).process(variables+legacyCss+fallback,{from:undefined});
processed.root.walkDecls(decl => { if(decl.prop.startsWith('--') || decl.prop.startsWith('grid-') || (decl.prop === 'display' && decl.value === 'grid')) decl.remove(); });
await writeFile(path.join(root,'compat/generated/style.css'),processed.root.toString());
const shortcuts=JSON.parse(await readFile(path.join(root,'compat/shortcuts.json'),'utf8'));
if(!shortcuts.length || shortcuts.some(a=>!a.id||!a.title)||new Set(shortcuts.map(a=>a.id)).size!==shortcuts.length) throw new Error('Shortcuts require unique IDs and nonempty titles');
await build({root,configFile:false,base:'./',plugins:[
 {name:'legacy-adapters',enforce:'pre',resolveId(source,importer){
  if(!importer)return;
  const resolved=path.resolve(path.dirname(importer),source);
  if(resolved===path.join(root,'src/lib/apps'))return path.join(root,'compat/apps.js');
  if(resolved===path.join(root,'src/lib/launch'))return path.join(root,'compat/launch.js');
  if(resolved===path.join(root,'src/lib/inputs'))return path.join(root,'compat/inputs.js');
 },transform(code,id){
  if(id===path.join(root,'src/main.tsx')) return "import '../compat/home.jsx';";
  if(id===path.join(root,'src/config/catalog.ts')) return code.replace('local.DEFAULT_APP_IDS || BASE_DEFAULT_APP_IDS',JSON.stringify(shortcuts.map(a=>a.id)));
  // Keep upstream TS read-only; remove the root-only option in this build.
  if(id===path.join(root,'src/app.tsx')) {
   code=code.replace("label: 'LG Home'", "label: 'Exit launcher'").replace("Couldn't open LG Home","Couldn't exit launcher");
   const start=code.indexOf('const options: OptionItem[] = useMemo('),end=code.indexOf('// ----- actions -----',start);
   if(start<0||end<0)throw new Error('Upstream options changed: review compatibility transform');
   return code.slice(0,start)+'const options: OptionItem[] = [];\n\n'+code.slice(end);
  }
 }},preact(),
 {name:'classic-entry',transformIndexHtml:{order:'post',handler:html=>html.replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/g,'<script defer src="$1"></script>').replace(/<link rel="stylesheet" crossorigin /g,'<link rel="stylesheet" ')}},
 {name:'legacy-javascript',enforce:'post',async generateBundle(options,bundle){for(const item of Object.values(bundle))if(item.type==='chunk'){
  const result=await transformAsync(item.code,{babelrc:false,configFile:false,sourceType:'script',presets:[['@babel/preset-env',{targets:{chrome:'38'},modules:false}]],comments:false,compact:true});item.code=result.code;
 }}}
],build:{outDir:'dist-legacy',cssCodeSplit:false,target:'es2015',minify:false,modulePreload:false,rollupOptions:{output:{format:'iife',inlineDynamicImports:true,entryFileNames:'assets/app.js'}}}});
const appinfo=JSON.parse(await readFile(path.join(root,'public/appinfo.json'),'utf8'));
Object.assign(appinfo,{id:'dev.ed.partridge.launcher',version:'0.9.2',title:'Ed’s Launcher'});
await writeFile(path.join(root,'dist-legacy/appinfo.json'),JSON.stringify(appinfo,null,2));

// Run polyfills in a preceding script: esbuild captures Object APIs before imports initialize.
const polyfillBundle=await bundleJavaScript({entryPoints:[path.join(root,'compat/polyfills.js')],bundle:true,write:false,format:'iife',target:'es2015'});
const polyfills=await transformAsync(polyfillBundle.outputFiles[0].text,{babelrc:false,configFile:false,presets:[['@babel/preset-env',{targets:{chrome:'38'},modules:false}]],comments:false,compact:true});
await writeFile(path.join(root,'dist-legacy/assets/polyfills.js'),polyfills.code);
const html=await readFile(path.join(root,'dist-legacy/index.html'),'utf8');
await writeFile(path.join(root,'dist-legacy/index.html'),html.replace('<script defer', '<script defer src="./assets/polyfills.js"></script>\n    <script defer'));

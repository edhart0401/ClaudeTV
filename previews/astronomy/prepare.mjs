import {readFile,writeFile,cp,mkdir} from 'node:fs/promises';
await mkdir('dist-legacy/astronomy',{recursive:true});
await cp('previews/astronomy/assets','dist-legacy/astronomy/assets',{recursive:true});
await cp('previews/astronomy/preview.js','dist-legacy/astronomy/preview.js');
let html=await readFile('dist-legacy/index.html','utf8');
html=html.replace('</body>','<script src="astronomy/preview.js"></script></body>');
await writeFile('dist-legacy/astronomy.html',html);

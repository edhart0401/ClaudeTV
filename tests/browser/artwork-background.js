// Run with Playwright MCP browser_run_code_unsafe(filename=absolute path).
async page=>{
 await page.goto('http://127.0.0.1:8766');
 await page.waitForFunction(()=>document.activeElement.getAttribute('aria-label')==='Open Netflix');
 if(await page.locator('#selected-app,.spotlight-art').count())throw Error('Central tile must be absent');
 if(await page.getByRole('button').count()!==9)throw Error('Expected seven apps and two utilities');
 const slow=await page.addStyleTag({content:'.app-backdrop{transition-duration:2s!important}'});
 await page.keyboard.press('ArrowRight');await page.waitForTimeout(180);
 const opacity=await page.locator('.app-backdrop.active').evaluate(e=>Number(getComputedStyle(e).opacity));
 if(!(opacity>0&&opacity<1))throw Error('Background must crossfade');
 const fields=await page.locator('.app-backdrop').evaluateAll(es=>es.map(e=>{const s=getComputedStyle(e);return{image:s.backgroundImage,size:s.backgroundSize,repeat:s.backgroundRepeat,mask:s.maskImage,blend:s.mixBlendMode}}));
 if(new Set(fields.map(f=>f.image)).size!==7||fields.some(f=>f.size!=='contain'||f.repeat!=='no-repeat'||f.mask!=='none'||f.blend!=='normal'))throw Error('Expected seven plain centred, non-repeating original images');
 for(let i=0;i<23;i++)await page.keyboard.press('ArrowRight');
 await page.getByRole('button',{name:'Open YouTube',exact:true}).waitFor();
 await page.keyboard.press('Enter');await page.getByRole('status').filter({hasText:'YouTube would open'}).waitFor();
 await slow.evaluate(e=>e.remove());await page.emulateMedia({reducedMotion:'reduce'});
 const reduced=await page.locator('.app-backdrop.active').evaluate(e=>getComputedStyle(e).transitionDuration);
 await page.emulateMedia({reducedMotion:'no-preference'});
 if(reduced!=='0s')throw Error('Reduced motion must disable fade');
 return{backgrounds:7,noCentralTile:true,crossfade:true,rapidInput:true,launch:true,reducedMotion:true};
}

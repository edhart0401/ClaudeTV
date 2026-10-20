// Run with Playwright MCP browser_run_code_unsafe(filename=absolute path).
async page=>{
 await page.goto('http://127.0.0.1:8766');
 await page.getByRole('button',{name:'Open Netflix',exact:true}).waitFor();
 await page.waitForFunction(()=>document.activeElement.id==='selected-app');
 const plate=await page.locator('#selected-app').evaluate(e=>({shadow:getComputedStyle(e).boxShadow,border:getComputedStyle(e,':after').borderStyle}));
 if(plate.shadow!=='none'||plate.border!=='none')throw Error('Selected artwork must have no card frame');
 const fade=await page.locator('.spotlight-art').first().evaluate(e=>getComputedStyle(e).transitionDuration);
 if(fade==='0s')throw Error('Remote selection must crossfade foreground artwork too');
 // Slow only the test's animation clock so screenshot/CI load cannot skip its sample.
 const slowMotion=await page.addStyleTag({content:'.app-backdrop,.spotlight-art{transition-duration:2s!important}'});
 await page.keyboard.press('ArrowRight');
 await page.getByRole('button',{name:'Open Prime Video',exact:true}).waitFor();
 await page.waitForTimeout(180);
 const opacity=await page.locator('.app-backdrop.active').evaluate(e=>Number(getComputedStyle(e).opacity));
 if(!(opacity>0&&opacity<.72))throw Error('Background must crossfade through intermediate opacity');
 for(let i=0;i<23;i++)await page.keyboard.press('ArrowRight');
 await page.getByRole('button',{name:'Open YouTube',exact:true}).waitFor();
 const sources=await page.locator('.backdrop-surface').evaluateAll(es=>es.map(e=>getComputedStyle(e).backgroundImage));
 if(new Set(sources).size!==7)throw Error('Each app needs its own background');
 for(const source of sources)await page.evaluate(async src=>{const image=new Image();image.src=src.slice(5,-2);await image.decode()},source);
 await slowMotion.evaluate(e=>e.remove());
 await page.emulateMedia({reducedMotion:'reduce'});
 const reduced=await page.locator('.app-backdrop.active').evaluate(e=>getComputedStyle(e).transitionDuration);
 await page.emulateMedia({reducedMotion:'no-preference'});
 if(reduced!=='0s')throw Error('Reduced motion must disable crossfade');
 return {intermediateOpacity:opacity,uniqueBackgrounds:7,rapidInput:'passed',reducedMotion:'passed'};
}

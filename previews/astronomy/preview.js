(function(){
 const variants=[
  {id:'night-sky',name:'Night sky',blur:1.2,opacity:.72,url:'https://www.eso.org/public/images/potw1938a/',credit:'ESO/P. Horálek'},
  {id:'deep-field',name:'Hubble Ultra Deep Field',blur:.6,opacity:.8,url:'https://esahubble.org/images/heic0406a/',credit:'NASA, ESA, S. Beckwith (STScI) and the HUDF Team'},
  {id:'nebula',name:'Pillars of Creation',blur:6,opacity:.65,url:'https://esahubble.org/images/heic1501a/',credit:'NASA, ESA/Hubble and the Hubble Heritage Team'}
 ];
 const style=document.createElement('style');style.textContent=`
 .ambient-texture{left:-20px;top:-20px;width:1960px;height:1120px;background-position:center;background-size:cover;}
 .ambient-base{background:#080e1b;}
 .ambient-light.active{opacity:.26;}
 .astronomy-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,10,22,.18),rgba(5,10,22,.05) 45%,rgba(5,10,22,.72));pointer-events:none;}
 .preview-label{visibility:hidden;}
 .astronomy-tools{position:fixed;top:18px;left:50%;transform:translateX(-50%);z-index:10;display:flex;gap:6px;padding:6px;border-radius:12px;background:#101722;box-shadow:0 8px 30px #0008;}
 .astronomy-tools button{border:1px solid #536075;border-radius:8px;padding:9px 14px;background:#1c2839;color:#f7f4ed;font:14px Arial;cursor:pointer;}
 .astronomy-tools button[aria-pressed=true]{border-color:#c9ac79;background:#3b3540;}
 .astronomy-credit{position:fixed;bottom:12px;left:0;right:0;text-align:center;color:#b9c2d0;font:12px Arial;text-decoration:none;}
 `;document.head.appendChild(style);
 const ready=setInterval(()=>{const texture=document.querySelector('.ambient-texture');if(!texture)return;clearInterval(ready);
 const shade=document.createElement('div');shade.className='astronomy-shade';texture.after(shade);
 const tools=document.createElement('div');tools.className='astronomy-tools';tools.setAttribute('role','group');tools.setAttribute('aria-label','Background previews');
 const credit=document.createElement('a');credit.className='astronomy-credit';credit.target='_blank';credit.rel='noopener';
 function choose(id){const v=variants.find(v=>v.id===id)||variants[0];texture.style.backgroundImage='url("astronomy/assets/'+v.id+'.jpg")';texture.style.filter='blur('+v.blur+'px)';texture.style.opacity=v.opacity;credit.textContent=v.name+' · '+v.credit;credit.href=v.url;tools.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===v.id)));history.replaceState(null,'','?background='+v.id+(location.search.includes('clean=1')?'&clean=1':''));}
 variants.forEach(v=>{const b=document.createElement('button');b.textContent=v.name;b.dataset.id=v.id;b.onclick=()=>choose(v.id);tools.appendChild(b)});
 if(!location.search.includes('clean=1')){document.body.appendChild(tools);document.body.appendChild(credit)}
 choose(new URLSearchParams(location.search).get('background'));
 },20);
})();

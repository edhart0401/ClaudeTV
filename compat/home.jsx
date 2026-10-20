import {render} from 'preact';
import {useEffect,useRef,useState} from 'preact/hooks';
import {services,navigate} from './home-model.js';
import {launchApp,launchLgHome} from './launch.js';
import './generated/style.css';
function Icon({exit=false}){
 return <svg viewBox="0 0 24 24" aria-hidden="true">{exit?<path d="M10 4H4v16h6M9 12h12m-5-5 5 5-5 5"/>:<g><path d="m9 3 6 0 1 3 3 1 3 3-2 3v4l-4 1-2 3h-4l-2-3-4-1v-4l-2-3 3-3 3-1Z"/><circle cx="12" cy="12" r="3"/></g>}</svg>;
}
function Art({app,large=false}){
 return <span class={'service-art brand-'+app.brand+(large?' art-large':'')}><img src={app.artwork} alt="" draggable={false}/></span>;
}
function Home(){
 const [state,setState]=useState({active:0,focus:2});
 const stateRef=useRef(state),refs=useRef([]),pending=useRef(false),noticeTimer=useRef(null);
 const [notice,setNotice]=useState(''),[loading,setLoading]=useState(false),[pointer,setPointer]=useState(false);
 const television=typeof window.PalmServiceBridge==='function';
 const app=services[state.active];
 function commit(next,focusDom=false){
  stateRef.current=next;setState(next);
  if(focusDom&&refs.current[next.focus])refs.current[next.focus].focus();
 }
 function message(text){clearTimeout(noticeTimer.current);setNotice(text);noticeTimer.current=setTimeout(()=>setNotice(''),3500);}
 function select(index,focus=2){commit({active:index,focus});}
 function activate(focus=stateRef.current.focus){
  if(pending.current)return;
  const current=services[stateRef.current.active];
  if(!television){message(focus===0?'TV settings would open here.':focus===1?'The launcher would close here.':current.title+' would open on the TV.');return;}
  if(focus===1){launchLgHome();return;}
  const id=focus===0?'com.palm.app.settings':current.id;
  pending.current=true;setLoading(true);setNotice('');
  launchApp(id).catch(()=>message('Couldn’t open '+(focus===0?'Settings':current.title)+'. Press OK to try again.')).then(()=>{pending.current=false;setLoading(false);});
 }
 useEffect(()=>{
  refs.current[2].focus();
  function fit(){var el=document.querySelector('.spotlight-home');var scale=Math.min(window.innerWidth/1920,window.innerHeight/1080);el.style.transform='scale('+scale+')';el.style.left=((window.innerWidth-1920*scale)/2)+'px';el.style.top=((window.innerHeight-1080*scale)/2)+'px';}
  fit();window.addEventListener('resize',fit);
  function onKey(event){
   const key=event.key||({37:'ArrowLeft',38:'ArrowUp',39:'ArrowRight',40:'ArrowDown',13:'Enter',461:'Back'}[event.keyCode]);
   if(/^Arrow/.test(key)){event.preventDefault();setPointer(false);commit(navigate(stateRef.current,key),true);}
   else if(key==='Enter'||key===' '){event.preventDefault();activate();}
   else if(key==='Back'||event.keyCode===461){event.preventDefault();activate(1);}
  }
  window.addEventListener('keydown',onKey);
  return()=>{window.removeEventListener('keydown',onKey);window.removeEventListener('resize',fit);clearTimeout(noticeTimer.current);};
 },[]);
 function bind(focus){return {ref:el=>{refs.current[focus]=el;},onFocus:()=>commit({...stateRef.current,focus}),onMouseDown:()=>setPointer(true),tabIndex:focus<3||focus===state.active+3?0:-1};}
 return <main class={'spotlight-home'+(pointer?' pointer-mode':'')+(app.brand==='youtube'?' light-background':'')}>
  <div class="ambient-base" aria-hidden="true"/>
  {services.map((service,i)=><div key={service.id} class={'app-backdrop brand-'+service.brand+(state.active===i?' active':'')} aria-hidden="true"/>)}
  <header class="spotlight-utilities">
   <button class="corner-action" aria-label="Settings" {...bind(0)} onClick={()=>activate(0)}><Icon/></button>
   {!television&&<span class="preview-label">Local preview</span>}
   <button class="corner-action" aria-label="Exit launcher" {...bind(1)} onClick={()=>activate(1)}><Icon exit/></button>
  </header>
  <section id="selected-app-panel" class="spotlight-stage" role="tabpanel" aria-label="Selected app">
   <button id="selected-app" class={'selected-service'+(state.focus===2?' has-focus':'')} aria-label={'Open '+app.title} aria-busy={loading?'true':'false'} {...bind(2)} onClick={()=>activate(2)}>
    {services.map((service,i)=><span key={service.id} class={'spotlight-art hero-'+service.brand+(state.active===i?' active':'')} aria-hidden="true"><Art app={service} large/></span>)}
    {loading&&<span class="opening-state">Opening…</span>}
   </button>
  </section>
  <nav class="app-strip" aria-label="Choose an app"><div class="app-strip-track" role="tablist" aria-label="Apps">
   {services.map((service,i)=><button key={service.id} class={'app-choice'+(state.active===i?' chosen':'')} role="tab" aria-label={service.title} aria-selected={state.active===i?'true':'false'} aria-controls="selected-app-panel" {...bind(i+3)} onFocus={()=>select(i,i+3)} onClick={()=>{setPointer(true);select(i,i+3);}}><Art app={service}/><span class="selection-line" aria-hidden="true"/></button>)}
  </div></nav>
  <div class={'home-notice'+(notice?' visible':'')} role="status" aria-live="polite">{notice}</div>
 </main>;
}
render(<Home/>,document.getElementById('root'));

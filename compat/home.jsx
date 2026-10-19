import {render} from 'preact';
import {useEffect,useRef,useState} from 'preact/hooks';
import shortcuts from './shortcuts.json';
import {nextFocus,clockParts} from './navigation.js';
import {launchApp,launchLgHome} from './launch.js';
import './generated/style.css';
function Mark({brand}){
 if(brand==='netflix')return <span class="mark netflix-mark">NETFLIX</span>;
 if(brand==='prime')return <span class="mark prime-mark">prime video<svg viewBox="0 0 240 35"><path d="M25 5 Q120 45 211 7 M198 5 L215 5 L211 21"/></svg></span>;
 if(brand==='iplayer')return <span class="mark iplayer-mark"><span class="bbc-boxes"><b>B</b><b>B</b><b>C</b></span><span>iPlayer</span></span>;
 if(brand==='youtube')return <span class="mark youtube-mark"><svg viewBox="0 0 80 56"><rect width="80" height="56" rx="15" fill="#ff3047"/><path d="M33 14 L55 28 L33 42Z" fill="white"/></svg>YouTube</span>;
 if(brand==='disney')return <span class="mark disney-mark"><svg viewBox="0 0 260 60"><path d="M15 50 Q115 -18 223 34"/></svg>Disney<span class="disney-plus">+</span></span>;
 return <span class="mark nuvio-mark"><span class="nuvio-symbol">n</span>nuvio</span>;
}
function Controller(){return <svg class="controller" viewBox="0 0 320 230" aria-hidden="true"><defs><linearGradient id="pad" x2="0" y2="1"><stop stop-color="#546e9d"/><stop offset="1" stop-color="#182940"/></linearGradient></defs><path d="M82 66 Q160 39 238 66 Q269 80 285 172 Q291 209 263 206 Q248 204 226 163 L94 163 Q72 204 57 206 Q28 209 35 172 Q49 80 82 66Z" fill="url(#pad)" stroke="#8099bf" stroke-width="2"/><rect x="119" y="66" width="82" height="52" rx="8" fill="#142236" stroke="#6f86a6"/><path d="M68 95 H84 V80 H99 V95 H114 V110 H99 V125 H84 V110 H68Z" fill="#0b1526"/><circle cx="115" cy="146" r="22" fill="#111d30" stroke="#627eaa"/><circle cx="205" cy="146" r="22" fill="#111d30" stroke="#627eaa"/><path d="M240 83 L247 95 H233Z" fill="none" stroke="#72cfcb" stroke-width="2"/><circle cx="258" cy="109" r="6" fill="none" stroke="#e592ac" stroke-width="2"/><path d="M236 119 L245 129 M245 119 L236 129" stroke="#92b9ef" stroke-width="2"/><rect x="217" y="103" width="11" height="11" fill="none" stroke="#d3a6de" stroke-width="2"/><path d="M138 58 H182" stroke="#9ecbff" stroke-width="4"/></svg>;}
function Home(){
 const [selected,setSelected]=useState(2),[now,setNow]=useState(new Date()),[error,setError]=useState('');
 const buttons=useRef([]),busy=useRef(false);
 function focus(index){setSelected(index);if(buttons.current[index])buttons.current[index].focus();}
 function open(id){
  if(busy.current)return;busy.current=true;setError('');
  launchApp(id).catch(()=>setError('Couldn’t open this app. Please try again.')).then(()=>{busy.current=false;});
 }
 function activate(index){if(index===0)open('com.palm.app.settings');else if(index===1)launchLgHome();else open(index===8?'com.webos.app.hdmi2':shortcuts[index-2].id);}
 useEffect(()=>{focus(2);const timer=setInterval(()=>setNow(new Date()),30000);return()=>clearInterval(timer);},[]);
 useEffect(()=>{
  const keydown=event=>{
   const key=event.key||({37:'ArrowLeft',38:'ArrowUp',39:'ArrowRight',40:'ArrowDown',13:'Enter',461:'Back'}[event.keyCode]);
   if(/^Arrow/.test(key)){event.preventDefault();focus(nextFocus(selected,key));}
   else if(key==='Enter'){event.preventDefault();activate(selected);}
   else if(key==='Back'||event.keyCode===461){event.preventDefault();launchLgHome();}
  };
  window.addEventListener('keydown',keydown);return()=>window.removeEventListener('keydown',keydown);
 },[selected]);
 const bind=index=>({ref:el=>{buttons.current[index]=el;},onFocus:()=>setSelected(index),onMouseEnter:()=>focus(index),onClick:()=>activate(index),tabIndex:index===selected?0:-1});
 const hour=now.getHours(),greeting=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening';
 const clock=clockParts(hour,now.getMinutes());
 const date=now.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
 return <main class="living-room">
  <header class="home-top"><button class="utility" {...bind(0)}><svg viewBox="0 0 24 24"><path d="M9 3 H15 L16 6 L19 7 L22 10 L20 13 L20 17 L16 18 L14 21 H10 L8 18 L4 17 L4 13 L2 10 L5 7 L8 6Z"/><circle cx="12" cy="12" r="3"/></svg>Settings</button><span class="home-wordmark">E D <span>/</span> H O M E</span><button class="utility exit" {...bind(1)}>Exit launcher <svg viewBox="0 0 24 24"><path d="M10 4 H4 V20 H10 M9 12 H21 M16 7 L21 12 L16 17"/></svg></button></header>
  <section class="welcome"><div><p class="eyebrow">WELCOME HOME</p><h1>{greeting}, Ed<span>.</span></h1><p class="welcome-copy">Your favourites, ready when you are.</p></div><div class="home-clock"><time>{clock[0]}<span>:</span>{clock[1]}</time><p>{date}</p></div></section>
  <section class="collection"><div class="collection-heading"><h2>Your apps</h2><span>WATCH · DISCOVER · PLAY</span></div><div class="home-content"><div class="streaming-grid">{shortcuts.map((app,i)=><button key={app.id} class={'service-card service-'+app.brand+(selected===i+2?' is-selected':'')} aria-label={app.title} {...bind(i+2)}><span class="card-index">0{i+1}</span><Mark brand={app.brand}/><span class="card-caption">{app.subtitle}<span class="card-arrow">↗</span></span></button>)}</div><button class={'console-card'+(selected===8?' is-selected':'')} aria-label="PlayStation 4, HDMI 2" {...bind(8)}><span class="console-kicker"><span class="console-dot"/> CONSOLE</span><Controller/><div class="console-title"><span class="ps-emblem">PS4</span><h2>PlayStation 4</h2><p>HDMI 2 <span>•</span> Your next adventure</p></div><span class="console-action">Let’s play <span>↗</span></span></button></div></section>
  <footer class="home-footer"><span>LIVING ROOM</span><span><b>← →</b> Explore <i/> <b>OK</b> Open</span></footer>{error&&<div class="home-error" role="alert">{error}</div>}
 </main>;
}
render(<Home/>,document.getElementById('root'));

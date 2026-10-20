import {render} from 'preact';
import {useEffect,useRef,useState} from 'preact/hooks';
import shortcuts from './shortcuts.json';
import {nextFocus,carouselStep} from './navigation.js';
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
function Ps4Mark(){return <svg class="ps4-logo" viewBox="0 0 340 130" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="10" stroke-linejoin="round" stroke-linecap="square" transform="translate(20 5) skewX(-13)"><path d="M20 105 V25 H68 Q94 25 94 47 Q94 69 68 69 H44 M127 105 H177 Q201 105 201 83 Q201 63 178 63 H151 Q128 63 128 44 Q128 25 152 25 H200 M283 105 V25 L229 80 H310"/></g></svg>;}
const services=shortcuts.concat([{id:'com.webos.app.hdmi2',title:'PlayStation 4, HDMI 2',brand:'ps4'}]);
function Home(){
 const [selected,setSelected]=useState(2),[error,setError]=useState(''),[turn,setTurn]=useState(0);
 const lastApp=useRef(2);
 const buttons=useRef([]),busy=useRef(false);
 function choose(index){
  if(index>=2 && index!==lastApp.current){const step=carouselStep(lastApp.current-2,index-2);setTurn(t=>t+step);lastApp.current=index;}
  setSelected(index);
 }
 function focus(index){choose(index);if(buttons.current[index])buttons.current[index].focus();}
 function open(id){
  if(busy.current)return;busy.current=true;setError('');
  launchApp(id).catch(()=>setError('Couldn’t open this app. Please try again.')).then(()=>{busy.current=false;});
 }
 function activate(index){if(index===0)open('com.palm.app.settings');else if(index===1)launchLgHome();else open(services[index-2].id);}
 useEffect(()=>{focus(2);},[]);
 useEffect(()=>{
  const keydown=event=>{
   const key=event.key||({37:'ArrowLeft',38:'ArrowUp',39:'ArrowRight',40:'ArrowDown',13:'Enter',461:'Back'}[event.keyCode]);
   if(/^Arrow/.test(key)){event.preventDefault();focus(nextFocus(selected,key,lastApp.current));}
   else if(key==='Enter'){event.preventDefault();activate(selected);}
   else if(key==='Back'||event.keyCode===461){event.preventDefault();launchLgHome();}
  };
  window.addEventListener('keydown',keydown);return()=>window.removeEventListener('keydown',keydown);
 },[selected]);
 const bind=index=>({ref:el=>{buttons.current[index]=el;},onFocus:()=>choose(index),onClick:()=>activate(index),tabIndex:index===selected?0:-1});
 return <main class="living-room">
  <header class="home-top"><button class="utility" aria-label="Settings" {...bind(0)}><svg viewBox="0 0 24 24"><path d="M9 3 H15 L16 6 L19 7 L22 10 L20 13 L20 17 L16 18 L14 21 H10 L8 18 L4 17 L4 13 L2 10 L5 7 L8 6Z"/><circle cx="12" cy="12" r="3"/></svg></button><button class="utility exit" aria-label="Exit launcher" {...bind(1)}><svg viewBox="0 0 24 24"><path d="M10 4 H4 V20 H10 M9 12 H21 M16 7 L21 12 L16 17"/></svg></button></header>
  <section class="carousel" aria-label="Apps"><div class="carousel-ring" style={{transform:'translateZ(-560px) rotateY('+(-turn*360/7)+'deg)'}}>{services.map((app,i)=><div class="carousel-slot" key={app.id} style={{transform:'rotateY('+(i*360/7)+'deg) translateZ(560px)'}}><button class={'service-card service-'+app.brand+(selected===i+2?' is-selected':'')} aria-label={app.title} {...bind(i+2)}>{app.brand==='ps4'?<Ps4Mark/>:<Mark brand={app.brand}/>}</button></div>)}</div></section>
  {error&&<div class="home-error" role="alert">{error}</div>}
 </main>;
}
render(<Home/>,document.getElementById('root'));

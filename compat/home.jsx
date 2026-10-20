import {render} from 'preact';
import {useEffect,useRef,useState} from 'preact/hooks';
import shortcuts from './shortcuts.json';
import {nextFocus} from './navigation.js';
import {launchApp,launchLgHome} from './launch.js';
import './generated/style.css';
function Mark({brand}){return <img class={'service-logo logo-'+brand} src={'logos/'+logoFiles[brand]} alt="" draggable={false}/>;}
const logoFiles={netflix:'Netflix.jpg',prime:'Prime.jpg',iplayer:'BBC.png',youtube:'Youtube.png',disney:'Disney.webp',nuvio:'Nuvio.png',ps4:'PS4.jpg'};
const services=shortcuts.concat([{id:'com.webos.app.hdmi2',title:'PlayStation 4, HDMI 2',brand:'ps4'}]);
function Home(){
 const [selected,setSelected]=useState(2),[error,setError]=useState('');
 const buttons=useRef([]),busy=useRef(false);
 function choose(index){setSelected(index);}
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
   if(/^Arrow/.test(key)){event.preventDefault();focus(nextFocus(selected,key));}
   else if(key==='Enter'){event.preventDefault();activate(selected);}
   else if(key==='Back'||event.keyCode===461){event.preventDefault();launchLgHome();}
  };
  window.addEventListener('keydown',keydown);return()=>window.removeEventListener('keydown',keydown);
 },[selected]);
 const bind=index=>({ref:el=>{buttons.current[index]=el;},onFocus:()=>choose(index),onClick:()=>activate(index),tabIndex:index===selected?0:-1});
 return <main class="living-room">
  <header class="home-top"><button class="utility" aria-label="Settings" {...bind(0)}><svg viewBox="0 0 24 24"><path d="M9 3 H15 L16 6 L19 7 L22 10 L20 13 L20 17 L16 18 L14 21 H10 L8 18 L4 17 L4 13 L2 10 L5 7 L8 6Z"/><circle cx="12" cy="12" r="3"/></svg></button><button class="utility exit" aria-label="Exit launcher" {...bind(1)}><svg viewBox="0 0 24 24"><path d="M10 4 H4 V20 H10 M9 12 H21 M16 7 L21 12 L16 17"/></svg></button></header>
  <section class="collection" aria-label="Apps"><div class="home-content"><div class="streaming-grid">{shortcuts.map((app,i)=><button key={app.id} class={'service-card service-'+app.brand+(selected===i+2?' is-selected':'')} aria-label={app.title} {...bind(i+2)}><Mark brand={app.brand}/></button>)}</div><button class={'console-card service-ps4'+(selected===8?' is-selected':'')} aria-label="PlayStation 4, HDMI 2" {...bind(8)}><Mark brand="ps4"/></button></div></section>
  {error&&<div class="home-error" role="alert">{error}</div>}
 </main>;
}
render(<Home/>,document.getElementById('root'));

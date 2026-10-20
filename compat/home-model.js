import shortcuts from './shortcuts.json' with {type:'json'};
const artwork={netflix:'Netflix.jpg',prime:'Prime.jpg',iplayer:'BBC.png',youtube:'Youtube.png',disney:'Disney.webp',nuvio:'Nuvio.png',ps4:'PS4.jpg'};
const colours={netflix:'#8a2639',prime:'#245d83',iplayer:'#7e2865',youtube:'#714947',disney:'#284f77',nuvio:'#604f80',ps4:'#31599b'};
export const services=shortcuts.concat([{id:'com.webos.app.hdmi2',title:'PlayStation 4',brand:'ps4'}]).map(app=>({...app,artwork:'logos/'+artwork[app.brand],ambient:colours[app.brand]}));
export function wrapSelection(index,count=services.length){return ((index%count)+count)%count;}
// Focus: Settings 0, Exit 1, app strip 3–9. No separate central control.
export function navigate(state,key){
 let {active,focus}=state;
 if(focus<2){
  if(key==='ArrowLeft')focus=0;
  if(key==='ArrowRight')focus=1;
  if(key==='ArrowDown')focus=active+3;
 }else if(key==='ArrowLeft'||key==='ArrowRight'){
  active=wrapSelection(active+(key==='ArrowRight'?1:-1));focus=active+3;
 }else if(key==='ArrowUp')focus=0;
 return {active,focus};
}

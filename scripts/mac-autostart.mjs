// Mac-only watcher. The TV needs no SSH connection or startup modifications.
import net from 'node:net';
import {spawn} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
export class PowerCycle {
 initialized=false; misses=0; armed=false; last=null;
 observe(active,now=Date.now()) {
  if(this.last!==null && now-this.last>60000){this.initialized=false;this.misses=0;this.armed=false;}
  this.last=now;
  if(!this.initialized){this.initialized=true;this.misses=active?0:1;return false;}
  if(!active){if(++this.misses>=2)this.armed=true;return false;}
  this.misses=0;
  if(this.armed){this.armed=false;return true;}
  return false;
 }
}
export async function request(config,uri,payload={}) {
 return new Promise((resolve,reject)=>{
  let ws,child,finished=false;
  const server=net.createServer(socket=>{
   child=spawn('/usr/bin/nc',['-G','3',config.ip,'3000']);
   socket.on('error',()=>child.kill());child.stdin.on('error',()=>socket.destroy());
   child.on('error',()=>finish(new Error('Transport unavailable')));
   child.on('exit',()=>socket.destroy());
   socket.pipe(child.stdin);child.stdout.pipe(socket);socket.on('close',()=>child.kill());
  });
  const finish=(error,value)=>{
   if(finished)return;finished=true;clearTimeout(timer);
   ws?.close();child?.kill();server.close();
   error?reject(error):resolve(value);
  };
  const timer=setTimeout(()=>finish(new Error('TV unavailable')),8000);
  server.on('error',()=>finish(new Error('Local transport unavailable')));
  server.listen(0,'127.0.0.1',()=>{
   ws=new WebSocket('ws://127.0.0.1:'+server.address().port);
   ws.onopen=()=>ws.send(JSON.stringify({id:'pair',type:'register',payload:{'client-key':config.clientKey}}));
   ws.onmessage=event=>{
    try{
     const message=JSON.parse(event.data);
     if(message.type==='registered')ws.send(JSON.stringify({id:'request',type:'request',uri,payload}));
     else if(message.type==='error')finish(new Error('TV rejected request'));
     else if(message.id==='request')message.payload?.returnValue===false?finish(new Error('TV rejected request')):finish(null,message.payload);
    }catch{finish(new Error('Invalid TV response'));}
   };
   ws.onerror=()=>finish(new Error('TV unavailable'));
   ws.onclose=()=>finish(new Error('TV disconnected'));
  });
 });
}
const log=message=>console.log(new Date().toISOString()+' '+message);
async function main(){
 const config=JSON.parse(await readFile(process.argv[2],'utf8'));
 if(!config.ip||!config.clientKey)throw new Error('Pairing configuration incomplete');
 const app='dev.ed.partridge.launcher';
 if(process.argv[3]==='--check'){
  const power=await request(config,'ssap://com.webos.service.tvpower/power/getPowerState');
  log('TV power state: '+power.state);return;
 }
 if(process.argv[3]==='--launch'){
  await request(config,'ssap://system.launcher/launch',{id:app});log('Launcher opened');return;
 }
 let previousState;
 const cycle=new PowerCycle();log('Watcher started; waiting for next TV power cycle');
 while(true){
  let active=false,state='unreachable';
  const pollStarted=Date.now();
  try{const power=await request(config,'ssap://com.webos.service.tvpower/power/getPowerState');state=power.state;active=state==='Active';}catch{/* Standby commonly disconnects the remote API. */}
  if(state!==previousState){log('Power observation: '+state+'; request '+(Date.now()-pollStarted)+'ms');previousState=state;}
  if(cycle.observe(active)){
   log('TV became active; opening launcher');
   for(let attempt=0;attempt<3;attempt++){
    try{await request(config,'ssap://system.launcher/launch',{id:app});log('Launch acknowledged');break;}
    catch{log('Launch attempt failed');await new Promise(r=>setTimeout(r,3000));}
   }
  }
  await new Promise(r=>setTimeout(r,5000));
 }
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href)
 main().catch(()=>{console.error('Autostart failed; check pairing configuration and TV access');process.exitCode=1;});

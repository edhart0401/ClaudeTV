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
// Keep one paired connection while online; launch on reconnection before querying power.
export function watchConnection(config,cycle,log){
 return new Promise(resolve=>{
  let ws,child,poll,done=false,registered=false,launchAttempts=0,lastPower,lastApp;
  const server=net.createServer(socket=>{
   child=spawn('/usr/bin/nc',['-G','1',config.ip,'3000']);
   socket.on('error',()=>child.kill());child.stdin.on('error',()=>socket.destroy());
   child.on('error',finish);child.on('exit',()=>socket.destroy());
   socket.pipe(child.stdin);child.stdout.pipe(socket);socket.on('close',()=>child.kill());
  });
  const timeout=setTimeout(finish,2000);
  function finish(){
   if(done)return;done=true;clearTimeout(timeout);clearInterval(poll);
   if(registered)log('Remote disconnected');
   cycle.observe(false);ws?.close();child?.kill();server.close();resolve();
  }
  function send(id,uri,payload={}){ws.send(JSON.stringify({id,type:'request',uri,payload}));}
  function launch(){
   launchAttempts++;log('Sending launch immediately; attempt '+launchAttempts);
   send('launch','ssap://system.launcher/launch',{id:'dev.ed.partridge.launcher'});
  }
  function query(){
   send('power','ssap://com.webos.service.tvpower/power/getPowerState');
   send('foreground','ssap://com.webos.applicationManager/getForegroundAppInfo');
  }
  server.on('error',finish);
  server.listen(0,'127.0.0.1',()=>{
   ws=new WebSocket('ws://127.0.0.1:'+server.address().port);
   ws.onopen=()=>ws.send(JSON.stringify({id:'pair',type:'register',payload:{'client-key':config.clientKey}}));
   ws.onmessage=event=>{
    let m;try{m=JSON.parse(event.data);}catch{log('Invalid remote response');return;}
    if(m.type==='registered'){
     registered=true;clearTimeout(timeout);log('Remote registered');
     if(cycle.observe(true))launch();
     query();poll=setInterval(query,500);
    }else if(m.id==='power' && m.type!=='error'){
     const state=m.payload?.state;
     if(state!==lastPower){log('Power state: '+state);lastPower=state;}
     if(cycle.observe(state==='Active')){launchAttempts=0;launch();}
    }else if(m.id==='foreground' && m.type!=='error'){
     const app=m.payload?.appId;
     if(app!==lastApp){log('Foreground: '+app);lastApp=app;}
    }else if(m.id==='launch'){
     if(m.type==='error'||m.payload?.returnValue===false){
      log('Launch rejected');
      if(launchAttempts<3)setTimeout(()=>{if(!done)launch();},1000);
     }else log('Launch acknowledged');
    }else if(m.type==='error' && !registered){log('Pairing rejected');finish();}
   };
   ws.onerror=finish;ws.onclose=finish;
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
 const cycle=new PowerCycle();log('Fast watcher started; waiting for next TV power cycle');
 while(true){
  await watchConnection(config,cycle,log);
  await new Promise(r=>setTimeout(r,250));
 }

}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href)
 main().catch(()=>{console.error('Autostart failed; check pairing configuration and TV access');process.exitCode=1;});

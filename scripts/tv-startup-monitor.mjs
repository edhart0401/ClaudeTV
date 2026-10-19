// Passive startup trace: no launch, keypress, power or settings commands.
import net from 'node:net';
import {spawn} from 'node:child_process';
import {readFile} from 'node:fs/promises';
const config=JSON.parse(await readFile(process.argv[2],'utf8'));
const started=performance.now();
const log=(event,fields={})=>console.log(JSON.stringify({time:new Date().toISOString(),elapsedMs:Math.round(performance.now()-started),event,...fields}));
let stopped=false;
function session(){return new Promise(resolve=>{
 let ws,child,done=false,connected=false;
 const server=net.createServer(socket=>{
  child=spawn('/usr/bin/nc',['-G','1',config.ip,'3000']);
  socket.on('error',()=>child.kill());child.stdin.on('error',()=>socket.destroy());
  child.on('error',finish);child.on('exit',()=>socket.destroy());
  socket.pipe(child.stdin);child.stdout.pipe(socket);socket.on('close',()=>child.kill());
 });
 const timeout=setTimeout(finish,2000);
 function finish(){
  if(done)return;done=true;clearTimeout(timeout);clearInterval(poll);
  if(connected)log('connection_lost');
  ws?.close();child?.kill();server.close();resolve();
 }
 let poll;
 server.on('error',finish);
 server.listen(0,'127.0.0.1',()=>{
  ws=new WebSocket('ws://127.0.0.1:'+server.address().port);
  ws.onopen=()=>{connected=true;log('remote_socket_open');ws.send(JSON.stringify({id:'pair',type:'register',payload:{'client-key':config.clientKey}}));};
  const send=()=>{
   for(const [id,uri] of [['power','ssap://com.webos.service.tvpower/power/getPowerState'],['foreground','ssap://com.webos.applicationManager/getForegroundAppInfo']])
    ws.send(JSON.stringify({id,type:'request',uri,payload:{}}));
  };
  const previous={};
  ws.onmessage=event=>{
   let m;try{m=JSON.parse(event.data);}catch{return;}
   if(m.type==='registered'){clearTimeout(timeout);log('remote_registered');send();poll=setInterval(send,250);}
   else if(m.id==='power'||m.id==='foreground'){
    const value=m.type==='error'?'unsupported':m.id==='power'?m.payload?.state:m.payload?.appId;
    if(value!==previous[m.id]){previous[m.id]=value;log(m.id,{value:value??null});}
   }
  };
  ws.onerror=finish;ws.onclose=finish;
 });
});}
process.on('SIGTERM',()=>process.exit(0));
log('monitor_started');
while(!stopped){await session();await new Promise(r=>setTimeout(r,250));}

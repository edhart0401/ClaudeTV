// Read the foreground app using the separately paired remote-control interface.
import net from 'node:net';
import {spawn} from 'node:child_process';
import {readFile} from 'node:fs/promises';
const file=process.argv[2];
if(!file)throw new Error('Expected path to private TV pairing JSON');
const config=JSON.parse(await readFile(file,'utf8'));
const timer=setTimeout(()=>{console.error('TV state request timed out');process.exit(1)},8000);
const server=net.createServer(socket=>{
 const child=spawn('/usr/bin/nc',[config.ip,'3000']);
 socket.on('error',()=>child.kill());child.stdin.on('error',()=>socket.destroy());
 socket.pipe(child.stdin);child.stdout.pipe(socket);socket.on('close',()=>child.kill());
});
server.listen(0,'127.0.0.1',()=>{
 const ws=new WebSocket('ws://127.0.0.1:'+server.address().port);
 ws.onopen=()=>ws.send(JSON.stringify({id:'pair',type:'register',payload:{'client-key':config.clientKey}}));
 ws.onmessage=event=>{
  const message=JSON.parse(event.data);
  if(message.type==='registered')ws.send(JSON.stringify({id:'state',type:'request',uri:'ssap://com.webos.applicationManager/getForegroundAppInfo'}));
  else if(message.id==='state'){console.log(JSON.stringify(message.payload||message));clearTimeout(timer);process.exit(message.type==='error'?1:0)}
  else if(message.type==='error'){console.error(message.error);process.exit(1)}
 };
 ws.onerror=()=>{console.error('TV remote connection failed');process.exit(1)};
});

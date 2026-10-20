// Local relay for machines where Node cannot connect to the TV but macOS nc can.
// Usage: node scripts/tv-transport.mjs TV_IP [LOCAL_PORT] [TV_PORT]
import net from 'node:net';
import {spawn} from 'node:child_process';
const [host,local='19922',remote='9922']=process.argv.slice(2);
if(!host||!/^\d{1,3}(\.\d{1,3}){3}$/.test(host))throw new Error('Expected TV IPv4 address');
for(const port of [local,remote])if(!/^\d+$/.test(port)||Number(port)<1||Number(port)>65535)throw new Error('Ports must be between 1 and 65535');
const server=net.createServer(socket=>{
 const child=spawn('/usr/bin/nc',[host,remote]);
 socket.on('error',()=>child.kill());
 child.stdin.on('error',()=>socket.destroy());
 child.stdout.on('error',()=>socket.destroy());
 child.on('error',()=>socket.destroy());
 child.on('exit',()=>socket.end());
 socket.pipe(child.stdin);child.stdout.pipe(socket);
 socket.on('close',()=>child.kill());
});
server.on('error',error=>{console.error(error.message);process.exit(1)});
server.listen(Number(local),'127.0.0.1',()=>console.log(`TV transport: localhost:${local} -> ${host}:${remote}`));

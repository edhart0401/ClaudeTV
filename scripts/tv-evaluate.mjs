// Evaluate an expression in the selected app's Developer Mode inspector.
// Usage: node scripts/tv-evaluate.mjs PORT APP_ID 'EXPRESSION'
const [port,appId,expression]=process.argv.slice(2);
if(!port||!appId||!expression)throw new Error('Expected PORT APP_ID EXPRESSION');
const pages=await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page=pages.find(p=>p.url.includes('/'+appId+'/'));
if(!page)throw new Error('Target app is not running');
const timer=setTimeout(()=>{console.error('Inspector response timed out');process.exit(1)},8000);
const ws=new WebSocket(page.webSocketDebuggerUrl);
ws.onopen=()=>ws.send(JSON.stringify({id:1,method:'Runtime.evaluate',params:{expression,returnByValue:true}}));
ws.onmessage=event=>{const message=JSON.parse(event.data);if(message.id!==1)return;clearTimeout(timer);console.log(JSON.stringify(message.result));process.exit(message.error||message.result?.wasThrown?1:0)};
ws.onerror=()=>{console.error('Inspector connection failed');process.exit(1)};

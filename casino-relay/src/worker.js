/* Independent Cloudflare WebSocket relay for Candy Land Casino.
 * 2 players per room; no gambling, accounts, secrets, or persistent game data.
 * The static website is hosted separately on GitHub Pages.
 */
import { DurableObject } from 'cloudflare:workers';

const CODE=/^rcl-casino-[a-f0-9]{20}$/i;
const ORIGINS=new Set([
  'https://randomcandyland.com',
  'https://www.randomcandyland.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
]);
const response=(message,status=400)=>new Response(message,{status,headers:{'cache-control':'no-store'}});
const send=(socket,data)=>{try{if(socket?.readyState===1)socket.send(JSON.stringify(data))}catch{}};

export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(request.method==='GET'&&url.pathname==='/health')return Response.json({
   ok:true,service:'candy-casino-room-relay',protocol:1,
   description:'WebSocket multiplayer rooms for RandomCandyLand.com'
  },{headers:{'cache-control':'no-store'}});
  const parts=url.pathname.match(/^\/room\/(rcl-casino-[a-zA-Z0-9-]+)$/);
  if(!parts||!CODE.test(parts[1]))return response('Not found',404);
  if(request.headers.get('Upgrade')?.toLowerCase()!=='websocket')return response('WebSocket upgrade required',426);
  if(!ORIGINS.has(request.headers.get('Origin')))return response('Origin not allowed',403);
  const role=url.searchParams.get('role');
  if(role!=='host'&&role!=='guest')return response('Invalid room role',400);
  // Every room maps to its own Durable Object, so ownership is atomic across devices.
  return env.CASINO_ROOMS.get(env.CASINO_ROOMS.idFromName(parts[1])).fetch(request);
 }
};

export class CandyCasinoRoom extends DurableObject {
 live(role,except){
  return this.ctx.getWebSockets().find(ws=>ws!==except && ws.readyState===1 && ws.deserializeAttachment()?.role===role);
 }
 async fetch(request){
  const url=new URL(request.url);
  const role=url.searchParams.get('role');
  if(!['host','guest'].includes(role))return response('Invalid room role',400);
  const pair=new WebSocketPair();
  const [client,server]=Object.values(pair);
  this.ctx.acceptWebSocket(server);
  server.serializeAttachment({role});
  if(role==='host'){
   if(this.live('host',server)){
    send(server,{t:'host-taken'});server.close(4409,'Host already active');
   }else{
    send(server,{t:'host-ready'});
   }
  }else{
   const host=this.live('host',server);
   if(!host){
    send(server,{t:'missing'});server.close(4404,'No active host');
   }else if(this.live('guest',server)){
    send(server,{t:'full'});server.close(4410,'Room full');
   }else{
    send(host,{t:'peer-ready'});
    send(server,{t:'peer-ready'});
   }
  }
  return new Response(null,{status:101,webSocket:client});
 }
 async webSocketMessage(ws,message){
  if(typeof message!=='string'||message.length>8192){ws.close(1009,'Message too large');return}
  let msg;try{msg=JSON.parse(message)}catch{return}
  const role=ws.deserializeAttachment()?.role;
  if(msg?.t==='data'&&msg.d&&typeof msg.d==='object'&&!Array.isArray(msg.d)){
   if(role==='guest'&&msg.d.type==='state')return;
   if(!['hello','ready','draw','reset','state'].includes(msg.d.type))return;
   send(this.live(role==='host'?'guest':'host',ws),{t:'data',d:msg.d});
  }else if(msg?.t==='drop-guest'&&role==='host'){
   const guest=this.live('guest',ws);
   if(guest){send(guest,{t:'peer-left'});guest.close(1000,'Room reset')}
  }
 }
 async webSocketClose(ws,code,reason,wasClean){
  const role=ws.deserializeAttachment()?.role;
  send(this.live(role==='host'?'guest':'host',ws),{t:'peer-left'});
  try{ws.close(code||1000,reason||'Disconnected')}catch{}
 }
 async webSocketError(ws){
  const role=ws.deserializeAttachment()?.role;
  send(this.live(role==='host'?'guest':'host',ws),{t:'peer-left'});
  try{ws.close(1011,'Transport error')}catch{}
 }
}

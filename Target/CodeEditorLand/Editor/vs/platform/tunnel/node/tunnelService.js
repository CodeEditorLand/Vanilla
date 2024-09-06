var w=Object.defineProperty;var A=Object.getOwnPropertyDescriptor;var v=(c,o,e,t)=>{for(var r=t>1?void 0:t?A(o,e):o,n=c.length-1,i;n>=0;n--)(i=c[n])&&(r=(t?i(o,e,r):i(r))||r);return t&&r&&w(o,e,r),r},s=(c,o)=>(e,t)=>o(e,t,c);import*as C from"net";import*as F from"os";import{Barrier as k}from"../../../../vs/base/common/async.js";import{VSBuffer as x}from"../../../../vs/base/common/buffer.js";import{Disposable as R}from"../../../../vs/base/common/lifecycle.js";import{OS as D}from"../../../../vs/base/common/platform.js";import{BROWSER_RESTRICTED_PORTS as P,findFreePortFaster as $}from"../../../../vs/base/node/ports.js";import"../../../../vs/base/parts/ipc/common/ipc.net.js";import{NodeSocket as T}from"../../../../vs/base/parts/ipc/node/ipc.net.js";import{IConfigurationService as f}from"../../../../vs/platform/configuration/common/configuration.js";import{ILogService as S}from"../../../../vs/platform/log/common/log.js";import{IProductService as _}from"../../../../vs/platform/product/common/productService.js";import{connectRemoteAgentTunnel as H}from"../../../../vs/platform/remote/common/remoteAgentConnection.js";import{IRemoteSocketFactoryService as y}from"../../../../vs/platform/remote/common/remoteSocketFactoryService.js";import{ISignService as I}from"../../../../vs/platform/sign/common/sign.js";import{AbstractTunnelService as O,isAllInterfaces as L,isLocalhost as E,isPortPrivileged as M,isTunnelProvider as N,TunnelPrivacyId as q}from"../../../../vs/platform/tunnel/common/tunnel.js";async function B(c,o,e,t,r){let n;for(let i=3;i&&(n?.dispose(),n=await new G(c,o,e,t,r).waitForReady(),!(r&&P[r]||!P[n.tunnelLocalPort]));i--);return n}class G extends R{constructor(e,t,r,n,i){super();this.defaultTunnelHost=t;this.suggestedLocalPort=i;this._options=e,this._server=C.createServer(),this._barrier=new k,this._listeningListener=()=>this._barrier.open(),this._server.on("listening",this._listeningListener),this._connectionListener=d=>this._onConnection(d),this._server.on("connection",this._connectionListener),this._errorListener=()=>{},this._server.on("error",this._errorListener),this.tunnelRemotePort=n,this.tunnelRemoteHost=r}tunnelRemotePort;tunnelLocalPort;tunnelRemoteHost;localAddress;privacy=q.Private;_options;_server;_barrier;_listeningListener;_connectionListener;_errorListener;_socketsDispose=new Map;async dispose(){super.dispose(),this._server.removeListener("listening",this._listeningListener),this._server.removeListener("connection",this._connectionListener),this._server.removeListener("error",this._errorListener),this._server.close(),Array.from(this._socketsDispose.values()).forEach(t=>{t()})}async waitForReady(){const e=this.suggestedLocalPort??this.tunnelRemotePort,t=L(this.defaultTunnelHost)?"0.0.0.0":"127.0.0.1";let r=await $(e,2,1e3,t),n=null;return this._server.listen(r,this.defaultTunnelHost),await this._barrier.wait(),n=this._server.address(),n||(r=0,this._server.listen(r,this.defaultTunnelHost),await this._barrier.wait(),n=this._server.address()),this.tunnelLocalPort=n.port,this.localAddress=`${this.tunnelRemoteHost==="127.0.0.1"?"127.0.0.1":"localhost"}:${n.port}`,this}async _onConnection(e){e.pause();const t=E(this.tunnelRemoteHost)||L(this.tunnelRemoteHost)?"localhost":this.tunnelRemoteHost,r=await H(this._options,t,this.tunnelRemotePort),n=r.getSocket(),i=r.readEntireBuffer();r.dispose(),i.byteLength>0&&e.write(i.buffer),e.on("end",()=>{e.localAddress&&this._socketsDispose.delete(e.localAddress),n.end()}),e.on("close",()=>n.end()),e.on("error",()=>{e.localAddress&&this._socketsDispose.delete(e.localAddress),n instanceof T?n.socket.destroy():n.end()}),n instanceof T?this._mirrorNodeSocket(e,n):this._mirrorGenericSocket(e,n),e.localAddress&&this._socketsDispose.set(e.localAddress,()=>{e.end(),n.end()})}_mirrorGenericSocket(e,t){t.onClose(()=>e.destroy()),t.onEnd(()=>e.end()),t.onData(r=>e.write(r.buffer)),e.on("data",r=>t.write(x.wrap(r))),e.resume()}_mirrorNodeSocket(e,t){const r=t.socket;r.on("end",()=>e.end()),r.on("close",()=>e.end()),r.on("error",()=>{e.destroy()}),r.pipe(e),e.pipe(r)}}let l=class extends O{constructor(e,t,r,n,i){super(t,i);this.remoteSocketFactoryService=e;this.signService=r;this.productService=n}isPortPrivileged(e){return M(e,this.defaultTunnelHost,D,F.release())}retainOrCreateTunnel(e,t,r,n,i,d,h,g){const u=this.getTunnelFromMap(t,r);if(u)return++u.refcount,u.value;if(N(e))return this.createWithProvider(e,t,r,i,d,h,g);{this.logService.trace(`ForwardedPorts: (TunnelService) Creating tunnel without provider ${t}:${r} on local port ${i}.`);const a={commit:this.productService.commit,quality:this.productService.quality,addressProvider:e,remoteSocketFactoryService:this.remoteSocketFactoryService,signService:this.signService,logService:this.logService,ipcLogger:null},b=B(a,n,t,r,i);return this.logService.trace("ForwardedPorts: (TunnelService) Tunnel created without provider."),this.addTunnelToMap(t,r,b),b}}};l=v([s(0,y),s(1,S),s(2,I),s(3,_),s(4,f)],l);let p=class extends l{constructor(o,e,t,r,n){super(o,e,t,r,n)}};p=v([s(0,y),s(1,S),s(2,I),s(3,_),s(4,f)],p);let m=class extends R{constructor(e,t,r,n,i){super();this.remoteSocketFactoryService=e;this.logService=t;this.productService=r;this.signService=n;this.configurationService=i}_tunnelServices=new Map;async openTunnel(e,t,r,n,i,d,h,g,u){if(this.logService.trace(`ForwardedPorts: (SharedTunnelService) openTunnel request for ${r}:${n} on local port ${d}.`),!this._tunnelServices.has(e)){const a=new p(this.remoteSocketFactoryService,this.logService,this.signService,this.productService,this.configurationService);this._register(a),this._tunnelServices.set(e,a),a.onTunnelClosed(async()=>{(await a.tunnels).length===0&&(a.dispose(),this._tunnelServices.delete(e))})}return this._tunnelServices.get(e).openTunnel(t,r,n,i,d,h,g,u)}};m=v([s(0,y),s(1,S),s(2,_),s(3,I),s(4,f)],m);export{l as BaseTunnelService,G as NodeRemoteTunnel,m as SharedTunnelsService,p as TunnelService};

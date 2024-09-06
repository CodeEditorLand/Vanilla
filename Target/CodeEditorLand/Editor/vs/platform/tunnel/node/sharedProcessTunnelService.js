var _=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var c=(o,n,e,s)=>{for(var r=s>1?void 0:s?v(n,e):n,t=o.length-1,l;t>=0;t--)(l=o[t])&&(r=(s?l(n,e,r):l(r))||r);return s&&r&&_(n,e,r),r},u=(o,n)=>(e,s)=>n(e,s,o);import{DeferredPromise as f}from"../../../../vs/base/common/async.js";import{canceled as g}from"../../../../vs/base/common/errors.js";import{Disposable as p}from"../../../../vs/base/common/lifecycle.js";import{ILogService as P}from"../../../../vs/platform/log/common/log.js";import"../../../../vs/platform/remote/common/remoteAgentConnection.js";import"../../../../vs/platform/remote/common/sharedProcessTunnelService.js";import{ISharedTunnelsService as T}from"../../../../vs/platform/tunnel/common/tunnel.js";class I extends p{_address;_addressPromise;constructor(){super(),this._address=null,this._addressPromise=null}async getAddress(){return this._address?this._address:(this._addressPromise||(this._addressPromise=new f),this._addressPromise.p)}setAddress(n){this._address=n,this._addressPromise&&(this._addressPromise.complete(n),this._addressPromise=null)}setTunnel(n){this._register(n)}}let d=class extends p{constructor(e,s){super();this._tunnelService=e;this._logService=s}_serviceBrand;static _lastId=0;_tunnels=new Map;_disposedTunnels=new Set;dispose(){super.dispose(),this._tunnels.forEach(e=>e.dispose())}async createTunnel(){return{id:String(++d._lastId)}}async startTunnel(e,s,r,t,l,m,h){const a=new I,i=await Promise.resolve(this._tunnelService.openTunnel(e,a,r,t,l,m,h));if(!i||typeof i=="string")throw this._logService.info(`[SharedProcessTunnelService] Could not create a tunnel to ${r}:${t} (remote).`),a.dispose(),new Error("Could not create tunnel");if(this._disposedTunnels.has(s))throw this._disposedTunnels.delete(s),a.dispose(),await i.dispose(),g();return a.setTunnel(i),this._tunnels.set(s,a),this._logService.info(`[SharedProcessTunnelService] Created tunnel ${s}: ${i.localAddress} (local) to ${r}:${t} (remote).`),{tunnelLocalPort:i.tunnelLocalPort,localAddress:i.localAddress}}async setAddress(e,s){const r=this._tunnels.get(e);r&&r.setAddress(s)}async destroyTunnel(e){const s=this._tunnels.get(e);if(s){this._logService.info(`[SharedProcessTunnelService] Disposing tunnel ${e}.`),this._tunnels.delete(e),await s.dispose();return}this._disposedTunnels.add(e)}};d=c([u(0,T),u(1,P)],d);export{d as SharedProcessTunnelService};
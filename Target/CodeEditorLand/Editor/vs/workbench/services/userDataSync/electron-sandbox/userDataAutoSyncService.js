var h=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var s=(t,r,e,n)=>{for(var o=n>1?void 0:n?m(r,e):r,i=t.length-1,l;i>=0;i--)(l=t[i])&&(o=(n?l(r,e,o):l(o))||o);return n&&o&&h(r,e,o),o},c=(t,r)=>(e,n)=>r(e,n,t);import{IUserDataAutoSyncService as d,UserDataSyncError as u}from"../../../../platform/userDataSync/common/userDataSync.js";import{ISharedProcessService as f}from"../../../../platform/ipc/electron-sandbox/services.js";import"../../../../base/parts/ipc/common/ipc.js";import{Event as g}from"../../../../base/common/event.js";import{InstantiationType as p,registerSingleton as y}from"../../../../platform/instantiation/common/extensions.js";let a=class{channel;get onError(){return g.map(this.channel.listen("onError"),r=>u.toUserDataSyncError(r))}constructor(r){this.channel=r.getChannel("userDataAutoSync")}triggerSync(r,e,n){return this.channel.call("triggerSync",[r,e,n])}turnOn(){return this.channel.call("turnOn")}turnOff(r){return this.channel.call("turnOff",[r])}};a=s([c(0,f)],a),y(d,a,p.Delayed);

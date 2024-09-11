import{createServer as x}from"net";import"../common/extensionHostDebug.js";import{ExtensionHostDebugBroadcastChannel as I}from"../common/extensionHostDebugIpc.js";import{OPTIONS as h,parseArgs as E}from"../../environment/node/argv.js";import{OpenContext as b}from"../../windows/electron-main/windows.js";class T extends I{constructor(d){super();this.windowsMainService=d}call(d,c,n){return c==="openExtensionDevelopmentHostWindow"?this.openExtensionDevelopmentHostWindow(n[0],n[1]):super.call(d,c,n)}async openExtensionDevelopmentHostWindow(d,c){const n=E(d,h);n.debugRenderer=c;const m=n.extensionDevelopmentPath;if(!m)return{success:!1};const[v]=await this.windowsMainService.openExtensionDevelopmentHostWindow(m,{context:b.API,cli:n,forceProfile:n.profile,forceTempProfile:n["profile-temp"]});if(!c)return{success:!0};const l=v.win;if(!l)return{success:!0};const r=l.webContents.debugger;let w=r.isAttached()?1/0:0;const p=x(s=>{w++===0&&r.attach();let f=!1;const u=a=>{f||s.write(JSON.stringify(a)+"\0")},g=(a,i,e,o)=>u({method:i,params:e,sessionId:o});l.on("close",()=>{r.removeListener("message",g),s.end(),f=!0}),r.addListener("message",g);let t=Buffer.alloc(0);s.on("data",a=>{t=Buffer.concat([t,a]);for(let i=t.indexOf(0);i!==-1;i=t.indexOf(0)){let e;try{const o=t.slice(0,i).toString("utf8");t=t.slice(i+1),e=JSON.parse(o)}catch{}r.sendCommand(e.method,e.params,e.sessionId).then(o=>u({id:e.id,sessionId:e.sessionId,result:o})).catch(o=>u({id:e.id,sessionId:e.sessionId,error:{code:0,message:o.message}}))}}),s.on("error",a=>{}),s.on("close",()=>{f=!0,--w===0&&r.detach()})});return await new Promise(s=>p.listen(0,s)),l.on("close",()=>p.close()),{rendererDebugPort:p.address().port,success:!0}}}export{T as ElectronExtensionHostDebugBroadcastChannel};

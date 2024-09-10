import{createServer as x}from"net";import{ExtensionHostDebugBroadcastChannel as I}from"../common/extensionHostDebugIpc.js";import{OPTIONS as h,parseArgs as E}from"../../environment/node/argv.js";import{OpenContext as b}from"../../windows/electron-main/windows.js";class T extends I{constructor(d){super();this.windowsMainService=d}call(d,a,n){return a==="openExtensionDevelopmentHostWindow"?this.openExtensionDevelopmentHostWindow(n[0],n[1]):super.call(d,a,n)}async openExtensionDevelopmentHostWindow(d,a){const n=E(d,h);n.debugRenderer=a;const m=n.extensionDevelopmentPath;if(!m)return{success:!1};const[v]=await this.windowsMainService.openExtensionDevelopmentHostWindow(m,{context:b.API,cli:n,forceProfile:n.profile,forceTempProfile:n["profile-temp"]});if(!a)return{success:!0};const l=v.win;if(!l)return{success:!0};const r=l.webContents.debugger;let w=r.isAttached()?1/0:0;const p=x(s=>{w++===0&&r.attach();let f=!1;const u=i=>{f||s.write(JSON.stringify(i)+"\0")},g=(i,c,e,o)=>u({method:c,params:e,sessionId:o});l.on("close",()=>{r.removeListener("message",g),s.end(),f=!0}),r.addListener("message",g);let t=Buffer.alloc(0);s.on("data",i=>{t=Buffer.concat([t,i]);for(let c=t.indexOf(0);c!==-1;c=t.indexOf(0)){let e;try{const o=t.slice(0,c).toString("utf8");t=t.slice(c+1),e=JSON.parse(o)}catch(o){console.error("error reading cdp line",o)}r.sendCommand(e.method,e.params,e.sessionId).then(o=>u({id:e.id,sessionId:e.sessionId,result:o})).catch(o=>u({id:e.id,sessionId:e.sessionId,error:{code:0,message:o.message}}))}}),s.on("error",i=>{console.error("error on cdp pipe:",i)}),s.on("close",()=>{f=!0,--w===0&&r.detach()})});return await new Promise(s=>p.listen(0,s)),l.on("close",()=>p.close()),{rendererDebugPort:p.address().port,success:!0}}}export{T as ElectronExtensionHostDebugBroadcastChannel};

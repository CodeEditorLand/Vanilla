import"electron";import{VSBuffer as p}from"../../../../../vs/base/common/buffer.js";import{Emitter as f,Event as n}from"../../../../../vs/base/common/event.js";import{toDisposable as v}from"../../../../../vs/base/common/lifecycle.js";import{IPCServer as C}from"../../../../../vs/base/parts/ipc/common/ipc.js";import{Protocol as E}from"../../../../../vs/base/parts/ipc/common/ipc.electron.js";import{validatedIpcMain as c}from"../../../../../vs/base/parts/ipc/electron-main/ipcMain.js";function l(a,s){const t=n.fromNodeEventEmitter(c,s,(e,r)=>({event:e,message:r})),o=n.filter(t,({event:e})=>e.sender.id===a);return n.map(o,({message:e})=>e&&p.wrap(e))}class i extends C{static Clients=new Map;static getOnDidClientConnect(){const s=n.fromNodeEventEmitter(c,"vscode:hello",({sender:t})=>t);return n.map(s,t=>{const o=t.id;i.Clients.get(o)?.dispose();const r=new f;i.Clients.set(o,v(()=>r.fire()));const m=l(o,"vscode:message"),d=n.any(n.signal(l(o,"vscode:disconnect")),r.event);return{protocol:new E(t,m),onDidClientDisconnect:d}})}constructor(){super(i.getOnDidClientConnect())}}export{i as Server};
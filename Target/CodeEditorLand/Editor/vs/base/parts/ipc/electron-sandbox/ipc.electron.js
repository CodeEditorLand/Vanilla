import{VSBuffer as c}from"../../../common/buffer.js";import{Event as i}from"../../../common/event.js";import"../../../common/lifecycle.js";import{ipcRenderer as e}from"../../sandbox/electron-sandbox/globals.js";import{Protocol as p}from"../common/ipc.electron.js";import{IPCClient as l}from"../common/ipc.js";class t extends l{protocol;static createProtocol(){const o=i.fromNodeEventEmitter(e,"vscode:message",(r,s)=>c.wrap(s));return e.send("vscode:hello"),new p(e,o)}constructor(o){const r=t.createProtocol();super(r,o),this.protocol=r}dispose(){this.protocol.disconnect(),super.dispose()}}export{t as Client};

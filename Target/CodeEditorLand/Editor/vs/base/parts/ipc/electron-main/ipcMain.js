import a from"electron";import{onUnexpectedError as o}from"../../../common/errors.js";import{VSCODE_AUTHORITY as s}from"../../../common/network.js";class p{mapListenerToWrapper=new WeakMap;on(e,t){const n=(r,...i)=>{this.validateEvent(e,r)&&t(r,...i)};return this.mapListenerToWrapper.set(t,n),a.ipcMain.on(e,n),this}once(e,t){return a.ipcMain.once(e,(n,...r)=>{this.validateEvent(e,n)&&t(n,...r)}),this}handle(e,t){return a.ipcMain.handle(e,(n,...r)=>this.validateEvent(e,n)?t(n,...r):Promise.reject(`Invalid channel '${e}' or sender for ipcMain.handle() usage.`)),this}removeHandler(e){return a.ipcMain.removeHandler(e),this}removeListener(e,t){const n=this.mapListenerToWrapper.get(t);return n&&(a.ipcMain.removeListener(e,n),this.mapListenerToWrapper.delete(t)),this}validateEvent(e,t){if(!e||!e.startsWith("vscode:"))return o(`Refused to handle ipcMain event for channel '${e}' because the channel is unknown.`),!1;const n=t.senderFrame,r=n.url;if(!r||r==="about:blank")return!0;let i="unknown";try{i=new URL(r).host}catch{return o(`Refused to handle ipcMain event for channel '${e}' because of a malformed URL '${r}'.`),!1}return i!==s?(o(`Refused to handle ipcMain event for channel '${e}' because of a bad origin of '${i}'.`),!1):n.parent!==null?(o(`Refused to handle ipcMain event for channel '${e}' because sender of origin '${i}' is not a main frame.`),!1):!0}}const u=new p;export{u as validatedIpcMain};

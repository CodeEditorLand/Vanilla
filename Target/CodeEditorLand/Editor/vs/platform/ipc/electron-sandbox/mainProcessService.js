import{Disposable as r}from"../../../base/common/lifecycle.js";import"../../../base/parts/ipc/common/ipc.js";import{Client as i}from"../../../base/parts/ipc/electron-sandbox/ipc.electron.js";import"../common/mainProcessService.js";class h extends r{mainProcessConnection;constructor(e){super(),this.mainProcessConnection=this._register(new i(`window:${e}`))}getChannel(e){return this.mainProcessConnection.getChannel(e)}registerChannel(e,n){this.mainProcessConnection.registerChannel(e,n)}}export{h as ElectronIPCMainProcessService};

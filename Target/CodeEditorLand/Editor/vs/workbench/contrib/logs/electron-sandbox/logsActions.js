var I=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var l=(o,t,e,r)=>{for(var i=r>1?void 0:r?f(t,e):t,s=o.length-1,a;s>=0;s--)(a=o[s])&&(i=(r?a(t,e,i):a(i))||i);return r&&i&&I(t,e,i),i},n=(o,t)=>(e,r)=>t(e,r,o);import{Action as m}from"../../../../base/common/actions.js";import*as h from"../../../../nls.js";import{INativeHostService as d}from"../../../../platform/native/common/native.js";import{INativeWorkbenchEnvironmentService as S}from"../../../services/environment/electron-sandbox/environmentService.js";import{IFileService as y}from"../../../../platform/files/common/files.js";import{joinPath as u}from"../../../../base/common/resources.js";import{Schemas as p}from"../../../../base/common/network.js";let v=class extends m{constructor(e,r,i,s){super(e,r);this.environmentService=i;this.nativeHostService=s}static ID="workbench.action.openLogsFolder";static TITLE=h.localize2("openLogsFolder","Open Logs Folder");run(){return this.nativeHostService.showItemInFolder(u(this.environmentService.logsHome,"main.log").with({scheme:p.file}).fsPath)}};v=l([n(2,S),n(3,d)],v);let c=class extends m{constructor(e,r,i,s,a){super(e,r);this.environmentSerice=i;this.fileService=s;this.nativeHostService=a}static ID="workbench.action.openExtensionLogsFolder";static TITLE=h.localize2("openExtensionLogsFolder","Open Extension Logs Folder");async run(){const e=await this.fileService.resolve(this.environmentSerice.extHostLogsPath);if(e.children&&e.children[0])return this.nativeHostService.showItemInFolder(e.children[0].resource.with({scheme:p.file}).fsPath)}};c=l([n(2,S),n(3,y),n(4,d)],c);export{c as OpenExtensionLogsFolderAction,v as OpenLogsFolderAction};

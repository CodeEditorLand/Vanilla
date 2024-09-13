var I=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var l=(o,t,e,r)=>{for(var i=r>1?void 0:r?f(t,e):t,s=o.length-1,a;s>=0;s--)(a=o[s])&&(i=(r?a(t,e,i):a(i))||i);return r&&i&&I(t,e,i),i},n=(o,t)=>(e,r)=>t(e,r,o);import{Action as m}from"../../../../base/common/actions.js";import{Schemas as h}from"../../../../base/common/network.js";import{joinPath as y}from"../../../../base/common/resources.js";import*as d from"../../../../nls.js";import{IFileService as u}from"../../../../platform/files/common/files.js";import{INativeHostService as S}from"../../../../platform/native/common/native.js";import{INativeWorkbenchEnvironmentService as p}from"../../../services/environment/electron-sandbox/environmentService.js";let v=class extends m{constructor(e,r,i,s){super(e,r);this.environmentService=i;this.nativeHostService=s}static ID="workbench.action.openLogsFolder";static TITLE=d.localize2("openLogsFolder","Open Logs Folder");run(){return this.nativeHostService.showItemInFolder(y(this.environmentService.logsHome,"main.log").with({scheme:h.file}).fsPath)}};v=l([n(2,p),n(3,S)],v);let c=class extends m{constructor(e,r,i,s,a){super(e,r);this.environmentSerice=i;this.fileService=s;this.nativeHostService=a}static ID="workbench.action.openExtensionLogsFolder";static TITLE=d.localize2("openExtensionLogsFolder","Open Extension Logs Folder");async run(){const e=await this.fileService.resolve(this.environmentSerice.extHostLogsPath);if(e.children&&e.children[0])return this.nativeHostService.showItemInFolder(e.children[0].resource.with({scheme:h.file}).fsPath)}};c=l([n(2,p),n(3,u),n(4,S)],c);export{c as OpenExtensionLogsFolderAction,v as OpenLogsFolderAction};

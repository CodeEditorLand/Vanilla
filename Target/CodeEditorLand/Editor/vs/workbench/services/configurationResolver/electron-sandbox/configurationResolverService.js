var u=Object.defineProperty;var d=Object.getOwnPropertyDescriptor;var S=(n,i,o,t)=>{for(var r=t>1?void 0:t?d(i,o):i,m=n.length-1,c;m>=0;m--)(c=n[m])&&(r=(t?c(i,o,r):c(r))||r);return t&&r&&u(i,o,r),r},e=(n,i)=>(o,t)=>i(o,t,n);import{ICommandService as g}from"../../../../../vs/platform/commands/common/commands.js";import{IConfigurationService as l}from"../../../../../vs/platform/configuration/common/configuration.js";import{InstantiationType as E,registerSingleton as h}from"../../../../../vs/platform/instantiation/common/extensions.js";import{ILabelService as x}from"../../../../../vs/platform/label/common/label.js";import{IQuickInputService as k}from"../../../../../vs/platform/quickinput/common/quickInput.js";import{IStorageService as C}from"../../../../../vs/platform/storage/common/storage.js";import{IWorkspaceContextService as b}from"../../../../../vs/platform/workspace/common/workspace.js";import{BaseConfigurationResolverService as P}from"../../../../../vs/workbench/services/configurationResolver/browser/baseConfigurationResolverService.js";import{IConfigurationResolverService as W}from"../../../../../vs/workbench/services/configurationResolver/common/configurationResolver.js";import{IEditorService as y}from"../../../../../vs/workbench/services/editor/common/editorService.js";import{INativeWorkbenchEnvironmentService as L}from"../../../../../vs/workbench/services/environment/electron-sandbox/environmentService.js";import{IShellEnvironmentService as N}from"../../../../../vs/workbench/services/environment/electron-sandbox/shellEnvironmentService.js";import{IExtensionService as Q}from"../../../../../vs/workbench/services/extensions/common/extensions.js";import{IPathService as A}from"../../../../../vs/workbench/services/path/common/pathService.js";let I=class extends P{constructor(i,o,t,r,m,c,p,v,a,f,s){super({getAppRoot:()=>o.appRoot,getExecPath:()=>o.execPath},v.getShellEnv(),i,t,r,m,c,p,a,f,s)}};I=S([e(0,y),e(1,L),e(2,l),e(3,g),e(4,b),e(5,k),e(6,x),e(7,N),e(8,A),e(9,Q),e(10,C)],I),h(W,I,E.Delayed);export{I as ConfigurationResolverService};
var f=Object.defineProperty;var s=Object.getOwnPropertyDescriptor;var p=(m,o,t,i)=>{for(var r=i>1?void 0:i?s(o,t):o,c=m.length-1,n;c>=0;c--)(n=m[c])&&(r=(i?n(o,t,r):n(r))||r);return i&&r&&f(o,t,r),r},e=(m,o)=>(t,i)=>o(t,i,m);import{ICommandService as d}from"../../../../platform/commands/common/commands.js";import{IConfigurationService as u}from"../../../../platform/configuration/common/configuration.js";import{InstantiationType as g,registerSingleton as l}from"../../../../platform/instantiation/common/extensions.js";import{ILabelService as x}from"../../../../platform/label/common/label.js";import{IQuickInputService as C}from"../../../../platform/quickinput/common/quickInput.js";import{IStorageService as E}from"../../../../platform/storage/common/storage.js";import{IWorkspaceContextService as k}from"../../../../platform/workspace/common/workspace.js";import{BaseConfigurationResolverService as P}from"./baseConfigurationResolverService.js";import{IConfigurationResolverService as b}from"../common/configurationResolver.js";import{IEditorService as h}from"../../editor/common/editorService.js";import{IExtensionService as y}from"../../extensions/common/extensions.js";import{IPathService as L}from"../../path/common/pathService.js";let I=class extends P{constructor(o,t,i,r,c,n,S,a,v){super({getAppRoot:()=>{},getExecPath:()=>{}},Promise.resolve(Object.create(null)),o,t,i,r,c,n,S,a,v)}};I=p([e(0,h),e(1,u),e(2,d),e(3,k),e(4,C),e(5,x),e(6,L),e(7,y),e(8,E)],I),l(b,I,g.Delayed);export{I as ConfigurationResolverService};

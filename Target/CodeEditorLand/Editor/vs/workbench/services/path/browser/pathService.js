var p=Object.defineProperty;var u=Object.getOwnPropertyDescriptor;var a=(t,o,r,e)=>{for(var i=e>1?void 0:e?u(o,r):o,c=t.length-1,s;c>=0;c--)(s=t[c])&&(i=(e?s(o,r,i):s(i))||i);return e&&i&&p(o,r,i),i},m=(t,o)=>(r,e)=>o(r,e,t);import{dirname as I}from"../../../../base/common/resources.js";import{URI as g}from"../../../../base/common/uri.js";import{InstantiationType as k,registerSingleton as h}from"../../../../platform/instantiation/common/extensions.js";import{IWorkspaceContextService as l}from"../../../../platform/workspace/common/workspace.js";import{IWorkbenchEnvironmentService as W}from"../../environment/common/environmentService.js";import{IRemoteAgentService as d}from"../../remote/common/remoteAgentService.js";import{AbstractPathService as f,IPathService as S}from"../common/pathService.js";let n=class extends f{constructor(o,r,e){super(b(r,e),o,r,e)}};n=a([m(0,d),m(1,W),m(2,l)],n);function b(t,o){const r=o.getWorkspace(),e=r.folders.at(0);return e?e.uri:r.configuration?I(r.configuration):g.from({scheme:f.findDefaultUriScheme(t,o),authority:t.remoteAuthority,path:"/"})}h(S,n,k.Delayed);export{n as BrowserPathService};

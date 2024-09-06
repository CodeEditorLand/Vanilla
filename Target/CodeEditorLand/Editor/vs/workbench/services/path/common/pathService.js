var d=Object.defineProperty;var u=Object.getOwnPropertyDescriptor;var f=(a,e,r,n)=>{for(var o=n>1?void 0:n?u(e,r):e,t=a.length-1,m;t>=0;t--)(m=a[t])&&(o=(n?m(e,r,o):m(o))||o);return n&&o&&d(e,r,o),o},c=(a,e)=>(r,n)=>e(r,n,a);import{isValidBasename as v}from"../../../../base/common/extpath.js";import{Schemas as s}from"../../../../base/common/network.js";import{posix as p,win32 as U}from"../../../../base/common/path.js";import{OperatingSystem as l,OS as g}from"../../../../base/common/platform.js";import{basename as I}from"../../../../base/common/resources.js";import{URI as h}from"../../../../base/common/uri.js";import{createDecorator as S}from"../../../../platform/instantiation/common/instantiation.js";import{getVirtualWorkspaceScheme as R}from"../../../../platform/workspace/common/virtualWorkspace.js";import{IWorkspaceContextService as y}from"../../../../platform/workspace/common/workspace.js";import{IWorkbenchEnvironmentService as b}from"../../environment/common/environmentService.js";import{IRemoteAgentService as H}from"../../remote/common/remoteAgentService.js";const q=S("pathService");let i=class{constructor(e,r,n,o){this.localUserHome=e;this.remoteAgentService=r;this.environmentService=n;this.contextService=o;this.resolveOS=(async()=>(await this.remoteAgentService.getEnvironment())?.os||g)(),this.resolveUserHome=(async()=>{const t=await this.remoteAgentService.getEnvironment();return this.maybeUnresolvedUserHome=t?.userHome??e})()}resolveOS;resolveUserHome;maybeUnresolvedUserHome;hasValidBasename(e,r,n){return typeof r=="string"||typeof r>"u"?this.resolveOS.then(o=>this.doHasValidBasename(e,o,r)):this.doHasValidBasename(e,r,n)}doHasValidBasename(e,r,n){return e.scheme===s.file||e.scheme===s.vscodeRemote?v(n??I(e),r===l.Windows):!0}get defaultUriScheme(){return i.findDefaultUriScheme(this.environmentService,this.contextService)}static findDefaultUriScheme(e,r){if(e.remoteAuthority)return s.vscodeRemote;const n=R(r.getWorkspace());if(n)return n;const o=r.getWorkspace().folders[0];if(o)return o.uri.scheme;const t=r.getWorkspace().configuration;return t?t.scheme:s.file}userHome(e){return e?.preferLocal?this.localUserHome:this.resolveUserHome}get resolvedUserHome(){return this.maybeUnresolvedUserHome}get path(){return this.resolveOS.then(e=>e===l.Windows?U:p)}async fileURI(e){let r="";if(await this.resolveOS===l.Windows&&(e=e.replace(/\\/g,"/")),e[0]==="/"&&e[1]==="/"){const o=e.indexOf("/",2);o===-1?(r=e.substring(2),e="/"):(r=e.substring(2,o),e=e.substring(o)||"/")}return h.from({scheme:s.file,authority:r,path:e,query:"",fragment:""})}};i=f([c(1,H),c(2,b),c(3,y)],i);export{i as AbstractPathService,q as IPathService};

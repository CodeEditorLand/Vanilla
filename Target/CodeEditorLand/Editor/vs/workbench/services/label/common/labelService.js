var P=Object.defineProperty;var C=Object.getOwnPropertyDescriptor;var g=(l,p,e,t)=>{for(var r=t>1?void 0:t?C(p,e):p,o=l.length-1,i;o>=0;o--)(i=l[o])&&(r=(t?i(p,e,r):i(r))||r);return t&&r&&P(p,e,r),r},m=(l,p)=>(e,t)=>p(e,t,l);import{Emitter as U}from"../../../../base/common/event.js";import{match as E}from"../../../../base/common/glob.js";import{getPathLabel as w,tildify as D}from"../../../../base/common/labels.js";import{Disposable as M,dispose as H}from"../../../../base/common/lifecycle.js";import{Schemas as O}from"../../../../base/common/network.js";import{posix as h,sep as T,win32 as v}from"../../../../base/common/path.js";import{OperatingSystem as $,OS as S}from"../../../../base/common/platform.js";import{basename as F,basenameOrAuthority as A,dirname as G,joinPath as N}from"../../../../base/common/resources.js";import{URI as b}from"../../../../base/common/uri.js";import{localize as n}from"../../../../nls.js";import{InstantiationType as _,registerSingleton as V}from"../../../../platform/instantiation/common/extensions.js";import{ILabelService as I,Verbosity as f}from"../../../../platform/label/common/label.js";import{Registry as j}from"../../../../platform/registry/common/platform.js";import{IStorageService as q,StorageScope as z,StorageTarget as B}from"../../../../platform/storage/common/storage.js";import{isSingleFolderWorkspaceIdentifier as x,isTemporaryWorkspace as J,isUntitledWorkspace as K,isWorkspace as X,isWorkspaceIdentifier as k,IWorkspaceContextService as Z,toWorkspaceIdentifier as Q,WORKSPACE_EXTENSION as L}from"../../../../platform/workspace/common/workspace.js";import{Extensions as Y}from"../../../common/contributions.js";import{Memento as ee}from"../../../common/memento.js";import{IWorkbenchEnvironmentService as te}from"../../environment/common/environmentService.js";import{isProposedApiEnabled as re}from"../../extensions/common/extensions.js";import{ExtensionsRegistry as oe}from"../../extensions/common/extensionsRegistry.js";import{ILifecycleService as ie,LifecyclePhase as se}from"../../lifecycle/common/lifecycle.js";import{IPathService as ae}from"../../path/common/pathService.js";import{IRemoteAgentService as ne}from"../../remote/common/remoteAgentService.js";const ce=oe.registerExtensionPoint({extensionPoint:"resourceLabelFormatters",jsonSchema:{description:n("vscode.extension.contributes.resourceLabelFormatters","Contributes resource label formatting rules."),type:"array",items:{type:"object",required:["scheme","formatting"],properties:{scheme:{type:"string",description:n("vscode.extension.contributes.resourceLabelFormatters.scheme",'URI scheme on which to match the formatter on. For example "file". Simple glob patterns are supported.')},authority:{type:"string",description:n("vscode.extension.contributes.resourceLabelFormatters.authority","URI authority on which to match the formatter on. Simple glob patterns are supported.")},formatting:{description:n("vscode.extension.contributes.resourceLabelFormatters.formatting","Rules for formatting uri resource labels."),type:"object",properties:{label:{type:"string",description:n("vscode.extension.contributes.resourceLabelFormatters.label","Label rules to display. For example: myLabel:/${path}. ${path}, ${scheme}, ${authority} and ${authoritySuffix} are supported as variables.")},separator:{type:"string",description:n("vscode.extension.contributes.resourceLabelFormatters.separator","Separator to be used in the uri label display. '/' or '' as an example.")},stripPathStartingSeparator:{type:"boolean",description:n("vscode.extension.contributes.resourceLabelFormatters.stripPathStartingSeparator","Controls whether `${path}` substitutions should have starting separator characters stripped.")},tildify:{type:"boolean",description:n("vscode.extension.contributes.resourceLabelFormatters.tildify","Controls if the start of the uri label should be tildified when possible.")},workspaceSuffix:{type:"string",description:n("vscode.extension.contributes.resourceLabelFormatters.formatting.workspaceSuffix","Suffix appended to the workspace label.")}}}}}}}),W=/\//g,le=/\$\{(scheme|authoritySuffix|authority|path|(query)\.(.+?))\}/g;function pe(l){return!!(l&&l[2]===":")}let u=class{formattersDisposables=new Map;constructor(p){ce.setHandler((e,t)=>{for(const r of t.added)for(const o of r.value){const i={...o};typeof i.formatting.label!="string"&&(i.formatting.label="${authority}${path}"),typeof i.formatting.separator!="string"&&(i.formatting.separator=T),!re(r.description,"contribLabelFormatterWorkspaceTooltip")&&i.formatting.workspaceTooltip&&(i.formatting.workspaceTooltip=void 0),this.formattersDisposables.set(i,p.registerFormatter(i))}for(const r of t.removed)for(const o of r.value)H(this.formattersDisposables.get(o))})}};u=g([m(0,I)],u),j.as(Y.Workbench).registerWorkbenchContribution(u,se.Restored);const R=50;let d=class extends M{constructor(e,t,r,o,i,s){super();this.environmentService=e;this.contextService=t;this.pathService=r;this.remoteAgentService=o;this.os=S,this.userHome=r.defaultUriScheme===O.file?this.pathService.userHome({preferLocal:!0}):void 0;const a=this.storedFormattersMemento=new ee("cachedResourceLabelFormatters2",i);this.storedFormatters=a.getMemento(z.PROFILE,B.MACHINE),this.formatters=this.storedFormatters?.formatters?.slice()||[],this.resolveRemoteEnvironment()}formatters;_onDidChangeFormatters=this._register(new U({leakWarningThreshold:400}));onDidChangeFormatters=this._onDidChangeFormatters.event;storedFormattersMemento;storedFormatters;os;userHome;async resolveRemoteEnvironment(){const e=await this.remoteAgentService.getEnvironment();this.os=e?.os??S,this.userHome=await this.pathService.userHome()}findFormatting(e){let t;for(const r of this.formatters)if(r.scheme===e.scheme){if(!r.authority&&(!t||r.priority)){t=r;continue}if(!r.authority)continue;E(r.authority.toLowerCase(),e.authority.toLowerCase())&&(!t||!t.authority||r.authority.length>t.authority.length||r.authority.length===t.authority.length&&r.priority)&&(t=r)}return t?t.formatting:void 0}getUriLabel(e,t={}){let r=this.findFormatting(e);r&&t.separator&&(r={...r,separator:t.separator});const o=this.doGetUriLabel(e,r,t);return!r&&t.separator?o.replace(W,t.separator):o}doGetUriLabel(e,t,r={}){if(!t)return w(e,{os:this.os,tildify:this.userHome?{userHome:this.userHome}:void 0,relative:r.relative?{noPrefix:r.noPrefix,getWorkspace:()=>this.contextService.getWorkspace(),getWorkspaceFolder:o=>this.contextService.getWorkspaceFolder(o)}:void 0});if(r.relative&&this.contextService){let o=this.contextService.getWorkspaceFolder(e);if(!o){const s=this.contextService.getWorkspace().folders.at(0);s&&e.scheme!==s.uri.scheme&&e.path.startsWith(h.sep)&&(o=this.contextService.getWorkspaceFolder(s.uri.with({path:e.path})))}if(o){const i=this.formatUri(o.uri,t,r.noPrefix);let s=this.formatUri(e,t,r.noPrefix),a=0;for(;s[a]&&s[a]===i[a];)a++;if(!s[a]||s[a]===t.separator?s=s.substring(1+a):a===i.length&&o.uri.path===h.sep&&(s=s.substring(a)),this.contextService.getWorkspace().folders.length>1&&!r.noPrefix){const c=o?.name??A(o.uri);s=s?`${c} \u2022 ${s}`:c}return s}}return this.formatUri(e,t,r.noPrefix)}getUriBasenameLabel(e){const t=this.findFormatting(e),r=this.doGetUriLabel(e,t);let o;return t?.separator===v.sep?o=v:t?.separator===h.sep?o=h:o=this.os===$.Windows?v:h,o.basename(r)}getWorkspaceLabel(e,t){if(X(e)){const r=Q(e);return x(r)||k(r)?this.getWorkspaceLabel(r,t):""}return b.isUri(e)?this.doGetSingleFolderWorkspaceLabel(e,t):x(e)?this.doGetSingleFolderWorkspaceLabel(e.uri,t):k(e)?this.doGetWorkspaceLabel(e.configPath,t):""}doGetWorkspaceLabel(e,t){if(K(e,this.environmentService))return n("untitledWorkspace","Untitled (Workspace)");if(J(e))return n("temporaryWorkspace","Workspace");let r=F(e);r.endsWith(L)&&(r=r.substr(0,r.length-L.length-1));let o;switch(t?.verbose){case f.SHORT:o=r;break;case f.LONG:o=n("workspaceNameVerbose","{0} (Workspace)",this.getUriLabel(N(G(e),r)));break;case f.MEDIUM:default:o=n("workspaceName","{0} (Workspace)",r);break}return t?.verbose===f.SHORT?o:this.appendWorkspaceSuffix(o,e)}doGetSingleFolderWorkspaceLabel(e,t){let r;switch(t?.verbose){case f.LONG:r=this.getUriLabel(e);break;case f.SHORT:case f.MEDIUM:default:r=F(e)||h.sep;break}return t?.verbose===f.SHORT?r:this.appendWorkspaceSuffix(r,e)}getSeparator(e,t){return this.findFormatting(b.from({scheme:e,authority:t}))?.separator||h.sep}getHostLabel(e,t){return this.findFormatting(b.from({scheme:e,authority:t}))?.workspaceSuffix||t||""}getHostTooltip(e,t){return this.findFormatting(b.from({scheme:e,authority:t}))?.workspaceTooltip}registerCachedFormatter(e){const t=this.storedFormatters.formatters??=[];let r=t.findIndex(o=>o.scheme===e.scheme&&o.authority===e.authority);if(r===-1&&t.length>=R&&(r=R-1),r===-1)t.unshift(e);else{for(let o=r;o>0;o--)t[o]=t[o-1];t[0]=e}return this.storedFormattersMemento.saveMemento(),this.registerFormatter(e)}registerFormatter(e){return this.formatters.push(e),this._onDidChangeFormatters.fire({scheme:e.scheme}),{dispose:()=>{this.formatters=this.formatters.filter(t=>t!==e),this._onDidChangeFormatters.fire({scheme:e.scheme})}}}formatUri(e,t,r){let o=t.label.replace(le,(i,s,a,y)=>{switch(s){case"scheme":return e.scheme;case"authority":return e.authority;case"authoritySuffix":{const c=e.authority.indexOf("+");return c===-1?e.authority:e.authority.slice(c+1)}case"path":return t.stripPathStartingSeparator?e.path.slice(e.path[0]===t.separator?1:0):e.path;default:{if(a==="query"){const{query:c}=e;if(c&&c[0]==="{"&&c[c.length-1]==="}")try{return JSON.parse(c)[y]||""}catch{}}return""}}});return t.normalizeDriveLetter&&pe(o)&&(o=o.charAt(1).toUpperCase()+o.substr(2)),t.tildify&&!r&&this.userHome&&(o=D(o,this.userHome.fsPath,this.os)),t.authorityPrefix&&e.authority&&(o=t.authorityPrefix+o),o.replace(W,t.separator)}appendWorkspaceSuffix(e,t){const r=this.findFormatting(t),o=r&&typeof r.workspaceSuffix=="string"?r.workspaceSuffix:void 0;return o?`${e} [${o}]`:e}};d=g([m(0,te),m(1,Z),m(2,ae),m(3,ne),m(4,q),m(5,ie)],d),V(I,d,_.Delayed);export{d as LabelService};

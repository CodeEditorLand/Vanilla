var v=Object.defineProperty;var E=Object.getOwnPropertyDescriptor;var f=(c,s,n,e)=>{for(var i=e>1?void 0:e?E(s,n):s,o=c.length-1,t;o>=0;o--)(t=c[o])&&(i=(e?t(s,n,i):t(i))||i);return e&&i&&v(s,n,i),i},r=(c,s)=>(n,e)=>s(n,e,c);import{distinct as l,equals as u}from"../../../../../vs/base/common/arrays.js";import{RunOnceScheduler as S}from"../../../../../vs/base/common/async.js";import{Emitter as k}from"../../../../../vs/base/common/event.js";import"../../../../../vs/base/common/uri.js";import{localize as p}from"../../../../../vs/nls.js";import{EXTENSION_IDENTIFIER_PATTERN as C}from"../../../../../vs/platform/extensionManagement/common/extensionManagement.js";import{FileChangeType as x,IFileService as R}from"../../../../../vs/platform/files/common/files.js";import{INotificationService as w}from"../../../../../vs/platform/notification/common/notification.js";import{IUriIdentityService as I}from"../../../../../vs/platform/uriIdentity/common/uriIdentity.js";import{IWorkspaceContextService as y}from"../../../../../vs/platform/workspace/common/workspace.js";import{ExtensionRecommendations as D}from"../../../../../vs/workbench/contrib/extensions/browser/extensionRecommendations.js";import{IWorkbenchExtensionManagementService as _}from"../../../../../vs/workbench/services/extensionManagement/common/extensionManagement.js";import{ExtensionRecommendationReason as g}from"../../../../../vs/workbench/services/extensionRecommendations/common/extensionRecommendations.js";import{IWorkspaceExtensionsConfigService as W}from"../../../../../vs/workbench/services/extensionRecommendations/common/workspaceExtensionsConfig.js";const m=".vscode/extensions";let d=class extends D{constructor(n,e,i,o,t,h){super();this.workspaceExtensionsConfigService=n;this.contextService=e;this.uriIdentityService=i;this.fileService=o;this.workbenchExtensionManagementService=t;this.notificationService=h;this.onDidChangeWorkspaceExtensionsScheduler=this._register(new S(()=>this.onDidChangeWorkspaceExtensionsFolders(),1e3))}_recommendations=[];get recommendations(){return this._recommendations}_onDidChangeRecommendations=this._register(new k);onDidChangeRecommendations=this._onDidChangeRecommendations.event;_ignoredRecommendations=[];get ignoredRecommendations(){return this._ignoredRecommendations}workspaceExtensions=[];onDidChangeWorkspaceExtensionsScheduler;async doActivate(){this.workspaceExtensions=await this.fetchWorkspaceExtensions(),await this.fetch(),this._register(this.workspaceExtensionsConfigService.onDidChangeExtensionsConfigs(()=>this.onDidChangeExtensionsConfigs()));for(const n of this.contextService.getWorkspace().folders)this._register(this.fileService.watch(this.uriIdentityService.extUri.joinPath(n.uri,m)));this._register(this.contextService.onDidChangeWorkspaceFolders(()=>this.onDidChangeWorkspaceExtensionsScheduler.schedule())),this._register(this.fileService.onDidFilesChange(n=>{this.contextService.getWorkspace().folders.some(e=>n.affects(this.uriIdentityService.extUri.joinPath(e.uri,m),x.ADDED,x.DELETED))&&this.onDidChangeWorkspaceExtensionsScheduler.schedule()}))}async onDidChangeWorkspaceExtensionsFolders(){const n=this.workspaceExtensions;this.workspaceExtensions=await this.fetchWorkspaceExtensions(),u(n,this.workspaceExtensions,(e,i)=>this.uriIdentityService.extUri.isEqual(e,i))||this.onDidChangeExtensionsConfigs()}async fetchWorkspaceExtensions(){const n=[];for(const e of this.contextService.getWorkspace().folders){const i=this.uriIdentityService.extUri.joinPath(e.uri,m);try{const o=await this.fileService.resolve(i);for(const t of o.children??[])t.isDirectory&&n.push(t.resource)}catch{}}return n.length?(await this.workbenchExtensionManagementService.getExtensions(n)).map(i=>i.location):[]}async fetch(){const n=await this.workspaceExtensionsConfigService.getExtensionsConfigs(),{invalidRecommendations:e,message:i}=await this.validateExtensions(n);e.length&&this.notificationService.warn(`The ${e.length} extension(s) below, in workspace recommendations have issues:
${i}`),this._recommendations=[],this._ignoredRecommendations=[];for(const o of n){if(o.unwantedRecommendations)for(const t of o.unwantedRecommendations)e.indexOf(t)===-1&&this._ignoredRecommendations.push(t);if(o.recommendations)for(const t of o.recommendations)e.indexOf(t)===-1&&this._recommendations.push({extension:t,reason:{reasonId:g.Workspace,reasonText:p("workspaceRecommendation","This extension is recommended by users of the current workspace.")}})}for(const o of this.workspaceExtensions)this._recommendations.push({extension:o,reason:{reasonId:g.Workspace,reasonText:p("workspaceRecommendation","This extension is recommended by users of the current workspace.")}})}async validateExtensions(n){const e=[],i=[];let o="";const t=l(n.flatMap(({recommendations:a})=>a||[])),h=new RegExp(C);for(const a of t)h.test(a)?e.push(a):(i.push(a),o+=`${a} (bad format) Expected: <provider>.<name>
`);return{validRecommendations:e,invalidRecommendations:i,message:o}}async onDidChangeExtensionsConfigs(){await this.fetch(),this._onDidChangeRecommendations.fire()}};d=f([r(0,W),r(1,y),r(2,I),r(3,R),r(4,_),r(5,w)],d);export{d as WorkspaceRecommendations};

var E=Object.defineProperty;var x=Object.getOwnPropertyDescriptor;var v=(d,o,n,r)=>{for(var i=r>1?void 0:r?x(o,n):o,s=d.length-1,a;s>=0;s--)(a=d[s])&&(i=(r?a(o,n,i):a(i))||i);return r&&i&&E(o,n,i),i},c=(d,o)=>(n,r)=>o(n,r,d);import"vscode";import{Lazy as I}from"../../../base/common/lazy.js";import{Disposable as b}from"../../../base/common/lifecycle.js";import*as g from"../../../base/common/path.js";import*as p from"../../../base/common/process.js";import"../../../base/common/uri.js";import{createDecorator as h}from"../../../platform/instantiation/common/instantiation.js";import"../../services/configurationResolver/common/configurationResolver.js";import{AbstractVariableResolverService as H}from"../../services/configurationResolver/common/variableResolver.js";import{IExtHostConfiguration as C}from"./extHostConfiguration.js";import{IExtHostDocumentsAndEditors as T}from"./extHostDocumentsAndEditors.js";import{IExtHostEditorTabs as k}from"./extHostEditorTabs.js";import{IExtHostExtensionService as P}from"./extHostExtensionService.js";import{CustomEditorTabInput as y,NotebookDiffEditorTabInput as R,NotebookEditorTabInput as D,TextDiffTabInput as S,TextTabInput as w}from"./extHostTypes.js";import{IExtHostWorkspace as F}from"./extHostWorkspace.js";const Y=h("IExtHostVariableResolverProvider");class W extends H{constructor(o,n,r,i,s,a,l){function m(){if(r){const e=r.activeEditor();if(e)return e.document.uri;const t=i.tabGroups.all.find(u=>u.isActive)?.activeTab;if(t!==void 0){if(t.input instanceof S||t.input instanceof R)return t.input.modified;if(t.input instanceof w||t.input instanceof D||t.input instanceof y)return t.input.uri}}}super({getFolderUri:e=>{const t=a.folders.filter(u=>u.name===e);if(t&&t.length>0)return t[0].uri},getWorkspaceFolderCount:()=>a.folders.length,getConfigurationValue:(e,t)=>s.getConfiguration(void 0,e).get(t),getAppRoot:()=>p.cwd(),getExecPath:()=>p.env.VSCODE_EXEC_PATH,getFilePath:()=>{const e=m();if(e)return g.normalize(e.fsPath)},getWorkspaceFolderPathForFile:()=>{if(n){const e=m();if(e){const t=n.getWorkspaceFolder(e);if(t)return g.normalize(t.uri.fsPath)}}},getSelectedText:()=>{if(r){const e=r.activeEditor();if(e&&!e.selection.isEmpty)return e.document.getText(e.selection)}},getLineNumber:()=>{if(r){const e=r.activeEditor();if(e)return String(e.selection.end.line+1)}},getExtension:e=>o.getExtension(e)},void 0,l?Promise.resolve(l):void 0,Promise.resolve(p.env))}}let f=class extends b{constructor(n,r,i,s,a){super();this.extensionService=n;this.workspaceService=r;this.editorService=i;this.configurationService=s;this.editorTabs=a}_resolver=new I(async()=>{const n=await this.configurationService.getConfigProvider(),i={folders:await this.workspaceService.getWorkspaceFolders2()||[]};return this._register(this.workspaceService.onDidChangeWorkspace(async s=>{i.folders=await this.workspaceService.getWorkspaceFolders2()||[]})),new W(this.extensionService,this.workspaceService,this.editorService,this.editorTabs,n,i,this.homeDir())});getResolver(){return this._resolver.value}homeDir(){}};f=v([c(0,P),c(1,F),c(2,T),c(3,C),c(4,k)],f);export{f as ExtHostVariableResolverProviderService,Y as IExtHostVariableResolverProvider};

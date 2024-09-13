var R=Object.defineProperty;var C=Object.getOwnPropertyDescriptor;var h=(l,c,e,o)=>{for(var n=o>1?void 0:o?C(c,e):c,i=l.length-1,t;i>=0;i--)(t=l[i])&&(n=(o?t(c,e,n):t(n))||n);return o&&n&&R(c,e,n),n},p=(l,c)=>(e,o)=>c(e,o,l);import{distinct as g}from"../../../../base/common/arrays.js";import{Emitter as y}from"../../../../base/common/event.js";import{parse as k}from"../../../../base/common/json.js";import{Disposable as W}from"../../../../base/common/lifecycle.js";import{ResourceMap as w}from"../../../../base/common/map.js";import{ILanguageService as S}from"../../../../editor/common/languages/language.js";import{getIconClasses as I}from"../../../../editor/common/services/getIconClasses.js";import{IModelService as F}from"../../../../editor/common/services/model.js";import{localize as u}from"../../../../nls.js";import{FileKind as O,IFileService as x}from"../../../../platform/files/common/files.js";import{InstantiationType as P,registerSingleton as A}from"../../../../platform/instantiation/common/extensions.js";import{createDecorator as N}from"../../../../platform/instantiation/common/instantiation.js";import{IQuickInputService as V}from"../../../../platform/quickinput/common/quickInput.js";import{IWorkspaceContextService as J,isWorkspace as E}from"../../../../platform/workspace/common/workspace.js";import{IJSONEditingService as D}from"../../configuration/common/jsonEditing.js";const v=".vscode/extensions.json",T=N("IWorkspaceExtensionsConfigService");let f=class extends W{constructor(e,o,n,i,t,r){super();this.workspaceContextService=e;this.fileService=o;this.quickInputService=n;this.modelService=i;this.languageService=t;this.jsonEditingService=r;this._register(e.onDidChangeWorkspaceFolders(s=>this._onDidChangeExtensionsConfigs.fire())),this._register(o.onDidFilesChange(s=>{const d=e.getWorkspace();(d.configuration&&s.affects(d.configuration)||d.folders.some(a=>s.affects(a.toResource(v))))&&this._onDidChangeExtensionsConfigs.fire()}))}_onDidChangeExtensionsConfigs=this._register(new y);onDidChangeExtensionsConfigs=this._onDidChangeExtensionsConfigs.event;async getExtensionsConfigs(){const e=this.workspaceContextService.getWorkspace(),o=[],n=e.configuration?await this.resolveWorkspaceExtensionConfig(e.configuration):void 0;return n&&o.push(n),o.push(...await Promise.all(e.folders.map(i=>this.resolveWorkspaceFolderExtensionConfig(i)))),o}async getRecommendations(){const e=await this.getExtensionsConfigs();return g(e.flatMap(o=>o.recommendations?o.recommendations.map(n=>n.toLowerCase()):[]))}async getUnwantedRecommendations(){const e=await this.getExtensionsConfigs();return g(e.flatMap(o=>o.unwantedRecommendations?o.unwantedRecommendations.map(n=>n.toLowerCase()):[]))}async toggleRecommendation(e){e=e.toLowerCase();const o=this.workspaceContextService.getWorkspace(),n=o.configuration?await this.resolveWorkspaceExtensionConfig(o.configuration):void 0,i=new w;await Promise.all(o.folders.map(async a=>{const m=await this.resolveWorkspaceFolderExtensionConfig(a);i.set(a.uri,m)}));const t=n&&n.recommendations?.some(a=>a.toLowerCase()===e),r=o.folders.filter(a=>i.get(a.uri)?.recommendations?.some(m=>m.toLowerCase()===e)),s=t||r.length>0,d=s?await this.pickWorkspaceOrFolders(r,t?o:void 0,u("select for remove","Remove extension recommendation from")):await this.pickWorkspaceOrFolders(o.folders,o.configuration?o:void 0,u("select for add","Add extension recommendation to"));for(const a of d)E(a)?await this.addOrRemoveWorkspaceRecommendation(e,a,n,!s):await this.addOrRemoveWorkspaceFolderRecommendation(e,a,i.get(a.uri),!s)}async toggleUnwantedRecommendation(e){const o=this.workspaceContextService.getWorkspace(),n=o.configuration?await this.resolveWorkspaceExtensionConfig(o.configuration):void 0,i=new w;await Promise.all(o.folders.map(async a=>{const m=await this.resolveWorkspaceFolderExtensionConfig(a);i.set(a.uri,m)}));const t=n&&n.unwantedRecommendations?.some(a=>a===e),r=o.folders.filter(a=>i.get(a.uri)?.unwantedRecommendations?.some(m=>m===e)),s=t||r.length>0,d=s?await this.pickWorkspaceOrFolders(r,t?o:void 0,u("select for remove","Remove extension recommendation from")):await this.pickWorkspaceOrFolders(o.folders,o.configuration?o:void 0,u("select for add","Add extension recommendation to"));for(const a of d)E(a)?await this.addOrRemoveWorkspaceUnwantedRecommendation(e,a,n,!s):await this.addOrRemoveWorkspaceFolderUnwantedRecommendation(e,a,i.get(a.uri),!s)}async addOrRemoveWorkspaceFolderRecommendation(e,o,n,i){const t=[];if(i){Array.isArray(n.recommendations)?t.push({path:["recommendations",-1],value:e}):t.push({path:["recommendations"],value:[e]});const r=this.getEditToRemoveValueFromArray(["unwantedRecommendations"],n.unwantedRecommendations,e);r&&t.push(r)}else if(n.recommendations){const r=this.getEditToRemoveValueFromArray(["recommendations"],n.recommendations,e);r&&t.push(r)}if(t.length)return this.jsonEditingService.write(o.toResource(v),t,!0)}async addOrRemoveWorkspaceRecommendation(e,o,n,i){const t=[];if(n){if(i){const r=["extensions","recommendations"];Array.isArray(n.recommendations)?t.push({path:[...r,-1],value:e}):t.push({path:r,value:[e]});const s=this.getEditToRemoveValueFromArray(["extensions","unwantedRecommendations"],n.unwantedRecommendations,e);s&&t.push(s)}else if(n.recommendations){const r=this.getEditToRemoveValueFromArray(["extensions","recommendations"],n.recommendations,e);r&&t.push(r)}}else i&&t.push({path:["extensions"],value:{recommendations:[e]}});if(t.length)return this.jsonEditingService.write(o.configuration,t,!0)}async addOrRemoveWorkspaceFolderUnwantedRecommendation(e,o,n,i){const t=[];if(i){const r=["unwantedRecommendations"];Array.isArray(n.unwantedRecommendations)?t.push({path:[...r,-1],value:e}):t.push({path:r,value:[e]});const s=this.getEditToRemoveValueFromArray(["recommendations"],n.recommendations,e);s&&t.push(s)}else if(n.unwantedRecommendations){const r=this.getEditToRemoveValueFromArray(["unwantedRecommendations"],n.unwantedRecommendations,e);r&&t.push(r)}if(t.length)return this.jsonEditingService.write(o.toResource(v),t,!0)}async addOrRemoveWorkspaceUnwantedRecommendation(e,o,n,i){const t=[];if(n){if(i){const r=["extensions","unwantedRecommendations"];Array.isArray(n.recommendations)?t.push({path:[...r,-1],value:e}):t.push({path:r,value:[e]});const s=this.getEditToRemoveValueFromArray(["extensions","recommendations"],n.recommendations,e);s&&t.push(s)}else if(n.unwantedRecommendations){const r=this.getEditToRemoveValueFromArray(["extensions","unwantedRecommendations"],n.unwantedRecommendations,e);r&&t.push(r)}}else i&&t.push({path:["extensions"],value:{unwantedRecommendations:[e]}});if(t.length)return this.jsonEditingService.write(o.configuration,t,!0)}async pickWorkspaceOrFolders(e,o,n){const i=o?[...e,o]:[...e];if(i.length===1)return i;const t=e.map(s=>({label:s.name,description:u("workspace folder","Workspace Folder"),workspaceOrFolder:s,iconClasses:I(this.modelService,this.languageService,s.uri,O.ROOT_FOLDER)}));return o&&(t.push({type:"separator"}),t.push({label:u("workspace","Workspace"),workspaceOrFolder:o})),(await this.quickInputService.pick(t,{placeHolder:n,canPickMany:!0})||[]).map(s=>s.workspaceOrFolder)}async resolveWorkspaceExtensionConfig(e){try{const o=await this.fileService.readFile(e),n=k(o.value.toString()).extensions;return n?this.parseExtensionConfig(n):void 0}catch{}}async resolveWorkspaceFolderExtensionConfig(e){try{const o=await this.fileService.readFile(e.toResource(v)),n=k(o.value.toString());return this.parseExtensionConfig(n)}catch{}return{}}parseExtensionConfig(e){return{recommendations:g((e.recommendations||[]).map(o=>o.toLowerCase())),unwantedRecommendations:g((e.unwantedRecommendations||[]).map(o=>o.toLowerCase()))}}getEditToRemoveValueFromArray(e,o,n){const i=o?.indexOf(n);if(i!==void 0&&i!==-1)return{path:[...e,i],value:void 0}}};f=h([p(0,J),p(1,x),p(2,V),p(3,F),p(4,S),p(5,D)],f),A(T,f,P.Delayed);export{v as EXTENSIONS_CONFIG,T as IWorkspaceExtensionsConfigService,f as WorkspaceExtensionsConfigService};

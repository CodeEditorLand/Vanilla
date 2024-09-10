var E=Object.defineProperty;var L=Object.getOwnPropertyDescriptor;var S=(p,e,i,t)=>{for(var n=t>1?void 0:t?L(e,i):e,s=p.length-1,r;s>=0;s--)(r=p[s])&&(n=(t?r(e,i,n):r(n))||n);return t&&n&&E(e,i,n),n},o=(p,e)=>(i,t)=>e(i,t,p);import{combinedDisposable as R,DisposableStore as h}from"../../../../base/common/lifecycle.js";import*as f from"../../../../base/common/resources.js";import{isFalsyOrWhitespace as _}from"../../../../base/common/strings.js";import{ILanguageService as k}from"../../../../editor/common/languages/language.js";import{setSnippetSuggestSupport as D}from"../../../../editor/contrib/suggest/browser/suggest.js";import{localize as l}from"../../../../nls.js";import{IEnvironmentService as W}from"../../../../platform/environment/common/environment.js";import{FileChangeType as T,IFileService as U}from"../../../../platform/files/common/files.js";import{ILifecycleService as C,LifecyclePhase as O}from"../../../services/lifecycle/common/lifecycle.js";import{ILogService as N}from"../../../../platform/log/common/log.js";import{IWorkspaceContextService as A}from"../../../../platform/workspace/common/workspace.js";import{SnippetFile as I,SnippetSource as g}from"./snippetsFile.js";import{ExtensionsRegistry as j}from"../../../services/extensions/common/extensionsRegistry.js";import{languagesExtPoint as M}from"../../../services/language/common/languageService.js";import{SnippetCompletionProvider as G}from"./snippetCompletionProvider.js";import{IExtensionResourceLoaderService as J}from"../../../../platform/extensionResourceLoader/common/extensionResourceLoader.js";import{ResourceMap as V}from"../../../../base/common/map.js";import{IStorageService as b,StorageScope as m,StorageTarget as P}from"../../../../platform/storage/common/storage.js";import{isStringArray as H}from"../../../../base/common/types.js";import{IInstantiationService as X}from"../../../../platform/instantiation/common/instantiation.js";import{ITextFileService as $}from"../../../services/textfile/common/textfiles.js";import{ILanguageConfigurationService as q}from"../../../../editor/common/languages/languageConfigurationRegistry.js";import{IUserDataProfileService as B}from"../../../services/userDataProfile/common/userDataProfile.js";import{insertInto as z}from"../../../../base/common/arrays.js";var y;(t=>{function p(n,s,r){if(_(s.path))return n.collector.error(l("invalid.path.0","Expected string in `contributes.{0}.path`. Provided value: {1}",n.description.name,String(s.path))),null;if(_(s.language)&&!s.path.endsWith(".code-snippets"))return n.collector.error(l("invalid.language.0","When omitting the language, the value of `contributes.{0}.path` must be a `.code-snippets`-file. Provided value: {1}",n.description.name,String(s.path))),null;if(!_(s.language)&&!r.isRegisteredLanguageId(s.language))return n.collector.error(l("invalid.language","Unknown language in `contributes.{0}.language`. Provided value: {1}",n.description.name,String(s.language))),null;const a=n.description.extensionLocation,u=f.joinPath(a,s.path);return f.isEqualOrParent(u,a)?{language:s.language,location:u}:(n.collector.error(l("invalid.path.1","Expected `contributes.{0}.path` ({1}) to be included inside extension's folder ({2}). This might make the extension non-portable.",n.description.name,u.path,a.path)),null)}t.toValidSnippet=p,t.snippetsContribution={description:l("vscode.extension.contributes.snippets","Contributes snippets."),type:"array",defaultSnippets:[{body:[{language:"",path:""}]}],items:{type:"object",defaultSnippets:[{body:{language:"${1:id}",path:"./snippets/${2:id}.json."}}],properties:{language:{description:l("vscode.extension.contributes.snippets-language","Language identifier for which this snippet is contributed to."),type:"string"},path:{description:l("vscode.extension.contributes.snippets-path","Path of the snippets file. The path is relative to the extension folder and typically starts with './snippets/'."),type:"string"}}}},t.point=j.registerExtensionPoint({extensionPoint:"snippets",deps:[M],jsonSchema:t.snippetsContribution})})(y||={});function K(p,e,i){return R(p.watch(e),p.onDidFilesChange(t=>{t.affects(e)&&i()}))}let c=class{constructor(e){this._storageService=e;const i=e.get(c._key,m.PROFILE,"");let t;try{t=JSON.parse(i)}catch{}this._ignored=H(t)?new Set(t):new Set}static _key="snippets.ignoredSnippets";_ignored;isIgnored(e){return this._ignored.has(e)}updateIgnored(e,i){let t=!1;this._ignored.has(e)&&!i?(this._ignored.delete(e),t=!0):!this._ignored.has(e)&&i&&(this._ignored.add(e),t=!0),t&&this._storageService.store(c._key,JSON.stringify(Array.from(this._ignored)),m.PROFILE,P.USER)}};c=S([o(0,b)],c);let d=class{constructor(e){this._storageService=e;const i=e.get(d._key,m.PROFILE,"");let t;try{t=JSON.parse(i)}catch{t=[]}this._usages=Array.isArray(t)?new Map(t):new Map}static _key="snippets.usageTimestamps";_usages;getUsageTimestamp(e){return this._usages.get(e)}updateUsageTimestamp(e){this._usages.delete(e),this._usages.set(e,Date.now());const i=[...this._usages].slice(-100);this._storageService.store(d._key,JSON.stringify(i),m.PROFILE,P.USER)}};d=S([o(0,b)],d);let v=class{constructor(e,i,t,n,s,r,a,u,F,x,w){this._environmentService=e;this._userDataProfileService=i;this._contextService=t;this._languageService=n;this._logService=s;this._fileService=r;this._textfileService=a;this._extensionResourceLoaderService=u;this._pendingWork.push(Promise.resolve(F.when(O.Restored).then(()=>{this._initExtensionSnippets(),this._initUserSnippets(),this._initWorkspaceSnippets()}))),D(new G(this._languageService,this,w)),this._enablement=x.createInstance(c),this._usageTimestamps=x.createInstance(d)}_disposables=new h;_pendingWork=[];_files=new V;_enablement;_usageTimestamps;dispose(){this._disposables.dispose()}isEnabled(e){return!this._enablement.isIgnored(e.snippetIdentifier)}updateEnablement(e,i){this._enablement.updateIgnored(e.snippetIdentifier,!i)}updateUsageTimestamp(e){this._usageTimestamps.updateUsageTimestamp(e.snippetIdentifier)}_joinSnippets(){const e=this._pendingWork.slice(0);return this._pendingWork.length=0,Promise.all(e)}async getSnippetFiles(){return await this._joinSnippets(),this._files.values()}async getSnippets(e,i){await this._joinSnippets();const t=[],n=[];if(e){if(this._languageService.isRegisteredLanguageId(e))for(const s of this._files.values())n.push(s.load().then(r=>r.select(e,t)).catch(r=>this._logService.error(r,s.location.toString())))}else for(const s of this._files.values())n.push(s.load().then(r=>z(t,t.length,r.data)).catch(r=>this._logService.error(r,s.location.toString())));return await Promise.all(n),this._filterAndSortSnippets(t,i)}getSnippetsSync(e,i){const t=[];if(this._languageService.isRegisteredLanguageId(e))for(const n of this._files.values())n.load().catch(s=>{}),n.select(e,t);return this._filterAndSortSnippets(t,i)}_filterAndSortSnippets(e,i){const t=[];for(const n of e)!n.prefix&&!i?.includeNoPrefixSnippets||!this.isEnabled(n)&&!i?.includeDisabledSnippets||typeof i?.fileTemplateSnippets=="boolean"&&i.fileTemplateSnippets!==n.isFileTemplate||t.push(n);return t.sort((n,s)=>{let r=0;if(!i?.noRecencySort){const a=this._usageTimestamps.getUsageTimestamp(n.snippetIdentifier)??-1;r=(this._usageTimestamps.getUsageTimestamp(s.snippetIdentifier)??-1)-a}return r===0&&(r=this._compareSnippet(n,s)),r})}_compareSnippet(e,i){return e.snippetSource<i.snippetSource?-1:e.snippetSource>i.snippetSource?1:e.source<i.source?-1:e.source>i.source||e.name>i.name?1:e.name<i.name?-1:0}_initExtensionSnippets(){y.point.setHandler(e=>{for(const[i,t]of this._files)t.source===g.Extension&&this._files.delete(i);for(const i of e)for(const t of i.value){const n=y.toValidSnippet(i,t,this._languageService);if(!n)continue;const s=this._files.get(n.location);if(s)s.defaultScopes?s.defaultScopes.push(n.language):s.defaultScopes=[];else{const r=new I(g.Extension,n.location,n.language?[n.language]:void 0,i.description,this._fileService,this._extensionResourceLoaderService);this._files.set(r.location,r),this._environmentService.isExtensionDevelopment&&r.load().then(a=>{a.data.some(u=>u.isBogous)&&i.collector.warn(l("badVariableUse","One or more snippets from the extension '{0}' very likely confuse snippet-variables and snippet-placeholders (see https://code.visualstudio.com/docs/editor/userdefinedsnippets#_snippet-syntax for more details)",i.description.name))},a=>{i.collector.warn(l("badFile",'The snippet file "{0}" could not be read.',r.location.toString()))})}}})}_initWorkspaceSnippets(){const e=new h,i=()=>{e.clear(),this._pendingWork.push(this._initWorkspaceFolderSnippets(this._contextService.getWorkspace(),e))};this._disposables.add(e),this._disposables.add(this._contextService.onDidChangeWorkspaceFolders(i)),this._disposables.add(this._contextService.onDidChangeWorkbenchState(i)),i()}async _initWorkspaceFolderSnippets(e,i){const t=e.folders.map(async n=>{const s=n.toResource(".vscode");await this._fileService.exists(s)?this._initFolderSnippets(g.Workspace,s,i):i.add(this._fileService.onDidFilesChange(a=>{a.contains(s,T.ADDED)&&this._initFolderSnippets(g.Workspace,s,i)}))});await Promise.all(t)}async _initUserSnippets(){const e=new h,i=async()=>{e.clear();const t=this._userDataProfileService.currentProfile.snippetsHome;await this._fileService.createFolder(t),await this._initFolderSnippets(g.User,t,e)};this._disposables.add(e),this._disposables.add(this._userDataProfileService.onDidChangeCurrentProfile(t=>t.join((async()=>{this._pendingWork.push(i())})()))),await i()}_initFolderSnippets(e,i,t){const n=new h,s=async()=>{if(n.clear(),!!await this._fileService.exists(i))try{const r=await this._fileService.resolve(i);for(const a of r.children||[])n.add(this._addSnippetFile(a.resource,e))}catch(r){this._logService.error(`Failed snippets from folder '${i.toString()}'`,r)}};return t.add(this._textfileService.files.onDidSave(r=>{f.isEqualOrParent(r.model.resource,i)&&s()})),t.add(K(this._fileService,i,s)),t.add(n),s()}_addSnippetFile(e,i){const t=f.extname(e);if(i===g.User&&t===".json"){const n=f.basename(e).replace(/\.json/,"");this._files.set(e,new I(i,e,[n],void 0,this._fileService,this._extensionResourceLoaderService))}else t===".code-snippets"&&this._files.set(e,new I(i,e,void 0,void 0,this._fileService,this._extensionResourceLoaderService));return{dispose:()=>this._files.delete(e)}}};v=S([o(0,W),o(1,B),o(2,A),o(3,k),o(4,N),o(5,U),o(6,$),o(7,J),o(8,C),o(9,X),o(10,q)],v);function Ue(p,e){const t=p.getLineContent(e.lineNumber).substr(0,e.column-1),n=Math.max(0,t.length-100);for(let s=t.length-1;s>=n;s--){const r=t.charAt(s);if(/\s/.test(r))return t.substr(s+1)}return n===0?t:""}export{v as SnippetsService,Ue as getNonWhitespacePrefix};

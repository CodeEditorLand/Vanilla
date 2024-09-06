var y=Object.defineProperty;var w=Object.getOwnPropertyDescriptor;var p=(c,e,r,o)=>{for(var t=o>1?void 0:o?w(e,r):e,a=c.length-1,n;a>=0;a--)(n=c[a])&&(t=(o?n(e,r,t):n(t))||t);return o&&t&&y(e,r,t),t},s=(c,e)=>(r,o)=>e(r,o,c);import{Schemas as g}from"../../../../../base/common/network.js";import{OperatingSystem as x}from"../../../../../base/common/platform.js";import{URI as I}from"../../../../../base/common/uri.js";import{ICommandService as b}from"../../../../../platform/commands/common/commands.js";import{IConfigurationService as E}from"../../../../../platform/configuration/common/configuration.js";import"../../../../../platform/editor/common/editor.js";import{IFileService as C}from"../../../../../platform/files/common/files.js";import{IInstantiationService as R}from"../../../../../platform/instantiation/common/instantiation.js";import{IOpenerService as k}from"../../../../../platform/opener/common/opener.js";import{IQuickInputService as P}from"../../../../../platform/quickinput/common/quickInput.js";import{TerminalCapability as T}from"../../../../../platform/terminal/common/capabilities/capabilities.js";import{ITerminalLogService as O}from"../../../../../platform/terminal/common/terminal.js";import{IWorkspaceContextService as W}from"../../../../../platform/workspace/common/workspace.js";import{IEditorService as M}from"../../../../services/editor/common/editorService.js";import{IWorkbenchEnvironmentService as $}from"../../../../services/environment/common/environmentService.js";import{IHostService as A}from"../../../../services/host/browser/host.js";import{QueryBuilder as Q}from"../../../../services/search/common/queryBuilder.js";import{ISearchService as D}from"../../../../services/search/common/search.js";import"./links.js";import{osPathModule as _,updateLinkWithRelativeCwd as L}from"./terminalLinkHelpers.js";import{detectLinks as U,getLinkSuffix as B}from"./terminalLinkParsing.js";let u=class{constructor(e){this._editorService=e}async open(e){if(!e.uri)throw new Error("Tried to open file link without a resolved URI");const r=e.parsedLink?e.parsedLink.suffix:B(e.text);let o=e.selection;o||(o=r?.row===void 0?void 0:{startLineNumber:r.row??1,startColumn:r.col??1,endLineNumber:r.rowEnd,endColumn:r.colEnd}),await this._editorService.openEditor({resource:e.uri,options:{pinned:!0,selection:o,revealIfOpened:!0}})}};u=p([s(0,M)],u);let f=class{constructor(e){this._commandService=e}async open(e){if(!e.uri)throw new Error("Tried to open folder in workspace link without a resolved URI");await this._commandService.executeCommand("revealInExplorer",e.uri)}};f=p([s(0,b)],f);let d=class{constructor(e){this._hostService=e}async open(e){if(!e.uri)throw new Error("Tried to open folder in workspace link without a resolved URI");this._hostService.openWindow([{folderUri:e.uri}],{forceNewWindow:!0})}};d=p([s(0,A)],d);let v=class{constructor(e,r,o,t,a,n,i,l,m,S,q,N){this._capabilities=e;this._initialCwd=r;this._localFileOpener=o;this._localFolderInWorkspaceOpener=t;this._getOS=a;this._fileService=n;this._instantiationService=i;this._logService=l;this._quickInputService=m;this._searchService=S;this._workspaceContextService=q;this._workbenchEnvironmentService=N}_fileQueryBuilder=this._instantiationService.createInstance(Q);async open(e){const r=_(this._getOS()),o=r.sep;let t=e.text.replace(/^file:\/\/\/?/,"");if(t=r.normalize(t).replace(/^(\.+[\\/])+/,""),e.contextLine){const i=U(e.contextLine,this._getOS()).find(l=>l.suffix&&e.text.startsWith(l.path.text));i&&i.suffix?.row!==void 0&&(t=i.path.text,t+=`:${i.suffix.row}`,i.suffix?.col!==void 0&&(t+=`:${i.suffix.col}`))}t=t.replace(/:[^\\/\d][^\d]*$/,""),t=t.replace(/\.$/,""),this._workspaceContextService.getWorkspace().folders.forEach(n=>{if(t.substring(0,n.name.length+1)===n.name+o){t=t.substring(n.name.length+1);return}});let a=t;if(this._capabilities.has(T.CommandDetection)&&(a=L(this._capabilities,e.bufferRange.start.y,t,r,this._logService)?.[0]||t),!await this._tryOpenExactLink(a,e)&&!(t!==a&&await this._tryOpenExactLink(t,e)))return this._quickInputService.quickAccess.show(t)}async _getExactMatch(e){const r=this._getOS(),o=_(r),t=o.isAbsolute(e);let a=t?e:void 0;!t&&this._initialCwd.length>0&&(a=o.join(this._initialCwd,e));let n;if(a){let i=a;r===x.Windows&&(i=a.replace(/\\/g,"/"),i.match(/[a-z]:/i)&&(i=`/${i}`));let l;this._workbenchEnvironmentService.remoteAuthority?l=I.from({scheme:g.vscodeRemote,authority:this._workbenchEnvironmentService.remoteAuthority,path:i}):l=I.file(i);try{const m=await this._fileService.stat(l);n={uri:l,isDirectory:m.isDirectory}}catch{}}if(!n){const i=await this._searchService.fileSearch(this._fileQueryBuilder.file(this._workspaceContextService.getWorkspace().folders,{filePattern:e,maxResults:2}));if(i.results.length>0){if(i.results.length===1)n={uri:i.results[0].resource};else if(!t){const m=(await this._searchService.fileSearch(this._fileQueryBuilder.file(this._workspaceContextService.getWorkspace().folders,{filePattern:`**/${e}`}))).results.filter(S=>S.resource.toString().endsWith(e));m.length===1&&(n={uri:m[0].resource})}}}return n}async _tryOpenExactLink(e,r){const o=e.replace(/:\d+(:\d+)?$/,"");try{const t=await this._getExactMatch(o);if(t){const{uri:a,isDirectory:n}=t,i={text:t.uri.path+(e.match(/:\d+(:\d+)?$/)?.[0]||""),uri:a,bufferRange:r.bufferRange,type:r.type};if(a)return await(n?this._localFolderInWorkspaceOpener.open(i):this._localFileOpener.open(i)),!0}}catch{return!1}return!1}};v=p([s(5,C),s(6,R),s(7,O),s(8,P),s(9,D),s(10,W),s(11,$)],v);let h=class{constructor(e,r,o){this._isRemote=e;this._openerService=r;this._configurationService=o}async open(e){if(!e.uri)throw new Error("Tried to open a url without a resolved URI");this._openerService.open(e.text,{allowTunneling:this._isRemote&&this._configurationService.getValue("remote.forwardOnOpen"),allowContributedOpeners:!0,openExternal:!0})}};h=p([s(1,k),s(2,E)],h);export{u as TerminalLocalFileLinkOpener,f as TerminalLocalFolderInWorkspaceLinkOpener,d as TerminalLocalFolderOutsideWorkspaceLinkOpener,v as TerminalSearchLinkOpener,h as TerminalUrlLinkOpener};

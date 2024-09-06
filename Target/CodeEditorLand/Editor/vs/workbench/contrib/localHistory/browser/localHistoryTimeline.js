var d=Object.defineProperty;var y=Object.getOwnPropertyDescriptor;var l=(m,n,e,t)=>{for(var i=t>1?void 0:t?y(n,e):n,s=m.length-1,r;s>=0;s--)(r=m[s])&&(i=(t?r(n,e,i):r(i))||i);return t&&i&&d(n,e,i),i},o=(m,n)=>(e,t)=>n(e,t,m);import"../../../../../vs/base/common/cancellation.js";import{Emitter as g}from"../../../../../vs/base/common/event.js";import{MarkdownString as S}from"../../../../../vs/base/common/htmlContent.js";import{Disposable as C,MutableDisposable as f}from"../../../../../vs/base/common/lifecycle.js";import{Schemas as u}from"../../../../../vs/base/common/network.js";import{URI as E}from"../../../../../vs/base/common/uri.js";import{localize as I}from"../../../../../vs/nls.js";import{IConfigurationService as _}from"../../../../../vs/platform/configuration/common/configuration.js";import{IFileService as D}from"../../../../../vs/platform/files/common/files.js";import{getVirtualWorkspaceAuthority as k}from"../../../../../vs/platform/workspace/common/virtualWorkspace.js";import{IWorkspaceContextService as T}from"../../../../../vs/platform/workspace/common/workspace.js";import{API_OPEN_DIFF_EDITOR_COMMAND_ID as H}from"../../../../../vs/workbench/browser/parts/editor/editorCommands.js";import"../../../../../vs/workbench/common/contributions.js";import{SaveSourceRegistry as v}from"../../../../../vs/workbench/common/editor.js";import{getLocalHistoryDateFormatter as b,LOCAL_HISTORY_ICON_ENTRY as W,LOCAL_HISTORY_MENU_CONTEXT_VALUE as L}from"../../../../../vs/workbench/contrib/localHistory/browser/localHistory.js";import{COMPARE_WITH_FILE_LABEL as A,toDiffEditorArguments as R}from"../../../../../vs/workbench/contrib/localHistory/browser/localHistoryCommands.js";import{LocalHistoryFileSystemProvider as c}from"../../../../../vs/workbench/contrib/localHistory/browser/localHistoryFileSystemProvider.js";import{ITimelineService as w}from"../../../../../vs/workbench/contrib/timeline/common/timeline.js";import{IWorkbenchEnvironmentService as O}from"../../../../../vs/workbench/services/environment/common/environmentService.js";import{IPathService as P}from"../../../../../vs/workbench/services/path/common/pathService.js";import{IWorkingCopyHistoryService as N}from"../../../../../vs/workbench/services/workingCopy/common/workingCopyHistory.js";let a=class extends C{constructor(e,t,i,s,r,p,h){super();this.timelineService=e;this.workingCopyHistoryService=t;this.pathService=i;this.fileService=s;this.environmentService=r;this.configurationService=p;this.contextService=h;this.registerComponents(),this.registerListeners()}static ID="workbench.contrib.localHistoryTimeline";static LOCAL_HISTORY_ENABLED_SETTINGS_KEY="workbench.localHistory.enabled";id="timeline.localHistory";label=I("localHistory","Local History");scheme="*";_onDidChange=this._register(new g);onDidChange=this._onDidChange.event;timelineProviderDisposable=this._register(new f);registerComponents(){this.updateTimelineRegistration(),this._register(this.fileService.registerProvider(c.SCHEMA,new c(this.fileService)))}updateTimelineRegistration(){this.configurationService.getValue(a.LOCAL_HISTORY_ENABLED_SETTINGS_KEY)?this.timelineProviderDisposable.value=this.timelineService.registerTimelineProvider(this):this.timelineProviderDisposable.clear()}registerListeners(){this._register(this.workingCopyHistoryService.onDidAddEntry(e=>this.onDidChangeWorkingCopyHistoryEntry(e.entry))),this._register(this.workingCopyHistoryService.onDidChangeEntry(e=>this.onDidChangeWorkingCopyHistoryEntry(e.entry))),this._register(this.workingCopyHistoryService.onDidReplaceEntry(e=>this.onDidChangeWorkingCopyHistoryEntry(e.entry))),this._register(this.workingCopyHistoryService.onDidRemoveEntry(e=>this.onDidChangeWorkingCopyHistoryEntry(e.entry))),this._register(this.workingCopyHistoryService.onDidRemoveEntries(()=>this.onDidChangeWorkingCopyHistoryEntry(void 0))),this._register(this.workingCopyHistoryService.onDidMoveEntries(()=>this.onDidChangeWorkingCopyHistoryEntry(void 0))),this._register(this.configurationService.onDidChangeConfiguration(e=>{e.affectsConfiguration(a.LOCAL_HISTORY_ENABLED_SETTINGS_KEY)&&this.updateTimelineRegistration()}))}onDidChangeWorkingCopyHistoryEntry(e){this._onDidChange.fire({id:this.id,uri:e?.workingCopy.resource,reset:!0})}async provideTimeline(e,t,i){const s=[];let r;if(e.scheme===c.SCHEMA?r=c.fromLocalHistoryFileSystem(e).associatedResource:e.scheme===this.pathService.defaultUriScheme||e.scheme===u.vscodeUserData?r=e:this.fileService.hasProvider(e)&&(r=E.from({scheme:this.pathService.defaultUriScheme,authority:this.environmentService.remoteAuthority??k(this.contextService.getWorkspace()),path:e.path})),r){const p=await this.workingCopyHistoryService.getEntries(r,i);for(const h of p)s.push(this.toTimelineItem(h))}return{source:this.id,items:s}}toTimelineItem(e){return{handle:e.id,label:v.getSourceLabel(e.source),tooltip:new S(`$(history) ${b().format(e.timestamp)}

${v.getSourceLabel(e.source)}${e.sourceDescription?` (${e.sourceDescription})`:""}`,{supportThemeIcons:!0}),source:this.id,timestamp:e.timestamp,themeIcon:W,contextValue:L,command:{id:H,title:A.value,arguments:R(e,e.workingCopy.resource)}}}};a=l([o(0,w),o(1,N),o(2,P),o(3,D),o(4,O),o(5,_),o(6,T)],a);export{a as LocalHistoryTimeline};

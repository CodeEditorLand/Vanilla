import{Schemas as b}from"../../../../base/common/network.js";import"./media/searchEditor.css";import{isDiffEditor as V}from"../../../../editor/browser/editorBrowser.js";import{IConfigurationService as P}from"../../../../platform/configuration/common/configuration.js";import{IInstantiationService as w}from"../../../../platform/instantiation/common/instantiation.js";import{ILabelService as k}from"../../../../platform/label/common/label.js";import{ITelemetryService as O}from"../../../../platform/telemetry/common/telemetry.js";import{IWorkspaceContextService as L}from"../../../../platform/workspace/common/workspace.js";import{EditorsOrder as T}from"../../../common/editor.js";import{IConfigurationResolverService as M}from"../../../services/configurationResolver/common/configurationResolver.js";import{IEditorGroupsService as j}from"../../../services/editor/common/editorGroupsService.js";import{ACTIVE_GROUP as D,IEditorService as d,SIDE_GROUP as G}from"../../../services/editor/common/editorService.js";import{IHistoryService as U}from"../../../services/history/common/history.js";import{IViewsService as N}from"../../../services/views/common/viewsService.js";import{getSearchView as q}from"../../search/browser/searchActionsBase.js";import{SearchEditorInput as l,getOrMakeSearchEditorInput as R}from"./searchEditorInput.js";import{serializeSearchResultForEditor as _}from"./searchEditorSerialization.js";const se=e=>{const t=e.get(d);t.activeEditor instanceof l&&t.activeEditorPane.toggleCaseSensitive()},ae=e=>{const t=e.get(d);t.activeEditor instanceof l&&t.activeEditorPane.toggleWholeWords()},de=e=>{const t=e.get(d);t.activeEditor instanceof l&&t.activeEditorPane.toggleRegex()},le=e=>{const t=e.get(d);t.activeEditor instanceof l&&t.activeEditorPane.toggleContextLines()},ge=(e,t)=>{const i=e.get(d);i.activeEditor instanceof l&&i.activeEditorPane.modifyContextLines(t)},ue=e=>{const t=e.get(d);t.activeEditor instanceof l&&t.activeEditorPane.focusAllResults()};async function pe(e){const t=e.get(N),i=e.get(w),r=q(t);r?await i.invokeFunction(F,{filesToInclude:r.searchIncludePattern.getValue(),onlyOpenEditors:r.searchIncludePattern.onlySearchInOpenEditors(),filesToExclude:r.searchExcludePattern.getValue(),isRegexp:r.searchAndReplaceWidget.searchInput?.getRegex(),isCaseSensitive:r.searchAndReplaceWidget.searchInput?.getCaseSensitive(),matchWholeWord:r.searchAndReplaceWidget.searchInput?.getWholeWords(),useExcludeSettingsAndIgnoreFiles:r.searchExcludePattern.useExcludesAndIgnoreFiles(),showIncludesExcludes:!!(r.searchIncludePattern.getValue()||r.searchExcludePattern.getValue()||!r.searchExcludePattern.useExcludesAndIgnoreFiles())}):await i.invokeFunction(F)}const F=async(e,t={},i=!1)=>{const r=e.get(d),v=e.get(j),f=e.get(O),I=e.get(w),p=e.get(P),y=e.get(M),h=e.get(L),m=e.get(U).getLastActiveWorkspaceRoot(b.file),C=m?h.getWorkspaceFolder(m)??void 0:void 0,a=r.activeTextEditorControl;let n,c="";if(a){V(a)?a.getOriginalEditor().hasTextFocus()?n=a.getOriginalEditor():n=a.getModifiedEditor():n=a;const o=n?.getSelection();if(c=(o&&n?.getModel()?.getValueInRange(o))??"",o?.isEmpty()&&p.getValue("search").seedWithNearestWord){const S=n.getModel()?.getWordAtPosition(o.getStartPosition());S&&(c=S.word)}}else r.activeEditor instanceof l&&(c=r.activeEditorPane.getSelected());f.publicLog2("searchEditor/openNewSearchEditor");const s={query:t.location==="new"||p.getValue("editor").find.seedSearchStringFromSelection?c:void 0};for(const o of Object.entries(t)){const S=o[0],E=o[1];E!==void 0&&(s[S]=typeof E=="string"?await y.resolveAsync(C,E):E)}const x=r.getEditors(T.MOST_RECENTLY_ACTIVE).find(o=>o.editor.typeId===l.ID);let u;if(x&&s.location==="reuse"){const o=v.getGroup(x.groupId);if(!o)throw new Error("Invalid group id for search editor");const S=x.editor;u=await o.openEditor(S),c?u.setQuery(c):u.selectQuery(),u.setSearchConfig(s)}else{const o=I.invokeFunction(R,{config:s,resultsContents:"",from:"rawData"});u=await r.openEditor(o,{pinned:!0},i?G:D)}const W=p.getValue("search").searchOnType;(s.triggerSearch===!0||s.triggerSearch!==!1&&W&&s.query)&&u.triggerSearch({focusResults:s.focusResults}),s.focusResults||u.focusSearchInput()},Se=async(e,t,i,r,v)=>{if(!t.query)return;const f=e.get(d),I=e.get(O),p=e.get(w),y=e.get(k),h=e.get(P),A=h.getValue("search").sortOrder;I.publicLog2("searchEditor/createEditorFromSearchResult");const m=g=>y.getUriLabel(g,{relative:!0}),{text:C,matchRanges:a,config:n}=_(t,i,r,0,m,A);n.onlyOpenEditors=v;const c=h.getValue("search").searchEditor.defaultNumberOfContextLines;if(t.isDirty||c===0||c===null){const g=p.invokeFunction(R,{resultsContents:C,config:n,from:"rawData"});await f.openEditor(g,{pinned:!0}),g.setMatchRanges(a)}else{const g=p.invokeFunction(R,{from:"rawData",resultsContents:"",config:{...n,contextLines:c}});(await f.openEditor(g,{pinned:!0})).triggerSearch()}};export{Se as createEditorFromSearchResult,ge as modifySearchEditorContextLinesCommand,F as openNewSearchEditor,pe as openSearchEditor,ue as selectAllSearchEditorMatchesCommand,se as toggleSearchEditorCaseSensitiveCommand,le as toggleSearchEditorContextLinesCommand,de as toggleSearchEditorRegexCommand,ae as toggleSearchEditorWholeWordCommand};

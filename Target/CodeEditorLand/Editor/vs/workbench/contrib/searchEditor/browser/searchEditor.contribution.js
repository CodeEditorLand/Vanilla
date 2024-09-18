var V=Object.defineProperty;var q=Object.getOwnPropertyDescriptor;var A=(r,e,i,t)=>{for(var d=t>1?void 0:t?q(e,i):e,u=r.length-1,m;u>=0;u--)(m=r[u])&&(d=(t?m(e,i,d):m(d))||d);return t&&d&&V(e,i,d),d},I=(r,e)=>(i,t)=>e(i,t,r);import{KeyCode as g,KeyMod as l}from"../../../../base/common/keyCodes.js";import{extname as B,isEqual as _}from"../../../../base/common/resources.js";import{URI as k}from"../../../../base/common/uri.js";import"../../../../editor/browser/editorExtensions.js";import"../../../../editor/common/core/range.js";import{ToggleCaseSensitiveKeybinding as Q,ToggleRegexKeybinding as j,ToggleWholeWordKeybinding as H}from"../../../../editor/contrib/find/browser/findModel.js";import{localize as w,localize2 as n}from"../../../../nls.js";import{Action2 as c,MenuId as R,registerAction2 as s}from"../../../../platform/actions/common/actions.js";import{CommandsRegistry as J}from"../../../../platform/commands/common/commands.js";import{ContextKeyExpr as D,IContextKeyService as X}from"../../../../platform/contextkey/common/contextkey.js";import{SyncDescriptor as $}from"../../../../platform/instantiation/common/descriptors.js";import{IInstantiationService as E}from"../../../../platform/instantiation/common/instantiation.js";import{KeybindingWeight as h}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{Registry as L}from"../../../../platform/registry/common/platform.js";import{EditorPaneDescriptor as G}from"../../../browser/editor.js";import{WorkbenchPhase as U,registerWorkbenchContribution2 as P}from"../../../common/contributions.js";import{EditorExtensions as N,DEFAULT_EDITOR_ASSOCIATION as Y}from"../../../common/editor.js";import{ActiveEditorContext as K}from"../../../common/contextkeys.js";import{IViewsService as Z}from"../../../services/views/common/viewsService.js";import{getSearchView as ee}from"../../search/browser/searchActionsBase.js";import{searchNewEditorIcon as re,searchRefreshIcon as te}from"../../search/browser/searchIcons.js";import*as C from"../../search/common/constants.js";import*as o from"./constants.js";import{SearchEditor as W}from"./searchEditor.js";import{createEditorFromSearchResult as ie,modifySearchEditorContextLinesCommand as z,openNewSearchEditor as F,openSearchEditor as oe,selectAllSearchEditorMatchesCommand as ne,toggleSearchEditorCaseSensitiveCommand as ce,toggleSearchEditorContextLinesCommand as se,toggleSearchEditorRegexCommand as ae,toggleSearchEditorWholeWordCommand as de}from"./searchEditorActions.js";import{getOrMakeSearchEditorInput as b,SearchEditorInput as S,SEARCH_EDITOR_EXT as M}from"./searchEditorInput.js";import{IEditorService as p}from"../../../services/editor/common/editorService.js";import{VIEW_ID as le}from"../../../services/search/common/search.js";import{RegisteredEditorPriority as he,IEditorResolverService as ue}from"../../../services/editor/common/editorResolverService.js";import{IWorkingCopyEditorService as ge}from"../../../services/workingCopy/common/workingCopyEditorService.js";import{Disposable as Se}from"../../../../base/common/lifecycle.js";import"../../../services/workingCopy/common/workingCopy.js";import"../../../common/editor/editorInput.js";import{getActiveElement as me}from"../../../../base/browser/dom.js";const Ee="search.action.openInEditor",pe="search.action.openNewEditorToSide",fe="search.action.focusQueryEditorWidget",ye="search.action.focusFilesToInclude",Ie="search.action.focusFilesToExclude",Ce="toggleSearchEditorCaseSensitive",be="toggleSearchEditorWholeWord",ve="toggleSearchEditorRegex",xe="increaseSearchEditorContextLines",Ae="decreaseSearchEditorContextLines",ke="rerunSearchEditorSearch",we="cleanSearchEditorState",Re="selectAllSearchEditorMatches";L.as(N.EditorPane).registerEditorPane(G.create(W,W.ID,w("searchEditor","Search Editor")),[new $(S)]);let f=class{static ID="workbench.contrib.searchEditor";constructor(e,i){e.registerEditor("*"+M,{id:S.ID,label:w("promptOpenWith.searchEditor.displayName","Search Editor"),detail:Y.providerDisplayName,priority:he.default},{singlePerResource:!0,canSupportResource:t=>B(t)===M},{createEditorInput:({resource:t})=>({editor:i.invokeFunction(b,{from:"existingFile",fileUri:t})})})}};f=A([I(0,ue),I(1,E)],f),P(f.ID,f,U.BlockStartup);class We{canSerialize(e){return!!e.tryReadConfigSync()}serialize(e){if(!this.canSerialize(e))return;if(e.isDisposed())return JSON.stringify({modelUri:void 0,dirty:!1,config:e.tryReadConfigSync(),name:e.getName(),matchRanges:[],backingUri:e.backingUri?.toString()});let i;(e.modelUri.path||e.modelUri.fragment&&e.isDirty())&&(i=e.modelUri.toString());const t=e.tryReadConfigSync(),d=e.isDirty(),u=d?e.getMatchRanges():[],m=e.backingUri;return JSON.stringify({modelUri:i,dirty:d,config:t,name:e.getName(),matchRanges:u,backingUri:m?.toString()})}deserialize(e,i){const{modelUri:t,dirty:d,config:u,matchRanges:m,backingUri:v}=JSON.parse(i);if(u&&u.query!==void 0)if(t){const x=e.invokeFunction(b,{from:"model",modelUri:k.parse(t),config:u,backupOf:v?k.parse(v):void 0});return x.setDirty(d),x.setMatchRanges(m),x}else return v?e.invokeFunction(b,{from:"existingFile",fileUri:k.parse(v)}):e.invokeFunction(b,{from:"rawData",resultsContents:"",config:u})}}L.as(N.EditorFactory).registerEditorSerializer(S.ID,We),J.registerCommand(we,r=>{const e=r.get(p).activeEditorPane;e instanceof W&&e.cleanState()});const a=n("search","Search Editor"),O=(r={})=>{const e={},i={includes:"filesToInclude",excludes:"filesToExclude",wholeWord:"matchWholeWord",caseSensitive:"isCaseSensitive",regexp:"isRegexp",useIgnores:"useExcludeSettingsAndIgnoreFiles"};return Object.entries(r).forEach(([t,d])=>{e[i[t]??t]=d}),e},T={description:"Open a new search editor. Arguments passed can include variables like ${relativeFileDirname}.",args:[{name:"Open new Search Editor args",schema:{properties:{query:{type:"string"},filesToInclude:{type:"string"},filesToExclude:{type:"string"},contextLines:{type:"number"},matchWholeWord:{type:"boolean"},isCaseSensitive:{type:"boolean"},isRegexp:{type:"boolean"},useExcludeSettingsAndIgnoreFiles:{type:"boolean"},showIncludesExcludes:{type:"boolean"},triggerSearch:{type:"boolean"},focusResults:{type:"boolean"},onlyOpenEditors:{type:"boolean"}}}}]};s(class extends c{constructor(){super({id:"search.searchEditor.action.deleteFileResults",title:n("searchEditor.deleteResultBlock","Delete File Results"),keybinding:{weight:h.EditorContrib,primary:l.CtrlCmd|l.Shift|g.Backspace},precondition:o.InSearchEditor,category:a,f1:!0})}async run(r){r.get(X).getContext(me()).getValue(o.InSearchEditor.serialize())&&r.get(p).activeEditorPane.deleteResultBlock()}}),s(class extends c{constructor(){super({id:o.OpenNewEditorCommandId,title:n("search.openNewSearchEditor","New Search Editor"),category:a,f1:!0,metadata:T})}async run(r,e){await r.get(E).invokeFunction(F,O({location:"new",...e}))}}),s(class extends c{constructor(){super({id:o.OpenEditorCommandId,title:n("search.openSearchEditor","Open Search Editor"),category:a,f1:!0,metadata:T})}async run(r,e){await r.get(E).invokeFunction(F,O({location:"reuse",...e}))}}),s(class extends c{constructor(){super({id:pe,title:n("search.openNewEditorToSide","Open New Search Editor to the Side"),category:a,f1:!0,metadata:T})}async run(r,e){await r.get(E).invokeFunction(F,O(e),!0)}}),s(class extends c{constructor(){super({id:Ee,title:n("search.openResultsInEditor","Open Results in Editor"),category:a,f1:!0,keybinding:{primary:l.Alt|g.Enter,when:D.and(C.SearchContext.HasSearchResults,C.SearchContext.SearchViewFocusedKey),weight:h.WorkbenchContrib,mac:{primary:l.CtrlCmd|g.Enter}}})}async run(r){const e=r.get(Z),i=r.get(E),t=ee(e);t&&await i.invokeFunction(ie,t.searchResult,t.searchIncludePattern.getValue(),t.searchExcludePattern.getValue(),t.searchIncludePattern.onlySearchInOpenEditors())}}),s(class extends c{constructor(){super({id:ke,title:n("search.rerunSearchInEditor","Search Again"),category:a,keybinding:{primary:l.CtrlCmd|l.Shift|g.KeyR,when:o.InSearchEditor,weight:h.EditorContrib},icon:te,menu:[{id:R.EditorTitle,group:"navigation",when:K.isEqualTo(o.SearchEditorID)},{id:R.CommandPalette,when:K.isEqualTo(o.SearchEditorID)}]})}async run(r){const e=r.get(p);e.activeEditor instanceof S&&e.activeEditorPane.triggerSearch({resetCursor:!1})}}),s(class extends c{constructor(){super({id:fe,title:n("search.action.focusQueryEditorWidget","Focus Search Editor Input"),category:a,f1:!0,precondition:o.InSearchEditor,keybinding:{primary:g.Escape,weight:h.EditorContrib}})}async run(r){const e=r.get(p);e.activeEditor instanceof S&&e.activeEditorPane.focusSearchInput()}}),s(class extends c{constructor(){super({id:ye,title:n("search.action.focusFilesToInclude","Focus Search Editor Files to Include"),category:a,f1:!0,precondition:o.InSearchEditor})}async run(r){const e=r.get(p);e.activeEditor instanceof S&&e.activeEditorPane.focusFilesToIncludeInput()}}),s(class extends c{constructor(){super({id:Ie,title:n("search.action.focusFilesToExclude","Focus Search Editor Files to Exclude"),category:a,f1:!0,precondition:o.InSearchEditor})}async run(r){const e=r.get(p);e.activeEditor instanceof S&&e.activeEditorPane.focusFilesToExcludeInput()}}),s(class extends c{constructor(){super({id:Ce,title:n("searchEditor.action.toggleSearchEditorCaseSensitive","Toggle Match Case"),category:a,f1:!0,precondition:o.InSearchEditor,keybinding:Object.assign({weight:h.WorkbenchContrib,when:C.SearchContext.SearchInputBoxFocusedKey},Q)})}run(r){ce(r)}}),s(class extends c{constructor(){super({id:be,title:n("searchEditor.action.toggleSearchEditorWholeWord","Toggle Match Whole Word"),category:a,f1:!0,precondition:o.InSearchEditor,keybinding:Object.assign({weight:h.WorkbenchContrib,when:C.SearchContext.SearchInputBoxFocusedKey},H)})}run(r){de(r)}}),s(class extends c{constructor(){super({id:ve,title:n("searchEditor.action.toggleSearchEditorRegex","Toggle Use Regular Expression"),category:a,f1:!0,precondition:o.InSearchEditor,keybinding:Object.assign({weight:h.WorkbenchContrib,when:C.SearchContext.SearchInputBoxFocusedKey},j)})}run(r){ae(r)}}),s(class extends c{constructor(){super({id:o.ToggleSearchEditorContextLinesCommandId,title:n("searchEditor.action.toggleSearchEditorContextLines","Toggle Context Lines"),category:a,f1:!0,precondition:o.InSearchEditor,keybinding:{weight:h.WorkbenchContrib,primary:l.Alt|g.KeyL,mac:{primary:l.CtrlCmd|l.Alt|g.KeyL}}})}run(r){se(r)}}),s(class extends c{constructor(){super({id:xe,title:n("searchEditor.action.increaseSearchEditorContextLines","Increase Context Lines"),category:a,f1:!0,precondition:o.InSearchEditor,keybinding:{weight:h.WorkbenchContrib,primary:l.Alt|g.Equal}})}run(r){z(r,!0)}}),s(class extends c{constructor(){super({id:Ae,title:n("searchEditor.action.decreaseSearchEditorContextLines","Decrease Context Lines"),category:a,f1:!0,precondition:o.InSearchEditor,keybinding:{weight:h.WorkbenchContrib,primary:l.Alt|g.Minus}})}run(r){z(r,!1)}}),s(class extends c{constructor(){super({id:Re,title:n("searchEditor.action.selectAllSearchEditorMatches","Select All Matches"),category:a,f1:!0,precondition:o.InSearchEditor,keybinding:{weight:h.WorkbenchContrib,primary:l.CtrlCmd|l.Shift|g.KeyL}})}run(r){ne(r)}}),s(class extends c{constructor(){super({id:"search.action.openNewEditorFromView",title:w("search.openNewEditor","Open New Search Editor"),category:a,icon:re,menu:[{id:R.ViewTitle,group:"navigation",order:2,when:D.equals("view",le)}]})}run(e,...i){return oe(e)}});let y=class extends Se{constructor(i,t){super();this.instantiationService=i;this._register(t.registerHandler(this))}static ID="workbench.contrib.searchEditorWorkingCopyEditorHandler";handles(i){return i.resource.scheme===o.SearchEditorScheme}isOpen(i,t){return this.handles(i)?t instanceof S&&_(i.resource,t.modelUri):!1}createEditor(i){const t=this.instantiationService.invokeFunction(b,{from:"model",modelUri:i.resource});return t.setDirty(!0),t}};y=A([I(0,E),I(1,ge)],y),P(y.ID,y,U.BlockRestore);

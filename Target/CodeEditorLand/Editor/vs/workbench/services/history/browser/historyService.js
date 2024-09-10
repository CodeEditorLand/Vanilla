var Z=Object.defineProperty;var Q=Object.getOwnPropertyDescriptor;var N=(g,n,e,t)=>{for(var i=t>1?void 0:t?Q(n,e):n,o=g.length-1,r;o>=0;o--)(r=g[o])&&(i=(t?r(n,e,i):r(i))||i);return t&&i&&Z(n,e,i),i},a=(g,n)=>(e,t)=>n(e,t,g);import{localize as v}from"../../../../nls.js";import{URI as T}from"../../../../base/common/uri.js";import{EditorResourceAccessor as C,EditorsOrder as F,SideBySideEditor as ee,isResourceEditorInput as x,isEditorInput as c,isSideBySideEditorInput as te,EditorCloseContext as H,EditorPaneSelectionCompareResult as R,EditorPaneSelectionChangeReason as p,isEditorPaneWithSelection as L,GroupModelChangeKind as ie}from"../../../common/editor.js";import{IEditorService as P}from"../../editor/common/editorService.js";import{GoFilter as d,GoScope as h,IHistoryService as oe}from"../common/history.js";import{FileChangesEvent as G,IFileService as _,FileChangeType as M,FILES_EXCLUDE_CONFIG as re,FileOperationEvent as K,FileOperation as b}from"../../../../platform/files/common/files.js";import{IWorkspaceContextService as ne}from"../../../../platform/workspace/common/workspace.js";import{dispose as O,Disposable as A,DisposableStore as S}from"../../../../base/common/lifecycle.js";import{IStorageService as se,StorageScope as W,StorageTarget as ae}from"../../../../platform/storage/common/storage.js";import{Emitter as V,Event as D}from"../../../../base/common/event.js";import{IConfigurationService as de}from"../../../../platform/configuration/common/configuration.js";import{IEditorGroupsService as B}from"../../editor/common/editorGroupsService.js";import{getExcludes as ce,SEARCH_EXCLUDE_CONFIG as he}from"../../search/common/search.js";import{IInstantiationService as w}from"../../../../platform/instantiation/common/instantiation.js";import{IWorkbenchLayoutService as le}from"../../layout/browser/layoutService.js";import{IContextKeyService as pe,RawContextKey as u}from"../../../../platform/contextkey/common/contextkey.js";import{coalesce as ve,remove as ue}from"../../../../base/common/arrays.js";import{InstantiationType as Ee,registerSingleton as ge}from"../../../../platform/instantiation/common/extensions.js";import{addDisposableListener as $,EventType as Y,EventHelper as X,WindowIdleValue as fe}from"../../../../base/browser/dom.js";import{IWorkspacesService as Ie}from"../../../../platform/workspaces/common/workspaces.js";import{Schemas as U}from"../../../../base/common/network.js";import{onUnexpectedError as j}from"../../../../base/common/errors.js";import{ResourceGlobMatcher as Se}from"../../../common/resources.js";import{IPathService as ye}from"../../path/common/pathService.js";import{IUriIdentityService as ke}from"../../../../platform/uriIdentity/common/uriIdentity.js";import{ILifecycleService as me,LifecyclePhase as Ne}from"../../lifecycle/common/lifecycle.js";import{ILogService as z,LogLevel as J}from"../../../../platform/log/common/log.js";import{mainWindow as Ce}from"../../../../base/browser/window.js";let l=class extends A{constructor(e,t,i,o,r,s,k,m,I,Re,be){super();this.editorService=e;this.editorGroupService=t;this.contextService=i;this.storageService=o;this.configurationService=r;this.fileService=s;this.workspacesService=k;this.instantiationService=m;this.layoutService=I;this.contextKeyService=Re;this.logService=be;this.registerListeners(),this.editorService.activeEditorPane&&this.onDidActiveEditorChange()}static MOUSE_NAVIGATION_SETTING="workbench.editor.mouseBackForwardToNavigate";static NAVIGATION_SCOPE_SETTING="workbench.editor.navigationScope";activeEditorListeners=this._register(new S);lastActiveEditor=void 0;editorHelper=this.instantiationService.createInstance(y);registerListeners(){this.registerMouseNavigationListener(),this._register(this.editorService.onDidActiveEditorChange(()=>this.onDidActiveEditorChange())),this._register(this.editorService.onDidOpenEditorFail(e=>this.remove(e.editor))),this._register(this.editorService.onDidCloseEditor(e=>this.onDidCloseEditor(e))),this._register(this.editorService.onDidMostRecentlyActiveEditorsChange(()=>this.handleEditorEventInRecentEditorsStack())),this._register(this.editorGroupService.onDidRemoveGroup(e=>this.onDidRemoveGroup(e))),this._register(this.fileService.onDidFilesChange(e=>this.onDidFilesChange(e))),this._register(this.fileService.onDidRunOperation(e=>this.onDidFilesChange(e))),this._register(this.storageService.onWillSaveState(()=>this.saveState())),this.registerEditorNavigationScopeChangeListener(),this._register(this.onDidChangeEditorNavigationStack(()=>this.updateContextKeys())),this._register(this.editorGroupService.onDidChangeActiveGroup(()=>this.updateContextKeys()))}onDidCloseEditor(e){this.handleEditorCloseEventInHistory(e),this.handleEditorCloseEventInReopen(e)}registerMouseNavigationListener(){const e=this._register(new S),t=()=>{e.clear(),this.configurationService.getValue(l.MOUSE_NAVIGATION_SETTING)&&this._register(D.runAndSubscribe(this.layoutService.onDidAddContainer,({container:i,disposables:o})=>{const r=o.add(new S);r.add($(i,Y.MOUSE_DOWN,s=>this.onMouseDownOrUp(s,!0))),r.add($(i,Y.MOUSE_UP,s=>this.onMouseDownOrUp(s,!1))),e.add(r)},{container:this.layoutService.mainContainer,disposables:this._store}))};this._register(this.configurationService.onDidChangeConfiguration(i=>{i.affectsConfiguration(l.MOUSE_NAVIGATION_SETTING)&&t()})),t()}onMouseDownOrUp(e,t){switch(e.button){case 3:X.stop(e),t&&this.goBack();break;case 4:X.stop(e),t&&this.goForward();break}}onDidRemoveGroup(e){this.handleEditorGroupRemoveInNavigationStacks(e)}onDidActiveEditorChange(){const e=this.editorGroupService.activeGroup,t=e.activeEditorPane;if(!(this.lastActiveEditor&&this.editorHelper.matchesEditorIdentifier(this.lastActiveEditor,t))){if(this.lastActiveEditor=t?.input?{editor:t.input,groupId:t.group.id}:void 0,this.activeEditorListeners.clear(),!t?.group.isTransient(t.input))this.handleActiveEditorChange(e,t);else{this.logService.trace(`[History]: ignoring transient editor change until becoming non-transient (editor: ${t.input?.resource?.toString()}})`);const i=e.onDidModelChange(o=>{o.kind===ie.EDITOR_TRANSIENT&&o.editor===t.input&&!t.group.isTransient(t.input)&&(i.dispose(),this.handleActiveEditorChange(e,t))});this.activeEditorListeners.add(i)}L(t)&&this.activeEditorListeners.add(t.onDidChangeSelection(i=>{t.group.isTransient(t.input)?this.logService.trace(`[History]: ignoring transient editor selection change (editor: ${t.input?.resource?.toString()}})`):this.handleActiveEditorSelectionChangeEvent(e,t,i)})),this.updateContextKeys()}}onDidFilesChange(e){e instanceof G?e.gotDeleted()&&this.remove(e):e.isOperation(b.DELETE)?this.remove(e):e.isOperation(b.MOVE)&&e.target.isFile&&this.move(e)}handleActiveEditorChange(e,t){this.handleActiveEditorChangeInHistory(t),this.handleActiveEditorChangeInNavigationStacks(e,t)}handleActiveEditorSelectionChangeEvent(e,t,i){this.handleActiveEditorSelectionChangeInNavigationStacks(e,t,i)}move(e){this.moveInHistory(e),this.moveInEditorNavigationStacks(e)}remove(e){this.removeFromHistory(e),this.removeFromEditorNavigationStacks(e),this.removeFromRecentlyClosedEditors(e),this.removeFromRecentlyOpened(e)}removeFromRecentlyOpened(e){let t;c(e)?t=C.getOriginalUri(e):e instanceof G||(t=e.resource),t&&this.workspacesService.removeRecentlyOpened([t])}clear(){this.clearRecentlyOpened(),this.clearEditorNavigationStacks(),this.recentlyClosedEditors=[],this.updateContextKeys()}canNavigateBackContextKey=new u("canNavigateBack",!1,v("canNavigateBack","Whether it is possible to navigate back in editor history")).bindTo(this.contextKeyService);canNavigateForwardContextKey=new u("canNavigateForward",!1,v("canNavigateForward","Whether it is possible to navigate forward in editor history")).bindTo(this.contextKeyService);canNavigateBackInNavigationsContextKey=new u("canNavigateBackInNavigationLocations",!1,v("canNavigateBackInNavigationLocations","Whether it is possible to navigate back in editor navigation locations history")).bindTo(this.contextKeyService);canNavigateForwardInNavigationsContextKey=new u("canNavigateForwardInNavigationLocations",!1,v("canNavigateForwardInNavigationLocations","Whether it is possible to navigate forward in editor navigation locations history")).bindTo(this.contextKeyService);canNavigateToLastNavigationLocationContextKey=new u("canNavigateToLastNavigationLocation",!1,v("canNavigateToLastNavigationLocation","Whether it is possible to navigate to the last editor navigation location")).bindTo(this.contextKeyService);canNavigateBackInEditsContextKey=new u("canNavigateBackInEditLocations",!1,v("canNavigateBackInEditLocations","Whether it is possible to navigate back in editor edit locations history")).bindTo(this.contextKeyService);canNavigateForwardInEditsContextKey=new u("canNavigateForwardInEditLocations",!1,v("canNavigateForwardInEditLocations","Whether it is possible to navigate forward in editor edit locations history")).bindTo(this.contextKeyService);canNavigateToLastEditLocationContextKey=new u("canNavigateToLastEditLocation",!1,v("canNavigateToLastEditLocation","Whether it is possible to navigate to the last editor edit location")).bindTo(this.contextKeyService);canReopenClosedEditorContextKey=new u("canReopenClosedEditor",!1,v("canReopenClosedEditor","Whether it is possible to reopen the last closed editor")).bindTo(this.contextKeyService);updateContextKeys(){this.contextKeyService.bufferChangeEvents(()=>{const e=this.getStack();this.canNavigateBackContextKey.set(e.canGoBack(d.NONE)),this.canNavigateForwardContextKey.set(e.canGoForward(d.NONE)),this.canNavigateBackInNavigationsContextKey.set(e.canGoBack(d.NAVIGATION)),this.canNavigateForwardInNavigationsContextKey.set(e.canGoForward(d.NAVIGATION)),this.canNavigateToLastNavigationLocationContextKey.set(e.canGoLast(d.NAVIGATION)),this.canNavigateBackInEditsContextKey.set(e.canGoBack(d.EDITS)),this.canNavigateForwardInEditsContextKey.set(e.canGoForward(d.EDITS)),this.canNavigateToLastEditLocationContextKey.set(e.canGoLast(d.EDITS)),this.canReopenClosedEditorContextKey.set(this.recentlyClosedEditors.length>0)})}_onDidChangeEditorNavigationStack=this._register(new V);onDidChangeEditorNavigationStack=this._onDidChangeEditorNavigationStack.event;defaultScopedEditorNavigationStack=void 0;editorGroupScopedNavigationStacks=new Map;editorScopedNavigationStacks=new Map;editorNavigationScope=h.DEFAULT;registerEditorNavigationScopeChangeListener(){const e=()=>{this.disposeEditorNavigationStacks();const t=this.configurationService.getValue(l.NAVIGATION_SCOPE_SETTING);t==="editorGroup"?this.editorNavigationScope=h.EDITOR_GROUP:t==="editor"?this.editorNavigationScope=h.EDITOR:this.editorNavigationScope=h.DEFAULT};this._register(this.configurationService.onDidChangeConfiguration(t=>{t.affectsConfiguration(l.NAVIGATION_SCOPE_SETTING)&&e()})),e()}getStack(e=this.editorGroupService.activeGroup,t=e.activeEditor){switch(this.editorNavigationScope){case h.EDITOR:{if(!t)return new Ge;let i=this.editorScopedNavigationStacks.get(e.id);i||(i=new Map,this.editorScopedNavigationStacks.set(e.id,i));let o=i.get(t)?.stack;if(!o){const r=new S;o=r.add(this.instantiationService.createInstance(f,h.EDITOR)),r.add(o.onDidChange(()=>this._onDidChangeEditorNavigationStack.fire())),i.set(t,{stack:o,disposable:r})}return o}case h.EDITOR_GROUP:{let i=this.editorGroupScopedNavigationStacks.get(e.id)?.stack;if(!i){const o=new S;i=o.add(this.instantiationService.createInstance(f,h.EDITOR_GROUP)),o.add(i.onDidChange(()=>this._onDidChangeEditorNavigationStack.fire())),this.editorGroupScopedNavigationStacks.set(e.id,{stack:i,disposable:o})}return i}case h.DEFAULT:return this.defaultScopedEditorNavigationStack||(this.defaultScopedEditorNavigationStack=this._register(this.instantiationService.createInstance(f,h.DEFAULT)),this._register(this.defaultScopedEditorNavigationStack.onDidChange(()=>this._onDidChangeEditorNavigationStack.fire()))),this.defaultScopedEditorNavigationStack}}goForward(e){return this.getStack().goForward(e)}goBack(e){return this.getStack().goBack(e)}goPrevious(e){return this.getStack().goPrevious(e)}goLast(e){return this.getStack().goLast(e)}handleActiveEditorChangeInNavigationStacks(e,t){this.getStack(e,t?.input).handleActiveEditorChange(t)}handleActiveEditorSelectionChangeInNavigationStacks(e,t,i){this.getStack(e,t.input).handleActiveEditorSelectionChange(t,i)}handleEditorCloseEventInHistory(e){const t=this.editorScopedNavigationStacks.get(e.groupId);if(t){const i=t.get(e.editor);i&&(i.disposable.dispose(),t.delete(e.editor)),t.size===0&&this.editorScopedNavigationStacks.delete(e.groupId)}}handleEditorGroupRemoveInNavigationStacks(e){this.defaultScopedEditorNavigationStack?.remove(e.id);const t=this.editorGroupScopedNavigationStacks.get(e.id);t&&(t.disposable.dispose(),this.editorGroupScopedNavigationStacks.delete(e.id))}clearEditorNavigationStacks(){this.withEachEditorNavigationStack(e=>e.clear())}removeFromEditorNavigationStacks(e){this.withEachEditorNavigationStack(t=>t.remove(e))}moveInEditorNavigationStacks(e){this.withEachEditorNavigationStack(t=>t.move(e))}withEachEditorNavigationStack(e){this.defaultScopedEditorNavigationStack&&e(this.defaultScopedEditorNavigationStack);for(const[,t]of this.editorGroupScopedNavigationStacks)e(t.stack);for(const[,t]of this.editorScopedNavigationStacks)for(const[,i]of t)e(i.stack)}disposeEditorNavigationStacks(){this.defaultScopedEditorNavigationStack?.dispose(),this.defaultScopedEditorNavigationStack=void 0;for(const[,e]of this.editorGroupScopedNavigationStacks)e.disposable.dispose();this.editorGroupScopedNavigationStacks.clear();for(const[,e]of this.editorScopedNavigationStacks)for(const[,t]of e)t.disposable.dispose();this.editorScopedNavigationStacks.clear()}recentlyUsedEditorsStack=void 0;recentlyUsedEditorsStackIndex=0;recentlyUsedEditorsInGroupStack=void 0;recentlyUsedEditorsInGroupStackIndex=0;navigatingInRecentlyUsedEditorsStack=!1;navigatingInRecentlyUsedEditorsInGroupStack=!1;openNextRecentlyUsedEditor(e){const[t,i]=this.ensureRecentlyUsedStack(o=>o-1,e);return this.doNavigateInRecentlyUsedEditorsStack(t[i],e)}openPreviouslyUsedEditor(e){const[t,i]=this.ensureRecentlyUsedStack(o=>o+1,e);return this.doNavigateInRecentlyUsedEditorsStack(t[i],e)}async doNavigateInRecentlyUsedEditorsStack(e,t){if(e){const i=typeof t!="number"||!this.editorGroupService.getGroup(t);i?this.navigatingInRecentlyUsedEditorsStack=!0:this.navigatingInRecentlyUsedEditorsInGroupStack=!0;const o=this.editorGroupService.getGroup(e.groupId)??this.editorGroupService.activeGroup;try{await o.openEditor(e.editor)}finally{i?this.navigatingInRecentlyUsedEditorsStack=!1:this.navigatingInRecentlyUsedEditorsInGroupStack=!1}}}ensureRecentlyUsedStack(e,t){let i,o;const r=typeof t=="number"?this.editorGroupService.getGroup(t):void 0;r?(i=this.recentlyUsedEditorsInGroupStack||r.getEditors(F.MOST_RECENTLY_ACTIVE).map(k=>({groupId:r.id,editor:k})),o=this.recentlyUsedEditorsInGroupStackIndex):(i=this.recentlyUsedEditorsStack||this.editorService.getEditors(F.MOST_RECENTLY_ACTIVE),o=this.recentlyUsedEditorsStackIndex);let s=e(o);return s<0?s=0:s>i.length-1&&(s=i.length-1),r?(this.recentlyUsedEditorsInGroupStack=i,this.recentlyUsedEditorsInGroupStackIndex=s):(this.recentlyUsedEditorsStack=i,this.recentlyUsedEditorsStackIndex=s),[i,s]}handleEditorEventInRecentEditorsStack(){this.navigatingInRecentlyUsedEditorsStack||(this.recentlyUsedEditorsStack=void 0,this.recentlyUsedEditorsStackIndex=0),this.navigatingInRecentlyUsedEditorsInGroupStack||(this.recentlyUsedEditorsInGroupStack=void 0,this.recentlyUsedEditorsInGroupStackIndex=0)}static MAX_RECENTLY_CLOSED_EDITORS=20;recentlyClosedEditors=[];ignoreEditorCloseEvent=!1;handleEditorCloseEventInReopen(e){if(this.ignoreEditorCloseEvent)return;const{editor:t,context:i}=e;if(i===H.REPLACE||i===H.MOVE)return;const o=t.toUntyped();if(!o)return;const r=[],s=C.getOriginalUri(t,{supportSideBySide:ee.BOTH});T.isUri(s)?r.push(s):s&&r.push(...ve([s.primary,s.secondary])),this.removeFromRecentlyClosedEditors(t),this.recentlyClosedEditors.push({editorId:t.editorId,editor:o,resource:C.getOriginalUri(t),associatedResources:r,index:e.index,sticky:e.sticky}),this.recentlyClosedEditors.length>l.MAX_RECENTLY_CLOSED_EDITORS&&this.recentlyClosedEditors.shift(),this.canReopenClosedEditorContextKey.set(!0)}async reopenLastClosedEditor(){const e=this.recentlyClosedEditors.pop();let t;return e&&(t=this.doReopenLastClosedEditor(e)),this.canReopenClosedEditorContextKey.set(this.recentlyClosedEditors.length>0),t}async doReopenLastClosedEditor(e){const t={pinned:!0,sticky:e.sticky,index:e.index,ignoreError:!0};(e.sticky&&!this.editorGroupService.activeGroup.isSticky(e.index)||!e.sticky&&this.editorGroupService.activeGroup.isSticky(e.index))&&(t.index=void 0);let i;if(!this.editorGroupService.activeGroup.contains(e.editor)){this.ignoreEditorCloseEvent=!0;try{i=await this.editorService.openEditor({...e.editor,options:{...e.editor.options,...t}})}finally{this.ignoreEditorCloseEvent=!1}}i||(ue(this.recentlyClosedEditors,e),this.reopenLastClosedEditor())}removeFromRecentlyClosedEditors(e){this.recentlyClosedEditors=this.recentlyClosedEditors.filter(t=>c(e)&&t.editorId!==e.editorId?!0:!(t.resource&&this.editorHelper.matchesFile(t.resource,e)||t.associatedResources.some(i=>this.editorHelper.matchesFile(i,e)))),this.canReopenClosedEditorContextKey.set(this.recentlyClosedEditors.length>0)}static MAX_HISTORY_ITEMS=200;static HISTORY_STORAGE_KEY="history.entries";history=void 0;editorHistoryListeners=new Map;resourceExcludeMatcher=this._register(new fe(Ce,()=>{const e=this._register(this.instantiationService.createInstance(Se,t=>ce(t?this.configurationService.getValue({resource:t}):this.configurationService.getValue())||Object.create(null),t=>t.affectsConfiguration(re)||t.affectsConfiguration(he)));return this._register(e.onExpressionChange(()=>this.removeExcludedFromHistory())),e}));handleActiveEditorChangeInHistory(e){const t=e?.input;!t||t.isDisposed()||!this.includeInHistory(t)||(this.removeFromHistory(t),this.addToHistory(t))}addToHistory(e,t=!0){this.ensureHistoryLoaded(this.history);const i=this.editorHelper.preferResourceEditorInput(e);i&&(t?this.history.unshift(i):this.history.push(i),this.history.length>l.MAX_HISTORY_ITEMS&&this.editorHelper.clearOnEditorDispose(this.history.pop(),this.editorHistoryListeners),c(e)&&this.editorHelper.onEditorDispose(e,()=>this.updateHistoryOnEditorDispose(i),this.editorHistoryListeners))}updateHistoryOnEditorDispose(e){if(c(e))if(!te(e))this.removeFromHistory(e);else{const t=[],i=e.primary.matches(e.secondary)?[e.primary]:[e.primary,e.secondary];for(const o of i){const r=this.editorHelper.preferResourceEditorInput(o);x(r)&&this.includeInHistory(r)&&t.push(r)}this.replaceInHistory(e,...t)}else this.includeInHistory(e)||this.removeFromHistory(e)}includeInHistory(e){return c(e)?!0:!this.resourceExcludeMatcher.value.matches(e.resource)}removeExcludedFromHistory(){this.ensureHistoryLoaded(this.history),this.history=this.history.filter(e=>{const t=this.includeInHistory(e);return t||this.editorHelper.clearOnEditorDispose(e,this.editorHistoryListeners),t})}moveInHistory(e){e.isOperation(b.MOVE)&&this.removeFromHistory(e)&&this.addToHistory({resource:e.target.resource})}removeFromHistory(e){let t=!1;return this.ensureHistoryLoaded(this.history),this.history=this.history.filter(i=>{const o=this.editorHelper.matchesEditor(e,i);return o&&(this.editorHelper.clearOnEditorDispose(e,this.editorHistoryListeners),t=!0),!o}),t}replaceInHistory(e,...t){this.ensureHistoryLoaded(this.history);let i=!1;const o=[];for(const r of this.history)this.editorHelper.matchesEditor(e,r)?(this.editorHelper.clearOnEditorDispose(e,this.editorHistoryListeners),i||(o.push(...t),i=!0)):t.some(s=>this.editorHelper.matchesEditor(s,r))||o.push(r);i||o.push(...t),this.history=o}clearRecentlyOpened(){this.history=[];for(const[,e]of this.editorHistoryListeners)O(e);this.editorHistoryListeners.clear()}getHistory(){return this.ensureHistoryLoaded(this.history),this.history}ensureHistoryLoaded(e){this.history||(this.history=[],this.editorGroupService.isReady?this.loadHistory():(async()=>(await this.editorGroupService.whenReady,this.loadHistory()))())}loadHistory(){this.history=[];const e=this.loadHistoryFromStorage(),t=[...this.editorService.getEditors(F.MOST_RECENTLY_ACTIVE)].reverse(),i=new Set;for(const{editor:o}of t)this.includeInHistory(o)&&(this.addToHistory(o),o.resource&&i.add(`${o.resource.toString()}/${o.editorId}`));for(const o of e)!i.has(`${o.resource.toString()}/${o.options?.override}`)&&this.includeInHistory(o)&&this.addToHistory(o,!1)}loadHistoryFromStorage(){const e=[],t=this.storageService.get(l.HISTORY_STORAGE_KEY,W.WORKSPACE);if(t)try{const i=JSON.parse(t);for(const o of i)if(!(!o.editor||!o.editor.resource))try{e.push({...o.editor,resource:typeof o.editor.resource=="string"?T.parse(o.editor.resource):T.from(o.editor.resource)})}catch(r){j(r)}}catch(i){j(i)}return e}saveState(){if(!this.history)return;const e=[];for(const t of this.history)c(t)||!x(t)||e.push({editor:{...t,resource:t.resource.toString()}});this.storageService.store(l.HISTORY_STORAGE_KEY,JSON.stringify(e),W.WORKSPACE,ae.MACHINE)}getLastActiveWorkspaceRoot(e,t){const i=this.contextService.getWorkspace().folders;if(i.length!==0){if(i.length===1){const o=i[0].uri;return(!e||o.scheme===e)&&(!t||o.authority===t)?o:void 0}for(const o of this.getHistory()){if(c(o)||e&&o.resource.scheme!==e||t&&o.resource.authority!==t)continue;const r=this.contextService.getWorkspaceFolder(o.resource);if(r)return r.uri}for(const o of i){const r=o.uri;if((!e||r.scheme===e)&&(!t||r.authority===t))return r}}}getLastActiveFile(e,t){for(const i of this.getHistory()){let o;if(c(i)?o=C.getOriginalUri(i,{filterByScheme:e}):o=i.resource,o&&o.scheme===e&&(!t||o.authority===t))return o}}dispose(){super.dispose();for(const[,e]of this.editorGroupScopedNavigationStacks)e.disposable.dispose();for(const[,e]of this.editorScopedNavigationStacks)for(const[,t]of e)t.disposable.dispose();for(const[,e]of this.editorHistoryListeners)e.dispose()}};l=N([a(0,P),a(1,B),a(2,ne),a(3,se),a(4,de),a(5,_),a(6,Ie),a(7,w),a(8,le),a(9,pe),a(10,z)],l),ge(oe,l,Ee.Eager);class q{constructor(n,e,t){this.editorIdentifier=n;this.selection=e;this.reason=t}justifiesNewNavigationEntry(n){if(this.editorIdentifier.groupId!==n.editorIdentifier.groupId||!this.editorIdentifier.editor.matches(n.editorIdentifier.editor)||!this.selection||!n.selection)return!0;const e=this.selection.compare(n.selection);return e===R.SIMILAR&&(n.reason===p.NAVIGATION||n.reason===p.JUMP)?!0:e===R.DIFFERENT}}let f=class extends A{constructor(e,t){super();this.scope=e;this.instantiationService=t}selectionsStack=this._register(this.instantiationService.createInstance(E,d.NONE,this.scope));editsStack=this._register(this.instantiationService.createInstance(E,d.EDITS,this.scope));navigationsStack=this._register(this.instantiationService.createInstance(E,d.NAVIGATION,this.scope));stacks=[this.selectionsStack,this.editsStack,this.navigationsStack];onDidChange=D.any(this.selectionsStack.onDidChange,this.editsStack.onDidChange,this.navigationsStack.onDidChange);canGoForward(e){return this.getStack(e).canGoForward()}goForward(e){return this.getStack(e).goForward()}canGoBack(e){return this.getStack(e).canGoBack()}goBack(e){return this.getStack(e).goBack()}goPrevious(e){return this.getStack(e).goPrevious()}canGoLast(e){return this.getStack(e).canGoLast()}goLast(e){return this.getStack(e).goLast()}getStack(e=d.NONE){switch(e){case d.NONE:return this.selectionsStack;case d.EDITS:return this.editsStack;case d.NAVIGATION:return this.navigationsStack}}handleActiveEditorChange(e){this.selectionsStack.notifyNavigation(e)}handleActiveEditorSelectionChange(e,t){const i=this.selectionsStack.current;this.selectionsStack.notifyNavigation(e,t),t.reason===p.EDIT?this.editsStack.notifyNavigation(e,t):(t.reason===p.NAVIGATION||t.reason===p.JUMP)&&!this.selectionsStack.isNavigating()&&(t.reason===p.JUMP&&!this.navigationsStack.isNavigating()&&i&&this.navigationsStack.addOrReplace(i.groupId,i.editor,i.selection),this.navigationsStack.notifyNavigation(e,t))}clear(){for(const e of this.stacks)e.clear()}remove(e){for(const t of this.stacks)t.remove(e)}move(e){for(const t of this.stacks)t.move(e)}};f=N([a(1,w)],f);class Ge{onDidChange=D.None;canGoForward(){return!1}async goForward(){}canGoBack(){return!1}async goBack(){}async goPrevious(){}canGoLast(){return!1}async goLast(){}handleActiveEditorChange(){}handleActiveEditorSelectionChange(){}clear(){}remove(){}move(){}dispose(){}}let E=class extends A{constructor(e,t,i,o,r,s){super();this.filter=e;this.scope=t;this.instantiationService=i;this.editorService=o;this.editorGroupService=r;this.logService=s;this.registerListeners()}static MAX_STACK_SIZE=50;_onDidChange=this._register(new V);onDidChange=this._onDidChange.event;mapEditorToDisposable=new Map;mapGroupToDisposable=new Map;editorHelper=this.instantiationService.createInstance(y);stack=[];index=-1;previousIndex=-1;navigating=!1;currentSelectionState=void 0;get current(){return this.stack[this.index]}set current(e){e&&(this.stack[this.index]=e)}registerListeners(){this._register(this.onDidChange(()=>this.traceStack())),this._register(this.logService.onDidChangeLogLevel(()=>this.traceStack()))}traceStack(){if(this.logService.getLevel()!==J.Trace)return;const e=[];for(const t of this.stack)typeof t.selection?.log=="function"?e.push(`- group: ${t.groupId}, editor: ${t.editor.resource?.toString()}, selection: ${t.selection.log()}`):e.push(`- group: ${t.groupId}, editor: ${t.editor.resource?.toString()}, selection: <none>`);e.length===0?this.trace(`index: ${this.index}, navigating: ${this.isNavigating()}: <empty>`):this.trace(`index: ${this.index}, navigating: ${this.isNavigating()}
${e.join(`
`)}
			`)}trace(e,t=null,i){if(this.logService.getLevel()!==J.Trace)return;let o;switch(this.filter){case d.NONE:o="global";break;case d.EDITS:o="edits";break;case d.NAVIGATION:o="navigation";break}let r;switch(this.scope){case h.DEFAULT:r="default";break;case h.EDITOR_GROUP:r="editorGroup";break;case h.EDITOR:r="editor";break}t!==null?this.logService.trace(`[History stack ${o}-${r}]: ${e} (editor: ${t?.resource?.toString()}, event: ${this.traceEvent(i)})`):this.logService.trace(`[History stack ${o}-${r}]: ${e}`)}traceEvent(e){if(!e)return"<none>";switch(e.reason){case p.EDIT:return"edit";case p.NAVIGATION:return"navigation";case p.JUMP:return"jump";case p.PROGRAMMATIC:return"programmatic";case p.USER:return"user"}}registerGroupListeners(e){if(!this.mapGroupToDisposable.has(e)){const t=this.editorGroupService.getGroup(e);t&&this.mapGroupToDisposable.set(e,t.onWillMoveEditor(i=>this.onWillMoveEditor(i)))}}onWillMoveEditor(e){if(this.trace("onWillMoveEditor()",e.editor),this.scope!==h.EDITOR_GROUP)for(const t of this.stack)t.groupId===e.groupId&&this.editorHelper.matchesEditor(e.editor,t.editor)&&(t.groupId=e.target)}notifyNavigation(e,t){this.trace("notifyNavigation()",e?.input,t);const i=L(e),o=e?.input&&!e.input.isDisposed();this.navigating?(this.trace("notifyNavigation() ignoring (navigating)",e?.input,t),i&&o?(this.trace("notifyNavigation() updating current selection state",e?.input,t),this.currentSelectionState=new q({groupId:e.group.id,editor:e.input},e.getSelection(),t?.reason)):(this.trace("notifyNavigation() dropping current selection state",e?.input,t),this.currentSelectionState=void 0)):(this.trace("notifyNavigation() not ignoring",e?.input,t),i&&o?this.onSelectionAwareEditorNavigation(e.group.id,e.input,e.getSelection(),t):(this.currentSelectionState=void 0,o&&this.onNonSelectionAwareEditorNavigation(e.group.id,e.input)))}onSelectionAwareEditorNavigation(e,t,i,o){if(this.current?.groupId===e&&!i&&this.editorHelper.matchesEditor(this.current.editor,t))return;this.trace("onSelectionAwareEditorNavigation()",t,o);const r=new q({groupId:e,editor:t},i,o?.reason);!this.currentSelectionState||this.currentSelectionState.justifiesNewNavigationEntry(r)?this.doAdd(e,t,r.selection):this.doReplace(e,t,r.selection),this.currentSelectionState=r}onNonSelectionAwareEditorNavigation(e,t){this.current?.groupId===e&&this.editorHelper.matchesEditor(this.current.editor,t)||(this.trace("onNonSelectionAwareEditorNavigation()",t),this.doAdd(e,t))}doAdd(e,t,i){this.navigating||this.addOrReplace(e,t,i)}doReplace(e,t,i){this.navigating||this.addOrReplace(e,t,i,!0)}addOrReplace(e,t,i,o){this.registerGroupListeners(e);let r=!1;this.current&&(o||this.shouldReplaceStackEntry(this.current,{groupId:e,editor:t,selection:i}))&&(r=!0);const s=this.editorHelper.preferResourceEditorInput(t);if(!s)return;r?this.trace("replace()",s):this.trace("add()",s);const k={groupId:e,editor:s,selection:i},m=[];if(r)this.current&&m.push(this.current),this.current=k;else{if(this.stack.length>this.index+1){for(let I=this.index+1;I<this.stack.length;I++)m.push(this.stack[I]);this.stack=this.stack.slice(0,this.index+1)}this.stack.splice(this.index+1,0,k),this.stack.length>E.MAX_STACK_SIZE?(m.push(this.stack.shift()),this.previousIndex>=0&&this.previousIndex--):this.setIndex(this.index+1,!0)}for(const I of m)this.editorHelper.clearOnEditorDispose(I.editor,this.mapEditorToDisposable);c(s)&&this.editorHelper.onEditorDispose(s,()=>this.remove(s),this.mapEditorToDisposable),this._onDidChange.fire()}shouldReplaceStackEntry(e,t){return e.groupId!==t.groupId||!this.editorHelper.matchesEditor(e.editor,t.editor)?!1:e.selection?t.selection?e.selection.compare(t.selection)===R.IDENTICAL:!1:!0}move(e){if(e.isOperation(b.MOVE))for(const t of this.stack)this.editorHelper.matchesEditor(e,t.editor)&&(t.editor={resource:e.target.resource})}remove(e){const t=this.stack.length;this.stack=this.stack.filter(i=>{const o=typeof e=="number"?i.groupId===e:this.editorHelper.matchesEditor(e,i.editor);return o&&this.editorHelper.clearOnEditorDispose(i.editor,this.mapEditorToDisposable),!o}),t!==this.stack.length&&(this.flatten(),this.index=this.stack.length-1,this.previousIndex=-1,typeof e=="number"&&(this.mapGroupToDisposable.get(e)?.dispose(),this.mapGroupToDisposable.delete(e)),this._onDidChange.fire())}flatten(){const e=[];let t;for(const i of this.stack)t&&this.shouldReplaceStackEntry(i,t)||(t=i,e.push(i));this.stack=e}clear(){this.index=-1,this.previousIndex=-1,this.stack.splice(0);for(const[,e]of this.mapEditorToDisposable)O(e);this.mapEditorToDisposable.clear();for(const[,e]of this.mapGroupToDisposable)O(e);this.mapGroupToDisposable.clear()}dispose(){super.dispose(),this.clear()}canGoForward(){return this.stack.length>this.index+1}async goForward(){if(!await this.maybeGoCurrent()&&this.canGoForward())return this.setIndex(this.index+1),this.navigate()}canGoBack(){return this.index>0}async goBack(){if(!await this.maybeGoCurrent()&&this.canGoBack())return this.setIndex(this.index-1),this.navigate()}async goPrevious(){if(!await this.maybeGoCurrent())return this.previousIndex===-1?this.goBack():(this.setIndex(this.previousIndex),this.navigate())}canGoLast(){return this.stack.length>0}async goLast(){if(this.canGoLast())return this.setIndex(this.stack.length-1),this.navigate()}async maybeGoCurrent(){return this.filter===d.NONE||this.isCurrentSelectionActive()?!1:(await this.navigate(),!0)}isCurrentSelectionActive(){if(!this.current?.selection)return!1;const e=this.editorService.activeEditorPane;if(!L(e)||e.group.id!==this.current.groupId||!e.input||!this.editorHelper.matchesEditor(e.input,this.current.editor))return!1;const t=e.getSelection();return t?t.compare(this.current.selection)===R.IDENTICAL:!1}setIndex(e,t){this.previousIndex=this.index,this.index=e,t||this._onDidChange.fire()}async navigate(){this.navigating=!0;try{this.current&&await this.doNavigate(this.current)}finally{this.navigating=!1}}doNavigate(e){let t=Object.create(null);return e.selection&&(t=e.selection.restore(t)),c(e.editor)?this.editorService.openEditor(e.editor,t,e.groupId):this.editorService.openEditor({...e.editor,options:{...e.editor.options,...t}},e.groupId)}isNavigating(){return this.navigating}};E=N([a(2,w),a(3,P),a(4,B),a(5,z)],E);let y=class{constructor(n,e,t,i){this.uriIdentityService=n;this.lifecycleService=e;this.fileService=t;this.pathService=i}preferResourceEditorInput(n){const e=C.getOriginalUri(n);if(e?.scheme===U.file||e?.scheme===U.vscodeRemote||e?.scheme===U.vscodeUserData||e?.scheme===this.pathService.defaultUriScheme){if(c(n)){const i=n.toUntyped();if(x(i))return i}return n}else return c(n)?n:void 0}matchesEditor(n,e){return n instanceof G||n instanceof K?c(e)?!1:n instanceof G?n.contains(e.resource,M.DELETED):this.matchesFile(e.resource,n):c(n)?c(e)?n.matches(e):this.matchesFile(e.resource,n):c(e)?this.matchesFile(n.resource,e):n&&e&&this.uriIdentityService.extUri.isEqual(n.resource,e.resource)}matchesFile(n,e){if(e instanceof G)return e.contains(n,M.DELETED);if(e instanceof K)return this.uriIdentityService.extUri.isEqualOrParent(n,e.resource);if(c(e)){const t=e.resource;return!t||this.lifecycleService.phase>=Ne.Restored&&!this.fileService.hasProvider(t)?!1:this.uriIdentityService.extUri.isEqual(t,n)}return this.uriIdentityService.extUri.isEqual(e?.resource,n)}matchesEditorIdentifier(n,e){return!e?.group||n.groupId!==e.group.id?!1:e.input?n.editor.matches(e.input):!1}onEditorDispose(n,e,t){const i=D.once(n.onWillDispose)(()=>e());let o=t.get(n);o||(o=new S,t.set(n,o)),o.add(i)}clearOnEditorDispose(n,e){if(!c(n))return;const t=e.get(n);t&&(O(t),e.delete(n))}};y=N([a(0,ke),a(1,me),a(2,_),a(3,ye)],y);export{E as EditorNavigationStack,l as HistoryService};

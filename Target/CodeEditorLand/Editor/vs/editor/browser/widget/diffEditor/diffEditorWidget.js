var q=Object.defineProperty;var J=Object.getOwnPropertyDescriptor;var P=(v,h,i,t)=>{for(var o=t>1?void 0:t?J(h,i):h,r=v.length-1,s;r>=0;r--)(s=v[r])&&(o=(t?s(h,i,o):s(o))||o);return t&&o&&q(h,i,o),o},y=(v,h)=>(i,t)=>h(i,t,v);import{getWindow as Q,h as C}from"../../../../../vs/base/browser/dom.js";import"../../../../../vs/base/browser/ui/sash/sash.js";import{findLast as X}from"../../../../../vs/base/common/arraysFind.js";import{BugIndicatingError as Y,onUnexpectedError as W}from"../../../../../vs/base/common/errors.js";import{Event as R}from"../../../../../vs/base/common/event.js";import{toDisposable as z}from"../../../../../vs/base/common/lifecycle.js";import{autorun as A,autorunWithStore as x,derived as M,disposableObservableValue as $,observableFromEvent as ii,observableValue as T,recomputeInitiallyAndOnChange as ei,subtransaction as ti,transaction as B}from"../../../../../vs/base/common/observable.js";import{derivedDisposable as p}from"../../../../../vs/base/common/observableInternal/derived.js";import"vs/css!./style";import{readHotReloadableExport as _}from"../../../../../vs/base/common/hotReloadHelpers.js";import"../../../../../vs/editor/browser/config/editorConfiguration.js";import"../../../../../vs/editor/browser/editorBrowser.js";import{EditorExtensionsRegistry as oi}from"../../../../../vs/editor/browser/editorExtensions.js";import{ICodeEditorService as ri}from"../../../../../vs/editor/browser/services/codeEditorService.js";import{StableEditorScrollState as ni}from"../../../../../vs/editor/browser/stableEditorScroll.js";import{CodeEditorWidget as si}from"../../../../../vs/editor/browser/widget/codeEditor/codeEditorWidget.js";import{AccessibleDiffViewer as di,AccessibleDiffViewerModelFromEditors as ai}from"../../../../../vs/editor/browser/widget/diffEditor/components/accessibleDiffViewer.js";import{DiffEditorDecorations as fi}from"../../../../../vs/editor/browser/widget/diffEditor/components/diffEditorDecorations.js";import{DiffEditorSash as li,SashLayout as hi}from"../../../../../vs/editor/browser/widget/diffEditor/components/diffEditorSash.js";import{DiffEditorViewZones as gi}from"../../../../../vs/editor/browser/widget/diffEditor/components/diffEditorViewZones/diffEditorViewZones.js";import{DiffEditorGutter as ci}from"../../../../../vs/editor/browser/widget/diffEditor/features/gutterFeature.js";import{HideUnchangedRegionsFeature as mi}from"../../../../../vs/editor/browser/widget/diffEditor/features/hideUnchangedRegionsFeature.js";import{MovedBlocksLinesFeature as ui}from"../../../../../vs/editor/browser/widget/diffEditor/features/movedBlocksLinesFeature.js";import{OverviewRulerFeature as F}from"../../../../../vs/editor/browser/widget/diffEditor/features/overviewRulerFeature.js";import{RevertButtonsFeature as pi}from"../../../../../vs/editor/browser/widget/diffEditor/features/revertButtonsFeature.js";import{applyStyle as K,applyViewZones as H,ObservableElementSizeObserver as _i,RefCounted as U,translatePosition as Z}from"../../../../../vs/editor/browser/widget/diffEditor/utils.js";import"../../../../../vs/editor/common/config/editorOptions.js";import"../../../../../vs/editor/common/core/dimension.js";import{Position as vi}from"../../../../../vs/editor/common/core/position.js";import{Range as Si}from"../../../../../vs/editor/common/core/range.js";import{CursorChangeReason as bi}from"../../../../../vs/editor/common/cursorEvents.js";import"../../../../../vs/editor/common/diff/legacyLinesDiffComputer.js";import"../../../../../vs/editor/common/diff/rangeMapping.js";import{EditorType as Ei}from"../../../../../vs/editor/common/editorCommon.js";import{EditorContextKeys as l}from"../../../../../vs/editor/common/editorContextKeys.js";import"../../../../../vs/editor/common/model.js";import{AccessibilitySignal as I,IAccessibilitySignalService as yi}from"../../../../../vs/platform/accessibilitySignal/browser/accessibilitySignalService.js";import{IContextKeyService as k}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IInstantiationService as Ii}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{ServiceCollection as Di}from"../../../../../vs/platform/instantiation/common/serviceCollection.js";import{bindContextKey as m}from"../../../../../vs/platform/observable/common/platformObservableUtils.js";import{IEditorProgressService as wi}from"../../../../../vs/platform/progress/common/progress.js";import{DiffEditorEditors as Mi}from"./components/diffEditorEditors.js";import{DelegatingEditor as Ci}from"./delegatingEditorImpl.js";import{DiffEditorOptions as Ri}from"./diffEditorOptions.js";import{DiffEditorViewModel as Vi}from"./diffEditorViewModel.js";let V=class extends Ci{constructor(i,t,o,r,s,d,a,b){super();this._domElement=i;this._parentContextKeyService=r;this._parentInstantiationService=s;this._accessibilitySignalService=a;this._editorProgressService=b;d.willCreateDiffEditor(),this._contextKeyService.createKey("isInDiffEditor",!0),this._domElement.appendChild(this.elements.root),this._register(z(()=>this.elements.root.remove())),this._rootSizeObserver=this._register(new _i(this.elements.root,t.dimension)),this._rootSizeObserver.setAutomaticLayout(t.automaticLayout??!1),this._options=this._instantiationService.createInstance(Ri,t),this._register(A(e=>{this._options.setWidth(this._rootSizeObserver.width.read(e))})),this._contextKeyService.createKey(l.isEmbeddedDiffEditor.key,!1),this._register(m(l.isEmbeddedDiffEditor,this._contextKeyService,e=>this._options.isInEmbeddedEditor.read(e))),this._register(m(l.comparingMovedCode,this._contextKeyService,e=>!!this._diffModel.read(e)?.movedTextToCompare.read(e))),this._register(m(l.diffEditorRenderSideBySideInlineBreakpointReached,this._contextKeyService,e=>this._options.couldShowInlineViewBecauseOfSize.read(e))),this._register(m(l.diffEditorInlineMode,this._contextKeyService,e=>!this._options.renderSideBySide.read(e))),this._register(m(l.hasChanges,this._contextKeyService,e=>(this._diffModel.read(e)?.diff.read(e)?.mappings.length??0)>0)),this._editors=this._register(this._instantiationService.createInstance(Mi,this.elements.original,this.elements.modified,this._options,o,(e,n,f,w)=>this._createInnerEditor(e,n,f,w))),this._register(m(l.diffEditorOriginalWritable,this._contextKeyService,e=>this._options.originalEditable.read(e))),this._register(m(l.diffEditorModifiedWritable,this._contextKeyService,e=>!this._options.readOnly.read(e))),this._register(m(l.diffEditorOriginalUri,this._contextKeyService,e=>this._diffModel.read(e)?.model.original.uri.toString()??"")),this._register(m(l.diffEditorModifiedUri,this._contextKeyService,e=>this._diffModel.read(e)?.model.modified.uri.toString()??"")),this._overviewRulerPart=p(this,e=>this._options.renderOverviewRuler.read(e)?this._instantiationService.createInstance(_(F,e),this._editors,this.elements.root,this._diffModel,this._rootSizeObserver.width,this._rootSizeObserver.height,this._layoutInfo.map(n=>n.modifiedEditor)):void 0).recomputeInitiallyAndOnChange(this._store);const g={height:this._rootSizeObserver.height,width:this._rootSizeObserver.width.map((e,n)=>e-(this._overviewRulerPart.read(n)?.width??0))};this._sashLayout=new hi(this._options,g),this._sash=p(this,e=>{const n=this._options.renderSideBySide.read(e);return this.elements.root.classList.toggle("side-by-side",n),n?new li(this.elements.root,g,this._options.enableSplitViewResizing,this._boundarySashes,this._sashLayout.sashLeft,()=>this._sashLayout.resetSash()):void 0}).recomputeInitiallyAndOnChange(this._store);const c=p(this,e=>this._instantiationService.createInstance(_(mi,e),this._editors,this._diffModel,this._options)).recomputeInitiallyAndOnChange(this._store);p(this,e=>this._instantiationService.createInstance(_(fi,e),this._editors,this._diffModel,this._options,this)).recomputeInitiallyAndOnChange(this._store);const S=new Set,E=new Set;let D=!1;const u=p(this,e=>this._instantiationService.createInstance(_(gi,e),Q(this._domElement),this._editors,this._diffModel,this._options,this,()=>D||c.get().isUpdatingHiddenAreas,S,E)).recomputeInitiallyAndOnChange(this._store),L=M(this,e=>{const n=u.read(e).viewZones.read(e).orig,f=c.read(e).viewZones.read(e).origViewZones;return n.concat(f)}),G=M(this,e=>{const n=u.read(e).viewZones.read(e).mod,f=c.read(e).viewZones.read(e).modViewZones;return n.concat(f)});this._register(H(this._editors.original,L,e=>{D=e},S));let O;this._register(H(this._editors.modified,G,e=>{D=e,D?O=ni.capture(this._editors.modified):(O?.restore(this._editors.modified),O=void 0)},E)),this._accessibleDiffViewer=p(this,e=>this._instantiationService.createInstance(_(di,e),this.elements.accessibleDiffViewer,this._accessibleDiffViewerVisible,(n,f)=>this._accessibleDiffViewerShouldBeVisible.set(n,f),this._options.onlyShowAccessibleDiffViewer.map(n=>!n),this._rootSizeObserver.width,this._rootSizeObserver.height,this._diffModel.map((n,f)=>n?.diff.read(f)?.mappings.map(w=>w.lineRangeMapping)),new ai(this._editors))).recomputeInitiallyAndOnChange(this._store);const N=this._accessibleDiffViewerVisible.map(e=>e?"hidden":"visible");this._register(K(this.elements.modified,{visibility:N})),this._register(K(this.elements.original,{visibility:N})),this._createDiffEditorContributions(),d.addDiffEditor(this),this._gutter=p(this,e=>this._options.shouldRenderGutterMenu.read(e)?this._instantiationService.createInstance(_(ci,e),this.elements.root,this._diffModel,this._editors,this._options,this._sashLayout,this._boundarySashes):void 0),this._register(ei(this._layoutInfo)),p(this,e=>new(_(ui,e))(this.elements.root,this._diffModel,this._layoutInfo.map(n=>n.originalEditor),this._layoutInfo.map(n=>n.modifiedEditor),this._editors)).recomputeInitiallyAndOnChange(this._store,e=>{this._movedBlocksLinesPart.set(e,void 0)}),this._register(R.runAndSubscribe(this._editors.modified.onDidChangeCursorPosition,e=>this._handleCursorPositionChange(e,!0))),this._register(R.runAndSubscribe(this._editors.original.onDidChangeCursorPosition,e=>this._handleCursorPositionChange(e,!1)));const j=this._diffModel.map(this,(e,n)=>{if(e)return e.diff.read(n)===void 0&&!e.isDiffUpToDate.read(n)});this._register(x((e,n)=>{if(j.read(e)===!0){const f=this._editorProgressService.show(!0,1e3);n.add(z(()=>f.done()))}})),this._register(x((e,n)=>{n.add(new(_(pi,e))(this._editors,this._diffModel,this._options,this))})),this._register(x((e,n)=>{const f=this._diffModel.read(e);if(f)for(const w of[f.model.original,f.model.modified])n.add(w.onWillDispose(Oi=>{W(new Y("TextModel got disposed before DiffEditorWidget model got reset")),this.setModel(null)}))})),this._register(A(e=>{this._options.setModel(this._diffModel.read(e))}))}static ENTIRE_DIFF_OVERVIEW_WIDTH=F.ENTIRE_DIFF_OVERVIEW_WIDTH;elements=C("div.monaco-diff-editor.side-by-side",{style:{position:"relative",height:"100%"}},[C("div.editor.original@original",{style:{position:"absolute",height:"100%"}}),C("div.editor.modified@modified",{style:{position:"absolute",height:"100%"}}),C("div.accessibleDiffViewer@accessibleDiffViewer",{style:{position:"absolute",height:"100%"}})]);_diffModelSrc=this._register($(this,void 0));_diffModel=M(this,i=>this._diffModelSrc.read(i)?.object);onDidChangeModel=R.fromObservableLight(this._diffModel);get onDidContentSizeChange(){return this._editors.onDidContentSizeChange}_contextKeyService=this._register(this._parentContextKeyService.createScoped(this._domElement));_instantiationService=this._register(this._parentInstantiationService.createChild(new Di([k,this._contextKeyService])));_rootSizeObserver;_sashLayout;_sash;_boundarySashes=T(this,void 0);_accessibleDiffViewerShouldBeVisible=T(this,!1);_accessibleDiffViewerVisible=M(this,i=>this._options.onlyShowAccessibleDiffViewer.read(i)?!0:this._accessibleDiffViewerShouldBeVisible.read(i));_accessibleDiffViewer;_options;_editors;_overviewRulerPart;_movedBlocksLinesPart=T(this,void 0);_gutter;get collapseUnchangedRegions(){return this._options.hideUnchangedRegions.get()}getViewWidth(){return this._rootSizeObserver.width.get()}getContentHeight(){return this._editors.modified.getContentHeight()}_createInnerEditor(i,t,o,r){return i.createInstance(si,t,o,r)}_layoutInfo=M(this,i=>{const t=this._rootSizeObserver.width.read(i),o=this._rootSizeObserver.height.read(i);this._rootSizeObserver.automaticLayout?this.elements.root.style.height="100%":this.elements.root.style.height=o+"px";const r=this._sash.read(i),s=this._gutter.read(i),d=s?.width.read(i)??0,a=this._overviewRulerPart.read(i)?.width??0;let b,g,c,S,E;if(!!r){const u=r.sashLeft.read(i),L=this._movedBlocksLinesPart.read(i)?.width.read(i)??0;b=0,g=u-d-L,E=u-d,c=u,S=t-c-a}else{E=0;const u=this._options.inlineViewHideOriginalLineNumbers.read(i);b=d,u?g=0:g=Math.max(5,this._editors.originalObs.layoutInfoDecorationsLeft.read(i)),c=d+g,S=t-c-a}return this.elements.original.style.left=b+"px",this.elements.original.style.width=g+"px",this._editors.original.layout({width:g,height:o},!0),s?.layout(E),this.elements.modified.style.left=c+"px",this.elements.modified.style.width=S+"px",this._editors.modified.layout({width:S,height:o},!0),{modifiedEditor:this._editors.modified.getLayoutInfo(),originalEditor:this._editors.original.getLayoutInfo()}});_createDiffEditorContributions(){const i=oi.getDiffEditorContributions();for(const t of i)try{this._register(this._instantiationService.createInstance(t.ctor,this))}catch(o){W(o)}}get _targetEditor(){return this._editors.modified}getEditorType(){return Ei.IDiffEditor}onVisible(){this._editors.original.onVisible(),this._editors.modified.onVisible()}onHide(){this._editors.original.onHide(),this._editors.modified.onHide()}layout(i){this._rootSizeObserver.observe(i)}hasTextFocus(){return this._editors.original.hasTextFocus()||this._editors.modified.hasTextFocus()}saveViewState(){const i=this._editors.original.saveViewState(),t=this._editors.modified.saveViewState();return{original:i,modified:t,modelState:this._diffModel.get()?.serializeState()}}restoreViewState(i){if(i&&i.original&&i.modified){const t=i;this._editors.original.restoreViewState(t.original),this._editors.modified.restoreViewState(t.modified),t.modelState&&this._diffModel.get()?.restoreSerializedState(t.modelState)}}handleInitialized(){this._editors.original.handleInitialized(),this._editors.modified.handleInitialized()}createViewModel(i){return this._instantiationService.createInstance(Vi,i,this._options)}getModel(){return this._diffModel.get()?.model??null}setModel(i){const t=i?"model"in i?U.create(i).createNewRef(this):U.create(this.createViewModel(i),this):null;this.setDiffModel(t)}setDiffModel(i,t){const o=this._diffModel.get();!i&&o&&this._accessibleDiffViewer.get().close(),this._diffModel.get()!==i?.object&&ti(t,r=>{const s=i?.object;ii.batchEventsGlobally(r,()=>{this._editors.original.setModel(s?s.model.original:null),this._editors.modified.setModel(s?s.model.modified:null)});const d=this._diffModelSrc.get()?.createNewRef(this);this._diffModelSrc.set(i?.createNewRef(this),r),setTimeout(()=>{d?.dispose()},0)})}updateOptions(i){this._options.updateOptions(i)}getContainerDomNode(){return this._domElement}getOriginalEditor(){return this._editors.original}getModifiedEditor(){return this._editors.modified}setBoundarySashes(i){this._boundarySashes.set(i,void 0)}_diffValue=this._diffModel.map((i,t)=>i?.diff.read(t));onDidUpdateDiff=R.fromObservableLight(this._diffValue);get ignoreTrimWhitespace(){return this._options.ignoreTrimWhitespace.get()}get maxComputationTime(){return this._options.maxComputationTimeMs.get()}get renderSideBySide(){return this._options.renderSideBySide.get()}getLineChanges(){const i=this._diffModel.get()?.diff.get();return i?Li(i):null}getDiffComputationResult(){const i=this._diffModel.get()?.diff.get();return i?{changes:this.getLineChanges(),changes2:i.mappings.map(t=>t.lineRangeMapping),identical:i.identical,quitEarly:i.quitEarly}:null}revert(i){const t=this._diffModel.get();!t||!t.isDiffUpToDate.get()||this._editors.modified.executeEdits("diffEditor",[{range:i.modified.toExclusiveRange(),text:t.model.original.getValueInRange(i.original.toExclusiveRange())}])}revertRangeMappings(i){const t=this._diffModel.get();if(!t||!t.isDiffUpToDate.get())return;const o=i.map(r=>({range:r.modifiedRange,text:t.model.original.getValueInRange(r.originalRange)}));this._editors.modified.executeEdits("diffEditor",o)}_goTo(i){this._editors.modified.setPosition(new vi(i.lineRangeMapping.modified.startLineNumber,1)),this._editors.modified.revealRangeInCenter(i.lineRangeMapping.modified.toExclusiveRange())}goToDiff(i){const t=this._diffModel.get()?.diff.get()?.mappings;if(!t||t.length===0)return;const o=this._editors.modified.getPosition().lineNumber;let r;i==="next"?r=t.find(s=>s.lineRangeMapping.modified.startLineNumber>o)??t[0]:r=X(t,s=>s.lineRangeMapping.modified.startLineNumber<o)??t[t.length-1],this._goTo(r),r.lineRangeMapping.modified.isEmpty?this._accessibilitySignalService.playSignal(I.diffLineDeleted,{source:"diffEditor.goToDiff"}):r.lineRangeMapping.original.isEmpty?this._accessibilitySignalService.playSignal(I.diffLineInserted,{source:"diffEditor.goToDiff"}):r&&this._accessibilitySignalService.playSignal(I.diffLineModified,{source:"diffEditor.goToDiff"})}revealFirstDiff(){const i=this._diffModel.get();i&&this.waitForDiff().then(()=>{const t=i.diff.get()?.mappings;!t||t.length===0||this._goTo(t[0])})}accessibleDiffViewerNext(){this._accessibleDiffViewer.get().next()}accessibleDiffViewerPrev(){this._accessibleDiffViewer.get().prev()}async waitForDiff(){const i=this._diffModel.get();i&&await i.waitForDiff()}mapToOtherSide(){const i=this._editors.modified.hasWidgetFocus(),t=i?this._editors.modified:this._editors.original,o=i?this._editors.original:this._editors.modified;let r;const s=t.getSelection();if(s){const d=this._diffModel.get()?.diff.get()?.mappings.map(a=>i?a.lineRangeMapping.flip():a.lineRangeMapping);if(d){const a=Z(s.getStartPosition(),d),b=Z(s.getEndPosition(),d);r=Si.plusRange(a,b)}}return{destination:o,destinationSelection:r}}switchSide(){const{destination:i,destinationSelection:t}=this.mapToOtherSide();i.focus(),t&&i.setSelection(t)}exitCompareMove(){const i=this._diffModel.get();i&&i.movedTextToCompare.set(void 0,void 0)}collapseAllUnchangedRegions(){const i=this._diffModel.get()?.unchangedRegions.get();i&&B(t=>{for(const o of i)o.collapseAll(t)})}showAllUnchangedRegions(){const i=this._diffModel.get()?.unchangedRegions.get();i&&B(t=>{for(const o of i)o.showAll(t)})}_handleCursorPositionChange(i,t){if(i?.reason===bi.Explicit){const o=this._diffModel.get()?.diff.get()?.mappings.find(r=>t?r.lineRangeMapping.modified.contains(i.position.lineNumber):r.lineRangeMapping.original.contains(i.position.lineNumber));o?.lineRangeMapping.modified.isEmpty?this._accessibilitySignalService.playSignal(I.diffLineDeleted,{source:"diffEditor.cursorPositionChanged"}):o?.lineRangeMapping.original.isEmpty?this._accessibilitySignalService.playSignal(I.diffLineInserted,{source:"diffEditor.cursorPositionChanged"}):o&&this._accessibilitySignalService.playSignal(I.diffLineModified,{source:"diffEditor.cursorPositionChanged"})}}};V=P([y(3,k),y(4,Ii),y(5,ri),y(6,yi),y(7,wi)],V);function Li(v){return v.mappings.map(h=>{const i=h.lineRangeMapping;let t,o,r,s,d=i.innerChanges;return i.original.isEmpty?(t=i.original.startLineNumber-1,o=0,d=void 0):(t=i.original.startLineNumber,o=i.original.endLineNumberExclusive-1),i.modified.isEmpty?(r=i.modified.startLineNumber-1,s=0,d=void 0):(r=i.modified.startLineNumber,s=i.modified.endLineNumberExclusive-1),{originalStartLineNumber:t,originalEndLineNumber:o,modifiedStartLineNumber:r,modifiedEndLineNumber:s,charChanges:d?.map(a=>({originalStartLineNumber:a.originalRange.startLineNumber,originalStartColumn:a.originalRange.startColumn,originalEndLineNumber:a.originalRange.endLineNumber,originalEndColumn:a.originalRange.endColumn,modifiedStartLineNumber:a.modifiedRange.startLineNumber,modifiedStartColumn:a.modifiedRange.startColumn,modifiedEndLineNumber:a.modifiedRange.endLineNumber,modifiedEndColumn:a.modifiedRange.endColumn}))}})}export{V as DiffEditorWidget};
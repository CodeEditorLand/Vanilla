var D=Object.defineProperty;var T=Object.getOwnPropertyDescriptor;var E=(y,g,e,o)=>{for(var i=o>1?void 0:o?T(g,e):g,s=y.length-1,t;s>=0;s--)(t=y[s])&&(i=(o?t(g,e,i):t(i))||i);return o&&i&&D(g,e,i),i},S=(y,g)=>(e,o)=>g(e,o,y);import*as u from"../../../../base/browser/dom.js";import{StandardMouseEvent as w}from"../../../../base/browser/mouseEvent.js";import{CancellationTokenSource as R}from"../../../../base/common/cancellation.js";import{Disposable as P,DisposableStore as v,toDisposable as b}from"../../../../base/common/lifecycle.js";import{MenuId as O}from"../../../../platform/actions/common/actions.js";import{IContextKeyService as K}from"../../../../platform/contextkey/common/contextkey.js";import{IContextMenuService as V}from"../../../../platform/contextview/browser/contextView.js";import{IInstantiationService as A}from"../../../../platform/instantiation/common/instantiation.js";import{MouseTargetType as x}from"../../../browser/editorBrowser.js";import{EditorOption as h,RenderLineNumbersType as H}from"../../../common/config/editorOptions.js";import{Position as L}from"../../../common/core/position.js";import{Range as N}from"../../../common/core/range.js";import{ScrollType as U}from"../../../common/editorCommon.js";import{EditorContextKeys as F}from"../../../common/editorContextKeys.js";import{ILanguageConfigurationService as G}from"../../../common/languages/languageConfigurationRegistry.js";import{ILanguageFeatureDebounceService as j}from"../../../common/services/languageFeatureDebounce.js";import{ILanguageFeaturesService as B}from"../../../common/services/languageFeatures.js";import"../../../common/textModelEvents.js";import{FoldingController as z}from"../../folding/browser/folding.js";import{toggleCollapseState as X}from"../../folding/browser/foldingModel.js";import{getDefinitionsAtPosition as q}from"../../gotoSymbol/browser/goToSymbol.js";import{ClickLinkGesture as Y}from"../../gotoSymbol/browser/link/clickLinkGesture.js";import{goToDefinitionWithLocation as J}from"../../inlayHints/browser/inlayHintsLocations.js";import{StickyRange as Q}from"./stickyScrollElement.js";import{StickyLineCandidateProvider as Z}from"./stickyScrollProvider.js";import{StickyScrollWidget as $,StickyScrollWidgetState as C}from"./stickyScrollWidget.js";let m=class extends P{constructor(e,o,i,s,t,n,r){super();this._editor=e;this._contextMenuService=o;this._languageFeaturesService=i;this._instaService=s;this._contextKeyService=r;this._stickyScrollWidget=new $(this._editor),this._stickyLineCandidateProvider=new Z(this._editor,i,t),this._register(this._stickyScrollWidget),this._register(this._stickyLineCandidateProvider),this._widgetState=C.Empty,this._onDidResize(),this._readConfiguration();const d=this._stickyScrollWidget.getDomNode();this._register(this._editor.onDidChangeConfiguration(l=>{this._readConfigurationChange(l)})),this._register(u.addDisposableListener(d,u.EventType.CONTEXT_MENU,async l=>{this._onContextMenu(u.getWindow(d),l)})),this._stickyScrollFocusedContextKey=F.stickyScrollFocused.bindTo(this._contextKeyService),this._stickyScrollVisibleContextKey=F.stickyScrollVisible.bindTo(this._contextKeyService);const c=this._register(u.trackFocus(d));this._register(c.onDidBlur(l=>{this._positionRevealed===!1&&d.clientHeight===0?(this._focusedStickyElementIndex=-1,this.focus()):this._disposeFocusStickyScrollStore()})),this._register(c.onDidFocus(l=>{this.focus()})),this._registerMouseListeners(),this._register(u.addDisposableListener(d,u.EventType.MOUSE_DOWN,l=>{this._onMouseDown=!0}))}static ID="store.contrib.stickyScrollController";_stickyScrollWidget;_stickyLineCandidateProvider;_sessionStore=new v;_widgetState;_foldingModel;_maxStickyLines=Number.MAX_SAFE_INTEGER;_stickyRangeProjectedOnEditor;_candidateDefinitionsLength=-1;_stickyScrollFocusedContextKey;_stickyScrollVisibleContextKey;_focusDisposableStore;_focusedStickyElementIndex=-1;_enabled=!1;_focused=!1;_positionRevealed=!1;_onMouseDown=!1;_endLineNumbers=[];_showEndForLine;_minRebuildFromLine;get stickyScrollCandidateProvider(){return this._stickyLineCandidateProvider}get stickyScrollWidgetState(){return this._widgetState}static get(e){return e.getContribution(m.ID)}_disposeFocusStickyScrollStore(){this._stickyScrollFocusedContextKey.set(!1),this._focusDisposableStore?.dispose(),this._focused=!1,this._positionRevealed=!1,this._onMouseDown=!1}focus(){if(this._onMouseDown){this._onMouseDown=!1,this._editor.focus();return}this._stickyScrollFocusedContextKey.get()!==!0&&(this._focused=!0,this._focusDisposableStore=new v,this._stickyScrollFocusedContextKey.set(!0),this._focusedStickyElementIndex=this._stickyScrollWidget.lineNumbers.length-1,this._stickyScrollWidget.focusLineWithIndex(this._focusedStickyElementIndex))}focusNext(){this._focusedStickyElementIndex<this._stickyScrollWidget.lineNumberCount-1&&this._focusNav(!0)}focusPrevious(){this._focusedStickyElementIndex>0&&this._focusNav(!1)}selectEditor(){this._editor.focus()}_focusNav(e){this._focusedStickyElementIndex=e?this._focusedStickyElementIndex+1:this._focusedStickyElementIndex-1,this._stickyScrollWidget.focusLineWithIndex(this._focusedStickyElementIndex)}goToFocused(){const e=this._stickyScrollWidget.lineNumbers;this._disposeFocusStickyScrollStore(),this._revealPosition({lineNumber:e[this._focusedStickyElementIndex],column:1})}_revealPosition(e){this._reveaInEditor(e,()=>this._editor.revealPosition(e))}_revealLineInCenterIfOutsideViewport(e){this._reveaInEditor(e,()=>this._editor.revealLineInCenterIfOutsideViewport(e.lineNumber,U.Smooth))}_reveaInEditor(e,o){this._focused&&this._disposeFocusStickyScrollStore(),this._positionRevealed=!0,o(),this._editor.setSelection(N.fromPositions(e)),this._editor.focus()}_registerMouseListeners(){const e=this._register(new v),o=this._register(new Y(this._editor,{extractLineNumberFromMouseEvent:t=>{const n=this._stickyScrollWidget.getEditorPositionFromNode(t.target.element);return n?n.lineNumber:0}})),i=t=>{if(!this._editor.hasModel()||t.target.type!==x.OVERLAY_WIDGET||t.target.detail!==this._stickyScrollWidget.getId())return null;const n=t.target.element;if(!n||n.innerText!==n.innerHTML)return null;const r=this._stickyScrollWidget.getEditorPositionFromNode(n);return r?{range:new N(r.lineNumber,r.column,r.lineNumber,r.column+n.innerText.length),textElement:n}:null},s=this._stickyScrollWidget.getDomNode();this._register(u.addStandardDisposableListener(s,u.EventType.CLICK,t=>{if(t.ctrlKey||t.altKey||t.metaKey||!t.leftButton)return;if(t.shiftKey){const c=this._stickyScrollWidget.getLineIndexFromChildDomNode(t.target);if(c===null)return;const l=new L(this._endLineNumbers[c],1);this._revealLineInCenterIfOutsideViewport(l);return}if(this._stickyScrollWidget.isInFoldingIconDomNode(t.target)){const c=this._stickyScrollWidget.getLineNumberFromChildDomNode(t.target);this._toggleFoldingRegionForLine(c);return}if(!this._stickyScrollWidget.isInStickyLine(t.target))return;let d=this._stickyScrollWidget.getEditorPositionFromNode(t.target);if(!d){const c=this._stickyScrollWidget.getLineNumberFromChildDomNode(t.target);if(c===null)return;d=new L(c,1)}this._revealPosition(d)})),this._register(u.addStandardDisposableListener(s,u.EventType.MOUSE_MOVE,t=>{if(t.shiftKey){const n=this._stickyScrollWidget.getLineIndexFromChildDomNode(t.target);if(n===null||this._showEndForLine!==null&&this._showEndForLine===n)return;this._showEndForLine=n,this._renderStickyScroll();return}this._showEndForLine!==void 0&&(this._showEndForLine=void 0,this._renderStickyScroll())})),this._register(u.addDisposableListener(s,u.EventType.MOUSE_LEAVE,t=>{this._showEndForLine!==void 0&&(this._showEndForLine=void 0,this._renderStickyScroll())})),this._register(o.onMouseMoveOrRelevantKeyDown(([t,n])=>{const r=i(t);if(!r||!t.hasTriggerModifier||!this._editor.hasModel()){e.clear();return}const{range:d,textElement:c}=r;if(!d.equalsRange(this._stickyRangeProjectedOnEditor))this._stickyRangeProjectedOnEditor=d,e.clear();else if(c.style.textDecoration==="underline")return;const l=new R;e.add(b(()=>l.dispose(!0)));let a;q(this._languageFeaturesService.definitionProvider,this._editor.getModel(),new L(d.startLineNumber,d.startColumn+1),!1,l.token).then(_=>{if(!l.token.isCancellationRequested)if(_.length!==0){this._candidateDefinitionsLength=_.length;const f=c;a!==f?(e.clear(),a=f,a.style.textDecoration="underline",e.add(b(()=>{a.style.textDecoration="none"}))):a||(a=f,a.style.textDecoration="underline",e.add(b(()=>{a.style.textDecoration="none"})))}else e.clear()})})),this._register(o.onCancel(()=>{e.clear()})),this._register(o.onExecute(async t=>{if(t.target.type!==x.OVERLAY_WIDGET||t.target.detail!==this._stickyScrollWidget.getId())return;const n=this._stickyScrollWidget.getEditorPositionFromNode(t.target.element);n&&(!this._editor.hasModel()||!this._stickyRangeProjectedOnEditor||(this._candidateDefinitionsLength>1&&(this._focused&&this._disposeFocusStickyScrollStore(),this._revealPosition({lineNumber:n.lineNumber,column:1})),this._instaService.invokeFunction(J,t,this._editor,{uri:this._editor.getModel().uri,range:this._stickyRangeProjectedOnEditor})))}))}_onContextMenu(e,o){const i=new w(e,o);this._contextMenuService.showContextMenu({menuId:O.StickyScrollContext,getAnchor:()=>i})}_toggleFoldingRegionForLine(e){if(!this._foldingModel||e===null)return;const o=this._stickyScrollWidget.getRenderedStickyLine(e),i=o?.foldingIcon;if(!i)return;X(this._foldingModel,Number.MAX_VALUE,[e]),i.isCollapsed=!i.isCollapsed;const s=(i.isCollapsed?this._editor.getTopForLineNumber(i.foldingEndLine):this._editor.getTopForLineNumber(i.foldingStartLine))-this._editor.getOption(h.lineHeight)*o.index+1;this._editor.setScrollTop(s),this._renderStickyScroll(e)}_readConfiguration(){const e=this._editor.getOption(h.stickyScroll);if(e.enabled===!1){this._editor.removeOverlayWidget(this._stickyScrollWidget),this._sessionStore.clear(),this._enabled=!1;return}else e.enabled&&!this._enabled&&(this._editor.addOverlayWidget(this._stickyScrollWidget),this._sessionStore.add(this._editor.onDidScrollChange(i=>{i.scrollTopChanged&&(this._showEndForLine=void 0,this._renderStickyScroll())})),this._sessionStore.add(this._editor.onDidLayoutChange(()=>this._onDidResize())),this._sessionStore.add(this._editor.onDidChangeModelTokens(i=>this._onTokensChange(i))),this._sessionStore.add(this._stickyLineCandidateProvider.onDidChangeStickyScroll(()=>{this._showEndForLine=void 0,this._renderStickyScroll()})),this._enabled=!0);this._editor.getOption(h.lineNumbers).renderType===H.Relative&&this._sessionStore.add(this._editor.onDidChangeCursorPosition(()=>{this._showEndForLine=void 0,this._renderStickyScroll(0)}))}_readConfigurationChange(e){(e.hasChanged(h.stickyScroll)||e.hasChanged(h.minimap)||e.hasChanged(h.lineHeight)||e.hasChanged(h.showFoldingControls)||e.hasChanged(h.lineNumbers))&&this._readConfiguration(),e.hasChanged(h.lineNumbers)&&this._renderStickyScroll(0)}_needsUpdate(e){const o=this._stickyScrollWidget.getCurrentLines();for(const i of o)for(const s of e.ranges)if(i>=s.fromLineNumber&&i<=s.toLineNumber)return!0;return!1}_onTokensChange(e){this._needsUpdate(e)&&this._renderStickyScroll(0)}_onDidResize(){const o=this._editor.getLayoutInfo().height/this._editor.getOption(h.lineHeight);this._maxStickyLines=Math.round(o*.25)}async _renderStickyScroll(e){const o=this._editor.getModel();if(!o||o.isTooLargeForTokenization()){this._resetState();return}const i=this._updateAndGetMinRebuildFromLine(e),s=this._stickyLineCandidateProvider.getVersionId();if(s===void 0||s===o.getVersionId())if(!this._focused)await this._updateState(i);else if(this._focusedStickyElementIndex===-1)await this._updateState(i),this._focusedStickyElementIndex=this._stickyScrollWidget.lineNumberCount-1,this._focusedStickyElementIndex!==-1&&this._stickyScrollWidget.focusLineWithIndex(this._focusedStickyElementIndex);else{const n=this._stickyScrollWidget.lineNumbers[this._focusedStickyElementIndex];await this._updateState(i),this._stickyScrollWidget.lineNumberCount===0?this._focusedStickyElementIndex=-1:(this._stickyScrollWidget.lineNumbers.includes(n)||(this._focusedStickyElementIndex=this._stickyScrollWidget.lineNumberCount-1),this._stickyScrollWidget.focusLineWithIndex(this._focusedStickyElementIndex))}}_updateAndGetMinRebuildFromLine(e){if(e!==void 0){const o=this._minRebuildFromLine!==void 0?this._minRebuildFromLine:1/0;this._minRebuildFromLine=Math.min(e,o)}return this._minRebuildFromLine}async _updateState(e){this._minRebuildFromLine=void 0,this._foldingModel=await z.get(this._editor)?.getFoldingModel()??void 0,this._widgetState=this.findScrollWidgetState();const o=this._widgetState.startLineNumbers.length>0;this._stickyScrollVisibleContextKey.set(o),this._stickyScrollWidget.setState(this._widgetState,this._foldingModel,e)}async _resetState(){this._minRebuildFromLine=void 0,this._foldingModel=void 0,this._widgetState=C.Empty,this._stickyScrollVisibleContextKey.set(!1),this._stickyScrollWidget.setState(void 0,void 0)}findScrollWidgetState(){const e=this._editor.getOption(h.lineHeight),o=Math.min(this._maxStickyLines,this._editor.getOption(h.stickyScroll).maxLineCount),i=this._editor.getScrollTop();let s=0;const t=[],n=[],r=this._editor.getVisibleRanges();if(r.length!==0){const d=new Q(r[0].startLineNumber,r[r.length-1].endLineNumber),c=this._stickyLineCandidateProvider.getCandidateStickyLinesIntersecting(d);for(const l of c){const a=l.startLineNumber,_=l.endLineNumber,f=l.nestingDepth;if(_-a>0){const I=(f-1)*e,p=f*e,M=this._editor.getBottomForLineNumber(a)-i,W=this._editor.getTopForLineNumber(_)-i,k=this._editor.getBottomForLineNumber(_)-i;if(I>W&&I<=k){t.push(a),n.push(_+1),s=k-p;break}else p>M&&p<=k&&(t.push(a),n.push(_+1));if(t.length===o)break}}}return this._endLineNumbers=n,new C(t,n,s,this._showEndForLine)}dispose(){super.dispose(),this._sessionStore.dispose()}};m=E([S(1,V),S(2,B),S(3,A),S(4,G),S(5,j),S(6,K)],m);export{m as StickyScrollController};

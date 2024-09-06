var F=Object.defineProperty;var N=Object.getOwnPropertyDescriptor;var v=(d,e,t,o)=>{for(var r=o>1?void 0:o?N(e,t):e,n=d.length-1,i;n>=0;n--)(i=d[n])&&(r=(o?i(e,t,r):i(r))||r);return o&&r&&F(e,t,r),r},a=(d,e)=>(t,o)=>e(t,o,d);import"../../../../../../vs/base/browser/ui/tree/tree.js";import{Barrier as q,raceCancellation as U,timeout as K,TimeoutTimer as w}from"../../../../../../vs/base/common/async.js";import{CancellationTokenSource as H}from"../../../../../../vs/base/common/cancellation.js";import{onUnexpectedError as Q}from"../../../../../../vs/base/common/errors.js";import{Emitter as $}from"../../../../../../vs/base/common/event.js";import{Disposable as j,DisposableStore as P,toDisposable as O}from"../../../../../../vs/base/common/lifecycle.js";import{isEqual as J}from"../../../../../../vs/base/common/resources.js";import"../../../../../../vs/base/common/uri.js";import{isCodeEditor as T,isDiffEditor as R}from"../../../../../../vs/editor/browser/editorBrowser.js";import{ICodeEditorService as X}from"../../../../../../vs/editor/browser/services/codeEditorService.js";import"../../../../../../vs/editor/common/core/position.js";import{Range as Y}from"../../../../../../vs/editor/common/core/range.js";import{ScrollType as Z}from"../../../../../../vs/editor/common/editorCommon.js";import"../../../../../../vs/editor/common/model.js";import{ILanguageFeaturesService as ee}from"../../../../../../vs/editor/common/services/languageFeatures.js";import{IMarkerDecorationsService as te}from"../../../../../../vs/editor/common/services/markerDecorations.js";import{ITextResourceConfigurationService as V}from"../../../../../../vs/editor/common/services/textResourceConfiguration.js";import"../../../../../../vs/editor/common/textModelEvents.js";import{IOutlineModelService as ie,OutlineElement as I,OutlineGroup as L,OutlineModel as x,TreeElement as y}from"../../../../../../vs/editor/contrib/documentSymbols/browser/outlineModel.js";import{localize as oe}from"../../../../../../vs/nls.js";import{IConfigurationService as re}from"../../../../../../vs/platform/configuration/common/configuration.js";import{TextEditorSelectionRevealType as ne}from"../../../../../../vs/platform/editor/common/editor.js";import{IInstantiationService as B}from"../../../../../../vs/platform/instantiation/common/instantiation.js";import{MarkerSeverity as G}from"../../../../../../vs/platform/markers/common/markers.js";import{Registry as se}from"../../../../../../vs/platform/registry/common/platform.js";import{Extensions as ae}from"../../../../../../vs/workbench/common/contributions.js";import"../../../../../../vs/workbench/common/editor.js";import{DocumentSymbolAccessibilityProvider as le,DocumentSymbolComparator as de,DocumentSymbolFilter as M,DocumentSymbolGroupRenderer as ue,DocumentSymbolIdentityProvider as ce,DocumentSymbolNavigationLabelProvider as me,DocumentSymbolRenderer as he,DocumentSymbolVirtualDelegate as fe}from"../../../../../../vs/workbench/contrib/codeEditor/browser/outline/documentSymbolsTree.js";import{LifecyclePhase as pe}from"../../../../../../vs/workbench/services/lifecycle/common/lifecycle.js";import{IOutlineService as ge,OutlineConfigCollapseItemsValues as be,OutlineConfigKeys as h,OutlineTarget as C}from"../../../../../../vs/workbench/services/outline/browser/outline.js";let f=class{constructor(e,t){this._editor=e;this._textResourceConfigurationService=t}_breadcrumbs=[];getBreadcrumbElements(){return this._breadcrumbs}clear(){this._breadcrumbs=[]}update(e,t){const o=this._computeBreadcrumbs(e,t);this._breadcrumbs=o}_computeBreadcrumbs(e,t){let o=e.getItemEnclosingPosition(t);if(!o)return[];const r=[];for(;o;){r.push(o);const i=o.parent;if(i instanceof x||i instanceof L&&i.parent&&i.parent.children.size===1)break;o=i}const n=[];for(let i=r.length-1;i>=0;i--){const s=r[i];if(this._isFiltered(s))break;n.push(s)}return n.length===0?[]:n}_isFiltered(e){if(!(e instanceof I))return!1;const t=`breadcrumbs.${M.kindToConfigName[e.symbol.kind]}`;let o;return this._editor&&this._editor.getModel()&&(o=this._editor.getModel().uri),!this._textResourceConfigurationService.getValue(o,t)}};f=v([a(1,V)],f);let p=class{constructor(e,t,o,r,n,i,s,u,c,m){this._editor=e;this._languageFeaturesService=r;this._codeEditorService=n;this._outlineModelService=i;this._configurationService=s;this._markerDecorationsService=u;this._breadcrumbsDataSource=new f(e,c);const S=new fe,b=[new ue,m.createInstance(he,!0,t)],_={getChildren:l=>l instanceof I||l instanceof L?l.children.values():l===this&&this._outlineModel?this._outlineModel.children.values():[]},D=new de,W=c.getValue(e.getModel()?.uri,h.collapseItems),A={collapseByDefault:t===C.Breadcrumbs||t===C.OutlinePane&&W===be.Collapsed,expandOnlyOnTwistieClick:!0,multipleSelectionSupport:!1,identityProvider:new ce,keyboardNavigationLabelProvider:new me,accessibilityProvider:new le(oe("document","Document Symbols")),filter:t===C.OutlinePane?m.createInstance(M,"outline"):t===C.Breadcrumbs?m.createInstance(M,"breadcrumbs"):void 0};this.config={breadcrumbsDataSource:this._breadcrumbsDataSource,delegate:S,renderers:b,treeDataSource:_,comparator:D,options:A,quickPickDataSource:{getQuickPickElements:()=>{throw new Error("not implemented")}}},this._disposables.add(r.documentSymbolProvider.onDidChange(l=>this._createOutline())),this._disposables.add(this._editor.onDidChangeModel(l=>this._createOutline())),this._disposables.add(this._editor.onDidChangeModelLanguage(l=>this._createOutline()));const E=new w;this._disposables.add(E),this._disposables.add(this._editor.onDidChangeModelContent(l=>{const k=this._editor.getModel();if(k){const z=i.getDebounceValue(k);E.cancelAndSet(()=>this._createOutline(l),z)}})),this._disposables.add(this._editor.onDidDispose(()=>this._outlineDisposables.clear())),this._createOutline().finally(()=>o.open())}_disposables=new P;_onDidChange=new $;onDidChange=this._onDidChange.event;_outlineModel;_outlineDisposables=new P;_breadcrumbsDataSource;config;outlineKind="documentSymbols";get activeElement(){const e=this._editor.getPosition();if(!(!e||!this._outlineModel))return this._outlineModel.getItemEnclosingPosition(e)}dispose(){this._disposables.dispose(),this._outlineDisposables.dispose()}get isEmpty(){return!this._outlineModel||y.empty(this._outlineModel)}get uri(){return this._outlineModel?.uri}async reveal(e,t,o,r){const n=x.get(e);!n||!(e instanceof I)||await this._codeEditorService.openCodeEditor({resource:n.uri,options:{...t,selection:r?e.symbol.range:Y.collapseToStart(e.symbol.selectionRange),selectionRevealType:ne.NearTopIfOutsideViewport}},this._editor,o)}preview(e){if(!(e instanceof I))return j.None;const{symbol:t}=e;this._editor.revealRangeInCenterIfOutsideViewport(t.range,Z.Smooth);const o=this._editor.createDecorationsCollection([{range:t.range,options:{description:"document-symbols-outline-range-highlight",className:"rangeHighlight",isWholeLine:!0}}]);return O(()=>o.clear())}captureViewState(){const e=this._editor.saveViewState();return O(()=>{e&&this._editor.restoreViewState(e)})}async _createOutline(e){if(this._outlineDisposables.clear(),e||this._setOutlineModel(void 0),!this._editor.hasModel())return;const t=this._editor.getModel();if(!this._languageFeaturesService.documentSymbolProvider.has(t))return;const o=new H,r=t.getVersionId(),n=new w;this._outlineDisposables.add(n),this._outlineDisposables.add(O(()=>o.dispose(!0)));try{const i=await this._outlineModelService.getOrCreate(t,o.token);if(o.token.isCancellationRequested)return;if(y.empty(i)||!this._editor.hasModel()){this._setOutlineModel(i);return}if(e&&this._outlineModel&&t.getLineCount()>=25){const s=y.size(i),u=t.getValueLength(),c=s/u,m=y.size(this._outlineModel),S=u-e.changes.reduce((_,D)=>_+D.rangeLength,0),b=m/S;if((c<=b*.5||c>=b*1.5)&&!await U(K(2e3).then(()=>!0),o.token,!1))return}this._applyMarkersToOutline(i),this._outlineDisposables.add(this._markerDecorationsService.onDidChangeMarker(s=>{J(i.uri,s.uri)&&(this._applyMarkersToOutline(i),this._onDidChange.fire({}))})),this._outlineDisposables.add(this._configurationService.onDidChangeConfiguration(s=>{if(s.affectsConfiguration(h.problemsEnabled)||s.affectsConfiguration("problems.visibility")){const u=this._configurationService.getValue("problems.visibility"),c=this._configurationService.getValue(h.problemsEnabled);!u||!c?i.updateMarker([]):this._applyMarkersToOutline(i),this._onDidChange.fire({})}s.affectsConfiguration("outline")&&this._onDidChange.fire({}),s.affectsConfiguration("breadcrumbs")&&this._editor.hasModel()&&(this._breadcrumbsDataSource.update(i,this._editor.getPosition()),this._onDidChange.fire({}))})),this._outlineDisposables.add(this._configurationService.onDidChangeConfiguration(s=>{s.affectsConfiguration(h.icons)&&this._onDidChange.fire({}),s.affectsConfiguration("outline")&&this._onDidChange.fire({})})),this._outlineDisposables.add(this._editor.onDidChangeCursorPosition(s=>{n.cancelAndSet(()=>{!t.isDisposed()&&r===t.getVersionId()&&this._editor.hasModel()&&(this._breadcrumbsDataSource.update(i,this._editor.getPosition()),this._onDidChange.fire({affectOnlyActiveElement:!0}))},150)})),this._setOutlineModel(i)}catch(i){this._setOutlineModel(void 0),Q(i)}}_applyMarkersToOutline(e){const t=this._configurationService.getValue("problems.visibility"),o=this._configurationService.getValue(h.problemsEnabled);if(!e||!t||!o)return;const r=[];for(const[n,i]of this._markerDecorationsService.getLiveMarkers(e.uri))(i.severity===G.Error||i.severity===G.Warning)&&r.push({...n,severity:i.severity});e.updateMarker(r)}_setOutlineModel(e){const t=this._editor.getPosition();!t||!e?(this._outlineModel=void 0,this._breadcrumbsDataSource.clear()):(this._outlineModel?.merge(e)||(this._outlineModel=e),this._breadcrumbsDataSource.update(e,t)),this._onDidChange.fire({})}};p=v([a(3,ee),a(4,X),a(5,ie),a(6,re),a(7,te),a(8,V),a(9,B)],p);let g=class{dispose;constructor(e){const t=e.registerOutlineCreator(this);this.dispose=()=>t.dispose()}matches(e){const t=e.getControl();return T(t)||R(t)}async createOutline(e,t,o){const r=e.getControl();let n;if(T(r)?n=r:R(r)&&(n=r.getModifiedEditor()),!n)return;const i=new q,s=n.invokeWithinContext(u=>u.get(B).createInstance(p,n,t,i));return await i.wait(),s}};g=v([a(0,ge)],g),se.as(ae.Workbench).registerWorkbenchContribution(g,pe.Eventually);
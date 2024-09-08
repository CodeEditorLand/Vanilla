var F=Object.defineProperty;var N=Object.getOwnPropertyDescriptor;var v=(d,e,t,o)=>{for(var r=o>1?void 0:o?N(e,t):e,n=d.length-1,i;n>=0;n--)(i=d[n])&&(r=(o?i(e,t,r):i(r))||r);return o&&r&&F(e,t,r),r},a=(d,e)=>(t,o)=>e(t,o,d);import{Emitter as q}from"../../../../../base/common/event.js";import{Disposable as U,DisposableStore as w,toDisposable as O}from"../../../../../base/common/lifecycle.js";import{OutlineConfigCollapseItemsValues as K,IOutlineService as H,OutlineConfigKeys as h,OutlineTarget as I}from"../../../../services/outline/browser/outline.js";import{Extensions as Q}from"../../../../common/contributions.js";import{Registry as $}from"../../../../../platform/registry/common/platform.js";import{LifecyclePhase as j}from"../../../../services/lifecycle/common/lifecycle.js";import"../../../../common/editor.js";import{DocumentSymbolComparator as J,DocumentSymbolAccessibilityProvider as X,DocumentSymbolRenderer as Y,DocumentSymbolFilter as M,DocumentSymbolGroupRenderer as Z,DocumentSymbolIdentityProvider as ee,DocumentSymbolNavigationLabelProvider as te,DocumentSymbolVirtualDelegate as ie}from"./documentSymbolsTree.js";import{isCodeEditor as P,isDiffEditor as T}from"../../../../../editor/browser/editorBrowser.js";import{OutlineGroup as R,OutlineElement as y,OutlineModel as V,TreeElement as C,IOutlineModelService as oe}from"../../../../../editor/contrib/documentSymbols/browser/outlineModel.js";import{CancellationTokenSource as re}from"../../../../../base/common/cancellation.js";import{raceCancellation as ne,TimeoutTimer as L,timeout as se,Barrier as ae}from"../../../../../base/common/async.js";import{onUnexpectedError as le}from"../../../../../base/common/errors.js";import"../../../../../base/common/uri.js";import"../../../../../editor/common/model.js";import{ITextResourceConfigurationService as x}from"../../../../../editor/common/services/textResourceConfiguration.js";import{IInstantiationService as B}from"../../../../../platform/instantiation/common/instantiation.js";import"../../../../../editor/common/core/position.js";import{ScrollType as de}from"../../../../../editor/common/editorCommon.js";import{Range as ue}from"../../../../../editor/common/core/range.js";import{TextEditorSelectionRevealType as ce}from"../../../../../platform/editor/common/editor.js";import{ICodeEditorService as me}from"../../../../../editor/browser/services/codeEditorService.js";import"../../../../../editor/common/textModelEvents.js";import"../../../../../base/browser/ui/tree/tree.js";import{IConfigurationService as he}from"../../../../../platform/configuration/common/configuration.js";import{localize as fe}from"../../../../../nls.js";import{IMarkerDecorationsService as pe}from"../../../../../editor/common/services/markerDecorations.js";import{MarkerSeverity as G}from"../../../../../platform/markers/common/markers.js";import{isEqual as ge}from"../../../../../base/common/resources.js";import{ILanguageFeaturesService as be}from"../../../../../editor/common/services/languageFeatures.js";let f=class{constructor(e,t){this._editor=e;this._textResourceConfigurationService=t}_breadcrumbs=[];getBreadcrumbElements(){return this._breadcrumbs}clear(){this._breadcrumbs=[]}update(e,t){const o=this._computeBreadcrumbs(e,t);this._breadcrumbs=o}_computeBreadcrumbs(e,t){let o=e.getItemEnclosingPosition(t);if(!o)return[];const r=[];for(;o;){r.push(o);const i=o.parent;if(i instanceof V||i instanceof R&&i.parent&&i.parent.children.size===1)break;o=i}const n=[];for(let i=r.length-1;i>=0;i--){const s=r[i];if(this._isFiltered(s))break;n.push(s)}return n.length===0?[]:n}_isFiltered(e){if(!(e instanceof y))return!1;const t=`breadcrumbs.${M.kindToConfigName[e.symbol.kind]}`;let o;return this._editor&&this._editor.getModel()&&(o=this._editor.getModel().uri),!this._textResourceConfigurationService.getValue(o,t)}};f=v([a(1,x)],f);let p=class{constructor(e,t,o,r,n,i,s,u,c,m){this._editor=e;this._languageFeaturesService=r;this._codeEditorService=n;this._outlineModelService=i;this._configurationService=s;this._markerDecorationsService=u;this._breadcrumbsDataSource=new f(e,c);const S=new ie,b=[new Z,m.createInstance(Y,!0,t)],_={getChildren:l=>l instanceof y||l instanceof R?l.children.values():l===this&&this._outlineModel?this._outlineModel.children.values():[]},D=new J,W=c.getValue(e.getModel()?.uri,h.collapseItems),A={collapseByDefault:t===I.Breadcrumbs||t===I.OutlinePane&&W===K.Collapsed,expandOnlyOnTwistieClick:!0,multipleSelectionSupport:!1,identityProvider:new ee,keyboardNavigationLabelProvider:new te,accessibilityProvider:new X(fe("document","Document Symbols")),filter:t===I.OutlinePane?m.createInstance(M,"outline"):t===I.Breadcrumbs?m.createInstance(M,"breadcrumbs"):void 0};this.config={breadcrumbsDataSource:this._breadcrumbsDataSource,delegate:S,renderers:b,treeDataSource:_,comparator:D,options:A,quickPickDataSource:{getQuickPickElements:()=>{throw new Error("not implemented")}}},this._disposables.add(r.documentSymbolProvider.onDidChange(l=>this._createOutline())),this._disposables.add(this._editor.onDidChangeModel(l=>this._createOutline())),this._disposables.add(this._editor.onDidChangeModelLanguage(l=>this._createOutline()));const E=new L;this._disposables.add(E),this._disposables.add(this._editor.onDidChangeModelContent(l=>{const k=this._editor.getModel();if(k){const z=i.getDebounceValue(k);E.cancelAndSet(()=>this._createOutline(l),z)}})),this._disposables.add(this._editor.onDidDispose(()=>this._outlineDisposables.clear())),this._createOutline().finally(()=>o.open())}_disposables=new w;_onDidChange=new q;onDidChange=this._onDidChange.event;_outlineModel;_outlineDisposables=new w;_breadcrumbsDataSource;config;outlineKind="documentSymbols";get activeElement(){const e=this._editor.getPosition();if(!(!e||!this._outlineModel))return this._outlineModel.getItemEnclosingPosition(e)}dispose(){this._disposables.dispose(),this._outlineDisposables.dispose()}get isEmpty(){return!this._outlineModel||C.empty(this._outlineModel)}get uri(){return this._outlineModel?.uri}async reveal(e,t,o,r){const n=V.get(e);!n||!(e instanceof y)||await this._codeEditorService.openCodeEditor({resource:n.uri,options:{...t,selection:r?e.symbol.range:ue.collapseToStart(e.symbol.selectionRange),selectionRevealType:ce.NearTopIfOutsideViewport}},this._editor,o)}preview(e){if(!(e instanceof y))return U.None;const{symbol:t}=e;this._editor.revealRangeInCenterIfOutsideViewport(t.range,de.Smooth);const o=this._editor.createDecorationsCollection([{range:t.range,options:{description:"document-symbols-outline-range-highlight",className:"rangeHighlight",isWholeLine:!0}}]);return O(()=>o.clear())}captureViewState(){const e=this._editor.saveViewState();return O(()=>{e&&this._editor.restoreViewState(e)})}async _createOutline(e){if(this._outlineDisposables.clear(),e||this._setOutlineModel(void 0),!this._editor.hasModel())return;const t=this._editor.getModel();if(!this._languageFeaturesService.documentSymbolProvider.has(t))return;const o=new re,r=t.getVersionId(),n=new L;this._outlineDisposables.add(n),this._outlineDisposables.add(O(()=>o.dispose(!0)));try{const i=await this._outlineModelService.getOrCreate(t,o.token);if(o.token.isCancellationRequested)return;if(C.empty(i)||!this._editor.hasModel()){this._setOutlineModel(i);return}if(e&&this._outlineModel&&t.getLineCount()>=25){const s=C.size(i),u=t.getValueLength(),c=s/u,m=C.size(this._outlineModel),S=u-e.changes.reduce((_,D)=>_+D.rangeLength,0),b=m/S;if((c<=b*.5||c>=b*1.5)&&!await ne(se(2e3).then(()=>!0),o.token,!1))return}this._applyMarkersToOutline(i),this._outlineDisposables.add(this._markerDecorationsService.onDidChangeMarker(s=>{ge(i.uri,s.uri)&&(this._applyMarkersToOutline(i),this._onDidChange.fire({}))})),this._outlineDisposables.add(this._configurationService.onDidChangeConfiguration(s=>{if(s.affectsConfiguration(h.problemsEnabled)||s.affectsConfiguration("problems.visibility")){const u=this._configurationService.getValue("problems.visibility"),c=this._configurationService.getValue(h.problemsEnabled);!u||!c?i.updateMarker([]):this._applyMarkersToOutline(i),this._onDidChange.fire({})}s.affectsConfiguration("outline")&&this._onDidChange.fire({}),s.affectsConfiguration("breadcrumbs")&&this._editor.hasModel()&&(this._breadcrumbsDataSource.update(i,this._editor.getPosition()),this._onDidChange.fire({}))})),this._outlineDisposables.add(this._configurationService.onDidChangeConfiguration(s=>{s.affectsConfiguration(h.icons)&&this._onDidChange.fire({}),s.affectsConfiguration("outline")&&this._onDidChange.fire({})})),this._outlineDisposables.add(this._editor.onDidChangeCursorPosition(s=>{n.cancelAndSet(()=>{!t.isDisposed()&&r===t.getVersionId()&&this._editor.hasModel()&&(this._breadcrumbsDataSource.update(i,this._editor.getPosition()),this._onDidChange.fire({affectOnlyActiveElement:!0}))},150)})),this._setOutlineModel(i)}catch(i){this._setOutlineModel(void 0),le(i)}}_applyMarkersToOutline(e){const t=this._configurationService.getValue("problems.visibility"),o=this._configurationService.getValue(h.problemsEnabled);if(!e||!t||!o)return;const r=[];for(const[n,i]of this._markerDecorationsService.getLiveMarkers(e.uri))(i.severity===G.Error||i.severity===G.Warning)&&r.push({...n,severity:i.severity});e.updateMarker(r)}_setOutlineModel(e){const t=this._editor.getPosition();!t||!e?(this._outlineModel=void 0,this._breadcrumbsDataSource.clear()):(this._outlineModel?.merge(e)||(this._outlineModel=e),this._breadcrumbsDataSource.update(e,t)),this._onDidChange.fire({})}};p=v([a(3,be),a(4,me),a(5,oe),a(6,he),a(7,pe),a(8,x),a(9,B)],p);let g=class{dispose;constructor(e){const t=e.registerOutlineCreator(this);this.dispose=()=>t.dispose()}matches(e){const t=e.getControl();return P(t)||T(t)}async createOutline(e,t,o){const r=e.getControl();let n;if(P(r)?n=r:T(r)&&(n=r.getModifiedEditor()),!n)return;const i=new ae,s=n.invokeWithinContext(u=>u.get(B).createInstance(p,n,t,i));return await i.wait(),s}};g=v([a(0,H)],g),$.as(Q.Workbench).registerWorkbenchContribution(g,j.Eventually);

var q=Object.defineProperty;var G=Object.getOwnPropertyDescriptor;var O=(L,b,g,u)=>{for(var h=u>1?void 0:u?G(b,g):b,M=L.length-1,m;M>=0;M--)(m=L[M])&&(h=(u?m(b,g,h):m(h))||h);return u&&h&&q(b,g,h),h},E=(L,b)=>(g,u)=>b(g,u,L);import{$ as V,addDisposableListener as C,getWindow as B,h as f,reset as U}from"../../../../../base/browser/dom.js";import{renderIcon as H,renderLabelWithIcons as J}from"../../../../../base/browser/ui/iconLabel/iconLabels.js";import{Codicon as Z}from"../../../../../base/common/codicons.js";import{MarkdownString as Q}from"../../../../../base/common/htmlContent.js";import{Disposable as X}from"../../../../../base/common/lifecycle.js";import{autorun as N,derived as w,derivedWithStore as ee,observableValue as ie,transaction as F}from"../../../../../base/common/observable.js";import{derivedDisposable as ne}from"../../../../../base/common/observableInternal/derived.js";import{ThemeIcon as oe}from"../../../../../base/common/themables.js";import{isDefined as P}from"../../../../../base/common/types.js";import{observableCodeEditor as te}from"../../../observableCodeEditor.js";import{RevealPreference as y}from"../diffEditorViewModel.js";import{PlaceholderViewZone as T,ViewZoneOverlayWidget as A,applyObservableDecorations as k,applyStyle as se}from"../utils.js";import{EditorOption as W}from"../../../../common/config/editorOptions.js";import{LineRange as de}from"../../../../common/core/lineRange.js";import{Position as re}from"../../../../common/core/position.js";import{Range as ae}from"../../../../common/core/range.js";import{CursorChangeReason as z}from"../../../../common/cursorEvents.js";import{SymbolKinds as le}from"../../../../common/languages.js";import{localize as v}from"../../../../../nls.js";import{IInstantiationService as ge}from"../../../../../platform/instantiation/common/instantiation.js";let R=class extends X{constructor(g,u,h,M){super();this._editors=g;this._diffModel=u;this._options=h;this._instantiationService=M;this._register(this._editors.original.onDidChangeCursorPosition(n=>{if(n.reason===z.ContentFlush)return;const o=this._diffModel.get();F(e=>{for(const i of this._editors.original.getSelections()||[])o?.ensureOriginalLineIsVisible(i.getStartPosition().lineNumber,y.FromCloserSide,e),o?.ensureOriginalLineIsVisible(i.getEndPosition().lineNumber,y.FromCloserSide,e)})})),this._register(this._editors.modified.onDidChangeCursorPosition(n=>{if(n.reason===z.ContentFlush)return;const o=this._diffModel.get();F(e=>{for(const i of this._editors.modified.getSelections()||[])o?.ensureModifiedLineIsVisible(i.getStartPosition().lineNumber,y.FromCloserSide,e),o?.ensureModifiedLineIsVisible(i.getEndPosition().lineNumber,y.FromCloserSide,e)})}));const m=this._diffModel.map((n,o)=>{const e=n?.unchangedRegions.read(o)??[];return e.length===1&&e[0].modifiedLineNumber===1&&e[0].lineCount===this._editors.modifiedModel.read(o)?.getLineCount()?[]:e});this.viewZones=ee(this,(n,o)=>{const e=this._modifiedOutlineSource.read(n);if(!e)return{origViewZones:[],modViewZones:[]};const i=[],t=[],c=this._options.renderSideBySide.read(n),l=this._options.compactMode.read(n),p=m.read(n);for(let _=0;_<p.length;_++){const r=p[_];if(!r.shouldHideControls(n)&&!(l&&(_===0||_===p.length-1)))if(l){{const s=w(this,d=>r.getHiddenOriginalRange(d).startLineNumber-1),a=new T(s,12);i.push(a),o.add(new Y(this._editors.original,a,r,!c))}{const s=w(this,d=>r.getHiddenModifiedRange(d).startLineNumber-1),a=new T(s,12);t.push(a),o.add(new Y(this._editors.modified,a,r))}}else{{const s=w(this,d=>r.getHiddenOriginalRange(d).startLineNumber-1),a=new T(s,24);i.push(a),o.add(new K(this._editors.original,a,r,r.originalUnchangedRange,!c,e,d=>this._diffModel.get().ensureModifiedLineIsVisible(d,y.FromBottom,void 0),this._options))}{const s=w(this,d=>r.getHiddenModifiedRange(d).startLineNumber-1),a=new T(s,24);t.push(a),o.add(new K(this._editors.modified,a,r,r.modifiedUnchangedRange,!1,e,d=>this._diffModel.get().ensureModifiedLineIsVisible(d,y.FromBottom,void 0),this._options))}}}return{origViewZones:i,modViewZones:t}});const D={description:"unchanged lines",className:"diff-unchanged-lines",isWholeLine:!0},S={description:"Fold Unchanged",glyphMarginHoverMessage:new Q(void 0,{isTrusted:!0,supportThemeIcons:!0}).appendMarkdown(v("foldUnchanged","Fold Unchanged Region")),glyphMarginClassName:"fold-unchanged "+oe.asClassName(Z.fold),zIndex:10001};this._register(k(this._editors.original,w(this,n=>{const o=m.read(n),e=o.map(i=>({range:i.originalUnchangedRange.toInclusiveRange(),options:D}));for(const i of o)i.shouldHideControls(n)&&e.push({range:ae.fromPositions(new re(i.originalLineNumber,1)),options:S});return e}))),this._register(k(this._editors.modified,w(this,n=>{const o=m.read(n),e=o.map(i=>({range:i.modifiedUnchangedRange.toInclusiveRange(),options:D}));for(const i of o)i.shouldHideControls(n)&&e.push({range:de.ofLength(i.modifiedLineNumber,1).toInclusiveRange(),options:S});return e}))),this._register(N(n=>{const o=m.read(n);this._isUpdatingHiddenAreas=!0;try{this._editors.original.setHiddenAreas(o.map(e=>e.getHiddenOriginalRange(n).toInclusiveRange()).filter(P)),this._editors.modified.setHiddenAreas(o.map(e=>e.getHiddenModifiedRange(n).toInclusiveRange()).filter(P))}finally{this._isUpdatingHiddenAreas=!1}})),this._register(this._editors.modified.onMouseUp(n=>{if(!n.event.rightButton&&n.target.position&&n.target.element?.className.includes("fold-unchanged")){const o=n.target.position.lineNumber,e=this._diffModel.get();if(!e)return;const i=e.unchangedRegions.get().find(t=>t.modifiedUnchangedRange.includes(o));if(!i)return;i.collapseAll(void 0),n.event.stopPropagation(),n.event.preventDefault()}})),this._register(this._editors.original.onMouseUp(n=>{if(!n.event.rightButton&&n.target.position&&n.target.element?.className.includes("fold-unchanged")){const o=n.target.position.lineNumber,e=this._diffModel.get();if(!e)return;const i=e.unchangedRegions.get().find(t=>t.originalUnchangedRange.includes(o));if(!i)return;i.collapseAll(void 0),n.event.stopPropagation(),n.event.preventDefault()}}))}static _breadcrumbsSourceFactory=ie(R,()=>({dispose(){},getBreadcrumbItems(g,u){return[]}}));static setBreadcrumbsSourceFactory(g){this._breadcrumbsSourceFactory.set(g,void 0)}_modifiedOutlineSource=ne(this,g=>{const u=this._editors.modifiedModel.read(g),h=R._breadcrumbsSourceFactory.read(g);return!u||!h?void 0:h(u,this._instantiationService)});viewZones;_isUpdatingHiddenAreas=!1;get isUpdatingHiddenAreas(){return this._isUpdatingHiddenAreas}};R=O([E(3,ge)],R);class Y extends A{constructor(g,u,h,M=!1){const m=f("div.diff-hidden-lines-widget");super(g,u,m.root);this._unchangedRegion=h;this._hide=M;m.root.appendChild(this._nodes.root),this._hide&&this._nodes.root.replaceChildren(),this._register(N(D=>{if(!this._hide){const S=this._unchangedRegion.getHiddenModifiedRange(D).length,n=v("hiddenLines","{0} hidden lines",S);this._nodes.text.innerText=n}}))}_nodes=f("div.diff-hidden-lines-compact",[f("div.line-left",[]),f("div.text@text",[]),f("div.line-right",[])])}class K extends A{constructor(g,u,h,M,m,D,S,n){const o=f("div.diff-hidden-lines-widget");super(g,u,o.root);this._editor=g;this._unchangedRegion=h;this._unchangedRegionRange=M;this._hide=m;this._modifiedOutlineSource=D;this._revealModifiedHiddenLine=S;this._options=n;o.root.appendChild(this._nodes.root),this._hide?U(this._nodes.first):this._register(se(this._nodes.first,{width:te(this._editor).layoutInfoContentLeft})),this._register(N(i=>{const t=this._unchangedRegion.visibleLineCountTop.read(i)+this._unchangedRegion.visibleLineCountBottom.read(i)===this._unchangedRegion.lineCount;this._nodes.bottom.classList.toggle("canMoveTop",!t),this._nodes.bottom.classList.toggle("canMoveBottom",this._unchangedRegion.visibleLineCountBottom.read(i)>0),this._nodes.top.classList.toggle("canMoveTop",this._unchangedRegion.visibleLineCountTop.read(i)>0),this._nodes.top.classList.toggle("canMoveBottom",!t);const c=this._unchangedRegion.isDragged.read(i),l=this._editor.getDomNode();l&&(l.classList.toggle("draggingUnchangedRegion",!!c),c==="top"?(l.classList.toggle("canMoveTop",this._unchangedRegion.visibleLineCountTop.read(i)>0),l.classList.toggle("canMoveBottom",!t)):c==="bottom"?(l.classList.toggle("canMoveTop",!t),l.classList.toggle("canMoveBottom",this._unchangedRegion.visibleLineCountBottom.read(i)>0)):(l.classList.toggle("canMoveTop",!1),l.classList.toggle("canMoveBottom",!1)))}));const e=this._editor;this._register(C(this._nodes.top,"mousedown",i=>{if(i.button!==0)return;this._nodes.top.classList.toggle("dragging",!0),this._nodes.root.classList.toggle("dragging",!0),i.preventDefault();const t=i.clientY;let c=!1;const l=this._unchangedRegion.visibleLineCountTop.get();this._unchangedRegion.isDragged.set("top",void 0);const p=B(this._nodes.top),_=C(p,"mousemove",s=>{const d=s.clientY-t;c=c||Math.abs(d)>2;const I=Math.round(d/e.getOption(W.lineHeight)),x=Math.max(0,Math.min(l+I,this._unchangedRegion.getMaxVisibleLineCountTop()));this._unchangedRegion.visibleLineCountTop.set(x,void 0)}),r=C(p,"mouseup",s=>{c||this._unchangedRegion.showMoreAbove(this._options.hideUnchangedRegionsRevealLineCount.get(),void 0),this._nodes.top.classList.toggle("dragging",!1),this._nodes.root.classList.toggle("dragging",!1),this._unchangedRegion.isDragged.set(void 0,void 0),_.dispose(),r.dispose()})})),this._register(C(this._nodes.bottom,"mousedown",i=>{if(i.button!==0)return;this._nodes.bottom.classList.toggle("dragging",!0),this._nodes.root.classList.toggle("dragging",!0),i.preventDefault();const t=i.clientY;let c=!1;const l=this._unchangedRegion.visibleLineCountBottom.get();this._unchangedRegion.isDragged.set("bottom",void 0);const p=B(this._nodes.bottom),_=C(p,"mousemove",s=>{const d=s.clientY-t;c=c||Math.abs(d)>2;const I=Math.round(d/e.getOption(W.lineHeight)),x=Math.max(0,Math.min(l-I,this._unchangedRegion.getMaxVisibleLineCountBottom())),j=this._unchangedRegionRange.endLineNumberExclusive>e.getModel().getLineCount()?e.getContentHeight():e.getTopForLineNumber(this._unchangedRegionRange.endLineNumberExclusive);this._unchangedRegion.visibleLineCountBottom.set(x,void 0);const $=this._unchangedRegionRange.endLineNumberExclusive>e.getModel().getLineCount()?e.getContentHeight():e.getTopForLineNumber(this._unchangedRegionRange.endLineNumberExclusive);e.setScrollTop(e.getScrollTop()+($-j))}),r=C(p,"mouseup",s=>{if(this._unchangedRegion.isDragged.set(void 0,void 0),!c){const a=e.getTopForLineNumber(this._unchangedRegionRange.endLineNumberExclusive);this._unchangedRegion.showMoreBelow(this._options.hideUnchangedRegionsRevealLineCount.get(),void 0);const d=e.getTopForLineNumber(this._unchangedRegionRange.endLineNumberExclusive);e.setScrollTop(e.getScrollTop()+(d-a))}this._nodes.bottom.classList.toggle("dragging",!1),this._nodes.root.classList.toggle("dragging",!1),_.dispose(),r.dispose()})})),this._register(N(i=>{const t=[];if(!this._hide){const c=h.getHiddenModifiedRange(i).length,l=v("hiddenLines","{0} hidden lines",c),p=V("span",{title:v("diff.hiddenLines.expandAll","Double click to unfold")},l);p.addEventListener("dblclick",s=>{s.button===0&&(s.preventDefault(),this._unchangedRegion.showAll(void 0))}),t.push(p);const _=this._unchangedRegion.getHiddenModifiedRange(i),r=this._modifiedOutlineSource.getBreadcrumbItems(_,i);if(r.length>0){t.push(V("span",void 0,"\xA0\xA0|\xA0\xA0"));for(let s=0;s<r.length;s++){const a=r[s],d=le.toIcon(a.kind),I=f("div.breadcrumb-item",{style:{display:"flex",alignItems:"center"}},[H(d),"\xA0",a.name,...s===r.length-1?[]:[H(Z.chevronRight)]]).root;t.push(I),I.onclick=()=>{this._revealModifiedHiddenLine(a.startLineNumber)}}}}U(this._nodes.others,...t)}))}_nodes=f("div.diff-hidden-lines",[f("div.top@top",{title:v("diff.hiddenLines.top","Click or drag to show more above")}),f("div.center@content",{style:{display:"flex"}},[f("div@first",{style:{display:"flex",justifyContent:"center",alignItems:"center",flexShrink:"0"}},[V("a",{title:v("showUnchangedRegion","Show Unchanged Region"),role:"button",onclick:()=>{this._unchangedRegion.showAll(void 0)}},...J("$(unfold)"))]),f("div@others",{style:{display:"flex",justifyContent:"center",alignItems:"center"}})]),f("div.bottom@bottom",{title:v("diff.bottom","Click or drag to show more below"),role:"button"})])}export{R as HideUnchangedRegionsFeature};

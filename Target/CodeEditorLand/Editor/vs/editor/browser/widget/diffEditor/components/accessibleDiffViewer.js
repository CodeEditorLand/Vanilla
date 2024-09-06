var Y=Object.defineProperty;var Z=Object.getOwnPropertyDescriptor;var H=(u,s,e,t)=>{for(var i=t>1?void 0:t?Z(s,e):s,r=u.length-1,d;r>=0;r--)(d=u[r])&&(i=(t?d(s,e,i):d(i))||i);return t&&i&&Y(s,e,i),i},P=(u,s)=>(e,t)=>s(e,t,u);import{addDisposableListener as ee,addStandardDisposableListener as ie,reset as W}from"../../../../../base/browser/dom.js";import{createTrustedTypesPolicy as te}from"../../../../../base/browser/trustedTypes.js";import{ActionBar as ne}from"../../../../../base/browser/ui/actionbar/actionbar.js";import{DomScrollableElement as re}from"../../../../../base/browser/ui/scrollbar/scrollableElement.js";import{Action as oe}from"../../../../../base/common/actions.js";import{forEachAdjacent as se,groupAdjacentBy as de}from"../../../../../base/common/arrays.js";import{Codicon as q}from"../../../../../base/common/codicons.js";import{KeyCode as b,KeyMod as x}from"../../../../../base/common/keyCodes.js";import{Disposable as B,toDisposable as ae}from"../../../../../base/common/lifecycle.js";import{autorun as D,autorunWithStore as le,derived as ce,derivedWithStore as me,observableValue as U,subtransaction as ue,transaction as O}from"../../../../../base/common/observable.js";import{ThemeIcon as z}from"../../../../../base/common/themables.js";import{localize as g}from"../../../../../nls.js";import{AccessibilitySignal as K,IAccessibilitySignalService as fe}from"../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";import{IInstantiationService as ge}from"../../../../../platform/instantiation/common/instantiation.js";import{registerIcon as F}from"../../../../../platform/theme/common/iconRegistry.js";import{EditorFontLigatures as pe,EditorOption as I}from"../../../../common/config/editorOptions.js";import{LineRange as k}from"../../../../common/core/lineRange.js";import{OffsetRange as X}from"../../../../common/core/offsetRange.js";import{Position as $}from"../../../../common/core/position.js";import{Range as j}from"../../../../common/core/range.js";import{LineRangeMapping as he}from"../../../../common/diff/rangeMapping.js";import"../../../../common/languages.js";import{ILanguageService as be}from"../../../../common/languages/language.js";import"../../../../common/model.js";import{LineTokens as ve}from"../../../../common/tokens/lineTokens.js";import{RenderLineInput as _e,renderViewLine2 as Le}from"../../../../common/viewLayout/viewLineRenderer.js";import{ViewLineRenderingData as J}from"../../../../common/viewModel.js";import{applyFontInfo as we}from"../../../config/domFontInfo.js";import{applyStyle as Q}from"../utils.js";import"./accessibleDiffViewer.css";import"./diffEditorEditors.js";const ye=F("diff-review-insert",q.add,g("accessibleDiffViewerInsertIcon","Icon for 'Insert' in accessible diff viewer.")),Ie=F("diff-review-remove",q.remove,g("accessibleDiffViewerRemoveIcon","Icon for 'Remove' in accessible diff viewer.")),Ee=F("diff-review-close",q.close,g("accessibleDiffViewerCloseIcon","Icon for 'Close' in accessible diff viewer."));let T=class extends B{constructor(e,t,i,r,d,a,o,n,c){super();this._parentNode=e;this._visible=t;this._setVisible=i;this._canClose=r;this._width=d;this._height=a;this._diffs=o;this._models=n;this._instantiationService=c}static _ttPolicy=te("diffReview",{createHTML:e=>e});_state=me(this,(e,t)=>{const i=this._visible.read(e);if(this._parentNode.style.visibility=i?"visible":"hidden",!i)return null;const r=t.add(this._instantiationService.createInstance(A,this._diffs,this._models,this._setVisible,this._canClose)),d=t.add(this._instantiationService.createInstance(V,this._parentNode,r,this._width,this._height,this._models));return{model:r,view:d}}).recomputeInitiallyAndOnChange(this._store);next(){O(e=>{const t=this._visible.get();this._setVisible(!0,e),t&&this._state.get().model.nextGroup(e)})}prev(){O(e=>{this._setVisible(!0,e),this._state.get().model.previousGroup(e)})}close(){O(e=>{this._setVisible(!1,e)})}};T=H([P(8,ge)],T);let A=class extends B{constructor(e,t,i,r,d){super();this._diffs=e;this._models=t;this._setVisible=i;this.canClose=r;this._accessibilitySignalService=d;this._register(D(a=>{const o=this._diffs.read(a);if(!o){this._groups.set([],void 0);return}const n=Ne(o,this._models.getOriginalModel().getLineCount(),this._models.getModifiedModel().getLineCount());O(c=>{const l=this._models.getModifiedPosition();if(l){const f=n.findIndex(p=>l?.lineNumber<p.range.modified.endLineNumberExclusive);f!==-1&&this._currentGroupIdx.set(f,c)}this._groups.set(n,c)})})),this._register(D(a=>{const o=this.currentElement.read(a);o?.type===2?this._accessibilitySignalService.playSignal(K.diffLineDeleted,{source:"accessibleDiffViewer.currentElementChanged"}):o?.type===3&&this._accessibilitySignalService.playSignal(K.diffLineInserted,{source:"accessibleDiffViewer.currentElementChanged"})})),this._register(D(a=>{const o=this.currentElement.read(a);if(o&&o.type!==0){const n=o.modifiedLineNumber??o.diff.modified.startLineNumber;this._models.modifiedSetSelection(j.fromPositions(new $(n,1)))}}))}_groups=U(this,[]);_currentGroupIdx=U(this,0);_currentElementIdx=U(this,0);groups=this._groups;currentGroup=this._currentGroupIdx.map((e,t)=>this._groups.read(t)[e]);currentGroupIndex=this._currentGroupIdx;currentElement=this._currentElementIdx.map((e,t)=>this.currentGroup.read(t)?.lines[e]);_goToGroupDelta(e,t){const i=this.groups.get();!i||i.length<=1||ue(t,r=>{this._currentGroupIdx.set(X.ofLength(i.length).clipCyclic(this._currentGroupIdx.get()+e),r),this._currentElementIdx.set(0,r)})}nextGroup(e){this._goToGroupDelta(1,e)}previousGroup(e){this._goToGroupDelta(-1,e)}_goToLineDelta(e){const t=this.currentGroup.get();!t||t.lines.length<=1||O(i=>{this._currentElementIdx.set(X.ofLength(t.lines.length).clip(this._currentElementIdx.get()+e),i)})}goToNextLine(){this._goToLineDelta(1)}goToPreviousLine(){this._goToLineDelta(-1)}goToLine(e){const t=this.currentGroup.get();if(!t)return;const i=t.lines.indexOf(e);i!==-1&&O(r=>{this._currentElementIdx.set(i,r)})}revealCurrentElementInEditor(){if(!this.canClose.get())return;this._setVisible(!1,void 0);const e=this.currentElement.get();e&&(e.type===2?this._models.originalReveal(j.fromPositions(new $(e.originalLineNumber,1))):this._models.modifiedReveal(e.type!==0?j.fromPositions(new $(e.modifiedLineNumber,1)):void 0))}close(){this.canClose.get()&&(this._setVisible(!1,void 0),this._models.modifiedFocus())}};A=H([P(4,fe)],A);const R=3;function Ne(u,s,e){const t=[];for(const i of de(u,(r,d)=>d.modified.startLineNumber-r.modified.endLineNumberExclusive<2*R)){const r=[];r.push(new Me);const d=new k(Math.max(1,i[0].original.startLineNumber-R),Math.min(i[i.length-1].original.endLineNumberExclusive+R,s+1)),a=new k(Math.max(1,i[0].modified.startLineNumber-R),Math.min(i[i.length-1].modified.endLineNumberExclusive+R,e+1));se(i,(c,l)=>{const f=new k(c?c.original.endLineNumberExclusive:d.startLineNumber,l?l.original.startLineNumber:d.endLineNumberExclusive),p=new k(c?c.modified.endLineNumberExclusive:a.startLineNumber,l?l.modified.startLineNumber:a.endLineNumberExclusive);f.forEach(v=>{r.push(new Oe(v,p.startLineNumber+(v-f.startLineNumber)))}),l&&(l.original.forEach(v=>{r.push(new xe(l,v))}),l.modified.forEach(v=>{r.push(new De(l,v))}))});const o=i[0].modified.join(i[i.length-1].modified),n=i[0].original.join(i[i.length-1].original);t.push(new Te(new he(o,n),r))}return t}var Ce=(i=>(i[i.Header=0]="Header",i[i.Unchanged=1]="Unchanged",i[i.Deleted=2]="Deleted",i[i.Added=3]="Added",i))(Ce||{});class Te{constructor(s,e){this.range=s;this.lines=e}}class Me{type=0}class xe{constructor(s,e){this.diff=s;this.originalLineNumber=e}type=2;modifiedLineNumber=void 0}class De{constructor(s,e){this.diff=s;this.modifiedLineNumber=e}type=3;originalLineNumber=void 0}class Oe{constructor(s,e){this.originalLineNumber=s;this.modifiedLineNumber=e}type=1}let V=class extends B{constructor(e,t,i,r,d,a){super();this._element=e;this._model=t;this._width=i;this._height=r;this._models=d;this._languageService=a;this.domNode=this._element,this.domNode.className="monaco-component diff-review monaco-editor-background";const o=document.createElement("div");o.className="diff-review-actions",this._actionBar=this._register(new ne(o)),this._register(D(n=>{this._actionBar.clear(),this._model.canClose.read(n)&&this._actionBar.push(new oe("diffreview.close",g("label.close","Close"),"close-diff-review "+z.asClassName(Ee),!0,async()=>t.close()),{label:!1,icon:!0})})),this._content=document.createElement("div"),this._content.className="diff-review-content",this._content.setAttribute("role","code"),this._scrollbar=this._register(new re(this._content,{})),W(this.domNode,this._scrollbar.getDomNode(),o),this._register(D(n=>{this._height.read(n),this._width.read(n),this._scrollbar.scanDomNode()})),this._register(ae(()=>{W(this.domNode)})),this._register(Q(this.domNode,{width:this._width,height:this._height})),this._register(Q(this._content,{width:this._width,height:this._height})),this._register(le((n,c)=>{this._model.currentGroup.read(n),this._render(c)})),this._register(ie(this.domNode,"keydown",n=>{(n.equals(b.DownArrow)||n.equals(x.CtrlCmd|b.DownArrow)||n.equals(x.Alt|b.DownArrow))&&(n.preventDefault(),this._model.goToNextLine()),(n.equals(b.UpArrow)||n.equals(x.CtrlCmd|b.UpArrow)||n.equals(x.Alt|b.UpArrow))&&(n.preventDefault(),this._model.goToPreviousLine()),(n.equals(b.Escape)||n.equals(x.CtrlCmd|b.Escape)||n.equals(x.Alt|b.Escape)||n.equals(x.Shift|b.Escape))&&(n.preventDefault(),this._model.close()),(n.equals(b.Space)||n.equals(b.Enter))&&(n.preventDefault(),this._model.revealCurrentElementInEditor())}))}domNode;_content;_scrollbar;_actionBar;_render(e){const t=this._models.getOriginalOptions(),i=this._models.getModifiedOptions(),r=document.createElement("div");r.className="diff-review-table",r.setAttribute("role","list"),r.setAttribute("aria-label",g("ariaLabel","Accessible Diff Viewer. Use arrow up and down to navigate.")),we(r,i.get(I.fontInfo)),W(this._content,r);const d=this._models.getOriginalModel(),a=this._models.getModifiedModel();if(!d||!a)return;const o=d.getOptions(),n=a.getOptions(),c=i.get(I.lineHeight),l=this._model.currentGroup.get();for(const f of l?.lines||[]){if(!l)break;let p;if(f.type===0){const h=document.createElement("div");h.className="diff-review-row",h.setAttribute("role","listitem");const m=l.range,G=this._model.currentGroupIndex.get(),M=this._model.groups.get().length,w=N=>N===0?g("no_lines_changed","no lines changed"):N===1?g("one_line_changed","1 line changed"):g("more_lines_changed","{0} lines changed",N),y=w(m.original.length),E=w(m.modified.length);h.setAttribute("aria-label",g({key:"header",comment:["This is the ARIA label for a git diff header.","A git diff header looks like this: @@ -154,12 +159,39 @@.","That encodes that at original line 154 (which is now line 159), 12 lines were removed/changed with 39 lines.","Variables 0 and 1 refer to the diff index out of total number of diffs.","Variables 2 and 4 will be numbers (a line number).",'Variables 3 and 5 will be "no lines changed", "1 line changed" or "X lines changed", localized separately.']},"Difference {0} of {1}: original line {2}, {3}, modified line {4}, {5}",G+1,M,m.original.startLineNumber,y,m.modified.startLineNumber,E));const _=document.createElement("div");_.className="diff-review-cell diff-review-summary",_.appendChild(document.createTextNode(`${G+1}/${M}: @@ -${m.original.startLineNumber},${m.original.length} +${m.modified.startLineNumber},${m.modified.length} @@`)),h.appendChild(_),p=h}else p=this._createRow(f,c,this._width.get(),t,d,o,i,a,n);r.appendChild(p);const v=ce(h=>this._model.currentElement.read(h)===f);e.add(D(h=>{const m=v.read(h);p.tabIndex=m?0:-1,m&&p.focus()})),e.add(ee(p,"focus",()=>{this._model.goToLine(f)}))}this._scrollbar.scanDomNode()}_createRow(e,t,i,r,d,a,o,n,c){const l=r.get(I.layoutInfo),f=l.glyphMarginWidth+l.lineNumbersWidth,p=o.get(I.layoutInfo),v=10+p.glyphMarginWidth+p.lineNumbersWidth;let h="diff-review-row",m="";const G="diff-review-spacer";let M=null;switch(e.type){case 3:h="diff-review-row line-insert",m=" char-insert",M=ye;break;case 2:h="diff-review-row line-delete",m=" char-delete",M=Ie;break}const w=document.createElement("div");w.style.minWidth=i+"px",w.className=h,w.setAttribute("role","listitem"),w.ariaLevel="";const y=document.createElement("div");y.className="diff-review-cell",y.style.height=`${t}px`,w.appendChild(y);const E=document.createElement("span");E.style.width=f+"px",E.style.minWidth=f+"px",E.className="diff-review-line-number"+m,e.originalLineNumber!==void 0?E.appendChild(document.createTextNode(String(e.originalLineNumber))):E.innerText="\xA0",y.appendChild(E);const _=document.createElement("span");_.style.width=v+"px",_.style.minWidth=v+"px",_.style.paddingRight="10px",_.className="diff-review-line-number"+m,e.modifiedLineNumber!==void 0?_.appendChild(document.createTextNode(String(e.modifiedLineNumber))):_.innerText="\xA0",y.appendChild(_);const N=document.createElement("span");if(N.className=G,M){const L=document.createElement("span");L.className=z.asClassName(M),L.innerText="\xA0\xA0",N.appendChild(L)}else N.innerText="\xA0\xA0";y.appendChild(N);let C;if(e.modifiedLineNumber!==void 0){let L=this._getLineHtml(n,o,c.tabSize,e.modifiedLineNumber,this._languageService.languageIdCodec);T._ttPolicy&&(L=T._ttPolicy.createHTML(L)),y.insertAdjacentHTML("beforeend",L),C=n.getLineContent(e.modifiedLineNumber)}else{let L=this._getLineHtml(d,r,a.tabSize,e.originalLineNumber,this._languageService.languageIdCodec);T._ttPolicy&&(L=T._ttPolicy.createHTML(L)),y.insertAdjacentHTML("beforeend",L),C=d.getLineContent(e.originalLineNumber)}C.length===0&&(C=g("blankLine","blank"));let S="";switch(e.type){case 1:e.originalLineNumber===e.modifiedLineNumber?S=g({key:"unchangedLine",comment:["The placeholders are contents of the line and should not be translated."]},"{0} unchanged line {1}",C,e.originalLineNumber):S=g("equalLine","{0} original line {1} modified line {2}",C,e.originalLineNumber,e.modifiedLineNumber);break;case 3:S=g("insertLine","+ {0} modified line {1}",C,e.modifiedLineNumber);break;case 2:S=g("deleteLine","- {0} original line {1}",C,e.originalLineNumber);break}return w.setAttribute("aria-label",S),w}_getLineHtml(e,t,i,r,d){const a=e.getLineContent(r),o=t.get(I.fontInfo),n=ve.createEmpty(a,d),c=J.isBasicASCII(a,e.mightContainNonBasicASCII()),l=J.containsRTL(a,c,e.mightContainRTL());return Le(new _e(o.isMonospace&&!t.get(I.disableMonospaceOptimizations),o.canUseHalfwidthRightwardsArrow,a,!1,c,l,0,n,[],i,0,o.spaceWidth,o.middotWidth,o.wsmiddotWidth,t.get(I.stopRenderingLineAfter),t.get(I.renderWhitespace),t.get(I.renderControlCharacters),t.get(I.fontLigatures)!==pe.OFF,null)).html}};V=H([P(5,be)],V);class _i{constructor(s){this.editors=s}getOriginalModel(){return this.editors.original.getModel()}getOriginalOptions(){return this.editors.original.getOptions()}originalReveal(s){this.editors.original.revealRange(s),this.editors.original.setSelection(s),this.editors.original.focus()}getModifiedModel(){return this.editors.modified.getModel()}getModifiedOptions(){return this.editors.modified.getOptions()}modifiedReveal(s){s&&(this.editors.modified.revealRange(s),this.editors.modified.setSelection(s)),this.editors.modified.focus()}modifiedSetSelection(s){this.editors.modified.setSelection(s)}modifiedFocus(){this.editors.modified.focus()}getModifiedPosition(){return this.editors.modified.getPosition()??void 0}}export{T as AccessibleDiffViewer,_i as AccessibleDiffViewerModelFromEditors};

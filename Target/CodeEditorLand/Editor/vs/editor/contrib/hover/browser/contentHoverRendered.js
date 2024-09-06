import*as l from"../../../../../vs/base/browser/dom.js";import"../../../../../vs/base/browser/ui/hover/hoverWidget.js";import{BugIndicatingError as w}from"../../../../../vs/base/common/errors.js";import{Disposable as p,DisposableStore as b,toDisposable as f}from"../../../../../vs/base/common/lifecycle.js";import"../../../../../vs/editor/browser/editorBrowser.js";import{Position as g}from"../../../../../vs/editor/common/core/position.js";import{Range as y}from"../../../../../vs/editor/common/core/range.js";import"../../../../../vs/editor/common/languages.js";import{ModelDecorationOptions as A}from"../../../../../vs/editor/common/model/textModel.js";import{ColorHoverParticipant as E}from"../../../../../vs/editor/contrib/colorPicker/browser/colorHoverParticipant.js";import"../../../../../vs/editor/contrib/hover/browser/contentHoverComputer.js";import{EditorHoverStatusBar as S}from"../../../../../vs/editor/contrib/hover/browser/contentHoverStatusBar.js";import"../../../../../vs/editor/contrib/hover/browser/contentHoverTypes.js";import"../../../../../vs/editor/contrib/hover/browser/hoverOperation.js";import{RenderedHoverParts as x}from"../../../../../vs/editor/contrib/hover/browser/hoverTypes.js";import{MarkdownHoverParticipant as R}from"../../../../../vs/editor/contrib/hover/browser/markdownHoverParticipant.js";import{InlayHintsHover as M}from"../../../../../vs/editor/contrib/inlayHints/browser/inlayHintsHover.js";import{localize as P}from"../../../../../vs/nls.js";import"../../../../../vs/platform/keybinding/common/keybinding.js";class I extends p{closestMouseDistance;initialMousePosX;initialMousePosY;showAtPosition;showAtSecondaryPosition;shouldFocus;source;shouldAppearBeforeContent;_renderedHoverParts;constructor(r,e,t,n,o,i){super();const c=e.anchor,s=e.hoverParts;this._renderedHoverParts=this._register(new m(r,t,s,i,o));const{showAtPosition:u,showAtSecondaryPosition:a}=I.computeHoverPositions(r,c.range,s);this.shouldAppearBeforeContent=s.some(d=>d.isBeforeContent),this.showAtPosition=u,this.showAtSecondaryPosition=a,this.initialMousePosX=c.initialMousePosX,this.initialMousePosY=c.initialMousePosY,this.shouldFocus=n.shouldFocus,this.source=n.source}get domNode(){return this._renderedHoverParts.domNode}get domNodeHasChildren(){return this._renderedHoverParts.domNodeHasChildren}get focusedHoverPartIndex(){return this._renderedHoverParts.focusedHoverPartIndex}focusHoverPartWithIndex(r){this._renderedHoverParts.focusHoverPartWithIndex(r)}getAccessibleWidgetContent(){return this._renderedHoverParts.getAccessibleContent()}getAccessibleWidgetContentAtIndex(r){return this._renderedHoverParts.getAccessibleHoverContentAtIndex(r)}async updateHoverVerbosityLevel(r,e,t){this._renderedHoverParts.updateHoverVerbosityLevel(r,e,t)}doesHoverAtIndexSupportVerbosityAction(r,e){return this._renderedHoverParts.doesHoverAtIndexSupportVerbosityAction(r,e)}isColorPickerVisible(){return this._renderedHoverParts.isColorPickerVisible()}static computeHoverPositions(r,e,t){let n=1;if(r.hasModel()){const a=r._getViewModel(),d=a.coordinatesConverter,v=d.convertModelRangeToViewRange(e),h=a.getLineMinColumn(v.startLineNumber),H=new g(v.startLineNumber,h);n=d.convertViewPositionToModelPosition(H).column}const o=e.startLineNumber;let i=e.startColumn,c;for(const a of t){const d=a.range,v=d.startLineNumber===o,h=d.endLineNumber===o;if(v&&h){const _=d.startColumn,C=Math.min(i,_);i=Math.max(C,n)}a.forceShowAtRange&&(c=d)}let s,u;if(c){const a=c.getStartPosition();s=a,u=a}else s=e.getStartPosition(),u=new g(o,i);return{showAtPosition:s,showAtSecondaryPosition:u}}}class k{constructor(r,e){this._statusBar=e;r.appendChild(this._statusBar.hoverElement)}get hoverElement(){return this._statusBar.hoverElement}get actions(){return this._statusBar.actions}dispose(){this._statusBar.dispose()}}class m extends p{static _DECORATION_OPTIONS=A.register({description:"content-hover-highlight",className:"hoverHighlight"});_renderedParts=[];_fragment;_context;_markdownHoverParticipant;_colorHoverParticipant;_focusedHoverPartIndex=-1;constructor(r,e,t,n,o){super(),this._context=o,this._fragment=document.createDocumentFragment(),this._register(this._renderParts(e,t,o,n)),this._register(this._registerListenersOnRenderedParts()),this._register(this._createEditorDecorations(r,t)),this._updateMarkdownAndColorParticipantInfo(e)}_createEditorDecorations(r,e){if(e.length===0)return p.None;let t=e[0].range;for(const o of e){const i=o.range;t=y.plusRange(t,i)}const n=r.createDecorationsCollection();return n.set([{range:t,options:m._DECORATION_OPTIONS}]),f(()=>{n.clear()})}_renderParts(r,e,t,n){const o=new S(n),i={fragment:this._fragment,statusBar:o,...t},c=new b;for(const u of r){const a=this._renderHoverPartsForParticipant(e,u,i);c.add(a);for(const d of a.renderedHoverParts)this._renderedParts.push({type:"hoverPart",participant:u,hoverPart:d.hoverPart,hoverElement:d.hoverElement})}const s=this._renderStatusBar(this._fragment,o);return s&&(c.add(s),this._renderedParts.push({type:"statusBar",hoverElement:s.hoverElement,actions:s.actions})),f(()=>{c.dispose()})}_renderHoverPartsForParticipant(r,e,t){const n=r.filter(i=>i.owner===e);return n.length>0?e.renderHoverParts(t,n):new x([])}_renderStatusBar(r,e){if(e.hasContent)return new k(r,e)}_registerListenersOnRenderedParts(){const r=new b;return this._renderedParts.forEach((e,t)=>{const n=e.hoverElement;n.tabIndex=0,r.add(l.addDisposableListener(n,l.EventType.FOCUS_IN,o=>{o.stopPropagation(),this._focusedHoverPartIndex=t})),r.add(l.addDisposableListener(n,l.EventType.FOCUS_OUT,o=>{o.stopPropagation(),this._focusedHoverPartIndex=-1}))}),r}_updateMarkdownAndColorParticipantInfo(r){const e=r.find(t=>t instanceof R&&!(t instanceof M));e&&(this._markdownHoverParticipant=e),this._colorHoverParticipant=r.find(t=>t instanceof E)}focusHoverPartWithIndex(r){r<0||r>=this._renderedParts.length||this._renderedParts[r].hoverElement.focus()}getAccessibleContent(){const r=[];for(let e=0;e<this._renderedParts.length;e++)r.push(this.getAccessibleHoverContentAtIndex(e));return r.join(`

`)}getAccessibleHoverContentAtIndex(r){const e=this._renderedParts[r];if(!e)return"";if(e.type==="statusBar"){const t=[P("hoverAccessibilityStatusBar","This is a hover status bar.")];for(const n of e.actions){const o=n.actionKeybindingLabel;o?t.push(P("hoverAccessibilityStatusBarActionWithKeybinding","It has an action with label {0} and keybinding {1}.",n.actionLabel,o)):t.push(P("hoverAccessibilityStatusBarActionWithoutKeybinding","It has an action with label {0}.",n.actionLabel))}return t.join(`
`)}return e.participant.getAccessibleContent(e.hoverPart)}async updateHoverVerbosityLevel(r,e,t){if(!this._markdownHoverParticipant)return;const n=this._normalizedIndexToMarkdownHoverIndexRange(this._markdownHoverParticipant,e);if(n===void 0)return;const o=await this._markdownHoverParticipant.updateMarkdownHoverVerbosityLevel(r,n,t);o&&(this._renderedParts[e]={type:"hoverPart",participant:this._markdownHoverParticipant,hoverPart:o.hoverPart,hoverElement:o.hoverElement},this._context.onContentsChanged())}doesHoverAtIndexSupportVerbosityAction(r,e){if(!this._markdownHoverParticipant)return!1;const t=this._normalizedIndexToMarkdownHoverIndexRange(this._markdownHoverParticipant,r);return t===void 0?!1:this._markdownHoverParticipant.doesMarkdownHoverAtIndexSupportVerbosityAction(t,e)}isColorPickerVisible(){return this._colorHoverParticipant?.isColorPickerVisible()??!1}_normalizedIndexToMarkdownHoverIndexRange(r,e){const t=this._renderedParts[e];if(!t||t.type!=="hoverPart"||!(t.participant===r))return;const o=this._renderedParts.findIndex(i=>i.type==="hoverPart"&&i.participant===r);if(o===-1)throw new w;return e-o}get domNode(){return this._fragment}get domNodeHasChildren(){return this._fragment.hasChildNodes()}get focusedHoverPartIndex(){return this._focusedHoverPartIndex}}export{I as RenderedContentHover};
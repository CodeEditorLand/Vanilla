var K=Object.defineProperty;var R=Object.getOwnPropertyDescriptor;var h=(r,e,t,i)=>{for(var o=i>1?void 0:i?R(e,t):e,n=r.length-1,s;n>=0;n--)(s=r[n])&&(o=(i?s(e,t,o):s(o))||o);return i&&o&&K(e,t,o),o};import{binarySearch as V,range as k}from"../../../common/arrays.js";import{timeout as A}from"../../../common/async.js";import{Color as T}from"../../../common/color.js";import{memoize as v}from"../../../common/decorators.js";import{Emitter as L,Event as c,EventBufferer as U}from"../../../common/event.js";import{matchesFuzzy2 as _,matchesPrefix as M}from"../../../common/filters.js";import{KeyCode as d}from"../../../common/keyCodes.js";import{DisposableStore as m,dispose as W}from"../../../common/lifecycle.js";import{clamp as z}from"../../../common/numbers.js";import*as P from"../../../common/platform.js";import"../../../common/scrollable.js";import"../../../common/sequence.js";import{isNumber as G}from"../../../common/types.js";import"../../dnd.js";import{asCssValueWithDefault as D,createStyleSheet as j,EventHelper as F,getActiveElement as q,getWindow as N,isActiveElement as J,isEditableElement as b,isHTMLElement as Q,isMouseEvent as Z}from"../../dom.js";import{DomEmitter as p}from"../../event.js";import{StandardKeyboardEvent as I}from"../../keyboardEvent.js";import{Gesture as X}from"../../touch.js";import{alert as O}from"../aria/aria.js";import"../scrollbar/scrollableElementOptions.js";import{CombinedSpliceable as Y}from"./splice.js";import"./list.css";import{autorun as ee,constObservable as te}from"../../../common/observable.js";import{StandardMouseEvent as ie}from"../../mouseEvent.js";import{ListError as f}from"./list.js";import{ListView as oe}from"./listView.js";class ne{constructor(e){this.trait=e}renderedElements=[];get templateId(){return`template:${this.trait.name}`}renderTemplate(e){return e}renderElement(e,t,i){const o=this.renderedElements.findIndex(n=>n.templateData===i);if(o>=0){const n=this.renderedElements[o];this.trait.unrender(i),n.index=t}else{const n={index:t,templateData:i};this.renderedElements.push(n)}this.trait.renderIndex(t,i)}splice(e,t,i){const o=[];for(const n of this.renderedElements)n.index<e?o.push(n):n.index>=e+t&&o.push({index:n.index+i-t,templateData:n.templateData});this.renderedElements=o}renderIndexes(e){for(const{index:t,templateData:i}of this.renderedElements)e.indexOf(t)>-1&&this.trait.renderIndex(t,i)}disposeTemplate(e){const t=this.renderedElements.findIndex(i=>i.templateData===e);t<0||this.renderedElements.splice(t,1)}}class E{constructor(e){this._trait=e}indexes=[];sortedIndexes=[];_onChange=new L;onChange=this._onChange.event;get name(){return this._trait}get renderer(){return new ne(this)}splice(e,t,i){const o=i.length-t,n=e+t,s=[];let l=0;for(;l<this.sortedIndexes.length&&this.sortedIndexes[l]<e;)s.push(this.sortedIndexes[l++]);for(let a=0;a<i.length;a++)i[a]&&s.push(a+e);for(;l<this.sortedIndexes.length&&this.sortedIndexes[l]>=n;)s.push(this.sortedIndexes[l++]+o);this.renderer.splice(e,t,i.length),this._set(s,s)}renderIndex(e,t){t.classList.toggle(this._trait,this.contains(e))}unrender(e){e.classList.remove(this._trait)}set(e,t){return this._set(e,[...e].sort(B),t)}_set(e,t,i){const o=this.indexes,n=this.sortedIndexes;this.indexes=e,this.sortedIndexes=t;const s=x(n,e);return this.renderer.renderIndexes(s),this._onChange.fire({indexes:e,browserEvent:i}),o}get(){return this.indexes}contains(e){return V(this.sortedIndexes,e,B)>=0}dispose(){W(this._onChange)}}h([v],E.prototype,"renderer",1);class se extends E{constructor(t){super("selected");this.setAriaSelected=t}renderIndex(t,i){super.renderIndex(t,i),this.setAriaSelected&&(this.contains(t)?i.setAttribute("aria-selected","true"):i.setAttribute("aria-selected","false"))}}class C{constructor(e,t,i){this.trait=e;this.view=t;this.identityProvider=i}splice(e,t,i){if(!this.identityProvider)return this.trait.splice(e,t,new Array(i.length).fill(!1));const o=this.trait.get().map(l=>this.identityProvider.getId(this.view.element(l)).toString());if(o.length===0)return this.trait.splice(e,t,new Array(i.length).fill(!1));const n=new Set(o),s=i.map(l=>n.has(this.identityProvider.getId(l).toString()));this.trait.splice(e,t,s)}}function w(r,e){return r.classList.contains(e)?!0:r.classList.contains("monaco-list")||!r.parentElement?!1:w(r.parentElement,e)}function S(r){return w(r,"monaco-editor")}function yt(r){return w(r,"monaco-custom-toggle")}function Tt(r){return w(r,"action-item")}function Lt(r){return w(r,"monaco-tl-twistie")}function Dt(r){return w(r,"monaco-tree-sticky-row")}function Ft(r){return r.classList.contains("monaco-tree-sticky-container")}function re(r){return r.tagName==="A"&&r.classList.contains("monaco-button")||r.tagName==="DIV"&&r.classList.contains("monaco-button-dropdown")?!0:r.classList.contains("monaco-list")||!r.parentElement?!1:re(r.parentElement)}class H{constructor(e,t,i){this.list=e;this.view=t;this.multipleSelectionSupport=i.multipleSelectionSupport,this.disposables.add(this.onKeyDown(o=>{switch(o.keyCode){case d.Enter:return this.onEnter(o);case d.UpArrow:return this.onUpArrow(o);case d.DownArrow:return this.onDownArrow(o);case d.PageUp:return this.onPageUpArrow(o);case d.PageDown:return this.onPageDownArrow(o);case d.Escape:return this.onEscape(o);case d.KeyA:this.multipleSelectionSupport&&(P.isMacintosh?o.metaKey:o.ctrlKey)&&this.onCtrlA(o)}}))}disposables=new m;multipleSelectionDisposables=new m;multipleSelectionSupport;get onKeyDown(){return c.chain(this.disposables.add(new p(this.view.domNode,"keydown")).event,e=>e.filter(t=>!b(t.target)).map(t=>new I(t)))}updateOptions(e){e.multipleSelectionSupport!==void 0&&(this.multipleSelectionSupport=e.multipleSelectionSupport)}onEnter(e){e.preventDefault(),e.stopPropagation(),this.list.setSelection(this.list.getFocus(),e.browserEvent)}onUpArrow(e){e.preventDefault(),e.stopPropagation(),this.list.focusPrevious(1,!1,e.browserEvent);const t=this.list.getFocus()[0];this.list.setAnchor(t),this.list.reveal(t),this.view.domNode.focus()}onDownArrow(e){e.preventDefault(),e.stopPropagation(),this.list.focusNext(1,!1,e.browserEvent);const t=this.list.getFocus()[0];this.list.setAnchor(t),this.list.reveal(t),this.view.domNode.focus()}onPageUpArrow(e){e.preventDefault(),e.stopPropagation(),this.list.focusPreviousPage(e.browserEvent);const t=this.list.getFocus()[0];this.list.setAnchor(t),this.list.reveal(t),this.view.domNode.focus()}onPageDownArrow(e){e.preventDefault(),e.stopPropagation(),this.list.focusNextPage(e.browserEvent);const t=this.list.getFocus()[0];this.list.setAnchor(t),this.list.reveal(t),this.view.domNode.focus()}onCtrlA(e){e.preventDefault(),e.stopPropagation(),this.list.setSelection(k(this.list.length),e.browserEvent),this.list.setAnchor(void 0),this.view.domNode.focus()}onEscape(e){this.list.getSelection().length&&(e.preventDefault(),e.stopPropagation(),this.list.setSelection([],e.browserEvent),this.list.setAnchor(void 0),this.view.domNode.focus())}dispose(){this.disposables.dispose(),this.multipleSelectionDisposables.dispose()}}h([v],H.prototype,"onKeyDown",1);var le=(t=>(t[t.Automatic=0]="Automatic",t[t.Trigger=1]="Trigger",t))(le||{}),ae=(t=>(t[t.Idle=0]="Idle",t[t.Typing=1]="Typing",t))(ae||{});const de=new class{mightProducePrintableCharacter(r){return r.ctrlKey||r.metaKey||r.altKey?!1:r.keyCode>=d.KeyA&&r.keyCode<=d.KeyZ||r.keyCode>=d.Digit0&&r.keyCode<=d.Digit9||r.keyCode>=d.Numpad0&&r.keyCode<=d.Numpad9||r.keyCode>=d.Semicolon&&r.keyCode<=d.Quote}};class ce{constructor(e,t,i,o,n){this.list=e;this.view=t;this.keyboardNavigationLabelProvider=i;this.keyboardNavigationEventFilter=o;this.delegate=n;this.updateOptions(e.options)}enabled=!1;state=0;mode=0;triggered=!1;previouslyFocused=-1;enabledDisposables=new m;disposables=new m;updateOptions(e){e.typeNavigationEnabled??!0?this.enable():this.disable(),this.mode=e.typeNavigationMode??0}trigger(){this.triggered=!this.triggered}enable(){if(this.enabled)return;let e=!1;const t=c.chain(this.enabledDisposables.add(new p(this.view.domNode,"keydown")).event,n=>n.filter(s=>!b(s.target)).filter(()=>this.mode===0||this.triggered).map(s=>new I(s)).filter(s=>e||this.keyboardNavigationEventFilter(s)).filter(s=>this.delegate.mightProducePrintableCharacter(s)).forEach(s=>F.stop(s,!0)).map(s=>s.browserEvent.key)),i=c.debounce(t,()=>null,800,void 0,void 0,void 0,this.enabledDisposables);c.reduce(c.any(t,i),(n,s)=>s===null?null:(n||"")+s,void 0,this.enabledDisposables)(this.onInput,this,this.enabledDisposables),i(this.onClear,this,this.enabledDisposables),t(()=>e=!0,void 0,this.enabledDisposables),i(()=>e=!1,void 0,this.enabledDisposables),this.enabled=!0,this.triggered=!1}disable(){this.enabled&&(this.enabledDisposables.clear(),this.enabled=!1,this.triggered=!1)}onClear(){const e=this.list.getFocus();if(e.length>0&&e[0]===this.previouslyFocused){const t=this.list.options.accessibilityProvider?.getAriaLabel(this.list.element(e[0]));typeof t=="string"?O(t):t&&O(t.get())}this.previouslyFocused=-1}onInput(e){if(!e){this.state=0,this.triggered=!1;return}const t=this.list.getFocus(),i=t.length>0?t[0]:0,o=this.state===0?1:0;this.state=1;for(let n=0;n<this.list.length;n++){const s=(i+n+o)%this.list.length,l=this.keyboardNavigationLabelProvider.getKeyboardNavigationLabel(this.view.element(s)),a=l&&l.toString();if(this.list.options.typeNavigationEnabled){if(typeof a<"u"){if(M(e,a)){this.previouslyFocused=i,this.list.setFocus([s]),this.list.reveal(s);return}const u=_(e,a);if(u&&u[0].end-u[0].start>1&&u.length===1){this.previouslyFocused=i,this.list.setFocus([s]),this.list.reveal(s);return}}}else if(typeof a>"u"||M(e,a)){this.previouslyFocused=i,this.list.setFocus([s]),this.list.reveal(s);return}}}dispose(){this.disable(),this.enabledDisposables.dispose(),this.disposables.dispose()}}class ue{constructor(e,t){this.list=e;this.view=t;const i=c.chain(this.disposables.add(new p(t.domNode,"keydown")).event,n=>n.filter(s=>!b(s.target)).map(s=>new I(s)));c.chain(i,n=>n.filter(s=>s.keyCode===d.Tab&&!s.ctrlKey&&!s.metaKey&&!s.shiftKey&&!s.altKey))(this.onTab,this,this.disposables)}disposables=new m;onTab(e){if(e.target!==this.view.domNode)return;const t=this.list.getFocus();if(t.length===0)return;const i=this.view.domElement(t[0]);if(!i)return;const o=i.querySelector("[tabIndex]");if(!o||!Q(o)||o.tabIndex===-1)return;const n=N(o).getComputedStyle(o);n.visibility==="hidden"||n.display==="none"||(e.preventDefault(),e.stopPropagation(),o.focus())}dispose(){this.disposables.dispose()}}function he(r){return P.isMacintosh?r.browserEvent.metaKey:r.browserEvent.ctrlKey}function ve(r){return r.browserEvent.shiftKey}function pe(r){return Z(r)&&r.button===2}const $={isSelectionSingleChangeEvent:he,isSelectionRangeChangeEvent:ve};class me{constructor(e){this.list=e;e.options.multipleSelectionSupport!==!1&&(this.multipleSelectionController=this.list.options.multipleSelectionController||$),this.mouseSupport=typeof e.options.mouseSupport>"u"||!!e.options.mouseSupport,this.mouseSupport&&(e.onMouseDown(this.onMouseDown,this,this.disposables),e.onContextMenu(this.onContextMenu,this,this.disposables),e.onMouseDblClick(this.onDoubleClick,this,this.disposables),e.onTouchStart(this.onMouseDown,this,this.disposables),this.disposables.add(X.addTarget(e.getHTMLElement()))),c.any(e.onMouseClick,e.onMouseMiddleClick,e.onTap)(this.onViewPointer,this,this.disposables)}multipleSelectionController;mouseSupport;disposables=new m;_onPointer=new L;onPointer=this._onPointer.event;updateOptions(e){e.multipleSelectionSupport!==void 0&&(this.multipleSelectionController=void 0,e.multipleSelectionSupport&&(this.multipleSelectionController=this.list.options.multipleSelectionController||$))}isSelectionSingleChangeEvent(e){return this.multipleSelectionController?this.multipleSelectionController.isSelectionSingleChangeEvent(e):!1}isSelectionRangeChangeEvent(e){return this.multipleSelectionController?this.multipleSelectionController.isSelectionRangeChangeEvent(e):!1}isSelectionChangeEvent(e){return this.isSelectionSingleChangeEvent(e)||this.isSelectionRangeChangeEvent(e)}onMouseDown(e){S(e.browserEvent.target)||q()!==e.browserEvent.target&&this.list.domFocus()}onContextMenu(e){if(b(e.browserEvent.target)||S(e.browserEvent.target))return;const t=typeof e.index>"u"?[]:[e.index];this.list.setFocus(t,e.browserEvent)}onViewPointer(e){if(!this.mouseSupport||b(e.browserEvent.target)||S(e.browserEvent.target)||e.browserEvent.isHandledByList)return;e.browserEvent.isHandledByList=!0;const t=e.index;if(typeof t>"u"){this.list.setFocus([],e.browserEvent),this.list.setSelection([],e.browserEvent),this.list.setAnchor(void 0);return}if(this.isSelectionChangeEvent(e))return this.changeSelection(e);this.list.setFocus([t],e.browserEvent),this.list.setAnchor(t),pe(e.browserEvent)||this.list.setSelection([t],e.browserEvent),this._onPointer.fire(e)}onDoubleClick(e){if(b(e.browserEvent.target)||S(e.browserEvent.target)||this.isSelectionChangeEvent(e)||e.browserEvent.isHandledByList)return;e.browserEvent.isHandledByList=!0;const t=this.list.getFocus();this.list.setSelection(t,e.browserEvent)}changeSelection(e){const t=e.index;let i=this.list.getAnchor();if(this.isSelectionRangeChangeEvent(e)){typeof i>"u"&&(i=this.list.getFocus()[0]??t,this.list.setAnchor(i));const o=Math.min(i,t),n=Math.max(i,t),s=k(o,n+1),l=this.list.getSelection(),a=be(x(l,[i]),i);if(a.length===0)return;const u=x(s,we(l,a));this.list.setSelection(u,e.browserEvent),this.list.setFocus([t],e.browserEvent)}else if(this.isSelectionSingleChangeEvent(e)){const o=this.list.getSelection(),n=o.filter(s=>s!==t);this.list.setFocus([t]),this.list.setAnchor(t),o.length===n.length?this.list.setSelection([...n,t],e.browserEvent):this.list.setSelection(n,e.browserEvent)}}dispose(){this.disposables.dispose()}}class ge{constructor(e,t){this.styleElement=e;this.selectorSuffix=t}style(e){const t=this.selectorSuffix&&`.${this.selectorSuffix}`,i=[];e.listBackground&&i.push(`.monaco-list${t} .monaco-list-rows { background: ${e.listBackground}; }`),e.listFocusBackground&&(i.push(`.monaco-list${t}:focus .monaco-list-row.focused { background-color: ${e.listFocusBackground}; }`),i.push(`.monaco-list${t}:focus .monaco-list-row.focused:hover { background-color: ${e.listFocusBackground}; }`)),e.listFocusForeground&&i.push(`.monaco-list${t}:focus .monaco-list-row.focused { color: ${e.listFocusForeground}; }`),e.listActiveSelectionBackground&&(i.push(`.monaco-list${t}:focus .monaco-list-row.selected { background-color: ${e.listActiveSelectionBackground}; }`),i.push(`.monaco-list${t}:focus .monaco-list-row.selected:hover { background-color: ${e.listActiveSelectionBackground}; }`)),e.listActiveSelectionForeground&&i.push(`.monaco-list${t}:focus .monaco-list-row.selected { color: ${e.listActiveSelectionForeground}; }`),e.listActiveSelectionIconForeground&&i.push(`.monaco-list${t}:focus .monaco-list-row.selected .codicon { color: ${e.listActiveSelectionIconForeground}; }`),e.listFocusAndSelectionBackground&&i.push(`
				.monaco-drag-image,
				.monaco-list${t}:focus .monaco-list-row.selected.focused { background-color: ${e.listFocusAndSelectionBackground}; }
			`),e.listFocusAndSelectionForeground&&i.push(`
				.monaco-drag-image,
				.monaco-list${t}:focus .monaco-list-row.selected.focused { color: ${e.listFocusAndSelectionForeground}; }
			`),e.listInactiveFocusForeground&&(i.push(`.monaco-list${t} .monaco-list-row.focused { color:  ${e.listInactiveFocusForeground}; }`),i.push(`.monaco-list${t} .monaco-list-row.focused:hover { color:  ${e.listInactiveFocusForeground}; }`)),e.listInactiveSelectionIconForeground&&i.push(`.monaco-list${t} .monaco-list-row.focused .codicon { color:  ${e.listInactiveSelectionIconForeground}; }`),e.listInactiveFocusBackground&&(i.push(`.monaco-list${t} .monaco-list-row.focused { background-color:  ${e.listInactiveFocusBackground}; }`),i.push(`.monaco-list${t} .monaco-list-row.focused:hover { background-color:  ${e.listInactiveFocusBackground}; }`)),e.listInactiveSelectionBackground&&(i.push(`.monaco-list${t} .monaco-list-row.selected { background-color:  ${e.listInactiveSelectionBackground}; }`),i.push(`.monaco-list${t} .monaco-list-row.selected:hover { background-color:  ${e.listInactiveSelectionBackground}; }`)),e.listInactiveSelectionForeground&&i.push(`.monaco-list${t} .monaco-list-row.selected { color: ${e.listInactiveSelectionForeground}; }`),e.listHoverBackground&&i.push(`.monaco-list${t}:not(.drop-target):not(.dragging) .monaco-list-row:hover:not(.selected):not(.focused) { background-color: ${e.listHoverBackground}; }`),e.listHoverForeground&&i.push(`.monaco-list${t}:not(.drop-target):not(.dragging) .monaco-list-row:hover:not(.selected):not(.focused) { color:  ${e.listHoverForeground}; }`);const o=D(e.listFocusAndSelectionOutline,D(e.listSelectionOutline,e.listFocusOutline??""));o&&i.push(`.monaco-list${t}:focus .monaco-list-row.focused.selected { outline: 1px solid ${o}; outline-offset: -1px;}`),e.listFocusOutline&&i.push(`
				.monaco-drag-image,
				.monaco-list${t}:focus .monaco-list-row.focused { outline: 1px solid ${e.listFocusOutline}; outline-offset: -1px; }
				.monaco-workbench.context-menu-visible .monaco-list${t}.last-focused .monaco-list-row.focused { outline: 1px solid ${e.listFocusOutline}; outline-offset: -1px; }
			`);const n=D(e.listSelectionOutline,e.listInactiveFocusOutline??"");n&&i.push(`.monaco-list${t} .monaco-list-row.focused.selected { outline: 1px dotted ${n}; outline-offset: -1px; }`),e.listSelectionOutline&&i.push(`.monaco-list${t} .monaco-list-row.selected { outline: 1px dotted ${e.listSelectionOutline}; outline-offset: -1px; }`),e.listInactiveFocusOutline&&i.push(`.monaco-list${t} .monaco-list-row.focused { outline: 1px dotted ${e.listInactiveFocusOutline}; outline-offset: -1px; }`),e.listHoverOutline&&i.push(`.monaco-list${t} .monaco-list-row:hover { outline: 1px dashed ${e.listHoverOutline}; outline-offset: -1px; }`),e.listDropOverBackground&&i.push(`
				.monaco-list${t}.drop-target,
				.monaco-list${t} .monaco-list-rows.drop-target,
				.monaco-list${t} .monaco-list-row.drop-target { background-color: ${e.listDropOverBackground} !important; color: inherit !important; }
			`),e.listDropBetweenBackground&&(i.push(`
			.monaco-list${t} .monaco-list-rows.drop-target-before .monaco-list-row:first-child::before,
			.monaco-list${t} .monaco-list-row.drop-target-before::before {
				content: ""; position: absolute; top: 0px; left: 0px; width: 100%; height: 1px;
				background-color: ${e.listDropBetweenBackground};
			}`),i.push(`
			.monaco-list${t} .monaco-list-rows.drop-target-after .monaco-list-row:last-child::after,
			.monaco-list${t} .monaco-list-row.drop-target-after::after {
				content: ""; position: absolute; bottom: 0px; left: 0px; width: 100%; height: 1px;
				background-color: ${e.listDropBetweenBackground};
			}`)),e.tableColumnsBorder&&i.push(`
				.monaco-table > .monaco-split-view2,
				.monaco-table > .monaco-split-view2 .monaco-sash.vertical::before,
				.monaco-workbench:not(.reduce-motion) .monaco-table:hover > .monaco-split-view2,
				.monaco-workbench:not(.reduce-motion) .monaco-table:hover > .monaco-split-view2 .monaco-sash.vertical::before {
					border-color: ${e.tableColumnsBorder};
				}

				.monaco-workbench:not(.reduce-motion) .monaco-table > .monaco-split-view2,
				.monaco-workbench:not(.reduce-motion) .monaco-table > .monaco-split-view2 .monaco-sash.vertical::before {
					border-color: transparent;
				}
			`),e.tableOddRowsBackgroundColor&&i.push(`
				.monaco-table .monaco-list-row[data-parity=odd]:not(.focused):not(.selected):not(:hover) .monaco-table-tr,
				.monaco-table .monaco-list:not(:focus) .monaco-list-row[data-parity=odd].focused:not(.selected):not(:hover) .monaco-table-tr,
				.monaco-table .monaco-list:not(.focused) .monaco-list-row[data-parity=odd].focused:not(.selected):not(:hover) .monaco-table-tr {
					background-color: ${e.tableOddRowsBackgroundColor};
				}
			`),this.styleElement.textContent=i.join(`
`)}}const Ct={listFocusBackground:"#7FB0D0",listActiveSelectionBackground:"#0E639C",listActiveSelectionForeground:"#FFFFFF",listActiveSelectionIconForeground:"#FFFFFF",listFocusAndSelectionOutline:"#90C2F9",listFocusAndSelectionBackground:"#094771",listFocusAndSelectionForeground:"#FFFFFF",listInactiveSelectionBackground:"#3F3F46",listInactiveSelectionIconForeground:"#FFFFFF",listHoverBackground:"#2A2D2E",listDropOverBackground:"#383B3D",listDropBetweenBackground:"#EEEEEE",treeIndentGuidesStroke:"#a9a9a9",treeInactiveIndentGuidesStroke:T.fromHex("#a9a9a9").transparent(.4).toString(),tableColumnsBorder:T.fromHex("#cccccc").transparent(.2).toString(),tableOddRowsBackgroundColor:T.fromHex("#cccccc").transparent(.04).toString(),listBackground:void 0,listFocusForeground:void 0,listInactiveSelectionForeground:void 0,listInactiveFocusForeground:void 0,listInactiveFocusBackground:void 0,listHoverForeground:void 0,listFocusOutline:void 0,listInactiveFocusOutline:void 0,listSelectionOutline:void 0,listHoverOutline:void 0,treeStickyScrollBackground:void 0,treeStickyScrollBorder:void 0,treeStickyScrollShadow:void 0},fe={keyboardSupport:!0,mouseSupport:!0,multipleSelectionSupport:!0,dnd:{getDragURI(){return null},onDragStart(){},onDragOver(){return!1},drop(){},dispose(){}}};function be(r,e){const t=r.indexOf(e);if(t===-1)return[];const i=[];let o=t-1;for(;o>=0&&r[o]===e-(t-o);)i.push(r[o--]);for(i.reverse(),o=t;o<r.length&&r[o]===e+(o-t);)i.push(r[o++]);return i}function x(r,e){const t=[];let i=0,o=0;for(;i<r.length||o<e.length;)if(i>=r.length)t.push(e[o++]);else if(o>=e.length)t.push(r[i++]);else if(r[i]===e[o]){t.push(r[i]),i++,o++;continue}else r[i]<e[o]?t.push(r[i++]):t.push(e[o++]);return t}function we(r,e){const t=[];let i=0,o=0;for(;i<r.length||o<e.length;)if(i>=r.length)t.push(e[o++]);else if(o>=e.length)t.push(r[i++]);else if(r[i]===e[o]){i++,o++;continue}else r[i]<e[o]?t.push(r[i++]):o++;return t}const B=(r,e)=>r-e;class Ie{constructor(e,t){this._templateId=e;this.renderers=t}get templateId(){return this._templateId}renderTemplate(e){return this.renderers.map(t=>t.renderTemplate(e))}renderElement(e,t,i,o){let n=0;for(const s of this.renderers)s.renderElement(e,t,i[n++],o)}disposeElement(e,t,i,o){let n=0;for(const s of this.renderers)s.disposeElement?.(e,t,i[n],o),n+=1}disposeTemplate(e){let t=0;for(const i of this.renderers)i.disposeTemplate(e[t++])}}class Ee{constructor(e){this.accessibilityProvider=e}templateId="a18n";renderTemplate(e){return{container:e,disposables:new m}}renderElement(e,t,i){const o=this.accessibilityProvider.getAriaLabel(e),n=o&&typeof o!="string"?o:te(o);i.disposables.add(ee(l=>{this.setAriaLabel(l.readObservable(n),i.container)}));const s=this.accessibilityProvider.getAriaLevel&&this.accessibilityProvider.getAriaLevel(e);typeof s=="number"?i.container.setAttribute("aria-level",`${s}`):i.container.removeAttribute("aria-level")}setAriaLabel(e,t){e?t.setAttribute("aria-label",e):t.removeAttribute("aria-label")}disposeElement(e,t,i,o){i.disposables.clear()}disposeTemplate(e){e.disposables.dispose()}}class Se{constructor(e,t){this.list=e;this.dnd=t}getDragElements(e){const t=this.list.getSelectedElements();return t.indexOf(e)>-1?t:[e]}getDragURI(e){return this.dnd.getDragURI(e)}getDragLabel(e,t){if(this.dnd.getDragLabel)return this.dnd.getDragLabel(e,t)}onDragStart(e,t){this.dnd.onDragStart?.(e,t)}onDragOver(e,t,i,o,n){return this.dnd.onDragOver(e,t,i,o,n)}onDragLeave(e,t,i,o){this.dnd.onDragLeave?.(e,t,i,o)}onDragEnd(e){this.dnd.onDragEnd?.(e)}drop(e,t,i,o,n){this.dnd.drop(e,t,i,o,n)}dispose(){this.dnd.dispose()}}class g{constructor(e,t,i,o,n=fe){this.user=e;this._options=n;const s=this._options.accessibilityProvider&&this._options.accessibilityProvider.getWidgetRole?this._options.accessibilityProvider?.getWidgetRole():"list";this.selection=new se(s!=="listbox");const l=[this.focus.renderer,this.selection.renderer];this.accessibilityProvider=n.accessibilityProvider,this.accessibilityProvider&&(l.push(new Ee(this.accessibilityProvider)),this.accessibilityProvider.onDidChangeActiveDescendant?.(this.onDidChangeActiveDescendant,this,this.disposables)),o=o.map(u=>new Ie(u.templateId,[...l,u]));const a={...n,dnd:n.dnd&&new Se(this,n.dnd)};if(this.view=this.createListView(t,i,o,a),this.view.domNode.setAttribute("role",s),n.styleController)this.styleController=n.styleController(this.view.domId);else{const u=j(this.view.domNode);this.styleController=new ge(u,this.view.domId)}if(this.spliceable=new Y([new C(this.focus,this.view,n.identityProvider),new C(this.selection,this.view,n.identityProvider),new C(this.anchor,this.view,n.identityProvider),this.view]),this.disposables.add(this.focus),this.disposables.add(this.selection),this.disposables.add(this.anchor),this.disposables.add(this.view),this.disposables.add(this._onDidDispose),this.disposables.add(new ue(this,this.view)),(typeof n.keyboardSupport!="boolean"||n.keyboardSupport)&&(this.keyboardController=new H(this,this.view,n),this.disposables.add(this.keyboardController)),n.keyboardNavigationLabelProvider){const u=n.keyboardNavigationDelegate||de;this.typeNavigationController=new ce(this,this.view,n.keyboardNavigationLabelProvider,n.keyboardNavigationEventFilter??(()=>!0),u),this.disposables.add(this.typeNavigationController)}this.mouseController=this.createMouseController(n),this.disposables.add(this.mouseController),this.onDidChangeFocus(this._onFocusChange,this,this.disposables),this.onDidChangeSelection(this._onSelectionChange,this,this.disposables),this.accessibilityProvider&&(this.ariaLabel=this.accessibilityProvider.getWidgetAriaLabel()),this._options.multipleSelectionSupport!==!1&&this.view.domNode.setAttribute("aria-multiselectable","true")}focus=new E("focused");selection;anchor=new E("anchor");eventBufferer=new U;view;spliceable;styleController;typeNavigationController;accessibilityProvider;keyboardController;mouseController;_ariaLabel="";disposables=new m;get onDidChangeFocus(){return c.map(this.eventBufferer.wrapEvent(this.focus.onChange),e=>this.toListEvent(e),this.disposables)}get onDidChangeSelection(){return c.map(this.eventBufferer.wrapEvent(this.selection.onChange),e=>this.toListEvent(e),this.disposables)}get domId(){return this.view.domId}get onDidScroll(){return this.view.onDidScroll}get onMouseClick(){return this.view.onMouseClick}get onMouseDblClick(){return this.view.onMouseDblClick}get onMouseMiddleClick(){return this.view.onMouseMiddleClick}get onPointer(){return this.mouseController.onPointer}get onMouseUp(){return this.view.onMouseUp}get onMouseDown(){return this.view.onMouseDown}get onMouseOver(){return this.view.onMouseOver}get onMouseMove(){return this.view.onMouseMove}get onMouseOut(){return this.view.onMouseOut}get onTouchStart(){return this.view.onTouchStart}get onTap(){return this.view.onTap}get onContextMenu(){let e=!1;const t=c.chain(this.disposables.add(new p(this.view.domNode,"keydown")).event,n=>n.map(s=>new I(s)).filter(s=>e=s.keyCode===d.ContextMenu||s.shiftKey&&s.keyCode===d.F10).map(s=>F.stop(s,!0)).filter(()=>!1)),i=c.chain(this.disposables.add(new p(this.view.domNode,"keyup")).event,n=>n.forEach(()=>e=!1).map(s=>new I(s)).filter(s=>s.keyCode===d.ContextMenu||s.shiftKey&&s.keyCode===d.F10).map(s=>F.stop(s,!0)).map(({browserEvent:s})=>{const l=this.getFocus(),a=l.length?l[0]:void 0,u=typeof a<"u"?this.view.element(a):void 0,y=typeof a<"u"?this.view.domElement(a):this.view.domNode;return{index:a,element:u,anchor:y,browserEvent:s}})),o=c.chain(this.view.onContextMenu,n=>n.filter(s=>!e).map(({element:s,index:l,browserEvent:a})=>({element:s,index:l,anchor:new ie(N(this.view.domNode),a),browserEvent:a})));return c.any(t,i,o)}get onKeyDown(){return this.disposables.add(new p(this.view.domNode,"keydown")).event}get onKeyUp(){return this.disposables.add(new p(this.view.domNode,"keyup")).event}get onKeyPress(){return this.disposables.add(new p(this.view.domNode,"keypress")).event}get onDidFocus(){return c.signal(this.disposables.add(new p(this.view.domNode,"focus",!0)).event)}get onDidBlur(){return c.signal(this.disposables.add(new p(this.view.domNode,"blur",!0)).event)}_onDidDispose=new L;onDidDispose=this._onDidDispose.event;createListView(e,t,i,o){return new oe(e,t,i,o)}createMouseController(e){return new me(this)}updateOptions(e={}){this._options={...this._options,...e},this.typeNavigationController?.updateOptions(this._options),this._options.multipleSelectionController!==void 0&&(this._options.multipleSelectionSupport?this.view.domNode.setAttribute("aria-multiselectable","true"):this.view.domNode.removeAttribute("aria-multiselectable")),this.mouseController.updateOptions(e),this.keyboardController?.updateOptions(e),this.view.updateOptions(e)}get options(){return this._options}splice(e,t,i=[]){if(e<0||e>this.view.length)throw new f(this.user,`Invalid start index: ${e}`);if(t<0)throw new f(this.user,`Invalid delete count: ${t}`);t===0&&i.length===0||this.eventBufferer.bufferEvents(()=>this.spliceable.splice(e,t,i))}updateWidth(e){this.view.updateWidth(e)}updateElementHeight(e,t){this.view.updateElementHeight(e,t,null)}rerender(){this.view.rerender()}element(e){return this.view.element(e)}indexOf(e){return this.view.indexOf(e)}indexAt(e){return this.view.indexAt(e)}get length(){return this.view.length}get contentHeight(){return this.view.contentHeight}get contentWidth(){return this.view.contentWidth}get onDidChangeContentHeight(){return this.view.onDidChangeContentHeight}get onDidChangeContentWidth(){return this.view.onDidChangeContentWidth}get scrollTop(){return this.view.getScrollTop()}set scrollTop(e){this.view.setScrollTop(e)}get scrollLeft(){return this.view.getScrollLeft()}set scrollLeft(e){this.view.setScrollLeft(e)}get scrollHeight(){return this.view.scrollHeight}get renderHeight(){return this.view.renderHeight}get firstVisibleIndex(){return this.view.firstVisibleIndex}get firstMostlyVisibleIndex(){return this.view.firstMostlyVisibleIndex}get lastVisibleIndex(){return this.view.lastVisibleIndex}get ariaLabel(){return this._ariaLabel}set ariaLabel(e){this._ariaLabel=e,this.view.domNode.setAttribute("aria-label",e)}domFocus(){this.view.domNode.focus({preventScroll:!0})}layout(e,t){this.view.layout(e,t)}triggerTypeNavigation(){this.typeNavigationController?.trigger()}setSelection(e,t){for(const i of e)if(i<0||i>=this.length)throw new f(this.user,`Invalid index ${i}`);this.selection.set(e,t)}getSelection(){return this.selection.get()}getSelectedElements(){return this.getSelection().map(e=>this.view.element(e))}setAnchor(e){if(typeof e>"u"){this.anchor.set([]);return}if(e<0||e>=this.length)throw new f(this.user,`Invalid index ${e}`);this.anchor.set([e])}getAnchor(){return this.anchor.get().at(0)}getAnchorElement(){const e=this.getAnchor();return typeof e>"u"?void 0:this.element(e)}setFocus(e,t){for(const i of e)if(i<0||i>=this.length)throw new f(this.user,`Invalid index ${i}`);this.focus.set(e,t)}focusNext(e=1,t=!1,i,o){if(this.length===0)return;const n=this.focus.get(),s=this.findNextIndex(n.length>0?n[0]+e:0,t,o);s>-1&&this.setFocus([s],i)}focusPrevious(e=1,t=!1,i,o){if(this.length===0)return;const n=this.focus.get(),s=this.findPreviousIndex(n.length>0?n[0]-e:0,t,o);s>-1&&this.setFocus([s],i)}async focusNextPage(e,t){let i=this.view.indexAt(this.view.getScrollTop()+this.view.renderHeight);i=i===0?0:i-1;const o=this.getFocus()[0];if(o!==i&&(o===void 0||i>o)){const n=this.findPreviousIndex(i,!1,t);n>-1&&o!==n?this.setFocus([n],e):this.setFocus([i],e)}else{const n=this.view.getScrollTop();let s=n+this.view.renderHeight;i>o&&(s-=this.view.elementHeight(i)),this.view.setScrollTop(s),this.view.getScrollTop()!==n&&(this.setFocus([]),await A(0),await this.focusNextPage(e,t))}}async focusPreviousPage(e,t,i=()=>0){let o;const n=i(),s=this.view.getScrollTop()+n;s===0?o=this.view.indexAt(s):o=this.view.indexAfter(s-1);const l=this.getFocus()[0];if(l!==o&&(l===void 0||l>=o)){const a=this.findNextIndex(o,!1,t);a>-1&&l!==a?this.setFocus([a],e):this.setFocus([o],e)}else{const a=s;this.view.setScrollTop(s-this.view.renderHeight-n),this.view.getScrollTop()+i()!==a&&(this.setFocus([]),await A(0),await this.focusPreviousPage(e,t,i))}}focusLast(e,t){if(this.length===0)return;const i=this.findPreviousIndex(this.length-1,!1,t);i>-1&&this.setFocus([i],e)}focusFirst(e,t){this.focusNth(0,e,t)}focusNth(e,t,i){if(this.length===0)return;const o=this.findNextIndex(e,!1,i);o>-1&&this.setFocus([o],t)}findNextIndex(e,t=!1,i){for(let o=0;o<this.length;o++){if(e>=this.length&&!t)return-1;if(e=e%this.length,!i||i(this.element(e)))return e;e++}return-1}findPreviousIndex(e,t=!1,i){for(let o=0;o<this.length;o++){if(e<0&&!t)return-1;if(e=(this.length+e%this.length)%this.length,!i||i(this.element(e)))return e;e--}return-1}getFocus(){return this.focus.get()}getFocusedElements(){return this.getFocus().map(e=>this.view.element(e))}reveal(e,t,i=0){if(e<0||e>=this.length)throw new f(this.user,`Invalid index ${e}`);const o=this.view.getScrollTop(),n=this.view.elementTop(e),s=this.view.elementHeight(e);if(G(t)){const l=s-this.view.renderHeight+i;this.view.setScrollTop(l*z(t,0,1)+n-i)}else{const l=n+s,a=o+this.view.renderHeight;n<o+i&&l>=a||(n<o+i||l>=a&&s>=this.view.renderHeight?this.view.setScrollTop(n-i):l>=a&&this.view.setScrollTop(l-this.view.renderHeight))}}getRelativeTop(e,t=0){if(e<0||e>=this.length)throw new f(this.user,`Invalid index ${e}`);const i=this.view.getScrollTop(),o=this.view.elementTop(e),n=this.view.elementHeight(e);if(o<i+t||o+n>i+this.view.renderHeight)return null;const s=n-this.view.renderHeight+t;return Math.abs((i+t-o)/s)}isDOMFocused(){return J(this.view.domNode)}getHTMLElement(){return this.view.domNode}getScrollableElement(){return this.view.scrollableElementDomNode}getElementID(e){return this.view.getElementDomId(e)}getElementTop(e){return this.view.elementTop(e)}style(e){this.styleController.style(e)}toListEvent({indexes:e,browserEvent:t}){return{indexes:e,elements:e.map(i=>this.view.element(i)),browserEvent:t}}_onFocusChange(){const e=this.focus.get();this.view.domNode.classList.toggle("element-focused",e.length>0),this.onDidChangeActiveDescendant()}onDidChangeActiveDescendant(){const e=this.focus.get();if(e.length>0){let t;this.accessibilityProvider?.getActiveDescendantId&&(t=this.accessibilityProvider.getActiveDescendantId(this.view.element(e[0]))),this.view.domNode.setAttribute("aria-activedescendant",t||this.view.getElementDomId(e[0]))}else this.view.domNode.removeAttribute("aria-activedescendant")}_onSelectionChange(){const e=this.selection.get();this.view.domNode.classList.toggle("selection-none",e.length===0),this.view.domNode.classList.toggle("selection-single",e.length===1),this.view.domNode.classList.toggle("selection-multiple",e.length>1)}dispose(){this._onDidDispose.fire(),this.disposables.dispose(),this._onDidDispose.dispose()}}h([v],g.prototype,"onDidChangeFocus",1),h([v],g.prototype,"onDidChangeSelection",1),h([v],g.prototype,"onContextMenu",1),h([v],g.prototype,"onKeyDown",1),h([v],g.prototype,"onKeyUp",1),h([v],g.prototype,"onKeyPress",1),h([v],g.prototype,"onDidFocus",1),h([v],g.prototype,"onDidBlur",1);export{de as DefaultKeyboardNavigationDelegate,ge as DefaultStyleController,g as List,me as MouseController,le as TypeNavigationMode,Tt as isActionItem,re as isButton,yt as isMonacoCustomToggle,S as isMonacoEditor,Lt as isMonacoTwistie,ve as isSelectionRangeChangeEvent,he as isSelectionSingleChangeEvent,Ft as isStickyScrollContainer,Dt as isStickyScrollElement,Ct as unthemedListStyles};

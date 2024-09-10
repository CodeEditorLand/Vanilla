var S=Object.defineProperty;var x=Object.getOwnPropertyDescriptor;var L=(v,l,e,t)=>{for(var i=t>1?void 0:t?x(l,e):l,r=v.length-1,a;r>=0;r--)(a=v[r])&&(i=(t?a(l,e,i):a(i))||i);return t&&i&&S(l,e,i),i},g=(v,l)=>(e,t)=>l(e,t,v);import"./hover.css";import{DisposableStore as O}from"../../../../base/common/lifecycle.js";import{Emitter as y}from"../../../../base/common/event.js";import*as h from"../../../../base/browser/dom.js";import{IKeybindingService as w}from"../../../../platform/keybinding/common/keybinding.js";import{KeyCode as I}from"../../../../base/common/keyCodes.js";import{IConfigurationService as W}from"../../../../platform/configuration/common/configuration.js";import{EDITOR_FONT_DEFAULTS as N}from"../../../common/config/editorOptions.js";import{HoverAction as R,HoverPosition as o,HoverWidget as F,getHoverAccessibleViewHint as B}from"../../../../base/browser/ui/hover/hoverWidget.js";import{Widget as C}from"../../../../base/browser/ui/widget.js";import{AnchorPosition as T}from"../../../../base/browser/ui/contextview/contextview.js";import{IOpenerService as z}from"../../../../platform/opener/common/opener.js";import{IInstantiationService as A}from"../../../../platform/instantiation/common/instantiation.js";import{MarkdownRenderer as $,openLinkFromMarkdown as V}from"../../widget/markdownRenderer/browser/markdownRenderer.js";import{isMarkdownString as H}from"../../../../base/common/htmlContent.js";import{localize as j}from"../../../../nls.js";import{isMacintosh as G}from"../../../../base/common/platform.js";import{IAccessibilityService as q}from"../../../../platform/accessibility/common/accessibility.js";import{status as K}from"../../../../base/browser/ui/aria/aria.js";const c=h.$;var X=(t=>(t[t.PointerSize=3]="PointerSize",t[t.HoverBorderWidth=2]="HoverBorderWidth",t[t.HoverWindowEdgeMargin=2]="HoverWindowEdgeMargin",t))(X||{});let P=class extends C{constructor(e,t,i,r,a,b){super();this._keybindingService=t;this._configurationService=i;this._openerService=r;this._instantiationService=a;this._accessibilityService=b;this._linkHandler=e.linkHandler||(s=>V(this._openerService,s,H(e.content)?e.content.isTrusted:void 0)),this._target="targetElements"in e.target?e.target:new Y(e.target),this._hoverPointer=e.appearance?.showPointer?c("div.workbench-hover-pointer"):void 0,this._hover=this._register(new F),this._hover.containerDomNode.classList.add("workbench-hover","fadeIn"),e.appearance?.compact&&this._hover.containerDomNode.classList.add("workbench-hover","compact"),e.appearance?.skipFadeInAnimation&&this._hover.containerDomNode.classList.add("skip-fade-in"),e.additionalClasses&&this._hover.containerDomNode.classList.add(...e.additionalClasses),e.position?.forcePosition&&(this._forcePosition=!0),e.trapFocus&&(this._enableFocusTraps=!0),this._hoverPosition=e.position?.hoverPosition??o.ABOVE,this.onmousedown(this._hover.containerDomNode,s=>s.stopPropagation()),this.onkeydown(this._hover.containerDomNode,s=>{s.equals(I.Escape)&&this.dispose()}),this._register(h.addDisposableListener(this._targetWindow,"blur",()=>this.dispose()));const f=c("div.hover-row.markdown-hover"),d=c("div.hover-contents");if(typeof e.content=="string")d.textContent=e.content,d.style.whiteSpace="pre-wrap";else if(h.isHTMLElement(e.content))d.appendChild(e.content),d.classList.add("html-hover-contents");else{const s=e.content,u=this._instantiationService.createInstance($,{codeBlockFontFamily:this._configurationService.getValue("editor").fontFamily||N.fontFamily}),{element:p}=u.render(s,{actionHandler:{callback:E=>this._linkHandler(E),disposables:this._messageListeners},asyncRenderCallback:()=>{d.classList.add("code-hover-contents"),this.layout(),this._onRequestLayout.fire()}});d.appendChild(p)}if(f.appendChild(d),this._hover.contentsDomNode.appendChild(f),e.actions&&e.actions.length>0){const s=c("div.hover-row.status-bar"),u=c("div.actions");e.actions.forEach(p=>{const E=this._keybindingService.lookupKeybinding(p.commandId),M=E?E.getLabel():null;R.render(u,{label:p.label,commandId:p.commandId,run:k=>{p.run(k),this.dispose()},iconClass:p.iconClass},M)}),s.appendChild(u),this._hover.containerDomNode.appendChild(s)}this._hoverContainer=c("div.workbench-hover-container"),this._hoverPointer&&this._hoverContainer.appendChild(this._hoverPointer),this._hoverContainer.appendChild(this._hover.containerDomNode);let n;if(e.actions&&e.actions.length>0?n=!1:e.persistence?.hideOnHover===void 0?n=typeof e.content=="string"||H(e.content)&&!e.content.value.includes("](")&&!e.content.value.includes("</a>"):n=e.persistence.hideOnHover,e.appearance?.showHoverHint){const s=c("div.hover-row.status-bar"),u=c("div.info");u.textContent=j("hoverhint","Hold {0} key to mouse over",G?"Option":"Alt"),s.appendChild(u),this._hover.containerDomNode.appendChild(s)}const m=[...this._target.targetElements];n||m.push(this._hoverContainer);const _=this._register(new D(m));if(this._register(_.onMouseOut(()=>{this._isLocked||this.dispose()})),n){const s=[...this._target.targetElements,this._hoverContainer];this._lockMouseTracker=this._register(new D(s)),this._register(this._lockMouseTracker.onMouseOut(()=>{this._isLocked||this.dispose()}))}else this._lockMouseTracker=_}_messageListeners=new O;_lockMouseTracker;_hover;_hoverPointer;_hoverContainer;_target;_linkHandler;_isDisposed=!1;_hoverPosition;_forcePosition=!1;_x=0;_y=0;_isLocked=!1;_enableFocusTraps=!1;_addedFocusTrap=!1;get _targetWindow(){return h.getWindow(this._target.targetElements[0])}get _targetDocumentElement(){return h.getWindow(this._target.targetElements[0]).document.documentElement}get isDisposed(){return this._isDisposed}get isMouseIn(){return this._lockMouseTracker.isMouseIn}get domNode(){return this._hover.containerDomNode}_onDispose=this._register(new y);get onDispose(){return this._onDispose.event}_onRequestLayout=this._register(new y);get onRequestLayout(){return this._onRequestLayout.event}get anchor(){return this._hoverPosition===o.BELOW?T.BELOW:T.ABOVE}get x(){return this._x}get y(){return this._y}get isLocked(){return this._isLocked}set isLocked(e){this._isLocked!==e&&(this._isLocked=e,this._hoverContainer.classList.toggle("locked",this._isLocked))}addFocusTrap(){if(!this._enableFocusTraps||this._addedFocusTrap)return;this._addedFocusTrap=!0;const e=this._hover.containerDomNode,t=this.findLastFocusableChild(this._hover.containerDomNode);if(t){const i=h.prepend(this._hoverContainer,c("div")),r=h.append(this._hoverContainer,c("div"));i.tabIndex=0,r.tabIndex=0,this._register(h.addDisposableListener(r,"focus",a=>{e.focus(),a.preventDefault()})),this._register(h.addDisposableListener(i,"focus",a=>{t.focus(),a.preventDefault()}))}}findLastFocusableChild(e){if(e.hasChildNodes())for(let t=0;t<e.childNodes.length;t++){const i=e.childNodes.item(e.childNodes.length-t-1);if(i.nodeType===i.ELEMENT_NODE){const a=i;if(typeof a.tabIndex=="number"&&a.tabIndex>=0)return a}const r=this.findLastFocusableChild(i);if(r)return r}}render(e){e.appendChild(this._hoverContainer);const i=this._hoverContainer.contains(this._hoverContainer.ownerDocument.activeElement)&&B(this._configurationService.getValue("accessibility.verbosity.hover")===!0&&this._accessibilityService.isScreenReaderOptimized(),this._keybindingService.lookupKeybinding("editor.action.accessibleView")?.getAriaLabel());i&&K(i),this.layout(),this.addFocusTrap()}layout(){this._hover.containerDomNode.classList.remove("right-aligned"),this._hover.contentsDomNode.style.maxHeight="";const e=m=>{const _=h.getDomNodeZoomLevel(m),s=m.getBoundingClientRect();return{top:s.top*_,bottom:s.bottom*_,right:s.right*_,left:s.left*_}},t=this._target.targetElements.map(m=>e(m)),{top:i,right:r,bottom:a,left:b}=t[0],f=r-b,d=a-i,n={top:i,right:r,bottom:a,left:b,width:f,height:d,center:{x:b+f/2,y:i+d/2}};if(this.adjustHorizontalHoverPosition(n),this.adjustVerticalHoverPosition(n),this.adjustHoverMaxHeight(n),this._hoverContainer.style.padding="",this._hoverContainer.style.margin="",this._hoverPointer){switch(this._hoverPosition){case o.RIGHT:n.left+=3,n.right+=3,this._hoverContainer.style.paddingLeft="3px",this._hoverContainer.style.marginLeft="-3px";break;case o.LEFT:n.left-=3,n.right-=3,this._hoverContainer.style.paddingRight="3px",this._hoverContainer.style.marginRight="-3px";break;case o.BELOW:n.top+=3,n.bottom+=3,this._hoverContainer.style.paddingTop="3px",this._hoverContainer.style.marginTop="-3px";break;case o.ABOVE:n.top-=3,n.bottom-=3,this._hoverContainer.style.paddingBottom="3px",this._hoverContainer.style.marginBottom="-3px";break}n.center.x=n.left+f/2,n.center.y=n.top+d/2}this.computeXCordinate(n),this.computeYCordinate(n),this._hoverPointer&&(this._hoverPointer.classList.remove("top"),this._hoverPointer.classList.remove("left"),this._hoverPointer.classList.remove("right"),this._hoverPointer.classList.remove("bottom"),this.setHoverPointerPosition(n)),this._hover.onContentsChanged()}computeXCordinate(e){const t=this._hover.containerDomNode.clientWidth+2;this._target.x!==void 0?this._x=this._target.x:this._hoverPosition===o.RIGHT?this._x=e.right:this._hoverPosition===o.LEFT?this._x=e.left-t:(this._hoverPointer?this._x=e.center.x-this._hover.containerDomNode.clientWidth/2:this._x=e.left,this._x+t>=this._targetDocumentElement.clientWidth&&(this._hover.containerDomNode.classList.add("right-aligned"),this._x=Math.max(this._targetDocumentElement.clientWidth-t-2,this._targetDocumentElement.clientLeft))),this._x<this._targetDocumentElement.clientLeft&&(this._x=e.left+2)}computeYCordinate(e){this._target.y!==void 0?this._y=this._target.y:this._hoverPosition===o.ABOVE?this._y=e.top:this._hoverPosition===o.BELOW?this._y=e.bottom-2:this._hoverPointer?this._y=e.center.y+this._hover.containerDomNode.clientHeight/2:this._y=e.bottom,this._y>this._targetWindow.innerHeight&&(this._y=e.bottom)}adjustHorizontalHoverPosition(e){if(this._target.x!==void 0)return;const t=this._hoverPointer?3:0;if(this._forcePosition){const i=t+2;this._hoverPosition===o.RIGHT?this._hover.containerDomNode.style.maxWidth=`${this._targetDocumentElement.clientWidth-e.right-i}px`:this._hoverPosition===o.LEFT&&(this._hover.containerDomNode.style.maxWidth=`${e.left-i}px`);return}this._hoverPosition===o.RIGHT?this._targetDocumentElement.clientWidth-e.right<this._hover.containerDomNode.clientWidth+t&&(e.left>=this._hover.containerDomNode.clientWidth+t?this._hoverPosition=o.LEFT:this._hoverPosition=o.BELOW):this._hoverPosition===o.LEFT&&(e.left<this._hover.containerDomNode.clientWidth+t&&(this._targetDocumentElement.clientWidth-e.right>=this._hover.containerDomNode.clientWidth+t?this._hoverPosition=o.RIGHT:this._hoverPosition=o.BELOW),e.left-this._hover.containerDomNode.clientWidth-t<=this._targetDocumentElement.clientLeft&&(this._hoverPosition=o.RIGHT))}adjustVerticalHoverPosition(e){if(this._target.y!==void 0||this._forcePosition)return;const t=this._hoverPointer?3:0;this._hoverPosition===o.ABOVE?e.top-this._hover.containerDomNode.clientHeight-t<0&&(this._hoverPosition=o.BELOW):this._hoverPosition===o.BELOW&&e.bottom+this._hover.containerDomNode.clientHeight+t>this._targetWindow.innerHeight&&(this._hoverPosition=o.ABOVE)}adjustHoverMaxHeight(e){let t=this._targetWindow.innerHeight/2;if(this._forcePosition){const i=(this._hoverPointer?3:0)+2;this._hoverPosition===o.ABOVE?t=Math.min(t,e.top-i):this._hoverPosition===o.BELOW&&(t=Math.min(t,this._targetWindow.innerHeight-e.bottom-i))}if(this._hover.containerDomNode.style.maxHeight=`${t}px`,this._hover.contentsDomNode.clientHeight<this._hover.contentsDomNode.scrollHeight){const i=`${this._hover.scrollbar.options.verticalScrollbarSize}px`;this._hover.contentsDomNode.style.paddingRight!==i&&(this._hover.contentsDomNode.style.paddingRight=i)}}setHoverPointerPosition(e){if(this._hoverPointer)switch(this._hoverPosition){case o.LEFT:case o.RIGHT:{this._hoverPointer.classList.add(this._hoverPosition===o.LEFT?"right":"left");const t=this._hover.containerDomNode.clientHeight;t>e.height?this._hoverPointer.style.top=`${e.center.y-(this._y-t)-3}px`:this._hoverPointer.style.top=`${Math.round(t/2)-3}px`;break}case o.ABOVE:case o.BELOW:{this._hoverPointer.classList.add(this._hoverPosition===o.ABOVE?"bottom":"top");const t=this._hover.containerDomNode.clientWidth;let i=Math.round(t/2)-3;const r=this._x+i;(r<e.left||r>e.right)&&(i=e.center.x-this._x-3),this._hoverPointer.style.left=`${i}px`;break}}}focus(){this._hover.containerDomNode.focus()}hide(){this.dispose()}dispose(){this._isDisposed||(this._onDispose.fire(),this._hoverContainer.remove(),this._messageListeners.dispose(),this._target.dispose(),super.dispose()),this._isDisposed=!0}};P=L([g(1,w),g(2,W),g(3,z),g(4,A),g(5,q)],P);class D extends C{constructor(e){super();this._elements=e;this._elements.forEach(t=>this.onmouseover(t,()=>this._onTargetMouseOver(t))),this._elements.forEach(t=>this.onmouseleave(t,()=>this._onTargetMouseLeave(t)))}_isMouseIn=!0;_mouseTimeout;_onMouseOut=this._register(new y);get onMouseOut(){return this._onMouseOut.event}get isMouseIn(){return this._isMouseIn}_onTargetMouseOver(e){this._isMouseIn=!0,this._clearEvaluateMouseStateTimeout(e)}_onTargetMouseLeave(e){this._isMouseIn=!1,this._evaluateMouseState(e)}_evaluateMouseState(e){this._clearEvaluateMouseStateTimeout(e),this._mouseTimeout=h.getWindow(e).setTimeout(()=>this._fireIfMouseOutside(),0)}_clearEvaluateMouseStateTimeout(e){this._mouseTimeout&&(h.getWindow(e).clearTimeout(this._mouseTimeout),this._mouseTimeout=void 0)}_fireIfMouseOutside(){this._isMouseIn||this._onMouseOut.fire()}}class Y{constructor(l){this._element=l;this.targetElements=[this._element]}targetElements;dispose(){}}export{P as HoverWidget};

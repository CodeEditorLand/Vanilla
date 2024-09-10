import{getZoomFactor as g,isChrome as E}from"../../browser.js";import*as h from"../../dom.js";import{createFastDomNode as S}from"../../fastDomNode.js";import{StandardWheelEvent as p}from"../../mouseEvent.js";import"./abstractScrollbar.js";import{HorizontalScrollbar as W}from"./horizontalScrollbar.js";import"./scrollableElementOptions.js";import{VerticalScrollbar as w}from"./verticalScrollbar.js";import{Widget as z}from"../widget.js";import{TimeoutTimer as P}from"../../../common/async.js";import{Emitter as v}from"../../../common/event.js";import{dispose as b}from"../../../common/lifecycle.js";import*as u from"../../../common/platform.js";import{Scrollable as N,ScrollbarVisibility as y}from"../../../common/scrollable.js";import"./media/scrollbars.css";const I=500,D=50,M=!0;class T{timestamp;deltaX;deltaY;score;constructor(e,t,s){this.timestamp=e,this.deltaX=t,this.deltaY=s,this.score=0}}class f{static INSTANCE=new f;_capacity;_memory;_front;_rear;constructor(){this._capacity=5,this._memory=[],this._front=-1,this._rear=-1}isPhysicalMouseWheel(){if(this._front===-1&&this._rear===-1)return!1;let e=1,t=0,s=1,i=this._rear;do{const l=i===this._front?e:Math.pow(2,-s);if(e-=l,t+=this._memory[i].score*l,i===this._front)break;i=(this._capacity+i-1)%this._capacity,s++}while(!0);return t<=.5}acceptStandardWheelEvent(e){if(E){const t=h.getWindow(e.browserEvent),s=g(t);this.accept(Date.now(),e.deltaX*s,e.deltaY*s)}else this.accept(Date.now(),e.deltaX,e.deltaY)}accept(e,t,s){let i=null;const l=new T(e,t,s);this._front===-1&&this._rear===-1?(this._memory[0]=l,this._front=0,this._rear=0):(i=this._memory[this._rear],this._rear=(this._rear+1)%this._capacity,this._rear===this._front&&(this._front=(this._front+1)%this._capacity),this._memory[this._rear]=l),l.score=this._computeScore(l,i)}_computeScore(e,t){if(Math.abs(e.deltaX)>0&&Math.abs(e.deltaY)>0)return 1;let s=.5;if((!this._isAlmostInt(e.deltaX)||!this._isAlmostInt(e.deltaY))&&(s+=.25),t){const i=Math.abs(e.deltaX),l=Math.abs(e.deltaY),r=Math.abs(t.deltaX),m=Math.abs(t.deltaY),c=Math.max(Math.min(i,r),1),n=Math.max(Math.min(l,m),1),a=Math.max(i,r),d=Math.max(l,m);a%c===0&&d%n===0&&(s-=.5)}return Math.min(Math.max(s,0),1)}_isAlmostInt(e){return Math.abs(Math.round(e)-e)<.01}}class _ extends z{_options;_scrollable;_verticalScrollbar;_horizontalScrollbar;_domNode;_leftShadowDomNode;_topShadowDomNode;_topLeftShadowDomNode;_listenOnDomNode;_mouseWheelToDispose;_isDragging;_mouseIsOver;_hideTimeout;_shouldRender;_revealOnScroll;_onScroll=this._register(new v);onScroll=this._onScroll.event;_onWillScroll=this._register(new v);onWillScroll=this._onWillScroll.event;get options(){return this._options}constructor(e,t,s){super(),e.style.overflow="hidden",this._options=L(t),this._scrollable=s,this._register(this._scrollable.onScroll(l=>{this._onWillScroll.fire(l),this._onDidScroll(l),this._onScroll.fire(l)}));const i={onMouseWheel:l=>this._onMouseWheel(l),onDragStart:()=>this._onDragStart(),onDragEnd:()=>this._onDragEnd()};this._verticalScrollbar=this._register(new w(this._scrollable,this._options,i)),this._horizontalScrollbar=this._register(new W(this._scrollable,this._options,i)),this._domNode=document.createElement("div"),this._domNode.className="monaco-scrollable-element "+this._options.className,this._domNode.setAttribute("role","presentation"),this._domNode.style.position="relative",this._domNode.style.overflow="hidden",this._domNode.appendChild(e),this._domNode.appendChild(this._horizontalScrollbar.domNode.domNode),this._domNode.appendChild(this._verticalScrollbar.domNode.domNode),this._options.useShadows?(this._leftShadowDomNode=S(document.createElement("div")),this._leftShadowDomNode.setClassName("shadow"),this._domNode.appendChild(this._leftShadowDomNode.domNode),this._topShadowDomNode=S(document.createElement("div")),this._topShadowDomNode.setClassName("shadow"),this._domNode.appendChild(this._topShadowDomNode.domNode),this._topLeftShadowDomNode=S(document.createElement("div")),this._topLeftShadowDomNode.setClassName("shadow"),this._domNode.appendChild(this._topLeftShadowDomNode.domNode)):(this._leftShadowDomNode=null,this._topShadowDomNode=null,this._topLeftShadowDomNode=null),this._listenOnDomNode=this._options.listenOnDomNode||this._domNode,this._mouseWheelToDispose=[],this._setListeningToMouseWheel(this._options.handleMouseWheel),this.onmouseover(this._listenOnDomNode,l=>this._onMouseOver(l)),this.onmouseleave(this._listenOnDomNode,l=>this._onMouseLeave(l)),this._hideTimeout=this._register(new P),this._isDragging=!1,this._mouseIsOver=!1,this._shouldRender=!0,this._revealOnScroll=!0}dispose(){this._mouseWheelToDispose=b(this._mouseWheelToDispose),super.dispose()}getDomNode(){return this._domNode}getOverviewRulerLayoutInfo(){return{parent:this._domNode,insertBefore:this._verticalScrollbar.domNode.domNode}}delegateVerticalScrollbarPointerDown(e){this._verticalScrollbar.delegatePointerDown(e)}getScrollDimensions(){return this._scrollable.getScrollDimensions()}setScrollDimensions(e){this._scrollable.setScrollDimensions(e,!1)}updateClassName(e){this._options.className=e,u.isMacintosh&&(this._options.className+=" mac"),this._domNode.className="monaco-scrollable-element "+this._options.className}updateOptions(e){typeof e.handleMouseWheel<"u"&&(this._options.handleMouseWheel=e.handleMouseWheel,this._setListeningToMouseWheel(this._options.handleMouseWheel)),typeof e.mouseWheelScrollSensitivity<"u"&&(this._options.mouseWheelScrollSensitivity=e.mouseWheelScrollSensitivity),typeof e.fastScrollSensitivity<"u"&&(this._options.fastScrollSensitivity=e.fastScrollSensitivity),typeof e.scrollPredominantAxis<"u"&&(this._options.scrollPredominantAxis=e.scrollPredominantAxis),typeof e.horizontal<"u"&&(this._options.horizontal=e.horizontal),typeof e.vertical<"u"&&(this._options.vertical=e.vertical),typeof e.horizontalScrollbarSize<"u"&&(this._options.horizontalScrollbarSize=e.horizontalScrollbarSize),typeof e.verticalScrollbarSize<"u"&&(this._options.verticalScrollbarSize=e.verticalScrollbarSize),typeof e.scrollByPage<"u"&&(this._options.scrollByPage=e.scrollByPage),this._horizontalScrollbar.updateOptions(this._options),this._verticalScrollbar.updateOptions(this._options),this._options.lazyRender||this._render()}setRevealOnScroll(e){this._revealOnScroll=e}delegateScrollFromMouseWheelEvent(e){this._onMouseWheel(new p(e))}_setListeningToMouseWheel(e){if(this._mouseWheelToDispose.length>0!==e&&(this._mouseWheelToDispose=b(this._mouseWheelToDispose),e)){const s=i=>{this._onMouseWheel(new p(i))};this._mouseWheelToDispose.push(h.addDisposableListener(this._listenOnDomNode,h.EventType.MOUSE_WHEEL,s,{passive:!1}))}}_onMouseWheel(e){if(e.browserEvent?.defaultPrevented)return;const t=f.INSTANCE;M&&t.acceptStandardWheelEvent(e);let s=!1;if(e.deltaY||e.deltaX){let l=e.deltaY*this._options.mouseWheelScrollSensitivity,r=e.deltaX*this._options.mouseWheelScrollSensitivity;this._options.scrollPredominantAxis&&(this._options.scrollYToX&&r+l===0?r=l=0:Math.abs(l)>=Math.abs(r)?r=0:l=0),this._options.flipAxes&&([l,r]=[r,l]);const m=!u.isMacintosh&&e.browserEvent&&e.browserEvent.shiftKey;(this._options.scrollYToX||m)&&!r&&(r=l,l=0),e.browserEvent&&e.browserEvent.altKey&&(r=r*this._options.fastScrollSensitivity,l=l*this._options.fastScrollSensitivity);const c=this._scrollable.getFutureScrollPosition();let n={};if(l){const a=D*l,d=c.scrollTop-(a<0?Math.floor(a):Math.ceil(a));this._verticalScrollbar.writeScrollPosition(n,d)}if(r){const a=D*r,d=c.scrollLeft-(a<0?Math.floor(a):Math.ceil(a));this._horizontalScrollbar.writeScrollPosition(n,d)}n=this._scrollable.validateScrollPosition(n),(c.scrollLeft!==n.scrollLeft||c.scrollTop!==n.scrollTop)&&(M&&this._options.mouseWheelSmoothScroll&&t.isPhysicalMouseWheel()?this._scrollable.setScrollPositionSmooth(n):this._scrollable.setScrollPositionNow(n),s=!0)}let i=s;!i&&this._options.alwaysConsumeMouseWheel&&(i=!0),!i&&this._options.consumeMouseWheelIfScrollbarIsNeeded&&(this._verticalScrollbar.isNeeded()||this._horizontalScrollbar.isNeeded())&&(i=!0),i&&(e.preventDefault(),e.stopPropagation())}_onDidScroll(e){this._shouldRender=this._horizontalScrollbar.onDidScroll(e)||this._shouldRender,this._shouldRender=this._verticalScrollbar.onDidScroll(e)||this._shouldRender,this._options.useShadows&&(this._shouldRender=!0),this._revealOnScroll&&this._reveal(),this._options.lazyRender||this._render()}renderNow(){if(!this._options.lazyRender)throw new Error("Please use `lazyRender` together with `renderNow`!");this._render()}_render(){if(this._shouldRender&&(this._shouldRender=!1,this._horizontalScrollbar.render(),this._verticalScrollbar.render(),this._options.useShadows)){const e=this._scrollable.getCurrentScrollPosition(),t=e.scrollTop>0,s=e.scrollLeft>0,i=s?" left":"",l=t?" top":"",r=s||t?" top-left-corner":"";this._leftShadowDomNode.setClassName(`shadow${i}`),this._topShadowDomNode.setClassName(`shadow${l}`),this._topLeftShadowDomNode.setClassName(`shadow${r}${l}${i}`)}}_onDragStart(){this._isDragging=!0,this._reveal()}_onDragEnd(){this._isDragging=!1,this._hide()}_onMouseLeave(e){this._mouseIsOver=!1,this._hide()}_onMouseOver(e){this._mouseIsOver=!0,this._reveal()}_reveal(){this._verticalScrollbar.beginReveal(),this._horizontalScrollbar.beginReveal(),this._scheduleHide()}_hide(){!this._mouseIsOver&&!this._isDragging&&(this._verticalScrollbar.beginHide(),this._horizontalScrollbar.beginHide())}_scheduleHide(){!this._mouseIsOver&&!this._isDragging&&this._hideTimeout.cancelAndSet(()=>this._hide(),I)}}class ne extends _{constructor(e,t){t=t||{},t.mouseWheelSmoothScroll=!1;const s=new N({forceIntegerValues:!0,smoothScrollDuration:0,scheduleAtNextAnimationFrame:i=>h.scheduleAtNextAnimationFrame(h.getWindow(e),i)});super(e,t,s),this._register(s)}setScrollPosition(e){this._scrollable.setScrollPositionNow(e)}getScrollPosition(){return this._scrollable.getCurrentScrollPosition()}}class ae extends _{constructor(e,t,s){super(e,t,s)}setScrollPosition(e){e.reuseAnimation?this._scrollable.setScrollPositionSmooth(e,e.reuseAnimation):this._scrollable.setScrollPositionNow(e)}getScrollPosition(){return this._scrollable.getCurrentScrollPosition()}}class he extends _{_element;constructor(e,t){t=t||{},t.mouseWheelSmoothScroll=!1;const s=new N({forceIntegerValues:!1,smoothScrollDuration:0,scheduleAtNextAnimationFrame:i=>h.scheduleAtNextAnimationFrame(h.getWindow(e),i)});super(e,t,s),this._register(s),this._element=e,this._register(this.onScroll(i=>{i.scrollTopChanged&&(this._element.scrollTop=i.scrollTop),i.scrollLeftChanged&&(this._element.scrollLeft=i.scrollLeft)})),this.scanDomNode()}setScrollPosition(e){this._scrollable.setScrollPositionNow(e)}getScrollPosition(){return this._scrollable.getCurrentScrollPosition()}scanDomNode(){this.setScrollDimensions({width:this._element.clientWidth,scrollWidth:this._element.scrollWidth,height:this._element.clientHeight,scrollHeight:this._element.scrollHeight}),this.setScrollPosition({scrollLeft:this._element.scrollLeft,scrollTop:this._element.scrollTop})}}function L(o){const e={lazyRender:typeof o.lazyRender<"u"?o.lazyRender:!1,className:typeof o.className<"u"?o.className:"",useShadows:typeof o.useShadows<"u"?o.useShadows:!0,handleMouseWheel:typeof o.handleMouseWheel<"u"?o.handleMouseWheel:!0,flipAxes:typeof o.flipAxes<"u"?o.flipAxes:!1,consumeMouseWheelIfScrollbarIsNeeded:typeof o.consumeMouseWheelIfScrollbarIsNeeded<"u"?o.consumeMouseWheelIfScrollbarIsNeeded:!1,alwaysConsumeMouseWheel:typeof o.alwaysConsumeMouseWheel<"u"?o.alwaysConsumeMouseWheel:!1,scrollYToX:typeof o.scrollYToX<"u"?o.scrollYToX:!1,mouseWheelScrollSensitivity:typeof o.mouseWheelScrollSensitivity<"u"?o.mouseWheelScrollSensitivity:1,fastScrollSensitivity:typeof o.fastScrollSensitivity<"u"?o.fastScrollSensitivity:5,scrollPredominantAxis:typeof o.scrollPredominantAxis<"u"?o.scrollPredominantAxis:!0,mouseWheelSmoothScroll:typeof o.mouseWheelSmoothScroll<"u"?o.mouseWheelSmoothScroll:!0,arrowSize:typeof o.arrowSize<"u"?o.arrowSize:11,listenOnDomNode:typeof o.listenOnDomNode<"u"?o.listenOnDomNode:null,horizontal:typeof o.horizontal<"u"?o.horizontal:y.Auto,horizontalScrollbarSize:typeof o.horizontalScrollbarSize<"u"?o.horizontalScrollbarSize:10,horizontalSliderSize:typeof o.horizontalSliderSize<"u"?o.horizontalSliderSize:0,horizontalHasArrows:typeof o.horizontalHasArrows<"u"?o.horizontalHasArrows:!1,vertical:typeof o.vertical<"u"?o.vertical:y.Auto,verticalScrollbarSize:typeof o.verticalScrollbarSize<"u"?o.verticalScrollbarSize:10,verticalHasArrows:typeof o.verticalHasArrows<"u"?o.verticalHasArrows:!1,verticalSliderSize:typeof o.verticalSliderSize<"u"?o.verticalSliderSize:0,scrollByPage:typeof o.scrollByPage<"u"?o.scrollByPage:!1};return e.horizontalSliderSize=typeof o.horizontalSliderSize<"u"?o.horizontalSliderSize:e.horizontalScrollbarSize,e.verticalSliderSize=typeof o.verticalSliderSize<"u"?o.verticalSliderSize:e.verticalScrollbarSize,u.isMacintosh&&(e.className+=" mac"),e}export{_ as AbstractScrollableElement,he as DomScrollableElement,f as MouseWheelClassifier,ne as ScrollableElement,ae as SmoothScrollableElement};

import*as s from"../../dom.js";import{createFastDomNode as l}from"../../fastDomNode.js";import{GlobalPointerMoveMonitor as c}from"../../globalPointerMoveMonitor.js";import{ScrollbarArrow as b}from"./scrollbarArrow.js";import{ScrollbarVisibilityController as h}from"./scrollbarVisibilityController.js";import{Widget as m}from"../widget.js";import*as S from"../../../common/platform.js";const _=140;class A extends m{_host;_scrollable;_scrollByPage;_lazyRender;_scrollbarState;_visibilityController;_pointerMoveMonitor;domNode;slider;_shouldRender;constructor(e){super(),this._lazyRender=e.lazyRender,this._host=e.host,this._scrollable=e.scrollable,this._scrollByPage=e.scrollByPage,this._scrollbarState=e.scrollbarState,this._visibilityController=this._register(new h(e.visibility,"visible scrollbar "+e.extraScrollbarClassName,"invisible scrollbar "+e.extraScrollbarClassName)),this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded()),this._pointerMoveMonitor=this._register(new c),this._shouldRender=!0,this.domNode=l(document.createElement("div")),this.domNode.setAttribute("role","presentation"),this.domNode.setAttribute("aria-hidden","true"),this._visibilityController.setDomNode(this.domNode),this.domNode.setPosition("absolute"),this._register(s.addDisposableListener(this.domNode.domNode,s.EventType.POINTER_DOWN,t=>this._domNodePointerDown(t)))}_createArrow(e){const t=this._register(new b(e));this.domNode.domNode.appendChild(t.bgDomNode),this.domNode.domNode.appendChild(t.domNode)}_createSlider(e,t,i,r){this.slider=l(document.createElement("div")),this.slider.setClassName("slider"),this.slider.setPosition("absolute"),this.slider.setTop(e),this.slider.setLeft(t),typeof i=="number"&&this.slider.setWidth(i),typeof r=="number"&&this.slider.setHeight(r),this.slider.setLayerHinting(!0),this.slider.setContain("strict"),this.domNode.domNode.appendChild(this.slider.domNode),this._register(s.addDisposableListener(this.slider.domNode,s.EventType.POINTER_DOWN,o=>{o.button===0&&(o.preventDefault(),this._sliderPointerDown(o))})),this.onclick(this.slider.domNode,o=>{o.leftButton&&o.stopPropagation()})}_onElementSize(e){return this._scrollbarState.setVisibleSize(e)&&(this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded()),this._shouldRender=!0,this._lazyRender||this.render()),this._shouldRender}_onElementScrollSize(e){return this._scrollbarState.setScrollSize(e)&&(this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded()),this._shouldRender=!0,this._lazyRender||this.render()),this._shouldRender}_onElementScrollPosition(e){return this._scrollbarState.setScrollPosition(e)&&(this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded()),this._shouldRender=!0,this._lazyRender||this.render()),this._shouldRender}beginReveal(){this._visibilityController.setShouldBeVisible(!0)}beginHide(){this._visibilityController.setShouldBeVisible(!1)}render(){this._shouldRender&&(this._shouldRender=!1,this._renderDomNode(this._scrollbarState.getRectangleLargeSize(),this._scrollbarState.getRectangleSmallSize()),this._updateSlider(this._scrollbarState.getSliderSize(),this._scrollbarState.getArrowSize()+this._scrollbarState.getSliderPosition()))}_domNodePointerDown(e){e.target===this.domNode.domNode&&this._onPointerDown(e)}delegatePointerDown(e){const t=this.domNode.domNode.getClientRects()[0].top,i=t+this._scrollbarState.getSliderPosition(),r=t+this._scrollbarState.getSliderPosition()+this._scrollbarState.getSliderSize(),o=this._sliderPointerPosition(e);i<=o&&o<=r?e.button===0&&(e.preventDefault(),this._sliderPointerDown(e)):this._onPointerDown(e)}_onPointerDown(e){let t,i;if(e.target===this.domNode.domNode&&typeof e.offsetX=="number"&&typeof e.offsetY=="number")t=e.offsetX,i=e.offsetY;else{const o=s.getDomNodePagePosition(this.domNode.domNode);t=e.pageX-o.left,i=e.pageY-o.top}const r=this._pointerDownRelativePosition(t,i);this._setDesiredScrollPositionNow(this._scrollByPage?this._scrollbarState.getDesiredScrollPositionFromOffsetPaged(r):this._scrollbarState.getDesiredScrollPositionFromOffset(r)),e.button===0&&(e.preventDefault(),this._sliderPointerDown(e))}_sliderPointerDown(e){if(!e.target||!(e.target instanceof Element))return;const t=this._sliderPointerPosition(e),i=this._sliderOrthogonalPointerPosition(e),r=this._scrollbarState.clone();this.slider.toggleClassName("active",!0),this._pointerMoveMonitor.startMonitoring(e.target,e.pointerId,e.buttons,o=>{const n=this._sliderOrthogonalPointerPosition(o),d=Math.abs(n-i);if(S.isWindows&&d>_){this._setDesiredScrollPositionNow(r.getScrollPosition());return}const a=this._sliderPointerPosition(o)-t;this._setDesiredScrollPositionNow(r.getDesiredScrollPositionFromDelta(a))},()=>{this.slider.toggleClassName("active",!1),this._host.onDragEnd()}),this._host.onDragStart()}_setDesiredScrollPositionNow(e){const t={};this.writeScrollPosition(t,e),this._scrollable.setScrollPositionNow(t)}updateScrollbarSize(e){this._updateScrollbarSize(e),this._scrollbarState.setScrollbarSize(e),this._shouldRender=!0,this._lazyRender||this.render()}isNeeded(){return this._scrollbarState.isNeeded()}}export{A as AbstractScrollbar};

import*as t from"../../../../../vs/base/browser/dom.js";import{GlobalPointerMoveMonitor as r}from"../../../../../vs/base/browser/globalPointerMoveMonitor.js";import{Widget as n}from"../../../../../vs/base/browser/ui/widget.js";import{TimeoutTimer as d}from"../../../../../vs/base/common/async.js";import{ThemeIcon as s}from"../../../../../vs/base/common/themables.js";const i=11;class b extends n{_onActivate;bgDomNode;domNode;_pointerdownRepeatTimer;_pointerdownScheduleRepeatTimer;_pointerMoveMonitor;constructor(e){super(),this._onActivate=e.onActivate,this.bgDomNode=document.createElement("div"),this.bgDomNode.className="arrow-background",this.bgDomNode.style.position="absolute",this.bgDomNode.style.width=e.bgWidth+"px",this.bgDomNode.style.height=e.bgHeight+"px",typeof e.top<"u"&&(this.bgDomNode.style.top="0px"),typeof e.left<"u"&&(this.bgDomNode.style.left="0px"),typeof e.bottom<"u"&&(this.bgDomNode.style.bottom="0px"),typeof e.right<"u"&&(this.bgDomNode.style.right="0px"),this.domNode=document.createElement("div"),this.domNode.className=e.className,this.domNode.classList.add(...s.asClassNameArray(e.icon)),this.domNode.style.position="absolute",this.domNode.style.width=i+"px",this.domNode.style.height=i+"px",typeof e.top<"u"&&(this.domNode.style.top=e.top+"px"),typeof e.left<"u"&&(this.domNode.style.left=e.left+"px"),typeof e.bottom<"u"&&(this.domNode.style.bottom=e.bottom+"px"),typeof e.right<"u"&&(this.domNode.style.right=e.right+"px"),this._pointerMoveMonitor=this._register(new r),this._register(t.addStandardDisposableListener(this.bgDomNode,t.EventType.POINTER_DOWN,o=>this._arrowPointerDown(o))),this._register(t.addStandardDisposableListener(this.domNode,t.EventType.POINTER_DOWN,o=>this._arrowPointerDown(o))),this._pointerdownRepeatTimer=this._register(new t.WindowIntervalTimer),this._pointerdownScheduleRepeatTimer=this._register(new d)}_arrowPointerDown(e){if(!e.target||!(e.target instanceof Element))return;const o=()=>{this._pointerdownRepeatTimer.cancelAndSet(()=>this._onActivate(),1e3/24,t.getWindow(e))};this._onActivate(),this._pointerdownRepeatTimer.cancel(),this._pointerdownScheduleRepeatTimer.cancelAndSet(o,200),this._pointerMoveMonitor.startMonitoring(e.target,e.pointerId,e.buttons,a=>{},()=>{this._pointerdownRepeatTimer.cancel(),this._pointerdownScheduleRepeatTimer.cancel()}),e.preventDefault()}}export{i as ARROW_IMG_SIZE,b as ScrollbarArrow};

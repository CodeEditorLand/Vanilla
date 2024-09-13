import"../colorPicker.css";import*as n from"../../../../../base/browser/dom.js";import{GlobalPointerMoveMonitor as l}from"../../../../../base/browser/globalPointerMoveMonitor.js";import{Color as r,HSVA as d}from"../../../../../base/common/color.js";import{Emitter as a}from"../../../../../base/common/event.js";import{Disposable as m}from"../../../../../base/common/lifecycle.js";const h=n.$;class C extends m{constructor(t,i,o){super();this.model=i;this.pixelRatio=o;this._domNode=h(".saturation-wrap"),n.append(t,this._domNode),this._canvas=document.createElement("canvas"),this._canvas.className="saturation-box",n.append(this._domNode,this._canvas),this.selection=h(".saturation-selection"),n.append(this._domNode,this.selection),this.layout(),this._register(n.addDisposableListener(this._domNode,n.EventType.POINTER_DOWN,e=>this.onPointerDown(e))),this._register(this.model.onDidChangeColor(this.onDidChangeColor,this)),this.monitor=null}_domNode;selection;_canvas;width;height;monitor;_onDidChange=new a;onDidChange=this._onDidChange.event;_onColorFlushed=new a;onColorFlushed=this._onColorFlushed.event;get domNode(){return this._domNode}get canvas(){return this._canvas}onPointerDown(t){if(!t.target||!(t.target instanceof Element))return;this.monitor=this._register(new l);const i=n.getDomNodePagePosition(this._domNode);t.target!==this.selection&&this.onDidChangePosition(t.offsetX,t.offsetY),this.monitor.startMonitoring(t.target,t.pointerId,t.buttons,e=>this.onDidChangePosition(e.pageX-i.left,e.pageY-i.top),()=>null);const o=n.addDisposableListener(t.target.ownerDocument,n.EventType.POINTER_UP,()=>{this._onColorFlushed.fire(),o.dispose(),this.monitor&&(this.monitor.stopMonitoring(!0),this.monitor=null)},!0)}onDidChangePosition(t,i){const o=Math.max(0,Math.min(1,t/this.width)),e=Math.max(0,Math.min(1,1-i/this.height));this.paintSelection(o,e),this._onDidChange.fire({s:o,v:e})}layout(){this.width=this._domNode.offsetWidth,this.height=this._domNode.offsetHeight,this._canvas.width=this.width*this.pixelRatio,this._canvas.height=this.height*this.pixelRatio,this.paint();const t=this.model.color.hsva;this.paintSelection(t.s,t.v)}paint(){const t=this.model.color.hsva,i=new r(new d(t.h,1,1,1)),o=this._canvas.getContext("2d"),e=o.createLinearGradient(0,0,this._canvas.width,0);e.addColorStop(0,"rgba(255, 255, 255, 1)"),e.addColorStop(.5,"rgba(255, 255, 255, 0.5)"),e.addColorStop(1,"rgba(255, 255, 255, 0)");const s=o.createLinearGradient(0,0,0,this._canvas.height);s.addColorStop(0,"rgba(0, 0, 0, 0)"),s.addColorStop(1,"rgba(0, 0, 0, 1)"),o.rect(0,0,this._canvas.width,this._canvas.height),o.fillStyle=r.Format.CSS.format(i),o.fill(),o.fillStyle=e,o.fill(),o.fillStyle=s,o.fill()}paintSelection(t,i){this.selection.style.left=`${t*this.width}px`,this.selection.style.top=`${this.height-i*this.height}px`}onDidChangeColor(t){if(this.monitor&&this.monitor.isMonitoring())return;this.paint();const i=t.hsva;this.paintSelection(i.s,i.v)}}export{C as SaturationBox};

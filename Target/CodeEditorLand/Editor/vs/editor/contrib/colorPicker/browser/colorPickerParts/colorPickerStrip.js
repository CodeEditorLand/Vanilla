import"../colorPicker.css";import*as i from"../../../../../base/browser/dom.js";import{GlobalPointerMoveMonitor as g}from"../../../../../base/browser/globalPointerMoveMonitor.js";import{Color as l,RGBA as h}from"../../../../../base/common/color.js";import{Emitter as p}from"../../../../../base/common/event.js";import{Disposable as u}from"../../../../../base/common/lifecycle.js";import"../colorPickerModel.js";const n=i.$;class m extends u{constructor(e,o,r=!1){super();this.model=o;r?(this.domNode=i.append(e,n(".standalone-strip")),this.overlay=i.append(this.domNode,n(".standalone-overlay"))):(this.domNode=i.append(e,n(".strip")),this.overlay=i.append(this.domNode,n(".overlay"))),this.slider=i.append(this.domNode,n(".slider")),this.slider.style.top="0px",this._register(i.addDisposableListener(this.domNode,i.EventType.POINTER_DOWN,s=>this.onPointerDown(s))),this._register(o.onDidChangeColor(this.onDidChangeColor,this)),this.layout()}domNode;overlay;slider;height;_onDidChange=new p;onDidChange=this._onDidChange.event;_onColorFlushed=new p;onColorFlushed=this._onColorFlushed.event;layout(){this.height=this.domNode.offsetHeight-this.slider.offsetHeight;const e=this.getValue(this.model.color);this.updateSliderPosition(e)}onDidChangeColor(e){const o=this.getValue(e);this.updateSliderPosition(o)}onPointerDown(e){if(!e.target||!(e.target instanceof Element))return;const o=this._register(new g),r=i.getDomNodePagePosition(this.domNode);this.domNode.classList.add("grabbing"),e.target!==this.slider&&this.onDidChangeTop(e.offsetY),o.startMonitoring(e.target,e.pointerId,e.buttons,d=>this.onDidChangeTop(d.pageY-r.top),()=>null);const s=i.addDisposableListener(e.target.ownerDocument,i.EventType.POINTER_UP,()=>{this._onColorFlushed.fire(),s.dispose(),o.stopMonitoring(!0),this.domNode.classList.remove("grabbing")},!0)}onDidChangeTop(e){const o=Math.max(0,Math.min(1,1-e/this.height));this.updateSliderPosition(o),this._onDidChange.fire(o)}updateSliderPosition(e){this.slider.style.top=`${(1-e)*this.height}px`}}class P extends m{constructor(t,e,o=!1){super(t,e,o),this.domNode.classList.add("opacity-strip"),this.onDidChangeColor(this.model.color)}onDidChangeColor(t){super.onDidChangeColor(t);const{r:e,g:o,b:r}=t.rgba,s=new l(new h(e,o,r,1)),d=new l(new h(e,o,r,0));this.overlay.style.background=`linear-gradient(to bottom, ${s} 0%, ${d} 100%)`}getValue(t){return t.hsva.a}}class E extends m{constructor(t,e,o=!1){super(t,e,o),this.domNode.classList.add("hue-strip")}getValue(t){return 1-t.hsva.h/360}}export{E as HueStrip,P as OpacityStrip,m as Strip};

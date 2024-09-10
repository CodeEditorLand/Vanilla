import*as r from"../../base/browser/dom.js";import{GlobalPointerMoveMonitor as p}from"../../base/browser/globalPointerMoveMonitor.js";import{StandardMouseEvent as b}from"../../base/browser/mouseEvent.js";import{RunOnceScheduler as v}from"../../base/common/async.js";import{Disposable as E,DisposableStore as m}from"../../base/common/lifecycle.js";import"./editorBrowser.js";import{asCssVariable as h}from"../../platform/theme/common/colorRegistry.js";import"../../base/common/themables.js";class u{constructor(e,t){this.x=e;this.y=t}_pageCoordinatesBrand=void 0;toClientCoordinates(e){return new M(this.x-e.scrollX,this.y-e.scrollY)}}class M{constructor(e,t){this.clientX=e;this.clientY=t}_clientCoordinatesBrand=void 0;toPageCoordinates(e){return new u(this.clientX+e.scrollX,this.clientY+e.scrollY)}}class g{constructor(e,t,o,s){this.x=e;this.y=t;this.width=o;this.height=s}_editorPagePositionBrand=void 0}class y{constructor(e,t){this.x=e;this.y=t}_positionRelativeToEditorBrand=void 0}function _(i){const e=r.getDomNodePagePosition(i);return new g(e.left,e.top,e.width,e.height)}function C(i,e,t){const o=e.width/i.offsetWidth,s=e.height/i.offsetHeight,l=(t.x-e.x)/o,n=(t.y-e.y)/s;return new y(l,n)}class a extends b{_editorMouseEventBrand=void 0;isFromPointerCapture;pos;editorPos;relativePos;constructor(e,t,o){super(r.getWindow(o),e),this.isFromPointerCapture=t,this.pos=new u(this.posx,this.posy),this.editorPos=_(o),this.relativePos=C(o,this.editorPos,this.pos)}}class O{_editorViewDomNode;constructor(e){this._editorViewDomNode=e}_create(e){return new a(e,!1,this._editorViewDomNode)}onContextMenu(e,t){return r.addDisposableListener(e,"contextmenu",o=>{t(this._create(o))})}onMouseUp(e,t){return r.addDisposableListener(e,"mouseup",o=>{t(this._create(o))})}onMouseDown(e,t){return r.addDisposableListener(e,r.EventType.MOUSE_DOWN,o=>{t(this._create(o))})}onPointerDown(e,t){return r.addDisposableListener(e,r.EventType.POINTER_DOWN,o=>{t(this._create(o),o.pointerId)})}onMouseLeave(e,t){return r.addDisposableListener(e,r.EventType.MOUSE_LEAVE,o=>{t(this._create(o))})}onMouseMove(e,t){return r.addDisposableListener(e,"mousemove",o=>t(this._create(o)))}}class V{_editorViewDomNode;constructor(e){this._editorViewDomNode=e}_create(e){return new a(e,!1,this._editorViewDomNode)}onPointerUp(e,t){return r.addDisposableListener(e,"pointerup",o=>{t(this._create(o))})}onPointerDown(e,t){return r.addDisposableListener(e,r.EventType.POINTER_DOWN,o=>{t(this._create(o),o.pointerId)})}onPointerLeave(e,t){return r.addDisposableListener(e,r.EventType.POINTER_LEAVE,o=>{t(this._create(o))})}onPointerMove(e,t){return r.addDisposableListener(e,"pointermove",o=>t(this._create(o)))}}class k extends E{_editorViewDomNode;_globalPointerMoveMonitor;_keydownListener;constructor(e){super(),this._editorViewDomNode=e,this._globalPointerMoveMonitor=this._register(new p),this._keydownListener=null}startMonitoring(e,t,o,s,l){this._keydownListener=r.addStandardDisposableListener(e.ownerDocument,"keydown",n=>{n.toKeyCodeChord().isModifierKey()||this._globalPointerMoveMonitor.stopMonitoring(!0,n.browserEvent)},!0),this._globalPointerMoveMonitor.startMonitoring(e,t,o,n=>{s(new a(n,!0,this._editorViewDomNode))},n=>{this._keydownListener.dispose(),l(n)})}stopMonitoring(){this._globalPointerMoveMonitor.stopMonitoring(!0)}}class c{constructor(e){this._editor=e}static _idPool=0;_instanceId=++c._idPool;_counter=0;_rules=new Map;_garbageCollectionScheduler=new v(()=>this.garbageCollect(),1e3);createClassNameRef(e){const t=this.getOrCreateRule(e);return t.increaseRefCount(),{className:t.className,dispose:()=>{t.decreaseRefCount(),this._garbageCollectionScheduler.schedule()}}}getOrCreateRule(e){const t=this.computeUniqueKey(e);let o=this._rules.get(t);if(!o){const s=this._counter++;o=new f(t,`dyn-rule-${this._instanceId}-${s}`,r.isInShadowDOM(this._editor.getContainerDomNode())?this._editor.getContainerDomNode():void 0,e),this._rules.set(t,o)}return o}computeUniqueKey(e){return JSON.stringify(e)}garbageCollect(){for(const e of this._rules.values())e.hasReferences()||(this._rules.delete(e.key),e.dispose())}}class f{constructor(e,t,o,s){this.key=e;this.className=t;this.properties=s;this._styleElementDisposables=new m,this._styleElement=r.createStyleSheet(o,void 0,this._styleElementDisposables),this._styleElement.textContent=this.getCssText(this.className,this.properties)}_referenceCount=0;_styleElement;_styleElementDisposables;getCssText(e,t){let o=`.${e} {`;for(const s in t){const l=t[s];let n;typeof l=="object"?n=h(l.id):n=l;const d=D(s);o+=`
	${d}: ${n};`}return o+=`
}`,o}dispose(){this._styleElementDisposables.dispose(),this._styleElement=void 0}increaseRefCount(){this._referenceCount++}decreaseRefCount(){this._referenceCount--}hasReferences(){return this._referenceCount>0}}function D(i){return i.replace(/(^[A-Z])/,([e])=>e.toLowerCase()).replace(/([A-Z])/g,([e])=>`-${e.toLowerCase()}`)}export{M as ClientCoordinates,y as CoordinatesRelativeToEditor,c as DynamicCssRules,a as EditorMouseEvent,O as EditorMouseEventFactory,g as EditorPagePosition,V as EditorPointerEventFactory,k as GlobalEditorPointerMoveMonitor,u as PageCoordinates,C as createCoordinatesRelativeToEditor,_ as createEditorPagePosition};

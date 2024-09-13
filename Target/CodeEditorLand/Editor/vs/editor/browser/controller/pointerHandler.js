import{BrowserFeatures as m}from"../../../base/browser/canIUse.js";import*as r from"../../../base/browser/dom.js";import{EventType as n,Gesture as u}from"../../../base/browser/touch.js";import{mainWindow as w}from"../../../base/browser/window.js";import{Disposable as f}from"../../../base/common/lifecycle.js";import*as p from"../../../base/common/platform.js";import{NavigationCommandRevealType as v}from"../coreCommands.js";import{MouseTargetType as T}from"../editorBrowser.js";import{EditorMouseEvent as l,EditorPointerEventFactory as c}from"../editorDom.js";import{TextAreaSyntethicEvents as g}from"./editContext/textArea/textAreaEditContextInput.js";import{MouseHandler as h}from"./mouseHandler.js";class _ extends h{_lastPointerType;constructor(e,t,i){super(e,t,i),this._register(u.addTarget(this.viewHelper.linesContentDomNode)),this._register(r.addDisposableListener(this.viewHelper.linesContentDomNode,n.Tap,o=>this.onTap(o))),this._register(r.addDisposableListener(this.viewHelper.linesContentDomNode,n.Change,o=>this.onChange(o))),this._register(r.addDisposableListener(this.viewHelper.linesContentDomNode,n.Contextmenu,o=>this._onContextMenu(new l(o,!1,this.viewHelper.viewDomNode),!1))),this._lastPointerType="mouse",this._register(r.addDisposableListener(this.viewHelper.linesContentDomNode,"pointerdown",o=>{const a=o.pointerType;if(a==="mouse"){this._lastPointerType="mouse";return}else a==="touch"?this._lastPointerType="touch":this._lastPointerType="pen"}));const s=new c(this.viewHelper.viewDomNode);this._register(s.onPointerMove(this.viewHelper.viewDomNode,o=>this._onMouseMove(o))),this._register(s.onPointerUp(this.viewHelper.viewDomNode,o=>this._onMouseUp(o))),this._register(s.onPointerLeave(this.viewHelper.viewDomNode,o=>this._onMouseLeave(o))),this._register(s.onPointerDown(this.viewHelper.viewDomNode,(o,a)=>this._onMouseDown(o,a)))}onTap(e){!e.initialTarget||!this.viewHelper.linesContentDomNode.contains(e.initialTarget)||(e.preventDefault(),this.viewHelper.focusTextArea(),this._dispatchGesture(e,!1))}onChange(e){this._lastPointerType==="touch"&&this._context.viewModel.viewLayout.deltaScrollNow(-e.translationX,-e.translationY),this._lastPointerType==="pen"&&this._dispatchGesture(e,!0)}_dispatchGesture(e,t){const i=this._createMouseTarget(new l(e,!1,this.viewHelper.viewDomNode),!1);i.position&&this.viewController.dispatchMouse({position:i.position,mouseColumn:i.position.column,startedOnLineNumbers:!1,revealType:v.Minimal,mouseDownCount:e.tapCount,inSelectionMode:t,altKey:!1,ctrlKey:!1,metaKey:!1,shiftKey:!1,leftButton:!1,middleButton:!1,onInjectedText:i.type===T.CONTENT_TEXT&&i.detail.injectedText!==null})}_onMouseDown(e,t){e.browserEvent.pointerType!=="touch"&&super._onMouseDown(e,t)}}class C extends h{constructor(e,t,i){super(e,t,i),this._register(u.addTarget(this.viewHelper.linesContentDomNode)),this._register(r.addDisposableListener(this.viewHelper.linesContentDomNode,n.Tap,s=>this.onTap(s))),this._register(r.addDisposableListener(this.viewHelper.linesContentDomNode,n.Change,s=>this.onChange(s))),this._register(r.addDisposableListener(this.viewHelper.linesContentDomNode,n.Contextmenu,s=>this._onContextMenu(new l(s,!1,this.viewHelper.viewDomNode),!1)))}onTap(e){e.preventDefault(),this.viewHelper.focusTextArea();const t=this._createMouseTarget(new l(e,!1,this.viewHelper.viewDomNode),!1);if(t.position){const i=document.createEvent("CustomEvent");i.initEvent(g.Tap,!1,!0),this.viewHelper.dispatchTextAreaEvent(i),this.viewController.moveTo(t.position,v.Minimal)}}onChange(e){this._context.viewModel.viewLayout.deltaScrollNow(-e.translationX,-e.translationY)}}class L extends f{handler;constructor(e,t,i){super(),(p.isIOS||p.isAndroid&&p.isMobile)&&m.pointerEvents?this.handler=this._register(new _(e,t,i)):w.TouchEvent?this.handler=this._register(new C(e,t,i)):this.handler=this._register(new h(e,t,i))}getTargetAtClientPoint(e,t){return this.handler.getTargetAtClientPoint(e,t)}}export{_ as PointerEventHandler,L as PointerHandler};

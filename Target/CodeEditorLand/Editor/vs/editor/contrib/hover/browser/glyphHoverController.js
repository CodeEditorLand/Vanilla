var _=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var v=(s,i,e,t)=>{for(var o=t>1?void 0:t?p(i,e):i,d=s.length-1,h;d>=0;d--)(h=s[d])&&(o=(t?h(i,e,o):h(o))||o);return t&&o&&_(i,e,o),o},u=(s,i)=>(e,t)=>i(e,t,s);import"../../../../base/browser/keyboardEvent.js";import{KeyCode as n}from"../../../../base/common/keyCodes.js";import{Disposable as g,DisposableStore as c}from"../../../../base/common/lifecycle.js";import"../../../browser/editorBrowser.js";import{EditorOption as l}from"../../../common/config/editorOptions.js";import"../../../common/editorCommon.js";import{IInstantiationService as M}from"../../../../platform/instantiation/common/instantiation.js";import"./hoverTypes.js";import{RunOnceScheduler as E}from"../../../../base/common/async.js";import{isMousePositionWithinElement as y}from"./hoverUtils.js";import"./hover.css";import{GlyphHoverWidget as S}from"./glyphHoverWidget.js";const a=!1;let r=class extends g{constructor(e,t){super();this._editor=e;this._instantiationService=t;this._reactToEditorMouseMoveRunner=this._register(new E(()=>this._reactToEditorMouseMove(this._mouseMoveEvent),0)),this._hookListeners(),this._register(this._editor.onDidChangeConfiguration(o=>{o.hasChanged(l.hover)&&(this._unhookListeners(),this._hookListeners())}))}static ID="editor.contrib.marginHover";shouldKeepOpenOnEditorMouseMoveOrLeave=!1;_listenersStore=new c;_glyphWidget;_mouseMoveEvent;_reactToEditorMouseMoveRunner;_hoverSettings;_hoverState={mouseDown:!1};static get(e){return e.getContribution(r.ID)}_hookListeners(){const e=this._editor.getOption(l.hover);this._hoverSettings={enabled:e.enabled,sticky:e.sticky,hidingDelay:e.hidingDelay},e.enabled?(this._listenersStore.add(this._editor.onMouseDown(t=>this._onEditorMouseDown(t))),this._listenersStore.add(this._editor.onMouseUp(()=>this._onEditorMouseUp())),this._listenersStore.add(this._editor.onMouseMove(t=>this._onEditorMouseMove(t))),this._listenersStore.add(this._editor.onKeyDown(t=>this._onKeyDown(t)))):(this._listenersStore.add(this._editor.onMouseMove(t=>this._onEditorMouseMove(t))),this._listenersStore.add(this._editor.onKeyDown(t=>this._onKeyDown(t)))),this._listenersStore.add(this._editor.onMouseLeave(t=>this._onEditorMouseLeave(t))),this._listenersStore.add(this._editor.onDidChangeModel(()=>{this._cancelScheduler(),this._hideWidgets()})),this._listenersStore.add(this._editor.onDidChangeModelContent(()=>this._cancelScheduler())),this._listenersStore.add(this._editor.onDidScrollChange(t=>this._onEditorScrollChanged(t)))}_unhookListeners(){this._listenersStore.clear()}_cancelScheduler(){this._mouseMoveEvent=void 0,this._reactToEditorMouseMoveRunner.cancel()}_onEditorScrollChanged(e){(e.scrollTopChanged||e.scrollLeftChanged)&&this._hideWidgets()}_onEditorMouseDown(e){this._hoverState.mouseDown=!0,!this._isMouseOnGlyphHoverWidget(e)&&this._hideWidgets()}_isMouseOnGlyphHoverWidget(e){const t=this._glyphWidget?.getDomNode();return t?y(t,e.event.posx,e.event.posy):!1}_onEditorMouseUp(){this._hoverState.mouseDown=!1}_onEditorMouseLeave(e){this.shouldKeepOpenOnEditorMouseMoveOrLeave||(this._cancelScheduler(),this._isMouseOnGlyphHoverWidget(e))||a||this._hideWidgets()}_shouldNotRecomputeCurrentHoverWidget(e){const t=this._hoverSettings.sticky,o=this._isMouseOnGlyphHoverWidget(e);return t&&o}_onEditorMouseMove(e){if(this.shouldKeepOpenOnEditorMouseMoveOrLeave)return;if(this._mouseMoveEvent=e,this._shouldNotRecomputeCurrentHoverWidget(e)){this._reactToEditorMouseMoveRunner.cancel();return}this._reactToEditorMouseMove(e)}_reactToEditorMouseMove(e){!e||this._tryShowHoverWidget(e)||a||this._hideWidgets()}_tryShowHoverWidget(e){return this._getOrCreateGlyphWidget().showsOrWillShow(e)}_onKeyDown(e){this._editor.hasModel()&&(e.keyCode===n.Ctrl||e.keyCode===n.Alt||e.keyCode===n.Meta||e.keyCode===n.Shift||this._hideWidgets())}_hideWidgets(){a||this._glyphWidget?.hide()}_getOrCreateGlyphWidget(){return this._glyphWidget||(this._glyphWidget=this._instantiationService.createInstance(S,this._editor)),this._glyphWidget}hideContentHover(){this._hideWidgets()}dispose(){super.dispose(),this._unhookListeners(),this._listenersStore.dispose(),this._glyphWidget?.dispose()}};r=v([u(1,M)],r);export{r as GlyphHoverController};

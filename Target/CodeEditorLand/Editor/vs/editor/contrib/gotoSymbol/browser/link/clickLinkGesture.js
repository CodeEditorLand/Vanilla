import{Emitter as l}from"../../../../../base/common/event.js";import{KeyCode as o}from"../../../../../base/common/keyCodes.js";import{Disposable as M}from"../../../../../base/common/lifecycle.js";import*as g from"../../../../../base/common/platform.js";import{EditorOption as d}from"../../../../common/config/editorOptions.js";function a(r,e){return!!r[e]}class u{target;hasTriggerModifier;hasSideBySideModifier;isNoneOrSingleMouseDown;isLeftClick;isMiddleClick;isRightClick;constructor(e,t){this.target=e.target,this.isLeftClick=e.event.leftButton,this.isMiddleClick=e.event.middleButton,this.isRightClick=e.event.rightButton,this.hasTriggerModifier=a(e.event,t.triggerModifier),this.hasSideBySideModifier=a(e.event,t.triggerSideBySideModifier),this.isNoneOrSingleMouseDown=e.event.detail<=1}}class h{keyCodeIsTriggerKey;keyCodeIsSideBySideKey;hasTriggerModifier;constructor(e,t){this.keyCodeIsTriggerKey=e.keyCode===t.triggerKey,this.keyCodeIsSideBySideKey=e.keyCode===t.triggerSideBySideKey,this.hasTriggerModifier=a(e,t.triggerModifier)}}class s{triggerKey;triggerModifier;triggerSideBySideKey;triggerSideBySideModifier;constructor(e,t,i,n){this.triggerKey=e,this.triggerModifier=t,this.triggerSideBySideKey=i,this.triggerSideBySideModifier=n}equals(e){return this.triggerKey===e.triggerKey&&this.triggerModifier===e.triggerModifier&&this.triggerSideBySideKey===e.triggerSideBySideKey&&this.triggerSideBySideModifier===e.triggerSideBySideModifier}}function y(r){return r==="altKey"?g.isMacintosh?new s(o.Meta,"metaKey",o.Alt,"altKey"):new s(o.Ctrl,"ctrlKey",o.Alt,"altKey"):g.isMacintosh?new s(o.Alt,"altKey",o.Meta,"metaKey"):new s(o.Alt,"altKey",o.Ctrl,"ctrlKey")}class S extends M{_onMouseMoveOrRelevantKeyDown=this._register(new l);onMouseMoveOrRelevantKeyDown=this._onMouseMoveOrRelevantKeyDown.event;_onExecute=this._register(new l);onExecute=this._onExecute.event;_onCancel=this._register(new l);onCancel=this._onCancel.event;_editor;_extractLineNumberFromMouseEvent;_opts;_lastMouseMoveEvent;_hasTriggerKeyOnMouseDown;_lineNumberOnMouseDown;constructor(e,t){super(),this._editor=e,this._extractLineNumberFromMouseEvent=t?.extractLineNumberFromMouseEvent??(i=>i.target.position?i.target.position.lineNumber:0),this._opts=y(this._editor.getOption(d.multiCursorModifier)),this._lastMouseMoveEvent=null,this._hasTriggerKeyOnMouseDown=!1,this._lineNumberOnMouseDown=0,this._register(this._editor.onDidChangeConfiguration(i=>{if(i.hasChanged(d.multiCursorModifier)){const n=y(this._editor.getOption(d.multiCursorModifier));if(this._opts.equals(n))return;this._opts=n,this._lastMouseMoveEvent=null,this._hasTriggerKeyOnMouseDown=!1,this._lineNumberOnMouseDown=0,this._onCancel.fire()}})),this._register(this._editor.onMouseMove(i=>this._onEditorMouseMove(new u(i,this._opts)))),this._register(this._editor.onMouseDown(i=>this._onEditorMouseDown(new u(i,this._opts)))),this._register(this._editor.onMouseUp(i=>this._onEditorMouseUp(new u(i,this._opts)))),this._register(this._editor.onKeyDown(i=>this._onEditorKeyDown(new h(i,this._opts)))),this._register(this._editor.onKeyUp(i=>this._onEditorKeyUp(new h(i,this._opts)))),this._register(this._editor.onMouseDrag(()=>this._resetHandler())),this._register(this._editor.onDidChangeCursorSelection(i=>this._onDidChangeCursorSelection(i))),this._register(this._editor.onDidChangeModel(i=>this._resetHandler())),this._register(this._editor.onDidChangeModelContent(()=>this._resetHandler())),this._register(this._editor.onDidScrollChange(i=>{(i.scrollTopChanged||i.scrollLeftChanged)&&this._resetHandler()}))}_onDidChangeCursorSelection(e){e.selection&&e.selection.startColumn!==e.selection.endColumn&&this._resetHandler()}_onEditorMouseMove(e){this._lastMouseMoveEvent=e,this._onMouseMoveOrRelevantKeyDown.fire([e,null])}_onEditorMouseDown(e){this._hasTriggerKeyOnMouseDown=e.hasTriggerModifier,this._lineNumberOnMouseDown=this._extractLineNumberFromMouseEvent(e)}_onEditorMouseUp(e){const t=this._extractLineNumberFromMouseEvent(e);this._hasTriggerKeyOnMouseDown&&this._lineNumberOnMouseDown&&this._lineNumberOnMouseDown===t&&this._onExecute.fire(e)}_onEditorKeyDown(e){this._lastMouseMoveEvent&&(e.keyCodeIsTriggerKey||e.keyCodeIsSideBySideKey&&e.hasTriggerModifier)?this._onMouseMoveOrRelevantKeyDown.fire([this._lastMouseMoveEvent,e]):e.hasTriggerModifier&&this._onCancel.fire()}_onEditorKeyUp(e){e.keyCodeIsTriggerKey&&this._onCancel.fire()}_resetHandler(){this._lastMouseMoveEvent=null,this._hasTriggerKeyOnMouseDown=!1,this._onCancel.fire()}}export{S as ClickLinkGesture,h as ClickLinkKeyboardEvent,u as ClickLinkMouseEvent,s as ClickLinkOptions};

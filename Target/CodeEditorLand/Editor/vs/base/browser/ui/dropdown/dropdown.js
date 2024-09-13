import{ActionRunner as v}from"../../../common/actions.js";import{Emitter as c}from"../../../common/event.js";import{KeyCode as l}from"../../../common/keyCodes.js";import{$ as d,EventHelper as h,EventType as s,addDisposableListener as r,append as p,isMouseEvent as f}from"../../dom.js";import{StandardKeyboardEvent as b}from"../../keyboardEvent.js";import{Gesture as g,EventType as m}from"../../touch.js";import{AnchorAlignment as _}from"../contextview/contextview.js";import{getBaseLayerHoverDelegate as y}from"../hover/hoverDelegate2.js";import{getDefaultHoverDelegate as I}from"../hover/hoverDelegateFactory.js";import"./dropdown.css";class O extends v{_element;boxContainer;_label;contents;visible;_onDidChangeVisibility=this._register(new c);onDidChangeVisibility=this._onDidChangeVisibility.event;hover;constructor(o,e){super(),this._element=p(o,d(".monaco-dropdown")),this._label=p(this._element,d(".dropdown-label"));let t=e.labelRenderer;t||(t=i=>(i.textContent=e.label||"",null));for(const i of[s.CLICK,s.MOUSE_DOWN,m.Tap])this._register(r(this.element,i,n=>h.stop(n,!0)));for(const i of[s.MOUSE_DOWN,m.Tap])this._register(r(this._label,i,n=>{f(n)&&(n.detail>1||n.button!==0)||(this.visible?this.hide():this.show())}));this._register(r(this._label,s.KEY_UP,i=>{const n=new b(i);(n.equals(l.Enter)||n.equals(l.Space))&&(h.stop(i,!0),this.visible?this.hide():this.show())}));const a=t(this._label);a&&this._register(a),this._register(g.addTarget(this._label))}get element(){return this._element}get label(){return this._label}set tooltip(o){this._label&&(!this.hover&&o!==""?this.hover=this._register(y().setupManagedHover(I("mouse"),this._label,o)):this.hover&&this.hover.update(o))}show(){this.visible||(this.visible=!0,this._onDidChangeVisibility.fire(!0))}hide(){this.visible&&(this.visible=!1,this._onDidChangeVisibility.fire(!1))}isVisible(){return!!this.visible}onEvent(o,e){this.hide()}dispose(){super.dispose(),this.hide(),this.boxContainer&&(this.boxContainer.remove(),this.boxContainer=void 0),this.contents&&(this.contents.remove(),this.contents=void 0),this._label&&(this._label.remove(),this._label=void 0)}}class P extends O{constructor(e,t){super(e,t);this._options=t;this.actions=t.actions||[]}_menuOptions;_actions=[];set menuOptions(e){this._menuOptions=e}get menuOptions(){return this._menuOptions}get actions(){return this._options.actionProvider?this._options.actionProvider.getActions():this._actions}set actions(e){this._actions=e}show(){super.show(),this.element.classList.add("active"),this._options.contextMenuProvider.showContextMenu({getAnchor:()=>this.element,getActions:()=>this.actions,getActionsContext:()=>this.menuOptions?this.menuOptions.context:null,getActionViewItem:(e,t)=>this.menuOptions&&this.menuOptions.actionViewItemProvider?this.menuOptions.actionViewItemProvider(e,t):void 0,getKeyBinding:e=>this.menuOptions&&this.menuOptions.getKeyBinding?this.menuOptions.getKeyBinding(e):void 0,getMenuClassName:()=>this._options.menuClassName||"",onHide:()=>this.onHide(),actionRunner:this.menuOptions?this.menuOptions.actionRunner:void 0,anchorAlignment:this.menuOptions?this.menuOptions.anchorAlignment:_.LEFT,domForShadowRoot:this._options.menuAsChild?this.element:void 0,skipTelemetry:this._options.skipTelemetry})}hide(){super.hide()}onHide(){this.hide(),this.element.classList.remove("active")}}export{P as DropdownMenu};

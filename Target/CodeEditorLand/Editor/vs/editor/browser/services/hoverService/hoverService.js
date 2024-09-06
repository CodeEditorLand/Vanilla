var F=Object.defineProperty;var K=Object.getOwnPropertyDescriptor;var E=(i,s,e,t)=>{for(var n=t>1?void 0:t?K(s,e):s,l=i.length-1,d;l>=0;l--)(d=i[l])&&(n=(t?d(s,e,n):d(n))||n);return t&&n&&F(s,e,n),n},H=(i,s)=>(e,t)=>s(e,t,i);import{addDisposableListener as u,EventType as v,getActiveElement as D,getWindow as g,isAncestor as U,isAncestorOfActiveElement as V,isEditableElement as A,isHTMLElement as I}from"../../../../base/browser/dom.js";import{StandardKeyboardEvent as B}from"../../../../base/browser/keyboardEvent.js";import"../../../../base/browser/ui/contextview/contextview.js";import{mainWindow as P}from"../../../../base/browser/window.js";import{TimeoutTimer as N}from"../../../../base/common/async.js";import{Disposable as R,DisposableStore as w,toDisposable as Y}from"../../../../base/common/lifecycle.js";import{IAccessibilityService as j}from"../../../../platform/accessibility/common/accessibility.js";import{IContextMenuService as $}from"../../../../platform/contextview/browser/contextView.js";import{ContextViewHandler as q}from"../../../../platform/contextview/browser/contextViewService.js";import{IHoverService as z}from"../../../../platform/hover/browser/hover.js";import{InstantiationType as G,registerSingleton as J}from"../../../../platform/instantiation/common/extensions.js";import{IInstantiationService as Q}from"../../../../platform/instantiation/common/instantiation.js";import{IKeybindingService as X}from"../../../../platform/keybinding/common/keybinding.js";import{ResultKind as Z}from"../../../../platform/keybinding/common/keybindingResolver.js";import{ILayoutService as ee}from"../../../../platform/layout/browser/layoutService.js";import{editorHoverBorder as te}from"../../../../platform/theme/common/colorRegistry.js";import{registerThemingParticipant as re}from"../../../../platform/theme/common/themeService.js";import{HoverWidget as oe}from"./hoverWidget.js";import{ManagedHoverWidget as ie}from"./updatableHoverWidget.js";let _=class extends R{constructor(e,t,n,l,d){super();this._instantiationService=e;this._keybindingService=n;this._layoutService=l;this._accessibilityService=d;t.onDidShowContextMenu(()=>this.hideHover()),this._contextViewHandler=this._register(new q(this._layoutService))}_contextViewHandler;_currentHoverOptions;_currentHover;_lastHoverOptions;_lastFocusedElementBeforeOpen;showHover(e,t,n){if(S(this._currentHoverOptions)===S(e)||this._currentHover&&this._currentHoverOptions?.persistence?.sticky)return;this._currentHoverOptions=e,this._lastHoverOptions=e;const l=e.trapFocus||this._accessibilityService.isScreenReaderOptimized(),d=D();n||(l&&d?d.classList.contains("monaco-hover")||(this._lastFocusedElementBeforeOpen=d):this._lastFocusedElementBeforeOpen=void 0);const r=new w,o=this._instantiationService.createInstance(oe,e);if(e.persistence?.sticky&&(o.isLocked=!0),o.onDispose(()=>{this._currentHover?.domNode&&V(this._currentHover.domNode)&&this._lastFocusedElementBeforeOpen?.focus(),this._currentHoverOptions===e&&(this._currentHoverOptions=void 0),r.dispose()},void 0,r),!e.container){const a=I(e.target)?e.target:e.target.targetElements[0];e.container=this._layoutService.getContainer(g(a))}if(this._contextViewHandler.showContextView(new ne(o,t),e.container),o.onRequestLayout(()=>this._contextViewHandler.layout(),void 0,r),e.persistence?.sticky)r.add(u(g(e.container).document,v.MOUSE_DOWN,a=>{U(a.target,o.domNode)||this.doHideHover()}));else{if("targetElements"in e.target)for(const f of e.target.targetElements)r.add(u(f,v.CLICK,()=>this.hideHover()));else r.add(u(e.target,v.CLICK,()=>this.hideHover()));const a=D();if(a){const f=g(a).document;r.add(u(a,v.KEY_DOWN,p=>this._keyDown(p,o,!!e.persistence?.hideOnKeyDown))),r.add(u(f,v.KEY_DOWN,p=>this._keyDown(p,o,!!e.persistence?.hideOnKeyDown))),r.add(u(a,v.KEY_UP,p=>this._keyUp(p,o))),r.add(u(f,v.KEY_UP,p=>this._keyUp(p,o)))}}if("IntersectionObserver"in P){const a=new IntersectionObserver(p=>this._intersectionChange(p,o),{threshold:0}),f="targetElements"in e.target?e.target.targetElements[0]:e.target;a.observe(f),r.add(Y(()=>a.disconnect()))}return this._currentHover=o,o}hideHover(){this._currentHover?.isLocked||!this._currentHoverOptions||this.doHideHover()}doHideHover(){this._currentHover=void 0,this._currentHoverOptions=void 0,this._contextViewHandler.hideContextView()}_intersectionChange(e,t){e[e.length-1].isIntersecting||t.dispose()}showAndFocusLastHover(){this._lastHoverOptions&&this.showHover(this._lastHoverOptions,!0,!0)}_keyDown(e,t,n){if(e.key==="Alt"){t.isLocked=!0;return}const l=new B(e);this._keybindingService.resolveKeyboardEvent(l).getSingleModifierDispatchChords().some(r=>!!r)||this._keybindingService.softDispatch(l,l.target).kind!==Z.NoMatchingKb||n&&(!this._currentHoverOptions?.trapFocus||e.key!=="Tab")&&(this.hideHover(),this._lastFocusedElementBeforeOpen?.focus())}_keyUp(e,t){e.key==="Alt"&&(t.isLocked=!1,t.isMouseIn||(this.hideHover(),this._lastFocusedElementBeforeOpen?.focus()))}_managedHovers=new Map;setupManagedHover(e,t,n,l){t.setAttribute("custom-hover","true"),t.title!==""&&(console.warn("HTML element already has a title attribute, which will conflict with the custom hover. Please remove the title attribute."),console.trace("Stack trace:",t.title),t.title="");let d,r;const o=(c,h)=>{const m=r!==void 0;c&&(r?.dispose(),r=void 0),h&&(d?.dispose(),d=void 0),m&&(e.onDidHideHover?.(),r=void 0)},a=(c,h,m,y)=>new N(async()=>{(!r||r.isDisposed)&&(r=new ie(e,m||t,c>0),await r.update(typeof n=="function"?n():n,h,{...l,trapFocus:y}))},c);let f=!1;const p=u(t,v.MOUSE_DOWN,()=>{f=!0,o(!0,!0)},!0),k=u(t,v.MOUSE_UP,()=>{f=!1},!0),T=u(t,v.MOUSE_LEAVE,c=>{f=!1,o(!1,c.fromElement===t)},!0),x=c=>{if(d)return;const h=new w,m={targetElements:[t],dispose:()=>{}};if(e.placement===void 0||e.placement==="mouse"){const y=b=>{m.x=b.x+10,I(b.target)&&L(b.target,t)!==t&&o(!0,!0)};h.add(u(t,v.MOUSE_MOVE,y,!0))}d=h,!(I(c.target)&&L(c.target,t)!==t)&&h.add(a(e.delay,!1,m))},C=u(t,v.MOUSE_OVER,x,!0),W=()=>{if(f||d)return;const c={targetElements:[t],dispose:()=>{}},h=new w,m=()=>o(!0,!0);h.add(u(t,v.BLUR,m,!0)),h.add(a(e.delay,!1,c)),d=h};let O;A(t)||(O=u(t,v.FOCUS,W,!0));const M={show:c=>{o(!1,!0),a(0,c,void 0,c)},hide:()=>{o(!0,!0)},update:async(c,h)=>{n=c,await r?.update(n,void 0,h)},dispose:()=>{this._managedHovers.delete(t),C.dispose(),T.dispose(),p.dispose(),k.dispose(),O?.dispose(),o(!0,!0)}};return this._managedHovers.set(t,M),M}showManagedHover(e){const t=this._managedHovers.get(e);t&&t.show(!0)}dispose(){this._managedHovers.forEach(e=>e.dispose()),super.dispose()}};_=E([H(0,Q),H(1,$),H(2,X),H(3,ee),H(4,j)],_);function S(i){if(i!==void 0)return i?.id??i}class ne{constructor(s,e=!1){this._hover=s;this._focus=e}layer=1;get anchorPosition(){return this._hover.anchor}render(s){return this._hover.render(s),this._focus&&this._hover.focus(),this._hover}getAnchor(){return{x:this._hover.x,y:this._hover.y}}layout(){this._hover.layout()}}function L(i,s){for(s=s??g(i).document.body;!i.hasAttribute("custom-hover")&&i!==s;)i=i.parentElement;return i}J(z,_,G.Delayed),re((i,s)=>{const e=i.getColor(te);e&&(s.addRule(`.monaco-workbench .workbench-hover .hover-row:not(:first-child):not(:empty) { border-top: 1px solid ${e.transparent(.5)}; }`),s.addRule(`.monaco-workbench .workbench-hover hr { border-top: 1px solid ${e.transparent(.5)}; }`))});export{_ as HoverService};

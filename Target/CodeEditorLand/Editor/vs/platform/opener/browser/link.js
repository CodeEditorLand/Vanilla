var y=Object.defineProperty;var I=Object.getOwnPropertyDescriptor;var v=(o,i,e,t)=>{for(var r=t>1?void 0:t?I(i,e):i,n=o.length-1,s;n>=0;n--)(s=o[n])&&(r=(t?s(i,e,r):s(r))||r);return t&&r&&y(i,e,r),r},p=(o,i)=>(e,t)=>i(e,t,o);import{$ as D,append as E,EventHelper as x,clearNode as H}from"../../../base/browser/dom.js";import{DomEmitter as d}from"../../../base/browser/event.js";import{StandardKeyboardEvent as _}from"../../../base/browser/keyboardEvent.js";import{EventType as T,Gesture as L}from"../../../base/browser/touch.js";import{Event as f}from"../../../base/common/event.js";import{KeyCode as w}from"../../../base/common/keyCodes.js";import{Disposable as S}from"../../../base/common/lifecycle.js";import{IOpenerService as C}from"../common/opener.js";import"./link.css";import{getDefaultHoverDelegate as M}from"../../../base/browser/ui/hover/hoverDelegateFactory.js";import{IHoverService as O}from"../../hover/browser/hover.js";let a=class extends S{constructor(e,t,r={},n,s){super();this._link=t;this._hoverService=n;this.el=E(e,D("a.monaco-link",{tabIndex:t.tabIndex??0,href:t.href},t.label)),this.hoverDelegate=r.hoverDelegate??M("mouse"),this.setTooltip(t.title),this.el.setAttribute("role","button");const m=this._register(new d(this.el,"click")),b=this._register(new d(this.el,"keypress")),c=f.chain(b.event,l=>l.map(h=>new _(h)).filter(h=>h.keyCode===w.Enter)),g=this._register(new d(this.el,T.Tap)).event;this._register(L.addTarget(this.el));const u=f.any(m.event,c,g);this._register(u(l=>{this.enabled&&(x.stop(l,!0),r?.opener?r.opener(this._link.href):s.open(this._link.href,{allowCommands:!0}))})),this.enabled=!0}el;hover;hoverDelegate;_enabled=!0;get enabled(){return this._enabled}set enabled(e){e?(this.el.setAttribute("aria-disabled","false"),this.el.tabIndex=0,this.el.style.pointerEvents="auto",this.el.style.opacity="1",this.el.style.cursor="pointer",this._enabled=!1):(this.el.setAttribute("aria-disabled","true"),this.el.tabIndex=-1,this.el.style.pointerEvents="none",this.el.style.opacity="0.4",this.el.style.cursor="default",this._enabled=!0),this._enabled=e}set link(e){typeof e.label=="string"?this.el.textContent=e.label:(H(this.el),this.el.appendChild(e.label)),this.el.href=e.href,typeof e.tabIndex<"u"&&(this.el.tabIndex=e.tabIndex),this.setTooltip(e.title),this._link=e}setTooltip(e){this.hoverDelegate.showNativeHover?this.el.title=e??"":!this.hover&&e?this.hover=this._register(this._hoverService.setupManagedHover(this.hoverDelegate,this.el,e)):this.hover&&this.hover.update(e)}};a=v([p(3,O),p(4,C)],a);export{a as Link};

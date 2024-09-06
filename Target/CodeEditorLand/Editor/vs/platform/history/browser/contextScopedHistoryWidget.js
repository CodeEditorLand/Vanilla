var W=Object.defineProperty;var H=Object.getOwnPropertyDescriptor;var d=(s,e,t,i)=>{for(var o=i>1?void 0:i?H(e,t):e,n=s.length-1,r;n>=0;n--)(r=s[n])&&(o=(i?r(e,t,o):r(o))||o);return i&&o&&W(e,t,o),o},c=(s,e)=>(t,i)=>e(t,i,s);import{isActiveElement as A}from"../../../../vs/base/browser/dom.js";import"../../../../vs/base/browser/history.js";import"../../../../vs/base/browser/ui/contextview/contextview.js";import{FindInput as D}from"../../../../vs/base/browser/ui/findinput/findInput.js";import{ReplaceInput as F}from"../../../../vs/base/browser/ui/findinput/replaceInput.js";import{HistoryInputBox as V}from"../../../../vs/base/browser/ui/inputbox/inputBox.js";import{KeyCode as g,KeyMod as x}from"../../../../vs/base/common/keyCodes.js";import{DisposableStore as B,toDisposable as T}from"../../../../vs/base/common/lifecycle.js";import{localize as O}from"../../../../vs/nls.js";import{ContextKeyExpr as a,IContextKeyService as b,RawContextKey as u}from"../../../../vs/platform/contextkey/common/contextkey.js";import{KeybindingsRegistry as I,KeybindingWeight as C}from"../../../../vs/platform/keybinding/common/keybindingsRegistry.js";const N=new u("suggestWidgetVisible",!1,O("suggestWidgetVisible","Whether suggestion are visible")),v="historyNavigationWidgetFocus",K="historyNavigationForwardsEnabled",E="historyNavigationBackwardsEnabled";let l;const m=[];function w(s,e){if(m.includes(e))throw new Error("Cannot register the same widget multiple times");m.push(e);const t=new B,i=new u(v,!1).bindTo(s),o=new u(K,!0).bindTo(s),n=new u(E,!0).bindTo(s),r=()=>{i.set(!0),l=e},f=()=>{i.set(!1),l===e&&(l=void 0)};return A(e.element)&&r(),t.add(e.onDidFocus(()=>r())),t.add(e.onDidBlur(()=>f())),t.add(T(()=>{m.splice(m.indexOf(e),1),f()})),{historyNavigationForwardsEnablement:o,historyNavigationBackwardsEnablement:n,dispose(){t.dispose()}}}let h=class extends V{constructor(e,t,i,o){super(e,t,i);const n=this._register(o.createScoped(this.element));this._register(w(n,this))}};h=d([c(3,b)],h);let y=class extends D{constructor(e,t,i,o){super(e,t,i);const n=this._register(o.createScoped(this.inputBox.element));this._register(w(n,this.inputBox))}};y=d([c(3,b)],y);let p=class extends F{constructor(e,t,i,o,n=!1){super(e,t,n,i);const r=this._register(o.createScoped(this.inputBox.element));this._register(w(r,this.inputBox))}};p=d([c(3,b)],p),I.registerCommandAndKeybindingRule({id:"history.showPrevious",weight:C.WorkbenchContrib,when:a.and(a.has(v),a.equals(E,!0),a.not("isComposing"),N.isEqualTo(!1)),primary:g.UpArrow,secondary:[x.Alt|g.UpArrow],handler:s=>{l?.showPreviousValue()}}),I.registerCommandAndKeybindingRule({id:"history.showNext",weight:C.WorkbenchContrib,when:a.and(a.has(v),a.equals(K,!0),a.not("isComposing"),N.isEqualTo(!1)),primary:g.DownArrow,secondary:[x.Alt|g.DownArrow],handler:s=>{l?.showNextValue()}});export{y as ContextScopedFindInput,h as ContextScopedHistoryInputBox,p as ContextScopedReplaceInput,N as historyNavigationVisible,w as registerAndCreateHistoryNavigationContext};

var l=Object.defineProperty;var C=Object.getOwnPropertyDescriptor;var V=(s,n,e,t)=>{for(var i=t>1?void 0:t?C(n,e):n,o=s.length-1,r;o>=0;o--)(r=s[o])&&(i=(t?r(n,e,i):r(i))||i);return t&&i&&l(n,e,i),i},a=(s,n)=>(e,t)=>n(e,t,s);import{getWindow as p}from"../../../../vs/base/browser/dom.js";import{ContextView as c,ContextViewDOMPosition as w}from"../../../../vs/base/browser/ui/contextview/contextview.js";import{Disposable as d}from"../../../../vs/base/common/lifecycle.js";import{ILayoutService as h}from"../../../../vs/platform/layout/browser/layoutService.js";import"./contextView.js";let x=class extends d{constructor(e){super();this.layoutService=e;this.layout(),this._register(e.onDidLayoutContainer(()=>this.layout()))}openContextView;contextView=this._register(new c(this.layoutService.mainContainer,w.ABSOLUTE));showContextView(e,t,i){let o;t?t===this.layoutService.getContainer(p(t))?o=w.ABSOLUTE:i?o=w.FIXED_SHADOW:o=w.FIXED:o=w.ABSOLUTE,this.contextView.setContainer(t??this.layoutService.activeContainer,o),this.contextView.show(e);const r={close:()=>{this.openContextView===r&&this.hideContextView()}};return this.openContextView=r,r}layout(){this.contextView.layout()}hideContextView(e){this.contextView.hide(e),this.openContextView=void 0}};x=V([a(0,h)],x);class g extends x{getContextViewElement(){return this.contextView.getViewElement()}}export{x as ContextViewHandler,g as ContextViewService};
